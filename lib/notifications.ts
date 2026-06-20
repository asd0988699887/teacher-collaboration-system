// ============================================
// 通知系統輔助函數
// ============================================

import { query, transaction } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

interface CreateNotificationParams {
  communityId: string
  actorId: string // 執行操作的使用者ID
  type: 'file' | 'task' | 'idea' | 'lesson_plan' | 'convergence' | 'chat' | 'announcement'
  action: 'create' | 'update' | 'reply'
  content: string
  relatedId?: string
  /** 為 true 時通知社群所有成員（含 actorId） */
  notifyAllMembers?: boolean
}

interface LessonPlanCommunityNotificationParams {
  communityId: string
  actorId: string
  activityId: string
  content: string
  action: 'create' | 'update' | 'reply'
  /** 同一活動、同一操作者在此時限內已有同類通知則略過 */
  dedupeWithinHours?: number
}

/**
 * 創建通知給社群內所有成員（排除操作者自己）
 */
export async function createNotificationsForCommunity(params: CreateNotificationParams) {
  const { communityId, actorId, type, action, content, relatedId, notifyAllMembers } = params

  console.log('🔔 準備創建通知:', { communityId, actorId, type, action, content })

  try {
    const members = (notifyAllMembers
      ? await query(`SELECT user_id FROM community_members WHERE community_id = ?`, [communityId])
      : await query(
          `SELECT user_id FROM community_members 
           WHERE community_id = ? AND user_id != ?`,
          [communityId, actorId]
        )) as any[]

    console.log('🔔 找到社群成員:', { count: members.length, memberIds: members.map(m => m.user_id) })

    if (members.length === 0) {
      console.log('🔔 沒有其他成員需要通知')
      return
    }

    // 為每個成員創建通知
    const insertPromises = members.map((member) => {
      const notificationId = uuidv4()
      console.log('🔔 創建通知給使用者:', { userId: member.user_id, notificationId, content })
      return query(
        `INSERT INTO notifications 
         (id, community_id, user_id, actor_id, type, action, content, related_id, is_read) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
        [notificationId, communityId, member.user_id, actorId, type, action, content, relatedId || null]
      )
    })

    await Promise.all(insertPromises)

    console.log(`✅ 已成功創建 ${members.length} 個通知 - 類型: ${type}, 操作: ${action}`)
  } catch (error) {
    console.error('❌ 創建通知失敗:', error)
    // 不拋出錯誤，避免影響主要操作
  }
}

function lessonPlanNotificationLockName(
  communityId: string,
  actorId: string,
  activityId: string
): string {
  return `lp:${communityId}:${actorId}:${activityId}`.slice(0, 64)
}

/**
 * 教案相關社群通知；可選 1 小時內去重（用於自動儲存／修改教案）
 * 以 GET_LOCK 串行化「檢查 + 寫入」，避免連續自動儲存競態造成多筆通知。
 */
export async function createLessonPlanCommunityNotification(
  params: LessonPlanCommunityNotificationParams
) {
  const { communityId, actorId, activityId, content, action, dedupeWithinHours } = params
  const lockName = lessonPlanNotificationLockName(communityId, actorId, activityId)

  try {
    await transaction(async (connection) => {
      const [lockRows] = (await connection.execute('SELECT GET_LOCK(?, 10) AS acquired', [
        lockName,
      ])) as [{ acquired: number | null }[], unknown]

      const acquired = Number(Array.isArray(lockRows) ? lockRows[0]?.acquired : 0) === 1
      if (!acquired) {
        console.log('🔔 教案通知鎖取得失敗，改為無鎖模式建立')
      }

      try {
        if (dedupeWithinHours != null && dedupeWithinHours > 0) {
          const hours = Math.max(1, Math.floor(dedupeWithinHours))
          const [existing] = (await connection.execute(
            `SELECT id FROM notifications
             WHERE community_id = ? AND actor_id = ? AND type = 'lesson_plan'
               AND action = ? AND related_id = ?
               AND content LIKE ?
               AND created_at >= DATE_SUB(NOW(), INTERVAL ${hours} HOUR)
             LIMIT 1`,
            [communityId, actorId, action, activityId, '%修改了教案%']
          )) as [{ id: string }[], unknown]

          if (Array.isArray(existing) && existing.length > 0) {
            console.log(`🔔 跳過重複教案通知（${hours} 小時內已有）`)
            return
          }
        }

        const [members] = (await connection.execute(
          `SELECT user_id FROM community_members
           WHERE community_id = ? AND user_id != ?`,
          [communityId, actorId]
        )) as [{ user_id: string }[], unknown]

        if (!Array.isArray(members) || members.length === 0) {
          console.log('🔔 沒有其他成員需要通知')
          return
        }

        for (const member of members) {
          const notificationId = uuidv4()
          await connection.execute(
            `INSERT INTO notifications
             (id, community_id, user_id, actor_id, type, action, content, related_id, is_read)
             VALUES (?, ?, ?, ?, 'lesson_plan', ?, ?, ?, FALSE)`,
            [notificationId, communityId, member.user_id, actorId, action, content, activityId]
          )
        }

        console.log(`✅ 已成功創建 ${members.length} 個教案通知`)
      } finally {
        if (acquired) {
          await connection.execute('SELECT RELEASE_LOCK(?)', [lockName])
        }
      }
    })
  } catch (error) {
    console.error('❌ 創建教案通知失敗:', error)
  }
}

function chatNotificationLockName(communityId: string): string {
  return `chat:${communityId}`.slice(0, 64)
}

/**
 * 合併式聊天通知：同一社群每位成員最多一筆未讀聊天通知。
 * 已有未讀則更新內容與時間，不再新增。
 */
export async function upsertMergedChatNotifications(params: {
  communityId: string
  actorId: string
  senderName: string
}) {
  const { communityId, actorId, senderName } = params
  const lockName = chatNotificationLockName(communityId)
  const messageContent = `${senderName} 在聊天室傳送了新訊息`

  try {
    await transaction(async (connection) => {
      const [lockRows] = (await connection.execute('SELECT GET_LOCK(?, 10) AS acquired', [
        lockName,
      ])) as [{ acquired: number | null }[], unknown]

      const acquired = Number(Array.isArray(lockRows) ? lockRows[0]?.acquired : 0) === 1
      if (!acquired) {
        console.log('🔔 聊天通知鎖取得失敗，改為無鎖模式建立')
      }

      try {
        const [members] = (await connection.execute(
          `SELECT user_id FROM community_members
           WHERE community_id = ? AND user_id != ?`,
          [communityId, actorId]
        )) as [{ user_id: string }[], unknown]

        if (!Array.isArray(members) || members.length === 0) {
          return
        }

        for (const member of members) {
          const [existing] = (await connection.execute(
            `SELECT id FROM notifications
             WHERE user_id = ? AND community_id = ? AND type = 'chat' AND is_read = FALSE
             LIMIT 1`,
            [member.user_id, communityId]
          )) as [{ id: string }[], unknown]

          if (Array.isArray(existing) && existing.length > 0) {
            await connection.execute(
              `UPDATE notifications
               SET content = ?, actor_id = ?, action = 'update', created_at = NOW()
               WHERE id = ?`,
              [messageContent, actorId, existing[0].id]
            )
          } else {
            const notificationId = uuidv4()
            await connection.execute(
              `INSERT INTO notifications
               (id, community_id, user_id, actor_id, type, action, content, related_id, is_read)
               VALUES (?, ?, ?, ?, 'chat', 'create', ?, ?, FALSE)`,
              [
                notificationId,
                communityId,
                member.user_id,
                actorId,
                messageContent,
                communityId,
              ]
            )
          }
        }

        console.log(`✅ 已更新 ${members.length} 位成員的聊天通知`)
      } finally {
        if (acquired) {
          await connection.execute('SELECT RELEASE_LOCK(?)', [lockName])
        }
      }
    })
  } catch (error) {
    console.error('❌ 創建聊天通知失敗:', error)
  }
}

/** 使用者進入聊天室後，將該社群所有未讀聊天通知標記為已讀 */
export async function markChatNotificationsAsRead(userId: string, communityId: string) {
  await query(
    `UPDATE notifications SET is_read = TRUE
     WHERE user_id = ? AND community_id = ? AND type = 'chat' AND is_read = FALSE`,
    [userId, communityId]
  )
}

function announcementNotificationLockName(communityId: string): string {
  return `ann:${communityId}`.slice(0, 64)
}

/**
 * 合併式公告通知：同一社群每位成員最多一筆未讀公告通知。
 */
export async function upsertMergedAnnouncementNotifications(params: {
  communityId: string
  actorId: string
  publisherName: string
}) {
  const { communityId, actorId, publisherName } = params
  const lockName = announcementNotificationLockName(communityId)
  const messageContent = `${publisherName} 發布了新公告`

  try {
    await transaction(async (connection) => {
      const [lockRows] = (await connection.execute('SELECT GET_LOCK(?, 10) AS acquired', [
        lockName,
      ])) as [{ acquired: number | null }[], unknown]

      const acquired = Array.isArray(lockRows) && lockRows[0]?.acquired === 1
      if (!acquired) {
        console.log('🔔 公告通知鎖取得失敗，略過建立')
        return
      }

      try {
        const [members] = (await connection.execute(
          `SELECT user_id FROM community_members
           WHERE community_id = ? AND user_id != ?`,
          [communityId, actorId]
        )) as [{ user_id: string }[], unknown]

        if (!Array.isArray(members) || members.length === 0) {
          return
        }

        for (const member of members) {
          const [existing] = (await connection.execute(
            `SELECT id FROM notifications
             WHERE user_id = ? AND community_id = ? AND type = 'announcement' AND is_read = FALSE
             LIMIT 1`,
            [member.user_id, communityId]
          )) as [{ id: string }[], unknown]

          if (Array.isArray(existing) && existing.length > 0) {
            await connection.execute(
              `UPDATE notifications
               SET content = ?, actor_id = ?, action = 'update', created_at = NOW()
               WHERE id = ?`,
              [messageContent, actorId, existing[0].id]
            )
          } else {
            const notificationId = uuidv4()
            await connection.execute(
              `INSERT INTO notifications
               (id, community_id, user_id, actor_id, type, action, content, related_id, is_read)
               VALUES (?, ?, ?, ?, 'announcement', 'create', ?, ?, FALSE)`,
              [
                notificationId,
                communityId,
                member.user_id,
                actorId,
                messageContent,
                communityId,
              ]
            )
          }
        }

        console.log(`✅ 已更新 ${members.length} 位成員的公告通知`)
      } finally {
        await connection.execute('SELECT RELEASE_LOCK(?)', [lockName])
      }
    })
  } catch (error) {
    console.error('❌ 創建公告通知失敗:', error)
  }
}

/** 使用者開啟公告欄後，將該社群所有未讀公告通知標記為已讀 */
export async function markAnnouncementNotificationsAsRead(userId: string, communityId: string) {
  await query(
    `UPDATE notifications SET is_read = TRUE
     WHERE user_id = ? AND community_id = ? AND type = 'announcement' AND is_read = FALSE`,
    [userId, communityId]
  )
}

