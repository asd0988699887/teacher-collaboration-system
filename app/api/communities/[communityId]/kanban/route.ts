// ============================================
// 團隊分工 Kanban API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'
import { createNotificationsForCommunity } from '@/lib/notifications'

// GET: 讀取社群的 Kanban 資料（包含列表和任務）
export async function GET(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams

    // 查詢所有列表
    const lists = await query(
      `SELECT 
        kl.id,
        kl.title,
        kl.sort_order AS sortOrder
      FROM kanban_lists kl
      WHERE kl.community_id = ?
      ORDER BY kl.sort_order ASC, kl.created_at ASC`,
      [communityId]
    ) as any[]

    // 查詢所有任務（包含指派資訊）
    const tasks = await query(
      `SELECT 
        kt.id,
        kt.list_id AS listId,
        kt.title,
        kt.content,
        kt.start_date AS startDate,
        kt.end_date AS endDate,
        kt.sort_order AS sortOrder,
        kt.created_at AS createdAt
      FROM kanban_tasks kt
      WHERE kt.list_id IN (
        SELECT id FROM kanban_lists WHERE community_id = ?
      )
      ORDER BY kt.sort_order ASC, kt.created_at ASC`,
      [communityId]
    ) as any[]

    // 查詢所有任務指派
    const assignees = await query(
      `SELECT 
        ta.task_id AS taskId,
        ta.user_id AS userId,
        u.nickname,
        u.account
      FROM task_assignees ta
      INNER JOIN users u ON ta.user_id = u.id
      WHERE ta.task_id IN (
        SELECT id FROM kanban_tasks WHERE list_id IN (
          SELECT id FROM kanban_lists WHERE community_id = ?
        )
      )`,
      [communityId]
    ) as any[]

    // 組織資料結構 - 返回使用者ID陣列，而不是暱稱陣列
    const assigneesMap = new Map<string, string[]>()
    assignees.forEach((assignee: any) => {
      if (!assigneesMap.has(assignee.taskId)) {
        assigneesMap.set(assignee.taskId, [])
      }
      // 返回使用者ID，而不是暱稱
      assigneesMap.get(assignee.taskId)!.push(assignee.userId)
    })

    const tasksMap = new Map<string, any[]>()
    tasks.forEach((task: any) => {
      if (!tasksMap.has(task.listId)) {
        tasksMap.set(task.listId, [])
      }
      // 格式化日期：將資料庫日期轉換為 YYYY-MM-DD 格式
      const formatDate = (dateStr: string | null): string => {
        if (!dateStr) return ''
        // 如果是 Date 物件或 ISO 字串，提取日期部分
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return ''
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      tasksMap.get(task.listId)!.push({
        id: task.id,
        title: task.title,
        content: task.content || '',
        startDate: formatDate(task.startDate),
        endDate: formatDate(task.endDate),
        assignees: assigneesMap.get(task.id) || [],
        createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : '',
      })
    })

    const formattedLists = lists.map((list: any) => ({
      id: list.id,
      title: list.title,
      tasks: tasksMap.get(list.id) || [],
    }))

    return NextResponse.json(formattedLists)
  } catch (error: any) {
    console.error('讀取 Kanban 資料錯誤:', error)
    return NextResponse.json(
      { error: '讀取 Kanban 資料失敗', details: error.message },
      { status: 500 }
    )
  }
}

