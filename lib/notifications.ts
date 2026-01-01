// ============================================
// 通知系統輔助函數
// ============================================

import { query } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

interface CreateNotificationParams {
  communityId: string
  actorId: string // 執行操作的使用者ID
  type: 'file' | 'task' | 'idea' | 'lesson_plan'
  action: 'create' | 'update' | 'reply'
  content: string
  relatedId?: string
}

/**
 * 創建通知給社群內所有成員（排除操作者自己）
 */
export async function createNotificationsForCommunity(params: CreateNotificationParams) {
  const { communityId, actorId, type, action, content, relatedId } = params

  console.log('🔔 準備創建通知:', { communityId, actorId, type, action, content })

  try {
    // 查詢社群內所有成員（排除操作者自己）
    const members = await query(
      `SELECT user_id FROM community_members 
       WHERE community_id = ? AND user_id != ?`,
      [communityId, actorId]
    ) as any[]

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

