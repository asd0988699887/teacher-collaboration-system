// ============================================
// 任務移動 API - 用於拖拽功能
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// PATCH: 移動任務到不同的列表或調整順序
export async function PATCH(
  request: NextRequest,
  { params }: { params: { communityId: string; taskId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId, taskId } = resolvedParams
    const body = await request.json()
    const { targetListId, sortOrder } = body

    // 驗證必填欄位
    if (!targetListId) {
      return NextResponse.json(
        { error: '請提供目標列表ID' },
        { status: 400 }
      )
    }

    // 驗證任務是否存在且屬於該社群
    const tasks = await query(
      `SELECT kt.id, kt.list_id
       FROM kanban_tasks kt
       INNER JOIN kanban_lists kl ON kt.list_id = kl.id
       WHERE kt.id = ? AND kl.community_id = ?`,
      [taskId, communityId]
    ) as any[]

    if (tasks.length === 0) {
      return NextResponse.json(
        { error: '任務不存在或不屬於該社群' },
        { status: 404 }
      )
    }

    // 驗證目標列表是否存在且屬於該社群
    const targetLists = await query(
      `SELECT id FROM kanban_lists WHERE id = ? AND community_id = ?`,
      [targetListId, communityId]
    ) as any[]

    if (targetLists.length === 0) {
      return NextResponse.json(
        { error: '目標列表不存在或不屬於該社群' },
        { status: 404 }
      )
    }

    const oldListId = tasks[0].list_id

    // 如果提供了 sortOrder，使用它；否則，將任務放到目標列表的最後
    let finalSortOrder = sortOrder

    if (finalSortOrder === undefined || finalSortOrder === null) {
      // 獲取目標列表中的最大 sortOrder
      const maxSortOrders = await query(
        `SELECT MAX(sort_order) as maxOrder FROM kanban_tasks WHERE list_id = ?`,
        [targetListId]
      ) as any[]

      finalSortOrder = (maxSortOrders[0]?.maxOrder || 0) + 1
    }

    // 更新任務的列表和排序
    await query(
      `UPDATE kanban_tasks 
       SET list_id = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [targetListId, finalSortOrder, taskId]
    )

    // 如果是在不同列表之間移動，重新排序兩個列表
    if (oldListId !== targetListId) {
      // 重新排序舊列表 - 使用子查詢方式
      await query(
        `UPDATE kanban_tasks t1
         INNER JOIN (
           SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order ASC, created_at ASC) as new_order
           FROM kanban_tasks
           WHERE list_id = ?
         ) t2 ON t1.id = t2.id
         SET t1.sort_order = t2.new_order`,
        [oldListId]
      )

      // 重新排序新列表 - 使用子查詢方式
      await query(
        `UPDATE kanban_tasks t1
         INNER JOIN (
           SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order ASC, created_at ASC) as new_order
           FROM kanban_tasks
           WHERE list_id = ?
         ) t2 ON t1.id = t2.id
         SET t1.sort_order = t2.new_order`,
        [targetListId]
      )
    }

    return NextResponse.json({ 
      success: true,
      message: '任務已成功移動'
    })
  } catch (error: any) {
    console.error('移動任務錯誤:', error)
    return NextResponse.json(
      { error: '移動任務失敗', details: error.message },
      { status: 500 }
    )
  }
}

