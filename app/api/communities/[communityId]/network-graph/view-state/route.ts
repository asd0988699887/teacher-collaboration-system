// ============================================
// 網絡圖視圖狀態 API（縮放比例和平移位置）
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: 獲取視圖狀態
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

    try {
      const viewState = await query(
        `SELECT zoom, pan_x, pan_y
         FROM network_graph_view_state
         WHERE community_id = ?`,
        [communityId]
      ) as any[]

      if (viewState.length === 0) {
        // 如果沒有保存的視圖狀態，返回默認值
        return NextResponse.json({
          zoom: 1.0,
          panX: 0,
          panY: 0,
        })
      }

      return NextResponse.json({
        zoom: parseFloat(viewState[0].zoom) || 1.0,
        panX: parseFloat(viewState[0].pan_x) || 0,
        panY: parseFloat(viewState[0].pan_y) || 0,
      })
    } catch (dbError: any) {
      // 如果表不存在，返回默認值
      if (dbError.message && dbError.message.includes('doesn\'t exist')) {
        return NextResponse.json({
          zoom: 1.0,
          panX: 0,
          panY: 0,
        })
      }
      throw dbError
    }
  } catch (error: any) {
    console.error('獲取視圖狀態錯誤:', error)
    return NextResponse.json(
      { error: '獲取視圖狀態失敗', details: error.message },
      { status: 500 }
    )
  }
}

// PUT: 保存視圖狀態
export async function PUT(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams
    const body = await request.json()
    const { zoom, panX, panY } = body

    if (!communityId) {
      return NextResponse.json(
        { error: '請提供社群ID' },
        { status: 400 }
      )
    }

    if (zoom === undefined || panX === undefined || panY === undefined) {
      return NextResponse.json(
        { error: '請提供縮放比例和平移位置' },
        { status: 400 }
      )
    }

    try {
      await query(
        `INSERT INTO network_graph_view_state (community_id, zoom, pan_x, pan_y)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         zoom = VALUES(zoom),
         pan_x = VALUES(pan_x),
         pan_y = VALUES(pan_y),
         updated_at = CURRENT_TIMESTAMP`,
        [communityId, zoom, panX, panY]
      )

      return NextResponse.json({
        message: '視圖狀態已保存',
        zoom,
        panX,
        panY,
      })
    } catch (dbError: any) {
      // 如果表不存在，返回友好錯誤訊息
      if (dbError.message && dbError.message.includes('doesn\'t exist')) {
        return NextResponse.json(
          { error: '數據表尚未創建，請先執行 migration 創建 network_graph_view_state 表' },
          { status: 500 }
        )
      }
      throw dbError
    }
  } catch (error: any) {
    console.error('保存視圖狀態錯誤:', error)
    return NextResponse.json(
      { error: '保存視圖狀態失敗', details: error.message },
      { status: 500 }
    )
  }
}