// POST: 建立列表或任務
export async function POST(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams
    
    // 驗證 communityId
    if (!communityId || communityId === 'null' || communityId === 'undefined') {
      return NextResponse.json(
        { error: '社群ID不存在或無效', details: `communityId: ${communityId}` },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const { type, listId, title, content, startDate, endDate, assignees, creatorId } = body

    if (type === 'list') {
      // 建立新列表
      if (!title) {
        return NextResponse.json(
          { error: '請提供列表標題' },
          { status: 400 }
        )
      }

      // 檢查是否已經有相同標題的列表（防止重複建立）
      const existingLists = await query(
        'SELECT id FROM kanban_lists WHERE community_id = ? AND title = ?',
        [communityId, title.trim()]
      ) as any[]

      if (existingLists.length > 0) {
        // 如果已存在，返回現有的列表
        const existingListId = existingLists[0].id
        const existingList = await query(
          `SELECT 
            kl.id,
            kl.title,
            kl.sort_order AS sortOrder
          FROM kanban_lists kl
          WHERE kl.id = ?`,
          [existingListId]
        ) as any[]

        const tasks = await query(
          `SELECT 
            kt.id,
            kt.list_id AS listId,
            kt.title,
            kt.content,
            kt.start_date AS startDate,
            kt.end_date AS endDate,
            kt.sort_order AS sortOrder,
            kt.created_at AS createdAt
          FROM kanban_tasks kt
          WHERE kt.list_id = ?`,
          [existingListId]
        ) as any[]

        return NextResponse.json({
          id: existingList[0].id,
          title: existingList[0].title,
          tasks: tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            content: task.content || '',
            startDate: task.startDate || '',
            endDate: task.endDate || '',
            assignees: [],
            createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : '',
          })),
        }, { status: 200 })
      }

      // 查詢當前最大排序
      const maxSort = await query(
        'SELECT MAX(sort_order) AS maxSort FROM kanban_lists WHERE community_id = ?',
        [communityId]
      ) as any[]

      const nextSort = (maxSort[0]?.maxSort || 0) + 1

      const newListId = uuidv4()
      
      // 確保所有參數都不是 undefined
      const listParams = [newListId, communityId, title.trim(), nextSort]
      if (listParams.some(param => param === undefined)) {
        console.error('列表參數包含 undefined:', { newListId, communityId, title, nextSort })
        return NextResponse.json(
          { error: '參數驗證失敗，請檢查列表資料' },
          { status: 400 }
        )
      }
      
      await query(
        'INSERT INTO kanban_lists (id, community_id, title, sort_order) VALUES (?, ?, ?, ?)',
        listParams
      )

      return NextResponse.json({ id: newListId, title: title.trim(), tasks: [] }, { status: 201 })

    } else if (type === 'task') {
      // 建立新任務
      console.log('建立任務請求:', { listId, title, content, startDate, endDate, assignees })
      
      if (!listId || listId.trim() === '') {
        console.error('列表ID無效:', listId)
        return NextResponse.json(
          { error: '請提供有效的列表ID', details: `listId: ${listId}` },
          { status: 400 }
        )
      }

      if (!title || title.trim() === '') {
        console.error('任務標題無效:', title)
        return NextResponse.json(
          { error: '請提供任務標題', details: `title: ${title}` },
          { status: 400 }
        )
      }

      // 檢查列表是否存在
      const lists = await query(
        'SELECT id FROM kanban_lists WHERE id = ? AND community_id = ?',
        [listId, communityId]
      ) as any[]

      if (lists.length === 0) {
        console.error('列表不存在:', { listId, communityId })
        return NextResponse.json(
          { error: '列表不存在或無權限', details: `listId: ${listId}, communityId: ${communityId}` },
          { status: 404 }
        )
      }

      // 查詢當前最大排序
      const maxSort = await query(
        'SELECT MAX(sort_order) AS maxSort FROM kanban_tasks WHERE list_id = ?',
        [listId]
      ) as any[]

      const nextSort = (maxSort[0]?.maxSort || 0) + 1

      const taskId = uuidv4()
      
      // 確保所有參數都不是 undefined
      const taskParams = [
        taskId,
        listId,
        title.trim(),
        content || null,
        startDate || null,
        endDate || null,
        nextSort
      ]
      
      if (taskParams.some(param => param === undefined)) {
        console.error('任務參數包含 undefined:', { taskId, listId, title, content, startDate, endDate, nextSort })
        return NextResponse.json(
          { error: '參數驗證失敗，請檢查任務資料', details: JSON.stringify({ taskId, listId, title, content, startDate, endDate, nextSort }) },
          { status: 400 }
        )
      }
      
      try {
        await query(
          'INSERT INTO kanban_tasks (id, list_id, title, content, start_date, end_date, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
          taskParams
        )

        // 指派任務
        if (assignees && Array.isArray(assignees) && assignees.length > 0) {
          // assignees 已經是使用者ID陣列
          for (const userId of assignees) {
            if (userId && userId !== 'undefined' && userId !== 'null' && userId.trim() !== '') {
              const assigneeId = uuidv4()
              await query(
                'INSERT INTO task_assignees (id, task_id, user_id) VALUES (?, ?, ?)',
                [assigneeId, taskId, userId]
              )
            }
          }
        }

        const newTask = {
          id: taskId,
          title: title.trim(),
          content: content || '',
          startDate: startDate || '',
          endDate: endDate || '',
          assignees: assignees || [],
          createdAt: new Date().toISOString(),
        }

        // 創建通知給社群其他成員
        if (creatorId) {
          const users = await query(
            'SELECT nickname FROM users WHERE id = ?',
            [creatorId]
          ) as any[]
          
          const creatorName = users.length > 0 ? users[0].nickname : '使用者'
          
          await createNotificationsForCommunity({
            communityId,
            actorId: creatorId,
            type: 'task',
            action: 'create',
            content: `${creatorName} 新增了分工任務「${title.trim()}」`,
            relatedId: taskId,
          })
        }

        return NextResponse.json(newTask, { status: 201 })
      } catch (dbError: any) {
        console.error('資料庫插入錯誤:', dbError)
        return NextResponse.json(
          { error: '建立任務失敗', details: dbError.message || '資料庫錯誤' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: '無效的操作類型' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('建立 Kanban 項目錯誤:', error)
    return NextResponse.json(
      { error: '建立失敗', details: error.message },
      { status: 500 }
    )
  }
}

// PUT: 更新列表或任務
export async function PUT(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams
    const body = await request.json()
    const { type, id, title, content, startDate, endDate, assignees } = body

    if (type === 'list') {
      // 更新列表
      if (!title) {
        return NextResponse.json(
          { error: '請提供列表標題' },
          { status: 400 }
        )
      }

      await query(
        'UPDATE kanban_lists SET title = ? WHERE id = ? AND community_id = ?',
        [title, id, communityId]
      )

      return NextResponse.json({ message: '列表已更新' })
    } else if (type === 'task') {
      // 更新任務
      const updateFields: string[] = []
      const updateValues: any[] = []

      if (title !== undefined) {
        updateFields.push('title = ?')
        updateValues.push(title)
      }
      if (content !== undefined) {
        updateFields.push('content = ?')
        updateValues.push(content)
      }
      if (startDate !== undefined) {
        updateFields.push('start_date = ?')
        updateValues.push(startDate || null)
      }
      if (endDate !== undefined) {
        updateFields.push('end_date = ?')
        updateValues.push(endDate || null)
      }

      if (updateFields.length > 0) {
        updateValues.push(id)
        await query(
          `UPDATE kanban_tasks SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        )
      }

      // 更新指派（刪除舊的，建立新的）
      if (assignees !== undefined) {
        await query('DELETE FROM task_assignees WHERE task_id = ?', [id])
        if (Array.isArray(assignees) && assignees.length > 0) {
          for (const userId of assignees) {
            const assigneeId = uuidv4()
            await query(
              'INSERT INTO task_assignees (id, task_id, user_id) VALUES (?, ?, ?)',
              [assigneeId, id, userId]
            )
          }
        }
      }

      return NextResponse.json({ message: '任務已更新' })
    } else {
      return NextResponse.json(
        { error: '無效的操作類型' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('更新 Kanban 項目錯誤:', error)
    return NextResponse.json(
      { error: '更新失敗', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE: 刪除列表或任務
export async function DELETE(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json(
        { error: '請提供操作類型和ID' },
        { status: 400 }
      )
    }

    if (type === 'list') {
      // 刪除列表（外鍵約束會自動刪除相關任務）
      await query(
        'DELETE FROM kanban_lists WHERE id = ? AND community_id = ?',
        [id, communityId]
      )
      return NextResponse.json({ message: '列表已刪除' })
    } else if (type === 'task') {
      // 刪除任務（外鍵約束會自動刪除相關指派）
      await query('DELETE FROM kanban_tasks WHERE id = ?', [id])
      return NextResponse.json({ message: '任務已刪除' })
    } else {
      return NextResponse.json(
        { error: '無效的操作類型' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('刪除 Kanban 項目錯誤:', error)
    return NextResponse.json(
      { error: '刪除失敗', details: error.message },
      { status: 500 }
    )
  }
}


