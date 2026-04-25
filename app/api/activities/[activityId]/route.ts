// ============================================
// 共備活動 API - 單一活動操作
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

function formatLastModified(raw: Date | string | null | undefined) {
  if (!raw) return { date: '', time: '' }
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return { date: '', time: '' }
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return { date: `${year}/${month}/${day}`, time: `${hh}:${mm}` }
}

// GET: 讀取單一活動資訊
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const resolvedParams = await params
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

    const row = activities[0]
    const { date: lastModifiedDate, time: lastModifiedTime } = formatLastModified(
      row.lastModifiedAt
    )
    const formattedActivity = {
      id: row.id,
      communityId: row.communityId,
      name: row.name,
      introduction: row.introduction || '',
      isPublic: row.isPublic === 1 || row.isPublic === true,
      password: row.password || '',
      createdDate: row.createdDate
        ? (() => {
            const date = new Date(row.createdDate)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}/${month}/${day}`
          })()
        : '',
      createdTime: row.createdTime || '',
      creatorId: row.creatorId,
      creatorName: row.creatorName || '',
      lessonPlanTitle: row.lessonPlanTitle || '',
      courseDomain: row.courseDomain || '',
      designer: row.designer || '',
      unitName: row.unitName || '',
      implementationGrade: row.implementationGrade || '',
      schoolLevel: row.schoolLevel || '',
      lastModifiedDate,
      lastModifiedTime,
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
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const resolvedParams = await params
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
        a.creator_id AS creatorId,
        a.created_at AS createdDate,
        DATE_FORMAT(a.created_at, '%H:%i') AS createdTime,
        u.nickname AS creatorName,
        lp.lesson_plan_title AS lessonPlanTitle,
        lp.course_domain AS courseDomain,
        lp.designer AS designer,
        lp.unit_name AS unitName,
        lp.implementation_grade AS implementationGrade,
        lp.school_level AS schoolLevel,
        COALESCE(lp.updated_at, a.created_at) AS lastModifiedAt
      FROM activities a
      INNER JOIN users u ON a.creator_id = u.id
      LEFT JOIN lesson_plans lp ON lp.activity_id = a.id
      WHERE a.id = ?`,
      [activityId]
    ) as any[]

    const ur = updatedActivities[0]
    const { date: lastModifiedDate, time: lastModifiedTime } = formatLastModified(
      ur.lastModifiedAt
    )
    const formattedActivity = {
      id: ur.id,
      name: ur.name,
      introduction: ur.introduction || '',
      isPublic: ur.isPublic === 1 || ur.isPublic === true,
      password: ur.password || '',
      createdDate: ur.createdDate
        ? (() => {
            const date = new Date(ur.createdDate)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}/${month}/${day}`
          })()
        : '',
      createdTime: ur.createdTime || '',
      creatorId: ur.creatorId || '',
      creatorName: ur.creatorName || '',
      lessonPlanTitle: ur.lessonPlanTitle || '',
      courseDomain: ur.courseDomain || '',
      designer: ur.designer || '',
      unitName: ur.unitName || '',
      implementationGrade: ur.implementationGrade || '',
      schoolLevel: ur.schoolLevel || '',
      lastModifiedDate,
      lastModifiedTime,
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
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const resolvedParams = await params
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


