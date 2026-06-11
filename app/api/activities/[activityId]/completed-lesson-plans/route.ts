// GET: 讀取已完成教案清單
// POST: 封存目前教案並重置為空白（產生新教案）

import { NextRequest, NextResponse } from 'next/server'
import { query, transaction } from '@/lib/db'
import type { LessonPlanSnapshotData } from '@/lib/lessonPlanSnapshot'

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

async function assertActivityMember(activityId: string, userId: string) {
  const rows = (await query(
    `SELECT a.id, a.community_id AS communityId, a.completed_at AS completedAt
     FROM activities a WHERE a.id = ?`,
    [activityId]
  )) as any[]

  if (rows.length === 0) {
    return { error: '活動不存在', status: 404 as const }
  }

  if (rows[0].completedAt) {
    return { error: '此活動已結束共備', status: 400 as const }
  }

  const members = (await query(
    'SELECT 1 FROM community_members WHERE community_id = ? AND user_id = ? LIMIT 1',
    [rows[0].communityId, userId]
  )) as any[]

  if (members.length === 0) {
    return { error: '僅社群成員可操作', status: 403 as const }
  }

  return { ok: true as const }
}

async function buildSnapshotFromDb(activityId: string): Promise<{
  lessonPlanId: string | null
  title: string
  snapshot: LessonPlanSnapshotData | null
}> {
  const lessonPlans = (await query('SELECT * FROM lesson_plans WHERE activity_id = ?', [
    activityId,
  ])) as any[]

  if (!lessonPlans || lessonPlans.length === 0) {
    return { lessonPlanId: null, title: '', snapshot: null }
  }

  const lessonPlan = lessonPlans[0]
  const lessonPlanId = lessonPlan.id

  const coreCompetencies =
    ((await query(
      'SELECT content FROM lesson_plan_core_competencies WHERE lesson_plan_id = ? ORDER BY sort_order',
      [lessonPlanId]
    )) as any[]) || []

  const learningPerformances =
    ((await query(
      'SELECT id, code, description FROM lesson_plan_learning_performances WHERE lesson_plan_id = ? ORDER BY sort_order',
      [lessonPlanId]
    )) as any[]) || []

  const learningContents =
    ((await query(
      'SELECT id, code, description FROM lesson_plan_learning_contents WHERE lesson_plan_id = ? ORDER BY sort_order',
      [lessonPlanId]
    )) as any[]) || []

  const activityRowsRaw =
    ((await query(
      'SELECT id, teaching_content, teaching_time, teaching_resources, assessment_methods FROM lesson_plan_activity_rows WHERE lesson_plan_id = ? ORDER BY sort_order',
      [lessonPlanId]
    )) as any[]) || []

  const specificationPerformances =
    ((await query(
      'SELECT performance_id, activity_row_id, is_checked FROM lesson_plan_specification_performances WHERE lesson_plan_id = ?',
      [lessonPlanId]
    )) as any[]) || []

  const specificationContents =
    ((await query(
      'SELECT content_id, activity_row_id, is_checked FROM lesson_plan_specification_contents WHERE lesson_plan_id = ?',
      [lessonPlanId]
    )) as any[]) || []

  const activityRows = activityRowsRaw.map((row: any) => {
    let selectedLearningObjectives: string[] = []
    let notes = ''
    let sequenceNumber = ''

    if (row.teaching_resources) {
      try {
        const parsed = JSON.parse(row.teaching_resources)
        if (parsed && typeof parsed === 'object') {
          selectedLearningObjectives = parsed.selectedLearningObjectives || []
          notes = parsed.notes || ''
          sequenceNumber = parsed.sequenceNumber || ''
        } else {
          notes = row.teaching_resources
        }
      } catch {
        notes = row.teaching_resources
      }
    }

    return {
      id: row.id,
      sequenceNumber,
      selectedLearningObjectives,
      activityFlow: row.teaching_content || '',
      time: row.teaching_time || '',
      assessmentMethod: row.assessment_methods || '',
      notes,
    }
  })

  const checkedPerformances: string[] = []
  const checkedContents: string[] = []

  const perfIdToIndex = new Map<string, number>()
  learningPerformances.forEach((p: any, index: number) => {
    if (p.id) perfIdToIndex.set(p.id, index)
  })

  const actIdToIndex = new Map<string, number>()
  activityRowsRaw.forEach((row: any, actIndex: number) => {
    if (row.id) actIdToIndex.set(row.id, actIndex)
  })

  specificationPerformances.forEach((spec: any) => {
    if (!spec.is_checked) return
    const perfIndex = perfIdToIndex.get(spec.performance_id)
    const actIndex = actIdToIndex.get(spec.activity_row_id)
    if (perfIndex !== undefined && actIndex !== undefined) {
      checkedPerformances.push(`perf-0-${perfIndex}-${actIndex}`)
    }
  })

  const contIdToIndex = new Map<string, number>()
  learningContents.forEach((c: any, index: number) => {
    if (c.id) contIdToIndex.set(c.id, index)
  })

  specificationContents.forEach((spec: any) => {
    if (!spec.is_checked) return
    const contIndex = contIdToIndex.get(spec.content_id)
    const actIndex = actIdToIndex.get(spec.activity_row_id)
    if (contIndex !== undefined && actIndex !== undefined) {
      checkedContents.push(`cont-0-${contIndex}-${actIndex}`)
    }
  })

  const snapshot: LessonPlanSnapshotData = {
    lessonPlanTitle: lessonPlan.lesson_plan_title,
    courseDomain: lessonPlan.course_domain,
    designer: lessonPlan.designer,
    unitName: lessonPlan.unit_name,
    schoolLevel: lessonPlan.school_level,
    implementationGrade: lessonPlan.implementation_grade,
    teachingTimeLessons: lessonPlan.teaching_time_lessons,
    teachingTimeMinutes: lessonPlan.teaching_time_minutes,
    materialSource: lessonPlan.material_source,
    teachingEquipment: lessonPlan.teaching_equipment,
    learningObjectives: lessonPlan.learning_objectives,
    assessmentTools: lessonPlan.assessment_tools,
    references: lessonPlan.references,
    addedCoreCompetencies: coreCompetencies.map((item: any) => ({ content: item.content })),
    addedLearningPerformances:
      learningPerformances.length > 0
        ? [
            {
              content: learningPerformances.map((p: any) => ({
                code: p.code,
                description: p.description,
              })),
            },
          ]
        : [],
    addedLearningContents:
      learningContents.length > 0
        ? [
            {
              content: learningContents.map((c: any) => ({
                code: c.code,
                description: c.description,
              })),
            },
          ]
        : [],
    activityRows,
    checkedPerformances,
    checkedContents,
  }

  return {
    lessonPlanId,
    title: lessonPlan.lesson_plan_title || '未命名教案',
    snapshot,
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params

    const rows = (await query(
      `SELECT
        clp.id,
        clp.title,
        clp.lesson_plan_data AS lessonPlanData,
        clp.completed_at AS completedAt,
        u.nickname AS completedByName
       FROM completed_lesson_plans clp
       LEFT JOIN users u ON u.id = clp.completed_by
       WHERE clp.activity_id = ?
       ORDER BY clp.sort_order DESC, clp.completed_at DESC`,
      [activityId]
    )) as any[]

    const items = rows.map((row: any) => {
      const completedAt = row.completedAt ? new Date(row.completedAt) : new Date()
      const year = completedAt.getFullYear()
      const month = String(completedAt.getMonth() + 1).padStart(2, '0')
      const day = String(completedAt.getDate()).padStart(2, '0')
      const hours = String(completedAt.getHours()).padStart(2, '0')
      const minutes = String(completedAt.getMinutes()).padStart(2, '0')

      let lessonPlanData: LessonPlanSnapshotData
      try {
        lessonPlanData =
          typeof row.lessonPlanData === 'string'
            ? JSON.parse(row.lessonPlanData)
            : row.lessonPlanData
      } catch {
        lessonPlanData = {}
      }

      return {
        id: row.id,
        title: row.title || lessonPlanData.lessonPlanTitle || '未命名教案',
        completedAt: completedAt.toISOString(),
        completedDate: `${year}/${month}/${day}`,
        completedTime: `${hours}:${minutes}`,
        completedByName: row.completedByName || undefined,
        lessonPlanData,
      }
    })

    return NextResponse.json({ items })
  } catch (error: unknown) {
    console.error('讀取已完成教案錯誤:', error)
    return NextResponse.json(
      { error: '讀取已完成教案失敗', details: error instanceof Error ? error.message : '未知錯誤' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: '請提供使用者 ID' }, { status: 400 })
    }

    const access = await assertActivityMember(activityId, userId)
    if ('error' in access) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const { lessonPlanId, title, snapshot } = await buildSnapshotFromDb(activityId)

    if (!lessonPlanId || !snapshot) {
      return NextResponse.json({ error: '尚無教案資料可封存' }, { status: 400 })
    }

    const archivedId = await transaction(async (connection) => {
      const [sortRows] = (await connection.execute(
        'SELECT COALESCE(MAX(sort_order), 0) AS maxSort FROM completed_lesson_plans WHERE activity_id = ?',
        [activityId]
      )) as [any[], any]
      const nextSort = (sortRows[0]?.maxSort || 0) + 1
      const id = generateUUID()

      await connection.execute(
        `INSERT INTO completed_lesson_plans (
          id, activity_id, title, lesson_plan_data, completed_by, sort_order, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [id, activityId, title, JSON.stringify(snapshot), userId, nextSort]
      )

      await connection.execute(
        'DELETE FROM lesson_plan_core_competencies WHERE lesson_plan_id = ?',
        [lessonPlanId]
      )
      await connection.execute(
        'DELETE FROM lesson_plan_learning_performances WHERE lesson_plan_id = ?',
        [lessonPlanId]
      )
      await connection.execute(
        'DELETE FROM lesson_plan_learning_contents WHERE lesson_plan_id = ?',
        [lessonPlanId]
      )
      await connection.execute(
        'DELETE FROM lesson_plan_activity_rows WHERE lesson_plan_id = ?',
        [lessonPlanId]
      )
      await connection.execute(
        'DELETE FROM lesson_plan_specification_performances WHERE lesson_plan_id = ?',
        [lessonPlanId]
      )
      await connection.execute(
        'DELETE FROM lesson_plan_specification_contents WHERE lesson_plan_id = ?',
        [lessonPlanId]
      )
      await connection.execute(
        `UPDATE lesson_plans SET
          lesson_plan_title = NULL,
          course_domain = NULL,
          designer = NULL,
          unit_name = NULL,
          school_level = NULL,
          implementation_grade = NULL,
          teaching_time_lessons = NULL,
          teaching_time_minutes = NULL,
          material_source = NULL,
          teaching_equipment = NULL,
          learning_objectives = NULL,
          assessment_tools = NULL,
          \`references\` = NULL,
          updated_at = NOW()
         WHERE id = ?`,
        [lessonPlanId]
      )

      return id
    })

    return NextResponse.json({
      ok: true,
      message: '已封存教案並建立新的空白教案',
      archivedId,
    })
  } catch (error: unknown) {
    console.error('封存教案錯誤:', error)
    const message = error instanceof Error ? error.message : '未知錯誤'
    if (/completed_lesson_plans/i.test(message)) {
      return NextResponse.json(
        { error: '資料表尚未建立，請先執行 add_completed_lesson_plans.sql migration' },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: '封存教案失敗', details: message }, { status: 500 })
  }
}
