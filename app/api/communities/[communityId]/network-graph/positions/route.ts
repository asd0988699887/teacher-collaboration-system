// ============================================
// 網絡圖節點位置 API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// PUT: 批量保存節點位置
export async function PUT(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams
    const body = await request.json()
    const { positions } = body // positions: [{ userId, x, y }]

    if (!communityId) {
      return NextResponse.json(
        { error: '請提供社群ID' },
        { status: 400 }
      )
    }

    if (!positions || !Array.isArray(positions)) {
      return NextResponse.json(
        { error: '請提供節點位置陣列' },
        { status: 400 }
      )
    }

    // 使用事務批量更新/插入位置
    // 先刪除該社群的所有舊位置，然後插入新位置
    try {
      await query(
        'DELETE FROM network_graph_positions WHERE community_id = ?',
        [communityId]
      )

      // 批量插入新位置
      if (positions.length > 0) {
        const values = positions.map((pos: any) => [
          communityId,
          pos.userId,
          pos.x,
          pos.y,
        ])

        const placeholders = positions.map(() => '(?, ?, ?, ?)').join(', ')
        const flatValues = values.flat()

        await query(
          `INSERT INTO network_graph_positions (community_id, user_id, position_x, position_y)
           VALUES ${placeholders}
           ON DUPLICATE KEY UPDATE
           position_x = VALUES(position_x),
           position_y = VALUES(position_y),
           updated_at = CURRENT_TIMESTAMP`,
          flatValues
        )
      }
    } catch (dbError: any) {
      // 如果表不存在，返回友好錯誤訊息
      if (dbError.message && dbError.message.includes('doesn\'t exist')) {
        return NextResponse.json(
          { error: '數據表尚未創建，請先執行 migration 創建 network_graph_positions 表' },
          { status: 500 }
        )
      }
      throw dbError // 其他錯誤繼續拋出
    }

    return NextResponse.json({ 
      message: '節點位置已保存',
      savedCount: positions.length 
    })
  } catch (error: any) {
    console.error('保存節點位置錯誤:', error)
    return NextResponse.json(
      { error: '保存節點位置失敗', details: error.message },
      { status: 500 }
    )
  }
}

