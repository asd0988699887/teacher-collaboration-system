// ============================================
// 共備活動 API - 單一活動操作
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: 讀取單一活動資訊
export async function GET(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { activityId } = resolvedParams

    // 查詢活動資訊
    const activities = await query(
      `SELECT 
        a.id,
        a.community_id AS communityId,
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

    if (activities.length === 0) {
      return NextResponse.json(
        { error: '活動不存在' },
        { status: 404 }
      )
    }

    const formattedActivity = {
      id: activities[0].id,
      communityId: activities[0].communityId,
      name: activities[0].name,
      introduction: activities[0].introduction || '',
      isPublic: activities[0].isPublic === 1 || activities[0].isPublic === true,
      password: activities[0].password || '',
      createdDate: activities[0].createdDate
        ? (() => {
            const date = new Date(activities[0].createdDate)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}/${month}/${day}`
          })()
        : '',
      createdTime: activities[0].createdTime || '',
      creatorId: activities[0].creatorId,
      creatorName: activities[0].creatorName || '',
    }

    return NextResponse.json(formattedActivity)
  } catch (error: any) {
    console.error('讀取活動資訊錯誤:', error)
    return NextResponse.json(
      { error: '讀取活動資訊失敗', details: error.message },
      { status: 500 }
    )
  }
}

// PUT: 更新活動資訊
export async function PUT(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { activityId } = resolvedParams
    const body = await request.json()
    const { name, introduction, isPublic, password, userId } = body

    // 驗證必填欄位
    if (!userId) {
      return NextResponse.json(
        { error: '請提供使用者ID' },
        { status: 400 }
      )
    }

    // 檢查使用者是否為活動建立者
    const activities = await query(
      'SELECT creator_id FROM activities WHERE id = ?',
      [activityId]
    ) as any[]

    if (activities.length === 0) {
      return NextResponse.json(
        { error: '活動不存在' },
        { status: 404 }
      )
    }

    if (activities[0].creator_id !== userId) {
      return NextResponse.json(
        { error: '只有建立者可以修改活動資訊' },
        { status: 403 }
      )
    }

    // 更新活動資訊
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (name !== undefined) {
      updateFields.push('name = ?')
      updateValues.push(name)
    }
    if (introduction !== undefined) {
      updateFields.push('introduction = ?')
      updateValues.push(introduction)
    }
    if (isPublic !== undefined) {
      updateFields.push('is_public = ?')
      updateValues.push(isPublic === true || isPublic === 'true' ? 1 : 0)
    }
    if (password !== undefined) {
      updateFields.push('password = ?')
      updateValues.push(password || null)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: '沒有需要更新的欄位' },
        { status: 400 }
      )
    }

    updateValues.push(activityId)

    await query(
      `UPDATE activities SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )

    // 查詢更新後的活動資訊
    const updatedActivities = await query(
      `SELECT 
        a.id,
        a.name,
        a.introduction,
        a.is_public AS isPublic,
        a.password,
        a.created_at AS createdDate,
        DATE_FORMAT(a.created_at, '%H:%i') AS createdTime,
        u.nickname AS creatorName
      FROM activities a
      INNER JOIN users u ON a.creator_id = u.id
      WHERE a.id = ?`,
      [activityId]
    ) as any[]

    const formattedActivity = {
      id: updatedActivities[0].id,
      name: updatedActivities[0].name,
      introduction: updatedActivities[0].introduction || '',
      isPublic: updatedActivities[0].isPublic === 1 || updatedActivities[0].isPublic === true,
      password: updatedActivities[0].password || '',
      createdDate: updatedActivities[0].createdDate
        ? (() => {
            const date = new Date(updatedActivities[0].createdDate)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}/${month}/${day}`
          })()
        : '',
      createdTime: updatedActivities[0].createdTime || '',
      creatorName: updatedActivities[0].creatorName || '',
    }

    return NextResponse.json(formattedActivity)
  } catch (error: any) {
    console.error('更新活動資訊錯誤:', error)
    return NextResponse.json(
      { error: '更新活動資訊失敗', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE: 刪除活動
export async function DELETE(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { activityId } = resolvedParams
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '請提供使用者ID' },
        { status: 400 }
      )
    }

    // 檢查使用者是否為活動建立者
    const activities = await query(
      'SELECT creator_id FROM activities WHERE id = ?',
      [activityId]
    ) as any[]

    if (activities.length === 0) {
      return NextResponse.json(
        { error: '活動不存在' },
        { status: 404 }
      )
    }

    if (activities[0].creator_id !== userId) {
      return NextResponse.json(
        { error: '只有建立者可以刪除活動' },
        { status: 403 }
      )
    }

    // 刪除活動（外鍵約束會自動刪除相關資料）
    await query('DELETE FROM activities WHERE id = ?', [activityId])

    return NextResponse.json({ message: '活動已刪除' })
  } catch (error: any) {
    console.error('刪除活動錯誤:', error)
    return NextResponse.json(
      { error: '刪除活動失敗', details: error.message },
      { status: 500 }
    )
  }
}


