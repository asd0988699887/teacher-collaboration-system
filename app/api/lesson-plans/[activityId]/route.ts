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
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const resolvedParams = await params
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
        schoolLevel: lessonPlan.school_level,
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
      activityRows: (activityRows || []).map((row: any) => {
        // 嘗試解析 teaching_resources 中的 JSON 資料（新格式）
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
              // 如果不是 JSON，可能是舊格式的純文字
              notes = row.teaching_resources
            }
          } catch (e) {
            // 解析失敗，當作舊格式的純文字處理
            notes = row.teaching_resources
          }
        }
        
        // 返回新格式，同時保持向後相容性
        return {
          id: row.id,
          sequenceNumber: sequenceNumber,
          selectedLearningObjectives: selectedLearningObjectives,
          activityFlow: row.teaching_content || '',
          time: row.teaching_time || '',
          assessmentMethod: row.assessment_methods || '',
          notes: notes,
          // 保持向後相容性
          teachingContent: row.teaching_content || '',
          teachingTime: row.teaching_time || '',
          teachingResources: row.teaching_resources || '',
          assessmentMethods: row.assessment_methods || '',
        }
      }),
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
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const resolvedParams = await params
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
        
        // 檢查是否為只更新勾選狀態的請求（不包含教案基本資料）
        const isSpecificationOnlyUpdate = body.checkedPerformances !== undefined || body.checkedContents !== undefined
        
        // 如果只是更新勾選狀態，跳過教案主表的更新
        if (!isSpecificationOnlyUpdate || body.lessonPlanTitle !== undefined || body.learningObjectives !== undefined) {
          // 構建動態更新語句，只更新提供的欄位
          const updateFields: string[] = []
          const updateValues: any[] = []
          
          if (body.lessonPlanTitle !== undefined) {
            updateFields.push('lesson_plan_title = ?')
            updateValues.push(body.lessonPlanTitle || null)
          }
          if (body.courseDomain !== undefined) {
            updateFields.push('course_domain = ?')
            updateValues.push(body.courseDomain || null)
          }
          if (body.designer !== undefined) {
            updateFields.push('designer = ?')
            updateValues.push(body.designer || null)
          }
          if (body.unitName !== undefined) {
            updateFields.push('unit_name = ?')
            updateValues.push(body.unitName || null)
          }
          if (body.schoolLevel !== undefined) {
            updateFields.push('school_level = ?')
            updateValues.push(body.schoolLevel || null)
          }
          if (body.implementationGrade !== undefined) {
            updateFields.push('implementation_grade = ?')
            updateValues.push(body.implementationGrade || null)
          }
          if (body.teachingTimeLessons !== undefined) {
            updateFields.push('teaching_time_lessons = ?')
            updateValues.push(body.teachingTimeLessons ? parseInt(body.teachingTimeLessons) : null)
          }
          if (body.teachingTimeMinutes !== undefined) {
            updateFields.push('teaching_time_minutes = ?')
            updateValues.push(body.teachingTimeMinutes ? parseInt(body.teachingTimeMinutes) : null)
          }
          if (body.materialSource !== undefined) {
            updateFields.push('material_source = ?')
            updateValues.push(body.materialSource || null)
          }
          if (body.teachingEquipment !== undefined) {
            updateFields.push('teaching_equipment = ?')
            updateValues.push(body.teachingEquipment || null)
          }
          if (body.learningObjectives !== undefined) {
            updateFields.push('learning_objectives = ?')
            updateValues.push(body.learningObjectives || null)
          }
          if (body.assessmentTools !== undefined) {
            updateFields.push('assessment_tools = ?')
            updateValues.push(body.assessmentTools || null)
          }
          if (body.references !== undefined) {
            updateFields.push('`references` = ?')
            updateValues.push(body.references || null)
          }
          
          // 如果有欄位需要更新，執行更新
          if (updateFields.length > 0) {
            updateFields.push('updated_at = NOW()')
            updateValues.push(lessonPlanId)
            
            await connection.execute(
              `UPDATE lesson_plans SET ${updateFields.join(', ')} WHERE id = ?`,
              updateValues
            )
            console.log('教案主表更新成功，更新欄位數:', updateFields.length - 1)
          } else {
            console.log('跳過教案主表更新（沒有提供基本資料欄位）')
          }
        } else {
          console.log('跳過教案主表更新（只更新勾選狀態）')
        }
      } else {
        // 檢查是否為只更新勾選狀態的請求（不包含教案基本資料）
        const isSpecificationOnlyUpdate = (body.checkedPerformances !== undefined || body.checkedContents !== undefined) &&
                                         body.lessonPlanTitle === undefined && 
                                         body.learningObjectives === undefined &&
                                         body.courseDomain === undefined
        
        // 如果只是更新勾選狀態但教案不存在，無法建立教案（需要基本資料）
        if (isSpecificationOnlyUpdate) {
          console.log('無法建立新教案：只提供勾選狀態，缺少教案基本資料')
          throw new Error('無法建立新教案：只提供勾選狀態，缺少教案基本資料。請先建立教案基本資料。')
        }
        
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
          body.schoolLevel || null,
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
            unit_name, school_level, implementation_grade, teaching_time_lessons, teaching_time_minutes,
            material_source, teaching_equipment, learning_objectives,
            assessment_tools, \`references\`
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          insertParams
        )
        
        console.log('教案主表插入成功')
      }

      // 2. 刪除舊的關聯資料（只在有對應的新資料時才刪除，避免只更新勾選狀態時誤刪其他資料）
      // 檢查是否有完整的教案資料（用於判斷是否為完整更新）
      const isFullUpdate = body.lessonPlanTitle !== undefined || body.learningObjectives !== undefined || 
                          (body.addedCoreCompetencies !== undefined && body.addedCoreCompetencies.length > 0) ||
                          (body.addedLearningPerformances !== undefined && body.addedLearningPerformances.length > 0) ||
                          (body.addedLearningContents !== undefined && body.addedLearningContents.length > 0) ||
                          (body.activityRows !== undefined && body.activityRows.length > 0)
      
      if (isFullUpdate) {
        // 完整更新：刪除所有舊資料
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
      }
      
      // 勾選狀態總是刪除舊的（因為可能會有取消勾選的情況）
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
        // 先排序活動行
        const sortedRows = [...body.activityRows].sort((a: any, b: any) => {
          const seqA = a.sequenceNumber || ''
          const seqB = b.sequenceNumber || ''
          
          if (!seqA && !seqB) return 0
          if (!seqA) return 1
          if (!seqB) return -1
          
          const parseSequence = (seq: string): number[] => {
            return seq.split('-').map((part: string) => {
              const num = parseInt(part.trim(), 10)
              return isNaN(num) ? 0 : num
            })
          }
          
          const partsA = parseSequence(seqA)
          const partsB = parseSequence(seqB)
          
          const maxLength = Math.max(partsA.length, partsB.length)
          for (let i = 0; i < maxLength; i++) {
            const partA = partsA[i] || 0
            const partB = partsB[i] || 0
            
            if (partA !== partB) {
              return partA - partB
            }
          }
          
          return (a.id || '').localeCompare(b.id || '')
        })

        for (let index = 0; index < sortedRows.length; index++) {
          const row = sortedRows[index]
          
          // 處理新格式：將 selectedLearningObjectives 和 notes 序列化到 teaching_resources
          // 同時保持向後相容性
          let teachingContent = row.activityFlow || row.teachingContent || null
          let teachingTime = row.time || row.teachingTime || null
          let teachingResources = null
          let assessmentMethods = row.assessmentMethod || row.assessmentMethods || null
          
          // 如果有新格式的資料，序列化到 teaching_resources
          if (row.selectedLearningObjectives !== undefined || row.notes !== undefined || row.sequenceNumber !== undefined) {
            const resourcesData: any = {}
            if (row.selectedLearningObjectives !== undefined) {
              resourcesData.selectedLearningObjectives = row.selectedLearningObjectives
            }
            if (row.notes !== undefined) {
              resourcesData.notes = row.notes
            }
            if (row.sequenceNumber !== undefined) {
              resourcesData.sequenceNumber = row.sequenceNumber
            }
            teachingResources = JSON.stringify(resourcesData)
          } else if (row.teachingResources) {
            // 保持舊格式
            teachingResources = row.teachingResources
          }
          
          await connection.execute(
            'INSERT INTO lesson_plan_activity_rows (id, lesson_plan_id, teaching_content, teaching_time, teaching_resources, assessment_methods, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              row.id || generateUUID(),
              lessonPlanId,
              teachingContent,
              teachingTime,
              teachingResources,
              assessmentMethods,
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

      // 8. 建立新版本記錄（只在完整更新時建立，不包含只更新勾選狀態的情況）
      // 判斷是否為只更新勾選狀態：
      // 1. 明確標記為自動保存（isAutoSave: true）
      // 2. 或者：只有勾選狀態，且沒有任何教案基本資料
      const hasBasicLessonPlanData = body.lessonPlanTitle !== undefined || 
                                     body.courseDomain !== undefined ||
                                     body.designer !== undefined ||
                                     body.unitName !== undefined ||
                                     body.schoolLevel !== undefined ||
                                     body.implementationGrade !== undefined ||
                                     body.learningObjectives !== undefined ||
                                     body.assessmentTools !== undefined ||
                                     body.references !== undefined ||
                                     body.materialSource !== undefined ||
                                     body.teachingEquipment !== undefined ||
                                     body.teachingTimeLessons !== undefined ||
                                     body.teachingTimeMinutes !== undefined ||
                                     isFullUpdate
      
      const isSpecificationOnlyUpdate = body.isAutoSave === true || 
                                        ((body.checkedPerformances !== undefined || body.checkedContents !== undefined) &&
                                         !hasBasicLessonPlanData)
      
      let nextVersionNumber = 0
      
      if (!isSpecificationOnlyUpdate) {
        // 只在完整更新時建立版本記錄
        const [versions] = await connection.execute(
          'SELECT MAX(version_number) as max_version FROM activity_versions WHERE activity_id = ?',
          [activityId]
        ) as any[]

        nextVersionNumber = versions[0]?.max_version ? versions[0].max_version + 1 : 1
        
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
      } else {
        console.log('跳過版本記錄建立（只更新勾選狀態）')
        // 獲取當前版本號（不建立新版本）
        const [versions] = await connection.execute(
          'SELECT MAX(version_number) as max_version FROM activity_versions WHERE activity_id = ?',
          [activityId]
        ) as any[]
        nextVersionNumber = versions[0]?.max_version || 0
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

