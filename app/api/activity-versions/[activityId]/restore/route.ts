// ============================================
// 回覆活動版本 API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query, transaction } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { activityId } = resolvedParams
    const body = await request.json()
    const { versionId, userId } = body

    console.log('回復版本請求:', { activityId, versionId, userId })

    // 驗證必填欄位
    if (!versionId || !userId) {
      return NextResponse.json(
        { error: '請提供版本ID和使用者ID' },
        { status: 400 }
      )
    }

    // 查詢要回覆的版本
    const versions = await query(
      'SELECT * FROM activity_versions WHERE id = ? AND activity_id = ?',
      [versionId, activityId]
    ) as any[]

    console.log('找到版本記錄:', { count: versions.length, hasLessonPlanId: versions.length > 0 ? !!versions[0].lesson_plan_id : false })

    if (versions.length === 0) {
      return NextResponse.json(
        { error: '版本不存在' },
        { status: 404 }
      )
    }

    const version = versions[0]

    // 檢查活動是否存在
    const activities = await query(
      'SELECT id FROM activities WHERE id = ?',
      [activityId]
    ) as any[]

    if (activities.length === 0) {
      return NextResponse.json(
        { error: '活動不存在' },
        { status: 404 }
      )
    }

    // 如果版本中有教案資料，需要回覆教案資料
    if (version.lesson_plan_data) {
      console.log('版本包含教案資料，開始回覆:', { hasData: !!version.lesson_plan_data })
      
      // 從版本快照中解析教案資料
      let lessonPlanSnapshot
      try {
        lessonPlanSnapshot = typeof version.lesson_plan_data === 'string' 
          ? JSON.parse(version.lesson_plan_data) 
          : version.lesson_plan_data
      } catch (error) {
        console.error('解析版本資料失敗:', error)
        return NextResponse.json(
          { error: '版本資料格式錯誤' },
          { status: 500 }
        )
      }

      console.log('解析的版本資料:', { 
        title: lessonPlanSnapshot.lessonPlanTitle,
        coreCompetencies: lessonPlanSnapshot.addedCoreCompetencies?.length || 0,
        learningPerformances: lessonPlanSnapshot.addedLearningPerformances?.length || 0,
        activityRows: lessonPlanSnapshot.activityRows?.length || 0
      })

      if (lessonPlanSnapshot) {

        // 使用事務回覆教案資料
        await transaction(async (connection) => {
          // 更新現有教案（如果存在）
          const existingLessonPlans = await connection.execute(
            'SELECT id FROM lesson_plans WHERE activity_id = ?',
            [activityId]
          ) as any[]

          console.log('查詢現有教案:', { count: existingLessonPlans.length })

          if (existingLessonPlans.length > 0) {
            const existingId = existingLessonPlans[0][0].id
            console.log('準備更新現有教案:', { existingId, newTitle: lessonPlanSnapshot.lessonPlanTitle })

            // 更新主表
            await connection.execute(
              `UPDATE lesson_plans SET
                lesson_plan_title = ?,
                course_domain = ?,
                designer = ?,
                unit_name = ?,
                implementation_grade = ?,
                teaching_time_lessons = ?,
                teaching_time_minutes = ?,
                material_source = ?,
                teaching_equipment = ?,
                learning_objectives = ?,
                assessment_tools = ?,
                \`references\` = ?
              WHERE id = ?`,
              [
                lessonPlanSnapshot.lessonPlanTitle || null,
                lessonPlanSnapshot.courseDomain || null,
                lessonPlanSnapshot.designer || null,
                lessonPlanSnapshot.unitName || null,
                lessonPlanSnapshot.implementationGrade || null,
                lessonPlanSnapshot.teachingTimeLessons || null,
                lessonPlanSnapshot.teachingTimeMinutes || null,
                lessonPlanSnapshot.materialSource || null,
                lessonPlanSnapshot.teachingEquipment || null,
                lessonPlanSnapshot.learningObjectives || null,
                lessonPlanSnapshot.assessmentTools || null,
                lessonPlanSnapshot.references || null,
                existingId,
              ]
            )

            // 刪除舊的關聯資料
            await connection.execute('DELETE FROM lesson_plan_core_competencies WHERE lesson_plan_id = ?', [existingId])
            await connection.execute('DELETE FROM lesson_plan_learning_performances WHERE lesson_plan_id = ?', [existingId])
            await connection.execute('DELETE FROM lesson_plan_learning_contents WHERE lesson_plan_id = ?', [existingId])
            await connection.execute('DELETE FROM lesson_plan_activity_rows WHERE lesson_plan_id = ?', [existingId])
            await connection.execute('DELETE FROM lesson_plan_specification_performances WHERE lesson_plan_id = ?', [existingId])
            await connection.execute('DELETE FROM lesson_plan_specification_contents WHERE lesson_plan_id = ?', [existingId])

            console.log('已刪除舊的關聯資料，準備從快照複製新資料')

            // 建立 ID 映射
            const performanceIdMap = new Map<string, string>()
            const contentIdMap = new Map<string, string>()
            const activityRowIdMap = new Map<string, string>()

            // 複製核心素養（從快照）
            const coreCompetencies = lessonPlanSnapshot.addedCoreCompetencies || []
            for (let i = 0; i < coreCompetencies.length; i++) {
              const cc = coreCompetencies[i]
              await connection.execute(
                'INSERT INTO lesson_plan_core_competencies (id, lesson_plan_id, content, sort_order) VALUES (?, ?, ?, ?)',
                [uuidv4(), existingId, cc.content || cc, i]
              )
            }

            // 複製學習表現（從快照，建立 ID 映射）
            const learningPerformances = lessonPlanSnapshot.addedLearningPerformances || []
            for (let i = 0; i < learningPerformances.length; i++) {
              const lp = learningPerformances[i]
              const newId = uuidv4()
              const oldId = lp.id || `temp-${i}`
              performanceIdMap.set(oldId, newId)
              await connection.execute(
                'INSERT INTO lesson_plan_learning_performances (id, lesson_plan_id, code, description, sort_order) VALUES (?, ?, ?, ?, ?)',
                [newId, existingId, lp.code || '', lp.description || lp.content || '', i]
              )
            }

            // 複製學習內容（從快照，建立 ID 映射）
            const learningContents = lessonPlanSnapshot.addedLearningContents || []
            for (let i = 0; i < learningContents.length; i++) {
              const lc = learningContents[i]
              const newId = uuidv4()
              const oldId = lc.id || `temp-${i}`
              contentIdMap.set(oldId, newId)
              await connection.execute(
                'INSERT INTO lesson_plan_learning_contents (id, lesson_plan_id, code, description, sort_order) VALUES (?, ?, ?, ?, ?)',
                [newId, existingId, lc.code || '', lc.description || lc.content || '', i]
              )
            }

            // 複製活動流程（從快照，建立 ID 映射）
            const activityRows = lessonPlanSnapshot.activityRows || []
            for (let i = 0; i < activityRows.length; i++) {
              const row = activityRows[i]
              const newId = uuidv4()
              const oldId = row.id || `temp-${i}`
              activityRowIdMap.set(oldId, newId)
              await connection.execute(
                `INSERT INTO lesson_plan_activity_rows (
                  id, lesson_plan_id, teaching_content, teaching_time, 
                  teaching_resources, assessment_methods, sort_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  newId, existingId, row.teachingContent || row.teaching_content || '', 
                  row.teachingTime || row.teaching_time || '',
                  row.teachingResources || row.teaching_resources || '', 
                  row.assessmentMethods || row.assessment_methods || '', i
                ]
              )
            }

            // 複製課綱學習表現（從快照）
            const checkedPerformances = lessonPlanSnapshot.checkedPerformances || []
            for (const cp of checkedPerformances) {
              const newPerformanceId = performanceIdMap.get(cp.performanceId || cp.performance_id)
              const newActivityRowId = activityRowIdMap.get(cp.activityRowId || cp.activity_row_id)
              
              if (newPerformanceId && newActivityRowId) {
                await connection.execute(
                  'INSERT INTO lesson_plan_specification_performances (id, lesson_plan_id, performance_id, activity_row_id, is_checked) VALUES (?, ?, ?, ?, ?)',
                  [uuidv4(), existingId, newPerformanceId, newActivityRowId, true]
                )
              }
            }

            // 複製課綱學習內容（從快照）
            const checkedContents = lessonPlanSnapshot.checkedContents || []
            for (const cc of checkedContents) {
              const newContentId = contentIdMap.get(cc.contentId || cc.content_id)
              const newActivityRowId = activityRowIdMap.get(cc.activityRowId || cc.activity_row_id)
              
              if (newContentId && newActivityRowId) {
                await connection.execute(
                  'INSERT INTO lesson_plan_specification_contents (id, lesson_plan_id, content_id, activity_row_id, is_checked) VALUES (?, ?, ?, ?, ?)',
                  [uuidv4(), existingId, newContentId, newActivityRowId, true]
                )
              }
            }

            console.log('教案資料回覆完成:', {
              coreCompetencies: coreCompetencies.length,
              learningPerformances: learningPerformances.length,
              learningContents: learningContents.length,
              activityRows: activityRows.length,
              checkedPerformances: checkedPerformances.length,
              checkedContents: checkedContents.length
            })
          } else {
            // 如果不存在，創建新的教案（這種情況應該很少發生）
            const newLessonPlanId = uuidv4()
            console.log('創建新教案')
            await connection.execute(
              `INSERT INTO lesson_plans (
                id, activity_id, lesson_plan_title, course_domain, designer,
                unit_name, implementation_grade, teaching_time_lessons,
                teaching_time_minutes, material_source, teaching_equipment,
                learning_objectives, assessment_tools, \`references\`
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                newLessonPlanId,
                activityId,
                lessonPlanSnapshot.lessonPlanTitle || null,
                lessonPlanSnapshot.courseDomain || null,
                lessonPlanSnapshot.designer || null,
                lessonPlanSnapshot.unitName || null,
                lessonPlanSnapshot.implementationGrade || null,
                lessonPlanSnapshot.teachingTimeLessons || null,
                lessonPlanSnapshot.teachingTimeMinutes || null,
                lessonPlanSnapshot.materialSource || null,
                lessonPlanSnapshot.teachingEquipment || null,
                lessonPlanSnapshot.learningObjectives || null,
                lessonPlanSnapshot.assessmentTools || null,
                lessonPlanSnapshot.references || null,
              ]
            )
            // TODO: 複製所有關聯表資料到新的 lesson_plan_id
          }
        })
      } else {
        console.log('版本快照資料為空')
      }
    } else {
      console.log('版本不包含教案資料，跳過教案回覆')
    }

    console.log('版本回覆成功:', { versionId, versionNumber: version.version_number })

    // 儲存當前版本資訊到教案表（用於前端顯示）
    try {
      await query(
        'UPDATE lesson_plans SET updated_at = NOW() WHERE activity_id = ?',
        [activityId]
      )
    } catch (error) {
      console.error('更新教案時間戳失敗:', error)
    }

    return NextResponse.json({
      message: '版本已回覆',
      versionId: versionId,
      versionNumber: version.version_number,
      currentVersionNumber: version.version_number, // 返回當前版本號
    })
  } catch (error: any) {
    console.error('回覆版本錯誤:', error)
    return NextResponse.json(
      { error: '回覆版本失敗', details: error.message },
      { status: 500 }
    )
  }
}


