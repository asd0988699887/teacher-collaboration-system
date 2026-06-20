// POST: 結束共備（標記活動完成，列入歷史）
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { createNotificationsForCommunity } from '@/lib/notifications'
import { activityDisplayLabel } from '@/lib/activityDisplay'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: '請提供使用者 ID' }, { status: 400 })
    }

    const rows = await query(
      `SELECT a.id, a.community_id AS communityId, a.name, a.completed_at AS completedAt,
              lp.lesson_plan_title AS lessonPlanTitle
       FROM activities a
       LEFT JOIN lesson_plans lp ON lp.activity_id = a.id
       WHERE a.id = ?`,
      [activityId]
    ) as any[]

    if (rows.length === 0) {
      return NextResponse.json({ error: '活動不存在' }, { status: 404 })
    }

    if (rows[0].completedAt) {
      return NextResponse.json({ error: '此活動已結束共備' }, { status: 400 })
    }

    const communityId = rows[0].communityId
    const members = await query(
      'SELECT 1 FROM community_members WHERE community_id = ? AND user_id = ? LIMIT 1',
      [communityId, userId]
    ) as any[]

    if (members.length === 0) {
      return NextResponse.json({ error: '僅社群成員可結束共備' }, { status: 403 })
    }

    await query('UPDATE activities SET completed_at = NOW() WHERE id = ?', [activityId])

    try {
      const activityName =
        activityDisplayLabel({
          name: rows[0].name || '',
          lessonPlanTitle: rows[0].lessonPlanTitle,
        }) || '教案'

      const users = (await query('SELECT nickname FROM users WHERE id = ?', [userId])) as {
        nickname: string
      }[]
      const userName = users.length > 0 ? users[0].nickname : '使用者'

      await createNotificationsForCommunity({
        communityId,
        actorId: userId,
        type: 'lesson_plan',
        action: 'update',
        content: `${userName} 結束了共備活動「${activityName}」`,
        relatedId: activityId,
      })
    } catch (notificationError) {
      console.error('創建結束共備通知失敗:', notificationError)
    }

    return NextResponse.json({ ok: true, message: '已結束共備' })
  } catch (error: any) {
    console.error('結束共備錯誤:', error)
    return NextResponse.json(
      { error: '結束共備失敗', details: error.message },
      { status: 500 }
    )
  }
}
