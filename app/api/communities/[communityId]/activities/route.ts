// ============================================
// 共備活動 API - 列表和建立
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'

type ActivitySelectVariant = 'full' | 'no_school_level' | 'no_completed_at' | 'minimal'

function buildActivitySelectSql(
  variant: ActivitySelectVariant,
  baseFrom: string,
  includeOrder: boolean
): string {
  const schoolLevelExpr =
    variant === 'full' || variant === 'no_completed_at'
      ? 'lp.school_level AS schoolLevel'
      : 'CAST(NULL AS CHAR(255)) AS schoolLevel'
  const completedAtExpr =
    variant === 'full' || variant === 'no_school_level'
      ? 'a.completed_at AS completedAt'
      : 'CAST(NULL AS DATETIME) AS completedAt'
  const orderClause =
    !includeOrder
      ? ''
      : variant === 'full' || variant === 'no_school_level'
        ? 'ORDER BY (a.completed_at IS NULL) DESC, COALESCE(lp.updated_at, a.created_at) DESC'
        : 'ORDER BY COALESCE(lp.updated_at, a.created_at) DESC'

  return `SELECT 
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
        ${schoolLevelExpr},
        COALESCE(lp.updated_at, a.created_at) AS lastModifiedAt,
        ${completedAtExpr}
      ${baseFrom}
      ${orderClause}`.trim()
}

const ACTIVITY_QUERY_VARIANTS: ActivitySelectVariant[] = [
  'full',
  'no_school_level',
  'no_completed_at',
  'minimal',
]

/** 僅在疑似「缺欄位」時換下一組 SQL，連線錯誤等不重試 */
function isRetryableSchemaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return /unknown column/i.test(msg) || /doesn't exist/i.test(msg) || /不存在/i.test(msg)
}

/**
 * 讀取活動列表（含教案摘要）：依序嘗試欄位組合，相容未跑 migrations 的資料庫
 */
async function fetchActivitiesForCommunity(communityId: string): Promise<any[]> {
  const baseFrom = `
      FROM activities a
      INNER JOIN users u ON a.creator_id = u.id
      LEFT JOIN lesson_plans lp ON lp.activity_id = a.id
      WHERE a.community_id = ?`

  let lastErr: unknown
  for (const variant of ACTIVITY_QUERY_VARIANTS) {
    try {
      const sql = buildActivitySelectSql(variant, baseFrom, true)
      return (await query(sql, [communityId])) as any[]
    } catch (err) {
      lastErr = err
      if (!isRetryableSchemaError(err)) throw err
    }
  }
  console.error('[activities] 所有相容查詢皆失敗，請檢查資料表 activities / lesson_plans / users 是否存在且可 JOIN。')
  throw lastErr
}

async function fetchActivityRowById(activityId: string): Promise<any[]> {
  const baseFrom = `
      FROM activities a
      INNER JOIN users u ON a.creator_id = u.id
      LEFT JOIN lesson_plans lp ON lp.activity_id = a.id
      WHERE a.id = ?`

  let lastErr: unknown
  for (const variant of ACTIVITY_QUERY_VARIANTS) {
    try {
      const sql = buildActivitySelectSql(variant, baseFrom, false)
      return (await query(sql, [activityId])) as any[]
    } catch (err) {
      lastErr = err
      if (!isRetryableSchemaError(err)) throw err
    }
  }
  throw lastErr
}

// GET: 讀取社群的所有活動列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const resolvedParams = await params
    const { communityId } = resolvedParams

    const activities = await fetchActivitiesForCommunity(communityId)

    const formatDateTime = (raw: Date | string | null | undefined) => {
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

    const formattedActivities = activities.map((activity) => {
      const { date: lastModifiedDate, time: lastModifiedTime } = formatDateTime(
        activity.lastModifiedAt
      )
      return {
        id: activity.id,
        name: activity.name,
        introduction: activity.introduction || '',
        isPublic: activity.isPublic === 1 || activity.isPublic === true,
        password: activity.password || '',
        createdDate: activity.createdDate
          ? (() => {
              const date = new Date(activity.createdDate)
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              return `${year}/${month}/${day}`
            })()
          : '',
        createdTime: activity.createdTime || '',
        creatorId: activity.creatorId || '',
        creatorName: activity.creatorName || '',
        lessonPlanTitle: activity.lessonPlanTitle || '',
        courseDomain: activity.courseDomain || '',
        designer: activity.designer || '',
        unitName: activity.unitName || '',
        implementationGrade: activity.implementationGrade || '',
        schoolLevel: activity.schoolLevel || '',
        lastModifiedDate,
        lastModifiedTime,
        coPrepCompleted: !!(activity.completedAt),
      }
    })

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
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const resolvedParams = await params
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

    const newActivities = await fetchActivityRowById(activityId)

    if (newActivities.length === 0) {
      return NextResponse.json(
        { error: '建立活動失敗' },
        { status: 500 }
      )
    }

    const na = newActivities[0]
    const lm = na.lastModifiedAt
      ? (() => {
          const d = new Date(na.lastModifiedAt)
          if (Number.isNaN(d.getTime())) return { date: '', time: '' }
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          const hh = String(d.getHours()).padStart(2, '0')
          const mm = String(d.getMinutes()).padStart(2, '0')
          return { date: `${year}/${month}/${day}`, time: `${hh}:${mm}` }
        })()
      : { date: '', time: '' }

    const formattedActivity = {
      id: na.id,
      name: na.name,
      introduction: na.introduction || '',
      isPublic: na.isPublic === 1 || na.isPublic === true,
      password: na.password || '',
      createdDate: na.createdDate
        ? (() => {
            const date = new Date(na.createdDate)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}/${month}/${day}`
          })()
        : '',
      createdTime: na.createdTime || '',
      creatorId: na.creatorId || '',
      creatorName: na.creatorName || '',
      lessonPlanTitle: na.lessonPlanTitle || '',
      courseDomain: na.courseDomain || '',
      designer: na.designer || '',
      unitName: na.unitName || '',
      implementationGrade: na.implementationGrade || '',
      schoolLevel: na.schoolLevel || '',
      lastModifiedDate: lm.date,
      lastModifiedTime: lm.time,
      coPrepCompleted: !!(na.completedAt),
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


