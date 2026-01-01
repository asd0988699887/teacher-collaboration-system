// ============================================
// 通知 API
// GET: 讀取使用者的通知列表
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const communityId = searchParams.get('communityId')

    if (!userId) {
      return NextResponse.json(
        { error: '缺少使用者 ID' },
        { status: 400 }
      )
    }

    // 查詢通知列表（最多99個，按時間倒序）
    let sql = `
      SELECT 
        n.id,
        n.community_id,
        n.user_id,
        n.actor_id,
        n.type,
        n.action,
        n.content,
        n.related_id,
        n.is_read,
        n.created_at,
        u.nickname AS actor_name,
        c.name AS community_name
      FROM notifications n
      LEFT JOIN users u ON n.actor_id = u.id
      LEFT JOIN communities c ON n.community_id = c.id
      WHERE n.user_id = ?
    `
    const params: any[] = [userId]

    // 如果指定社群，只顯示該社群的通知
    if (communityId) {
      sql += ' AND n.community_id = ?'
      params.push(communityId)
    }

    sql += ' ORDER BY n.created_at DESC LIMIT 99'

    const notifications = await query(sql, params) as any[]

    // 計算未讀數量
    const unreadCount = notifications.filter(n => !n.is_read).length

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        communityId: n.community_id,
        communityName: n.community_name,
        actorName: n.actor_name,
        type: n.type,
        action: n.action,
        content: n.content,
        relatedId: n.related_id,
        isRead: n.is_read,
        createdAt: n.created_at,
      })),
      unreadCount: Math.min(unreadCount, 99), // 最多顯示99
    })
  } catch (error: any) {
    console.error('讀取通知失敗:', error)
    return NextResponse.json(
      { error: '讀取通知失敗', details: error.message },
      { status: 500 }
    )
  }
}

