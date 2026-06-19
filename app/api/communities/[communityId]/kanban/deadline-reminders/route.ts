// ============================================
// 任務截止提醒：3 天、2 天、1 天各通知一次
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'
import { createNotificationsForCommunity } from '@/lib/notifications'
import { daysUntilDeadline } from '@/lib/taskDeadline'

const REMINDER_DAYS = [3, 2, 1] as const

async function hasDeadlineNotificationLog(taskId: string, daysBefore: number): Promise<boolean> {
  try {
    const rows = (await query(
      `SELECT id FROM task_deadline_notification_logs WHERE task_id = ? AND days_before = ? LIMIT 1`,
      [taskId, daysBefore]
    )) as { id: string }[]
    return rows.length > 0
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (/doesn't exist|unknown table/i.test(msg)) return false
    throw err
  }
}

async function recordDeadlineNotificationLog(taskId: string, daysBefore: number): Promise<void> {
  try {
    await query(
      `INSERT INTO task_deadline_notification_logs (id, task_id, days_before) VALUES (?, ?, ?)`,
      [uuidv4(), taskId, daysBefore]
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (/doesn't exist|unknown table/i.test(msg)) {
      console.warn('task_deadline_notification_logs 表尚未建立，略過記錄')
      return
    }
    throw err
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const { communityId } = await params

    const communities = (await query(
      'SELECT creator_id AS creatorId FROM communities WHERE id = ? LIMIT 1',
      [communityId]
    )) as { creatorId: string }[]

    if (communities.length === 0) {
      return NextResponse.json({ error: '找不到活動' }, { status: 404 })
    }

    const actorId = communities[0].creatorId

    let tasks: { id: string; title: string; endDate: string | Date; status?: string }[]
    try {
      tasks = (await query(
        `SELECT 
          kt.id,
          kt.title,
          kt.end_date AS endDate,
          kt.status
        FROM kanban_tasks kt
        INNER JOIN kanban_lists kl ON kt.list_id = kl.id
        WHERE kl.community_id = ?
          AND kt.end_date IS NOT NULL
          AND (kt.status IS NULL OR kt.status != 'completed')`,
        [communityId]
      )) as typeof tasks
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (/unknown column|Incorrect DATETIME|ER_WRONG_VALUE/i.test(msg)) {
        tasks = (await query(
          `SELECT 
            kt.id,
            kt.title,
            kt.end_date AS endDate
          FROM kanban_tasks kt
          INNER JOIN kanban_lists kl ON kt.list_id = kl.id
          WHERE kl.community_id = ?
            AND kt.end_date IS NOT NULL`,
          [communityId]
        )) as typeof tasks
      } else {
        throw err
      }
    }

    let sentCount = 0

    for (const task of tasks) {
      try {
        const daysLeft = daysUntilDeadline(task.endDate)
        if (daysLeft === null || !REMINDER_DAYS.includes(daysLeft as (typeof REMINDER_DAYS)[number])) {
          continue
        }

        const alreadySent = await hasDeadlineNotificationLog(task.id, daysLeft)
        if (alreadySent) continue

        const taskTitle = task.title?.trim() || '未命名任務'
        const dayLabel = daysLeft === 1 ? '1 天' : `${daysLeft} 天`

        await createNotificationsForCommunity({
          communityId,
          actorId,
          type: 'task',
          action: 'update',
          content: `任務「${taskTitle}」將於 ${dayLabel}後截止，請留意進度`,
          relatedId: task.id,
          notifyAllMembers: true,
        })

        await recordDeadlineNotificationLog(task.id, daysLeft)
        sentCount++
      } catch (taskErr) {
        console.error('單一任務截止提醒失敗:', task.id, taskErr)
      }
    }

    return NextResponse.json({ sent: sentCount })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '處理截止提醒失敗'
    console.error('截止提醒通知錯誤:', error)
    // 背景提醒失敗不應影響頁面使用
    return NextResponse.json({ sent: 0, warning: message })
  }
}
