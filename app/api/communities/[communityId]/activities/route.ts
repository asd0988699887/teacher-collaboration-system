// ============================================
// 共備活動 API - 列表和建立
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'

// GET: 讀取社群的所有活動列表
export async function GET(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams

    // 查詢社群的所有活動
    const activities = await query(
      `SELECT 
        a.id,
        a.name,
        a.introduction,
        a.is_public AS isPublic,
        a.password,
        a.creator_id AS creatorId,
        a.created_at AS createdDate,
        DATE_FORMAT(a.created_at, '%H:%i') AS createdTime,
        u.nickname AS creatorName
      FROM activities a
      INNER JOIN users u ON a.creator_id = u.id
      WHERE a.community_id = ?
      ORDER BY a.created_at DESC`,
      [communityId]
    ) as any[]

    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      name: activity.name,
      introduction: activity.introduction || '',
      isPublic: activity.isPublic === 1 || activity.isPublic === true,
      password: activity.password || '',
      createdDate: activity.createdDate
        ? new Date(activity.createdDate).toISOString().split('T')[0].replace(/-/g, '/')
        : '',
      createdTime: activity.createdTime || '',
      creatorId: activity.creatorId || '',
      creatorName: activity.creatorName || '',
    }))

    return NextResponse.json(formattedActivities)
  } catch (error: any) {
    console.error('讀取活動列表錯誤:', error)
    return NextResponse.json(
      { error: '讀取活動列表失敗', details: error.message },
      { status: 500 }
    )
  }
}

// POST: 建立新活動
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
    const { name, introduction, isPublic, password, creatorId } = body

    // 驗證必填欄位
    if (!name || !creatorId) {
      return NextResponse.json(
        { error: '請填寫活動名稱和建立者ID' },
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

    // 檢查建立者是否存在
    const users = await query(
      'SELECT id FROM users WHERE id = ?',
      [creatorId]
    ) as any[]

    if (users.length === 0) {
      return NextResponse.json(
        { error: '建立者不存在' },
        { status: 404 }
      )
    }

    // 建立活動
    const activityId = uuidv4()
    
    // 確保所有參數都不是 undefined
    const insertParams = [
      activityId,
      communityId,
      name || null,
      introduction || null,
      isPublic === true || isPublic === 'true' ? 1 : 0,
      password || null,
      creatorId || null,
    ]
    
    // 驗證所有參數都不是 undefined
    if (insertParams.some(param => param === undefined)) {
      console.error('參數包含 undefined:', { activityId, communityId, name, introduction, isPublic, password, creatorId })
      return NextResponse.json(
        { error: '參數驗證失敗，請檢查活動資料' },
        { status: 400 }
      )
    }
    
    await query(
      'INSERT INTO activities (id, community_id, name, introduction, is_public, password, creator_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      insertParams
    )

    // 查詢新建立的活動
    const newActivities = await query(
      `SELECT 
        a.id,
        a.name,
        a.introduction,
        a.is_public AS isPublic,
        a.password,
        a.creator_id AS creatorId,
        a.created_at AS createdDate,
        DATE_FORMAT(a.created_at, '%H:%i') AS createdTime,
        u.nickname AS creatorName
      FROM activities a
      INNER JOIN users u ON a.creator_id = u.id
      WHERE a.id = ?`,
      [activityId]
    ) as any[]

    if (newActivities.length === 0) {
      return NextResponse.json(
        { error: '建立活動失敗' },
        { status: 500 }
      )
    }

    const formattedActivity = {
      id: newActivities[0].id,
      name: newActivities[0].name,
      introduction: newActivities[0].introduction || '',
      isPublic: newActivities[0].isPublic === 1 || newActivities[0].isPublic === true,
      password: newActivities[0].password || '',
      createdDate: newActivities[0].createdDate
        ? new Date(newActivities[0].createdDate).toISOString().split('T')[0].replace(/-/g, '/')
        : '',
      createdTime: newActivities[0].createdTime || '',
      creatorId: newActivities[0].creatorId || '',
      creatorName: newActivities[0].creatorName || '',
    }

    return NextResponse.json(formattedActivity, { status: 201 })
  } catch (error: any) {
    console.error('建立活動錯誤:', error)
    return NextResponse.json(
      { error: '建立活動失敗', details: error.message },
      { status: 500 }
    )
  }
}


