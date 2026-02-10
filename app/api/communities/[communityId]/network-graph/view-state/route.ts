// ============================================
// 網絡圖視圖狀態 API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: 取得視圖狀態
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

    // 嘗試從資料庫讀取視圖狀態
    // 如果沒有對應的資料表，返回預設值
    try {
      const results = await query(
        'SELECT zoom, pan_x as panX, pan_y as panY FROM network_graph_view_state WHERE community_id = ?',
        [communityId]
      ) as any[]

      if (results.length > 0) {
        return NextResponse.json({
          zoom: results[0].zoom || 1.0,
          panX: results[0].panX || 0,
          panY: results[0].panY || 0,
        })
      }
    } catch (dbError: any) {
      // 如果表不存在，返回預設值（不報錯）
      if (dbError.message && dbError.message.includes('doesn\'t exist')) {
        console.log('視圖狀態表不存在，返回預設值')
      } else {
        console.error('讀取視圖狀態錯誤:', dbError)
      }
    }

    // 返回預設值
    return NextResponse.json({
      zoom: 1.0,
      panX: 0,
      panY: 0,
    })
  } catch (error: any) {
    console.error('取得視圖狀態錯誤:', error)
    // 即使出錯也返回預設值，不影響功能
    return NextResponse.json({
      zoom: 1.0,
      panX: 0,
      panY: 0,
    })
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
        { error: '請提供完整的視圖狀態（zoom, panX, panY）' },
        { status: 400 }
      )
    }

    // 嘗試保存到資料庫
    try {
      await query(
        `INSERT INTO network_graph_view_state (community_id, zoom, pan_x, pan_y, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
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
        panY
      })
    } catch (dbError: any) {
      // 如果表不存在，返回成功但不保存（不報錯）
      if (dbError.message && dbError.message.includes('doesn\'t exist')) {
        console.log('視圖狀態表不存在，跳過保存')
        return NextResponse.json({ 
          message: '視圖狀態已保存（未持久化）',
          zoom,
          panX,
          panY
        })
      }
      throw dbError // 其他錯誤繼續拋出
    }
  } catch (error: any) {
    console.error('保存視圖狀態錯誤:', error)
    return NextResponse.json(
      { error: '保存視圖狀態失敗', details: error.message },
      { status: 500 }
    )
  }
}

