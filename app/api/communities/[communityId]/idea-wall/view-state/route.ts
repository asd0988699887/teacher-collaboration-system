// ============================================
// 想法牆視圖狀態 API（縮放比例和平移位置）
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: 獲取想法牆的視圖狀態
export async function GET(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams

    if (!communityId) {
      return NextResponse.json(
        { error: '請提供社群ID' },
        { status: 400 }
      )
    }

    // 查詢視圖狀態
    const results = await query(
      `SELECT zoom, pan_x AS panX, pan_y AS panY
       FROM idea_wall_view_state
       WHERE community_id = ?`,
      [communityId]
    ) as any[]

    if (results.length === 0) {
      // 如果沒有保存的狀態，返回默認值
      return NextResponse.json({
        zoom: 1.0,
        panX: 0,
        panY: 0,
      })
    }

    return NextResponse.json({
      zoom: parseFloat(results[0].zoom) || 1.0,
      panX: parseFloat(results[0].panX) || 0,
      panY: parseFloat(results[0].panY) || 0,
    })
  } catch (error: any) {
    console.error('獲取想法牆視圖狀態錯誤:', error)
    // 如果表不存在，返回默認值
    if (error.message?.includes("doesn't exist") || error.message?.includes('Unknown table')) {
      return NextResponse.json({
        zoom: 1.0,
        panX: 0,
        panY: 0,
      })
    }
    return NextResponse.json(
      { error: '獲取視圖狀態失敗' },
      { status: 500 }
    )
  }
}

// PUT: 保存想法牆的視圖狀態
export async function PUT(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams

    if (!communityId) {
      return NextResponse.json(
        { error: '請提供社群ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { zoom, panX, panY } = body

    if (zoom === undefined || panX === undefined || panY === undefined) {
      return NextResponse.json(
        { error: '請提供 zoom、panX 和 panY' },
        { status: 400 }
      )
    }

    // 使用 INSERT ... ON DUPLICATE KEY UPDATE 來更新或插入
    await query(
      `INSERT INTO idea_wall_view_state (community_id, zoom, pan_x, pan_y, updated_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         zoom = VALUES(zoom),
         pan_x = VALUES(pan_x),
         pan_y = VALUES(pan_y),
         updated_at = NOW()`,
      [communityId, zoom, panX, panY]
    )

    return NextResponse.json({
      message: '視圖狀態保存成功',
      zoom,
      panX,
      panY,
    })
  } catch (error: any) {
    console.error('保存想法牆視圖狀態錯誤:', error)
    // 如果表不存在，返回錯誤提示
    if (error.message?.includes("doesn't exist") || error.message?.includes('Unknown table')) {
      return NextResponse.json(
        { error: '數據表尚未創建,請先執行 migration 創建 idea_wall_view_state 表' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: '保存視圖狀態失敗' },
      { status: 500 }
    )
  }
}

