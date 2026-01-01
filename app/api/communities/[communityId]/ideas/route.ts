// ============================================
// 想法牆 API - 列表和建立
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'
import { createNotificationsForCommunity } from '@/lib/notifications'

// GET: 讀取社群的所有想法
export async function GET(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams

    // 查詢社群的所有想法
    const ideas = await query(
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
      WHERE i.community_id = ?
      ORDER BY i.created_at ASC`,
      [communityId]
    ) as any[]

    const formattedIdeas = ideas.map((idea) => {
      // 安全地解析 convergedIdeaIds
      let convergedIdeaIds = undefined
      if (idea.convergedIdeaIds) {
        try {
          // 如果已經是數組，直接使用；如果是字符串，嘗試解析
          if (typeof idea.convergedIdeaIds === 'string') {
            const trimmed = idea.convergedIdeaIds.trim()
            if (trimmed && trimmed !== 'null' && trimmed !== '') {
              convergedIdeaIds = JSON.parse(trimmed)
            }
          } else if (Array.isArray(idea.convergedIdeaIds)) {
            convergedIdeaIds = idea.convergedIdeaIds
          }
        } catch (parseError) {
          console.error('解析 convergedIdeaIds 失敗:', {
            ideaId: idea.id,
            convergedIdeaIds: idea.convergedIdeaIds,
            error: parseError,
          })
          // 解析失敗時設為 undefined，不影響其他數據
          convergedIdeaIds = undefined
        }
      }

      return {
        id: idea.id,
        activityId: idea.activityId || undefined, // 新增 activityId，但不顯示在卡片上
        stage: idea.stage || '',
        title: idea.title,
        content: idea.content || '',
        parentId: idea.parentId || undefined,
        position: idea.positionX !== null && idea.positionY !== null
          ? { x: parseFloat(idea.positionX), y: parseFloat(idea.positionY) }
          : undefined,
        rotation: idea.rotation ? parseFloat(idea.rotation) : 0,
        isConvergence: idea.isConvergence === 1 || idea.isConvergence === true,
        convergedIdeaIds,
        createdDate: idea.createdDate
          ? new Date(idea.createdDate).toISOString().split('T')[0].replace(/-/g, '/')
          : '',
        createdTime: idea.createdTime || '',
        creatorName: idea.creatorName || '',
        creatorAccount: idea.creatorAccount || '',
      }
    })

    return NextResponse.json(formattedIdeas)
  } catch (error: any) {
    console.error('讀取想法列表錯誤:', error)
    return NextResponse.json(
      { error: '讀取想法列表失敗', details: error.message },
      { status: 500 }
    )
  }
}

// POST: 建立新想法
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
    const { stage, title, content, parentId, position, rotation, isConvergence, convergedIdeaIds, creatorId, activityId } = body

    // 驗證必填欄位
    if (!title || !creatorId) {
      return NextResponse.json(
        { error: '請填寫標題和建立者ID' },
        { status: 400 }
      )
    }

    // 檢查社群是否存在
    const communities = await query(
      'SELECT id FROM communities WHERE id = ?',
      [communityId]
    ) as any[]

    if (communities.length === 0) {
      return NextResponse.json(
        { error: '社群不存在' },
        { status: 404 }
      )
    }

    // 建立想法
    const ideaId = uuidv4()
    
    // 如果提供了 activityId，驗證活動是否存在且屬於該社群
    if (activityId) {
      const activities = await query(
        'SELECT id FROM activities WHERE id = ? AND community_id = ?',
        [activityId, communityId]
      ) as any[]
      
      if (activities.length === 0) {
        return NextResponse.json(
          { error: '指定的共備活動不存在或不属于該社群' },
          { status: 400 }
        )
      }
    }

    // 確保所有參數都不是 undefined
    const insertParams = [
      ideaId,
      communityId,
      activityId || null, // 新增 activity_id
      creatorId || null,
      stage || null,
      title || null,
      content || null,
      parentId || null,
      position?.x ?? null,
      position?.y ?? null,
      rotation ?? 0,
      isConvergence === true ? 1 : 0,
      convergedIdeaIds ? JSON.stringify(convergedIdeaIds) : null,
    ]
    
    // 驗證所有參數都不是 undefined
    if (insertParams.some(param => param === undefined)) {
      console.error('參數包含 undefined:', { ideaId, communityId, creatorId, stage, title, content, parentId, position, rotation, isConvergence, convergedIdeaIds })
      return NextResponse.json(
        { error: '參數驗證失敗，請檢查想法資料' },
        { status: 400 }
      )
    }
    
    await query(
      `INSERT INTO ideas (
        id, community_id, activity_id, creator_id, stage, title, content,
        parent_id, position_x, position_y, rotation,
        is_convergence, converged_idea_ids
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      insertParams
    )

    // 查詢新建立的想法
    const newIdeas = await query(
      `SELECT 
        i.id,
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

    if (newIdeas.length === 0) {
      return NextResponse.json(
        { error: '建立想法失敗' },
        { status: 500 }
      )
    }

    const formattedIdea = {
      id: newIdeas[0].id,
      activityId: newIdeas[0].activityId || undefined, // 新增 activityId，但不顯示在卡片上
      stage: newIdeas[0].stage || '',
      title: newIdeas[0].title,
      content: newIdeas[0].content || '',
      parentId: newIdeas[0].parentId || undefined,
      position: newIdeas[0].positionX !== null && newIdeas[0].positionY !== null
        ? { x: parseFloat(newIdeas[0].positionX), y: parseFloat(newIdeas[0].positionY) }
        : undefined,
      rotation: newIdeas[0].rotation ? parseFloat(newIdeas[0].rotation) : 0,
      isConvergence: newIdeas[0].isConvergence === 1 || newIdeas[0].isConvergence === true,
      convergedIdeaIds: (() => {
        try {
          if (!newIdeas[0].convergedIdeaIds) return undefined
          if (typeof newIdeas[0].convergedIdeaIds === 'string') {
            const trimmed = newIdeas[0].convergedIdeaIds.trim()
            if (trimmed && trimmed !== 'null' && trimmed !== '') {
              return JSON.parse(trimmed)
            }
          } else if (Array.isArray(newIdeas[0].convergedIdeaIds)) {
            return newIdeas[0].convergedIdeaIds
          }
          return undefined
        } catch (parseError) {
          console.error('解析新想法的 convergedIdeaIds 失敗:', {
            ideaId: newIdeas[0].id,
            convergedIdeaIds: newIdeas[0].convergedIdeaIds,
            error: parseError,
          })
          return undefined
        }
      })(),
      createdDate: newIdeas[0].createdDate
        ? new Date(newIdeas[0].createdDate).toISOString().split('T')[0].replace(/-/g, '/')
        : '',
      createdTime: newIdeas[0].createdTime || '',
      creatorName: newIdeas[0].creatorName || '',
      creatorAccount: newIdeas[0].creatorAccount || '',
    }

    // 創建通知給社群其他成員
    const creatorName = formattedIdea.creatorName || '使用者'
    const isReply = !!parentId
    
    await createNotificationsForCommunity({
      communityId,
      actorId: creatorId,
      type: 'idea',
      action: isReply ? 'reply' : 'create',
      content: isReply 
        ? `${creatorName} 回復了想法節點「${title}」`
        : `${creatorName} 新增了想法節點「${title}」`,
      relatedId: ideaId,
    })

    return NextResponse.json(formattedIdea, { status: 201 })
  } catch (error: any) {
    console.error('建立想法錯誤:', error)
    return NextResponse.json(
      { error: '建立想法失敗', details: error.message },
      { status: 500 }
    )
  }
}


