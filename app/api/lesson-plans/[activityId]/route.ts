// ============================================
// 教案 API 路由
// GET: 讀取教案資料
// POST: 儲存教案資料（包含版本管理）
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import pool, { query, transaction } from '@/lib/db'
import { createNotificationsForCommunity } from '@/lib/notifications'

// 生成 UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// GET: 讀取教案資料
export async function GET(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { activityId } = resolvedParams

    if (!activityId) {
      return NextResponse.json(
        { error: '缺少活動 ID' },
        { status: 400 }
      )
    }

    console.log('載入教案資料:', { activityId })

    // 讀取教案主表
    const lessonPlans = await query(
      'SELECT * FROM lesson_plans WHERE activity_id = ?',
      [activityId]
    ) as any[]

    console.log('查詢教案主表結果:', { 
      found: lessonPlans && lessonPlans.length > 0,
      count: lessonPlans?.length || 0,
      firstPlan: lessonPlans?.[0] ? {
        id: lessonPlans[0].id,
        title: lessonPlans[0].lesson_plan_title,
        activityId: lessonPlans[0].activity_id,
      } : null,
    })

    if (!lessonPlans || lessonPlans.length === 0) {
      console.log('教案不存在，返回空資料')
      return NextResponse.json({
        lessonPlan: null,
        coreCompetencies: [],
        learningPerformances: [],
        learningContents: [],
        activityRows: [],
        specificationPerformances: [],
        specificationContents: [],
      })
    }

    const lessonPlan = lessonPlans[0]
    const lessonPlanId = lessonPlan.id

    // 讀取核心素養
    const coreCompetencies = (await query(
      'SELECT id, content FROM lesson_plan_core_competencies WHERE lesson_plan_id = ? ORDER BY sort_order',
      [lessonPlanId]
    )) as any[] || []

    // 讀取學習表現
    const learningPerformances = (await query(
      'SELECT id, code, description FROM lesson_plan_learning_performances WHERE lesson_plan_id = ? ORDER BY sort_order',
      [lessonPlanId]
    )) as any[] || []

    // 讀取學習內容
    const learningContents = (await query(
      'SELECT id, code, description FROM lesson_plan_learning_contents WHERE lesson_plan_id = ? ORDER BY sort_order',
      [lessonPlanId]
    )) as any[] || []

    // 讀取活動與評量設計
    const activityRows = (await query(
      'SELECT id, teaching_content, teaching_time, teaching_resources, assessment_methods FROM lesson_plan_activity_rows WHERE lesson_plan_id = ? ORDER BY sort_order',
      [lessonPlanId]
    )) as any[] || []

    // 讀取雙向細目表勾選狀態
    const specificationPerformances = (await query(
      'SELECT performance_id, activity_row_id, is_checked FROM lesson_plan_specification_performances WHERE lesson_plan_id = ?',
      [lessonPlanId]
    )) as any[] || []

    const specificationContents = (await query(
      'SELECT content_id, activity_row_id, is_checked FROM lesson_plan_specification_contents WHERE lesson_plan_id = ?',
      [lessonPlanId]
    )) as any[] || []

    // 組合資料為前端格式
    const response = {
      lessonPlan: {
        id: lessonPlan.id,
        activityId: lessonPlan.activity_id,
        lessonPlanTitle: lessonPlan.lesson_plan_title,
        courseDomain: lessonPlan.course_domain,
        designer: lessonPlan.designer,
        unitName: lessonPlan.unit_name,
        implementationGrade: lessonPlan.implementation_grade,
        teachingTimeLessons: lessonPlan.teaching_time_lessons,
        teachingTimeMinutes: lessonPlan.teaching_time_minutes,
        materialSource: lessonPlan.material_source,
        teachingEquipment: lessonPlan.teaching_equipment,
        learningObjectives: lessonPlan.learning_objectives,
        assessmentTools: lessonPlan.assessment_tools,
        references: lessonPlan.references,
      },
      coreCompetencies: coreCompetencies.map((item: any) => ({
        content: item.content,
      })),
      learningPerformances: (() => {
        if (!learningPerformances || learningPerformances.length === 0) return []
        const grouped = groupLearningPerformances(learningPerformances)
        return grouped.map((group: any, groupIndex: number) => ({
          ...group,
          _groupIndex: groupIndex,
          content: (group.content || []).map((item: any, itemIndex: number) => {
            // 找到對應的原始資料以獲取 id
            const original = learningPerformances.find((p: any) => p.code === item.code)
            return {
              ...item,
              id: original?.id,
              _itemIndex: itemIndex,
            }
          }),
        }))
      })(),
      learningContents: (() => {
        if (!learningContents || learningContents.length === 0) return []
        const grouped = groupLearningContents(learningContents)
        return grouped.map((group: any, groupIndex: number) => ({
          ...group,
          _groupIndex: groupIndex,
          content: (group.content || []).map((item: any, itemIndex: number) => {
            // 找到對應的原始資料以獲取 id
            const original = learningContents.find((c: any) => c.code === item.code)
            return {
              ...item,
              id: original?.id,
              _itemIndex: itemIndex,
            }
          }),
        }))
      })(),
      activityRows: (activityRows || []).map((row: any) => ({
        id: row.id,
        teachingContent: row.teaching_content || '',
        teachingTime: row.teaching_time || '',
        teachingResources: row.teaching_resources || '',
        assessmentMethods: row.assessment_methods || '',
      })),
      specificationPerformances: (specificationPerformances || []).map((item: any) => ({
        performanceId: item.performance_id,
        activityRowId: item.activity_row_id,
        isChecked: item.is_checked === 1 || item.is_checked === true,
      })),
      specificationContents: (specificationContents || []).map((item: any) => ({
        contentId: item.content_id,
        activityRowId: item.activity_row_id,
        isChecked: item.is_checked === 1 || item.is_checked === true,
      })),
    }

    console.log('教案資料組合完成:', {
      hasLessonPlan: !!response.lessonPlan,
      coreCompetenciesCount: response.coreCompetencies.length,
      learningPerformancesCount: response.learningPerformances.length,
      learningContentsCount: response.learningContents.length,
      activityRowsCount: response.activityRows.length,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('讀取教案資料錯誤:', error)
    console.error('錯誤堆疊:', error.stack)
    console.error('錯誤詳情:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
    })
    return NextResponse.json(
      { error: '讀取教案資料失敗', details: error.message || '未知錯誤' },
      { status: 500 }
    )
  }
}

