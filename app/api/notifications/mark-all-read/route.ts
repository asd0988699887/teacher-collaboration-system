// ============================================
// 全部標記已讀 API
// PUT: 標記使用者所有通知為已讀
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, communityId } = body

    if (!userId) {
      return NextResponse.json(
        { error: '缺少使用者 ID' },
        { status: 400 }
      )
    }

    // 標記所有未讀通知為已讀
    let sql = 'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE'
    const params: any[] = [userId]

    // 如果指定社群，只標記該社群的通知
    if (communityId) {
      sql += ' AND community_id = ?'
      params.push(communityId)
    }

    await query(sql, params)

    return NextResponse.json({
      success: true,
      message: '已全部標記為已讀',
    })
  } catch (error: any) {
    console.error('全部標記已讀失敗:', error)
    return NextResponse.json(
      { error: '全部標記已讀失敗', details: error.message },
      { status: 500 }
    )
  }
}

