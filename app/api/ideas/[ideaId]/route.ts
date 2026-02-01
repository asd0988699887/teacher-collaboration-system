// ============================================
// 想法牆 API - 單一想法操作
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// PUT: 更新想法
export async function PUT(
  request: NextRequest,
  { params }: { params: { ideaId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { ideaId } = resolvedParams
    const body = await request.json()
    const { activityId, stage, title, content, position, rotation, userId } = body

    // 驗證必填欄位
    if (!userId) {
      return NextResponse.json(
        { error: '請提供使用者ID' },
        { status: 400 }
      )
    }

    // 檢查想法是否存在
    const ideas = await query(
      'SELECT creator_id, community_id FROM ideas WHERE id = ?',
      [ideaId]
    ) as any[]

    if (ideas.length === 0) {
      return NextResponse.json(
        { error: '想法不存在' },
        { status: 404 }
      )
    }

    // 判斷是否只更新位置或旋轉（允許所有用戶操作）
    const isOnlyPositionOrRotation = 
      (position !== undefined || rotation !== undefined) &&
      activityId === undefined &&
      stage === undefined &&
      title === undefined &&
      content === undefined

    // 如果不是只更新位置/旋轉，則需要檢查權限（只有建立者可以修改其他欄位）
    if (!isOnlyPositionOrRotation && ideas[0].creator_id !== userId) {
      return NextResponse.json(
        { error: '只有建立者可以修改想法的內容' },
        { status: 403 }
      )
    }

    // 如果提供了 activityId，驗證活動是否存在且屬於該社群
    if (activityId !== undefined && activityId !== null) {
      const activities = await query(
        'SELECT id FROM activities WHERE id = ? AND community_id = ?',
        [activityId, ideas[0].community_id]
      ) as any[]
      
      if (activities.length === 0) {
        return NextResponse.json(
          { error: '指定的共備活動不存在或不屬於該社群' },
          { status: 400 }
        )
      }
    }

    // 更新想法資訊
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (activityId !== undefined) {
      updateFields.push('activity_id = ?')
      updateValues.push(activityId || null)
    }
    if (stage !== undefined) {
      updateFields.push('stage = ?')
      updateValues.push(stage)
    }
    if (title !== undefined) {
      updateFields.push('title = ?')
      updateValues.push(title)
    }
    if (content !== undefined) {
      updateFields.push('content = ?')
      updateValues.push(content)
    }
    if (position !== undefined) {
      updateFields.push('position_x = ?, position_y = ?')
      updateValues.push(position.x, position.y)
    }
    if (rotation !== undefined) {
      updateFields.push('rotation = ?')
      updateValues.push(rotation)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: '沒有需要更新的欄位' },
        { status: 400 }
      )
    }

    updateValues.push(ideaId)

    await query(
      `UPDATE ideas SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )

    // 查詢更新後的想法
    const updatedIdeas = await query(
      `SELECT 
        i.id,
        i.activity_id AS activityId,
        i.stage,
        i.title,
        i.content,
        i.parent_id AS parentId,
        i.position_x AS positionX,
        i.position_y AS positionY,
        i.rotation,
        i.is_convergence AS isConvergence,
        i.converged_idea_ids AS convergedIdeaIds,
        i.created_at AS createdDate,
        DATE_FORMAT(i.created_at, '%H:%i') AS createdTime,
        u.nickname AS creatorName,
        u.account AS creatorAccount
      FROM ideas i
      INNER JOIN users u ON i.creator_id = u.id
      WHERE i.id = ?`,
      [ideaId]
    ) as any[]

    // 安全地解析 convergedIdeaIds
    let convergedIdeaIds = undefined
    if (updatedIdeas[0].convergedIdeaIds) {
      try {
        if (typeof updatedIdeas[0].convergedIdeaIds === 'string') {
          const trimmed = updatedIdeas[0].convergedIdeaIds.trim()
          if (trimmed && trimmed !== 'null' && trimmed !== '') {
            convergedIdeaIds = JSON.parse(trimmed)
          }
        } else if (Array.isArray(updatedIdeas[0].convergedIdeaIds)) {
          convergedIdeaIds = updatedIdeas[0].convergedIdeaIds
        }
      } catch (parseError) {
        console.error('解析更新想法的 convergedIdeaIds 失敗:', {
          ideaId: updatedIdeas[0].id,
          convergedIdeaIds: updatedIdeas[0].convergedIdeaIds,
          error: parseError,
        })
        convergedIdeaIds = undefined
      }
    }

    const formattedIdea = {
      id: updatedIdeas[0].id,
      activityId: updatedIdeas[0].activityId || undefined, // 新增 activityId，但不顯示在卡片上
      stage: updatedIdeas[0].stage || '',
      title: updatedIdeas[0].title,
      content: updatedIdeas[0].content || '',
      parentId: updatedIdeas[0].parentId || undefined,
      position: updatedIdeas[0].positionX !== null && updatedIdeas[0].positionY !== null
        ? { x: parseFloat(updatedIdeas[0].positionX), y: parseFloat(updatedIdeas[0].positionY) }
        : undefined,
      rotation: updatedIdeas[0].rotation ? parseFloat(updatedIdeas[0].rotation) : 0,
      isConvergence: updatedIdeas[0].isConvergence === 1 || updatedIdeas[0].isConvergence === true,
      convergedIdeaIds,
      createdDate: updatedIdeas[0].createdDate
        ? (() => {
            const date = new Date(updatedIdeas[0].createdDate)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}/${month}/${day}`
          })()
        : '',
      createdTime: updatedIdeas[0].createdTime || '',
      creatorName: updatedIdeas[0].creatorName || '',
      creatorAccount: updatedIdeas[0].creatorAccount || '',
    }

    return NextResponse.json(formattedIdea)
  } catch (error: any) {
    console.error('更新想法錯誤:', error)
    return NextResponse.json(
      { error: '更新想法失敗', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE: 刪除想法
export async function DELETE(
  request: NextRequest,
  { params }: { params: { ideaId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { ideaId } = resolvedParams
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '請提供使用者ID' },
        { status: 400 }
      )
    }

    // 檢查使用者是否為想法建立者
    const ideas = await query(
      'SELECT creator_id FROM ideas WHERE id = ?',
      [ideaId]
    ) as any[]

    if (ideas.length === 0) {
      return NextResponse.json(
        { error: '想法不存在' },
        { status: 404 }
      )
    }

    if (ideas[0].creator_id !== userId) {
      return NextResponse.json(
        { error: '只有建立者可以刪除想法' },
        { status: 403 }
      )
    }

    // 刪除想法（外鍵約束會自動處理子節點）
    await query('DELETE FROM ideas WHERE id = ?', [ideaId])

    return NextResponse.json({ message: '想法已刪除' })
  } catch (error: any) {
    console.error('刪除想法錯誤:', error)
    return NextResponse.json(
      { error: '刪除想法失敗', details: error.message },
      { status: 500 }
    )
  }
}


