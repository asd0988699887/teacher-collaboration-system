// ============================================
// 標記通知為已讀 API
// PUT: 標記單個通知為已讀
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const resolvedParams = await params
    const { notificationId } = resolvedParams

    if (!notificationId) {
      return NextResponse.json(
        { error: '缺少通知 ID' },
        { status: 400 }
      )
    }

    // 標記為已讀
    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [notificationId]
    )

    return NextResponse.json({
      success: true,
      message: '已標記為已讀',
    })
  } catch (error: any) {
    console.error('標記已讀失敗:', error)
    return NextResponse.json(
      { error: '標記已讀失敗', details: error.message },
      { status: 500 }
    )
  }
}

