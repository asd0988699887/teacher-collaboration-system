import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/learning-contents/english
 * 取得英文領域學習內容列表
 * 
 * 查詢參數：
 * - topic: 主題項目代碼 (Aa, Ab, Ac, Ad, Ae, B, C, D) - 用於國小查詢
 * - stage: 階段 (I/II/III) - 用於國小查詢
 * - schoolLevel: 學段 (國小/國中/高中) - 用於國中/高中查詢
 * - mainCategoryCode: 主分類代碼 (A, B, C, D) - 用於國中/高中查詢
 * - subCategoryCode: 子分類代碼 (a, b, c, d, e) - 用於國中/高中查詢（僅 A 主題）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const topic = searchParams.get('topic')
    const stage = searchParams.get('stage')
    const schoolLevel = searchParams.get('schoolLevel')
    const mainCategoryCode = searchParams.get('mainCategoryCode')
    const subCategoryCode = searchParams.get('subCategoryCode')

    // === 國中/高中查詢 ===
    if (schoolLevel === '國中' || schoolLevel === '高中') {
      let sql = `
        SELECT 
          id,
          school_level AS schoolLevel,
          main_category_code AS mainCategoryCode,
          main_category_name AS mainCategoryName,
          sub_category_code AS subCategoryCode,
          sub_category_name AS subCategoryName,
          code,
          description
        FROM english_middle_high_contents
        WHERE school_level = ?
      `
      const params: string[] = [schoolLevel]

      // 篩選主分類
      if (mainCategoryCode) {
        sql += ' AND main_category_code = ?'
        params.push(mainCategoryCode)
      }

      // 篩選子分類
      if (subCategoryCode) {
        sql += ' AND sub_category_code = ?'
        params.push(subCategoryCode)
      }

      // 按主分類、子分類、代碼排序
      sql += ' ORDER BY main_category_code, sub_category_code, code'

      const results = await query(sql, params)

      // 如果沒有指定 mainCategoryCode，按主分類和子分類分組返回
      if (!mainCategoryCode) {
        const grouped: Record<string, any> = {}
        for (const row of results as any[]) {
          const mainCode = row.mainCategoryCode
          if (!grouped[mainCode]) {
            grouped[mainCode] = {
              mainCategoryCode: mainCode,
              mainCategoryName: row.mainCategoryName,
              subCategories: [] as any[],
              contents: [] as any[]
            }
          }

          // A 主題有子分類，B/C/D 沒有
          if (row.subCategoryCode) {
            // 檢查子分類是否已存在
            let subCat = grouped[mainCode].subCategories.find(
              (sc: any) => sc.subCategoryCode === row.subCategoryCode
            )
            if (!subCat) {
              subCat = {
                subCategoryCode: row.subCategoryCode,
                subCategoryName: row.subCategoryName,
                contents: []
              }
              grouped[mainCode].subCategories.push(subCat)
            }
            subCat.contents.push({
              id: row.id,
              code: row.code,
              description: row.description
            })
          } else {
            // B/C/D 主題沒有子分類，直接加入 contents
            grouped[mainCode].contents.push({
              id: row.id,
              code: row.code,
              description: row.description
            })
          }
        }
        return NextResponse.json(Object.values(grouped))
      }

      return NextResponse.json(results)
    }

    // === 國小查詢 ===
    let sql = `
      SELECT 
        id,
        code,
        topic,
        topic_name AS topicName,
        stage,
        stage_name AS stageName,
        serial,
        description
      FROM english_learning_contents
      WHERE 1=1
    `
    const params: any[] = []

    // 篩選主題項目
    if (topic) {
      sql += ' AND topic = ?'
      params.push(topic)
    }

    // 篩選階段
    if (stage) {
      sql += ' AND stage = ?'
      params.push(stage)
    }

    // 按主題項目、階段、流水號排序
    sql += ' ORDER BY topic, stage, serial'

    const results = await query(sql, params)

    // 如果沒有指定 topic 和 stage，按主分類分組返回
    if (!topic && !stage) {
      const grouped: Record<string, any> = {}
      
      for (const row of results as any[]) {
        // 判斷主分類：Aa-Ae 屬於 A，B/C/D 是獨立的主分類
        let mainCategoryCode = row.topic
        let mainCategoryName = ''
        
        if (row.topic.startsWith('A')) {
          mainCategoryCode = 'A'
          mainCategoryName = '語言知識'
        } else if (row.topic === 'B') {
          mainCategoryName = '溝通功能'
        } else if (row.topic === 'C') {
          mainCategoryName = '文化與習俗'
        } else if (row.topic === 'D') {
          mainCategoryName = '思考能力'
        }

        // 初始化主分類
        if (!grouped[mainCategoryCode]) {
          grouped[mainCategoryCode] = {
            mainCategoryCode: mainCategoryCode,
            mainCategoryName: mainCategoryName,
            subCategories: [] as any[],
            contents: [] as any[]
          }
        }

        // A 主題：按子項目分組
        if (mainCategoryCode === 'A') {
          const subCategoryCode = row.topic
          const subCategoryName = row.topicName
          
          // 查找或創建子分類
          let subCat = grouped[mainCategoryCode].subCategories.find(
            (sc: any) => sc.subCategoryCode === subCategoryCode
          )
          
          if (!subCat) {
            subCat = {
              subCategoryCode: subCategoryCode,
              subCategoryName: subCategoryName,
              contents: [] as any[]
            }
            grouped[mainCategoryCode].subCategories.push(subCat)
          }
          
          subCat.contents.push({
            id: row.id,
            code: row.code,
            stage: row.stage,
            stageName: row.stageName,
            description: row.description
          })
        } else {
          // B/C/D 主題：直接加入 contents
          grouped[mainCategoryCode].contents.push({
            id: row.id,
            code: row.code,
            stage: row.stage,
            stageName: row.stageName,
            description: row.description
          })
        }
      }
      
      return NextResponse.json(Object.values(grouped))
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('取得英文學習內容錯誤:', error)
    return NextResponse.json(
      { error: '取得英文學習內容失敗', details: error.message },
      { status: 500 }
    )
  }
}