// POST: 儲存教案資料
export async function POST(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { activityId } = resolvedParams
    const body = await request.json()
    const userId = body.userId // 從請求中取得使用者 ID

    if (!activityId) {
      return NextResponse.json(
        { error: '缺少活動 ID' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: '缺少使用者 ID' },
        { status: 400 }
      )
    }

    console.log('開始儲存教案資料:', { activityId, userId, bodyKeys: Object.keys(body) })

    // 使用事務來確保資料一致性
    const result = await transaction(async (connection) => {
      // 1. 檢查教案是否存在
      const [existingRows] = await connection.execute(
        'SELECT id FROM lesson_plans WHERE activity_id = ?',
        [activityId]
      ) as [any[], any]

      console.log('檢查教案是否存在:', { existingRowsCount: existingRows?.length || 0 })

      let lessonPlanId: string

      if (existingRows && Array.isArray(existingRows) && existingRows.length > 0) {
        // 更新現有教案
        lessonPlanId = existingRows[0].id
        console.log('更新現有教案:', { lessonPlanId })
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
            \`references\` = ?,
            updated_at = NOW()
          WHERE id = ?`,
          [
            body.lessonPlanTitle || null,
            body.courseDomain || null,
            body.designer || null,
            body.unitName || null,
            body.implementationGrade || null,
            body.teachingTimeLessons ? parseInt(body.teachingTimeLessons) : null,
            body.teachingTimeMinutes ? parseInt(body.teachingTimeMinutes) : null,
            body.materialSource || null,
            body.teachingEquipment || null,
            body.learningObjectives || null,
            body.assessmentTools || null,
            body.references || null,
            lessonPlanId,
          ]
        )
      } else {
        // 建立新教案
        lessonPlanId = generateUUID()
        console.log('建立新教案:', { lessonPlanId, activityId })
        
        const insertParams = [
          lessonPlanId,
          activityId,
          body.lessonPlanTitle || null,
          body.courseDomain || null,
          body.designer || null,
          body.unitName || null,
          body.implementationGrade || null,
          body.teachingTimeLessons ? parseInt(body.teachingTimeLessons) : null,
          body.teachingTimeMinutes ? parseInt(body.teachingTimeMinutes) : null,
          body.materialSource || null,
          body.teachingEquipment || null,
          body.learningObjectives || null,
          body.assessmentTools || null,
          body.references || null,
        ]
        
        console.log('插入教案主表參數:', insertParams)
        
        await connection.execute(
          `INSERT INTO lesson_plans (
            id, activity_id, lesson_plan_title, course_domain, designer,
            unit_name, implementation_grade, teaching_time_lessons, teaching_time_minutes,
            material_source, teaching_equipment, learning_objectives,
            assessment_tools, \`references\`
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          insertParams
        )
        
        console.log('教案主表插入成功')
      }

      // 2. 刪除舊的關聯資料
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

      // 3. 插入核心素養
      if (body.addedCoreCompetencies && body.addedCoreCompetencies.length > 0) {
        console.log('插入核心素養:', { count: body.addedCoreCompetencies.length })
        for (let index = 0; index < body.addedCoreCompetencies.length; index++) {
          const item = body.addedCoreCompetencies[index]
          await connection.execute(
            'INSERT INTO lesson_plan_core_competencies (id, lesson_plan_id, content, sort_order) VALUES (?, ?, ?, ?)',
            [generateUUID(), lessonPlanId, item.content || null, index]
          )
        }
        console.log('核心素養插入完成')
      }

      // 4. 插入學習表現（展開後）
      if (body.addedLearningPerformances && body.addedLearningPerformances.length > 0) {
        let sortOrder = 0
        const performanceValues: any[] = []
        
        body.addedLearningPerformances.forEach((group: any) => {
          if (group.content && Array.isArray(group.content)) {
            group.content.forEach((item: any) => {
              performanceValues.push([
                generateUUID(),
                lessonPlanId,
                item.code,
                item.description,
                sortOrder++,
              ])
            })
          }
        })

        if (performanceValues.length > 0) {
          for (const values of performanceValues) {
            await connection.execute(
              'INSERT INTO lesson_plan_learning_performances (id, lesson_plan_id, code, description, sort_order) VALUES (?, ?, ?, ?, ?)',
              values
            )
          }
        }
      }

      // 5. 插入學習內容（展開後）
      if (body.addedLearningContents && body.addedLearningContents.length > 0) {
        let sortOrder = 0
        const contentValues: any[] = []
        
        body.addedLearningContents.forEach((group: any) => {
          if (group.content && Array.isArray(group.content)) {
            group.content.forEach((item: any) => {
              contentValues.push([
                generateUUID(),
                lessonPlanId,
                item.code,
                item.description,
                sortOrder++,
              ])
            })
          }
        })

        if (contentValues.length > 0) {
          for (const values of contentValues) {
            await connection.execute(
              'INSERT INTO lesson_plan_learning_contents (id, lesson_plan_id, code, description, sort_order) VALUES (?, ?, ?, ?, ?)',
              values
            )
          }
        }
      }

      // 6. 插入活動與評量設計
      if (body.activityRows && body.activityRows.length > 0) {
        for (let index = 0; index < body.activityRows.length; index++) {
          const row = body.activityRows[index]
          await connection.execute(
            'INSERT INTO lesson_plan_activity_rows (id, lesson_plan_id, teaching_content, teaching_time, teaching_resources, assessment_methods, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              row.id || generateUUID(),
              lessonPlanId,
              row.teachingContent || null,
              row.teachingTime || null,
              row.teachingResources || null,
              row.assessmentMethods || null,
              index,
            ]
          )
        }
      }

      // 7. 插入雙向細目表勾選狀態
      // 需要先取得學習表現和活動行的 ID 對應關係
      const [performancesRows] = await connection.execute(
        'SELECT id, code FROM lesson_plan_learning_performances WHERE lesson_plan_id = ? ORDER BY sort_order',
        [lessonPlanId]
      ) as [any[], any]

      const performances = performancesRows || []

      const [activityRowsData] = await connection.execute(
        'SELECT id FROM lesson_plan_activity_rows WHERE lesson_plan_id = ? ORDER BY sort_order',
        [lessonPlanId]
      ) as [any[], any]

      const activityRows = activityRowsData || []

      // 處理學習表現勾選狀態
      if (body.checkedPerformances && Array.isArray(body.checkedPerformances) && performances.length > 0 && activityRows.length > 0) {
        const specPerfValues: any[] = []
        
        // 解析前端的 key 格式: "perf-${perfIndex}-${perfContentIndex}-${actIndex}"
        body.checkedPerformances.forEach((key: string) => {
          const match = key.match(/^perf-(\d+)-(\d+)-(\d+)$/)
          if (match) {
            const perfIndex = parseInt(match[1])
            const perfContentIndex = parseInt(match[2])
            const actIndex = parseInt(match[3])
            
            // 計算實際的學習表現索引（需要展開後的索引）
            let actualPerfIndex = 0
            let currentGroupIndex = 0
            let currentContentIndex = 0
            
            if (body.addedLearningPerformances) {
              for (let i = 0; i < body.addedLearningPerformances.length; i++) {
                if (i === perfIndex) {
                  actualPerfIndex += perfContentIndex
                  break
                }
                if (body.addedLearningPerformances[i].content) {
                  actualPerfIndex += body.addedLearningPerformances[i].content.length
                }
              }
            }
            
            if (actualPerfIndex < performances.length && actIndex < activityRows.length) {
              specPerfValues.push([
                generateUUID(),
                lessonPlanId,
                performances[actualPerfIndex].id,
                activityRows[actIndex].id,
                true,
              ])
            }
          }
        })

        if (specPerfValues.length > 0) {
          for (const values of specPerfValues) {
            await connection.execute(
              'INSERT INTO lesson_plan_specification_performances (id, lesson_plan_id, performance_id, activity_row_id, is_checked) VALUES (?, ?, ?, ?, ?)',
              values
            )
          }
        }
      }

      // 處理學習內容勾選狀態
      if (body.checkedContents && Array.isArray(body.checkedContents) && activityRows.length > 0) {
        const [contentsRows] = await connection.execute(
          'SELECT id FROM lesson_plan_learning_contents WHERE lesson_plan_id = ? ORDER BY sort_order',
          [lessonPlanId]
        ) as [any[], any]

        const contents = contentsRows || []

        const specContentValues: any[] = []
        
        // 解析前端的 key 格式: "cont-${contIndex}-${contContentIndex}-${actIndex}"
        body.checkedContents.forEach((key: string) => {
          const match = key.match(/^cont-(\d+)-(\d+)-(\d+)$/)
          if (match) {
            const contIndex = parseInt(match[1])
            const contContentIndex = parseInt(match[2])
            const actIndex = parseInt(match[3])
            
            // 計算實際的學習內容索引（需要展開後的索引）
            let actualContentIndex = 0
            if (body.addedLearningContents) {
              for (let i = 0; i < body.addedLearningContents.length; i++) {
                if (i === contIndex) {
                  actualContentIndex += contContentIndex
                  break
                }
                if (body.addedLearningContents[i].content) {
                  actualContentIndex += body.addedLearningContents[i].content.length
                }
              }
            }
            
            if (actualContentIndex < contents.length && actIndex < activityRows.length) {
              specContentValues.push([
                generateUUID(),
                lessonPlanId,
                contents[actualContentIndex].id,
                activityRows[actIndex].id,
                true,
              ])
            }
          }
        })

        if (specContentValues.length > 0) {
          for (const values of specContentValues) {
            await connection.execute(
              'INSERT INTO lesson_plan_specification_contents (id, lesson_plan_id, content_id, activity_row_id, is_checked) VALUES (?, ?, ?, ?, ?)',
              values
            )
          }
        }
      }

      // 8. 建立新版本記錄
      const [versions] = await connection.execute(
        'SELECT MAX(version_number) as max_version FROM activity_versions WHERE activity_id = ?',
        [activityId]
      ) as any[]

      const nextVersionNumber = versions[0]?.max_version ? versions[0].max_version + 1 : 1
      
      console.log('建立版本記錄:', { activityId, nextVersionNumber, lessonPlanId })

      const versionData = {
        lessonPlanTitle: body.lessonPlanTitle,
        courseDomain: body.courseDomain,
        designer: body.designer,
        unitName: body.unitName,
        implementationGrade: body.implementationGrade,
        teachingTimeLessons: body.teachingTimeLessons,
        teachingTimeMinutes: body.teachingTimeMinutes,
        materialSource: body.materialSource,
        teachingEquipment: body.teachingEquipment,
        learningObjectives: body.learningObjectives,
        assessmentTools: body.assessmentTools,
        references: body.references,
        addedCoreCompetencies: body.addedCoreCompetencies,
        addedLearningPerformances: body.addedLearningPerformances,
        addedLearningContents: body.addedLearningContents,
        activityRows: body.activityRows,
      }

      // 嘗試插入版本記錄（包含 lesson_plan_id 如果欄位存在）
      try {
        await connection.execute(
          `INSERT INTO activity_versions (
            id, activity_id, version_number, modified_by, lesson_plan_data, lesson_plan_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [
            generateUUID(),
            activityId,
            nextVersionNumber,
            userId,
            JSON.stringify(versionData),
            lessonPlanId,
          ]
        )
        console.log('版本記錄插入成功（包含 lesson_plan_id）')
      } catch (error: any) {
        // 如果 lesson_plan_id 欄位不存在，使用舊的格式
        if (error.code === 'ER_BAD_FIELD_ERROR' && error.sqlMessage?.includes('lesson_plan_id')) {
          console.log('lesson_plan_id 欄位不存在，使用舊格式')
          await connection.execute(
            `INSERT INTO activity_versions (
              id, activity_id, version_number, modified_by, lesson_plan_data, created_at
            ) VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              generateUUID(),
              activityId,
              nextVersionNumber,
              userId,
              JSON.stringify(versionData),
            ]
          )
          console.log('版本記錄插入成功（不含 lesson_plan_id）')
        } else {
          throw error
        }
      }

      // 驗證資料是否真的寫入
      const [verifyLessonPlan] = await connection.execute(
        'SELECT * FROM lesson_plans WHERE id = ?',
        [lessonPlanId]
      ) as [any[], any]

      console.log('驗證教案資料:', { 
        exists: verifyLessonPlan && verifyLessonPlan.length > 0,
        lessonPlanTitle: verifyLessonPlan?.[0]?.lesson_plan_title,
        activityId: verifyLessonPlan?.[0]?.activity_id,
      })

      return {
        success: true,
        lessonPlanId,
        versionNumber: nextVersionNumber,
      }
    })

    // 創建通知給社群其他成員
    try {
      // 查詢活動所屬的社群 ID 和活動名稱
      const activities = await query(
        'SELECT community_id, name FROM activities WHERE id = ?',
        [activityId]
      ) as any[]

      if (activities.length > 0) {
        const communityId = activities[0].community_id
        const activityName = activities[0].name || '教案'

        // 查詢操作者名稱
        const users = await query(
          'SELECT nickname FROM users WHERE id = ?',
          [userId]
        ) as any[]

        const userName = users.length > 0 ? users[0].nickname : '使用者'

        await createNotificationsForCommunity({
          communityId,
          actorId: userId,
          type: 'lesson_plan',
          action: 'update',
          content: `${userName} 修改了教案「${activityName}」`,
          relatedId: activityId,
        })
      }
    } catch (notificationError) {
      // 通知失敗不影響主要功能
      console.error('創建教案通知失敗:', notificationError)
    }

    return NextResponse.json({
      success: true,
      message: '教案資料儲存成功',
      data: result,
    })
  } catch (error: any) {
    console.error('儲存教案資料錯誤:', error)
    console.error('錯誤堆疊:', error.stack)
    console.error('錯誤詳情:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
    })
    return NextResponse.json(
      { 
        error: '儲存教案資料失敗', 
        details: error.message || '未知錯誤',
        sqlMessage: error.sqlMessage || undefined,
        code: error.code || undefined,
      },
      { status: 500 }
    )
  }
}

// 輔助函數：將學習表現分組（還原前端格式）
function groupLearningPerformances(performances: any[]): any[] {
  // 簡單實作：將所有學習表現放在一個組中
  // 如果需要更複雜的分組邏輯，可以根據實際需求調整
  if (performances.length === 0) return []
  
  return [{
    content: performances.map((p: any) => ({
      code: p.code,
      description: p.description,
    })),
  }]
}

// 輔助函數：將學習內容分組（還原前端格式）
function groupLearningContents(contents: any[]): any[] {
  // 簡單實作：將所有學習內容放在一個組中
  // 如果需要更複雜的分組邏輯，可以根據實際需求調整
  if (contents.length === 0) return []
  
  return [{
    content: contents.map((c: any) => ({
      code: c.code,
      description: c.description,
    })),
  }]
}

