import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/learning-performances/english
 * 取得英文領域學習表現列表
 * 
 * 查詢參數：
 * - category: 類別 (1-9: 聽/說/讀/寫/聽說讀寫綜合應用能力/學習興趣與態度/學習方法與策略/文化理解/邏輯思考判斷與創造力) - 用於國小查詢
 * - stage: 階段 (I/II/III) - 用於國小查詢
 * - schoolLevel: 學段 (國小/國中/高中) - 用於國中/高中查詢
 * - mainCategory: 大分類 (1-9) - 用於國中/高中查詢
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const stage = searchParams.get('stage')
    const schoolLevel = searchParams.get('schoolLevel')
    const mainCategory = searchParams.get('mainCategory')

    // === 國中/高中查詢 ===
    if (schoolLevel === '國中' || schoolLevel === '高中') {
      let sql = `
        SELECT 
          id,
          school_level AS schoolLevel,
          main_category AS mainCategory,
          main_category_name AS mainCategoryName,
          code,
          description
        FROM english_middle_high_performances
        WHERE school_level = ?
      `
      const params: string[] = [schoolLevel]

      // 篩選大分類
      if (mainCategory) {
        sql += ' AND main_category = ?'
        params.push(mainCategory)
      }

      // 按大分類、代碼排序
      sql += ' ORDER BY main_category, code'

      const results = await query(sql, params)

      // 如果沒有指定 mainCategory，按大分類分組返回
      if (!mainCategory) {
        const grouped: Record<number, any> = {}
        for (const row of results as any[]) {
          const cat = row.mainCategory
          if (!grouped[cat]) {
            grouped[cat] = {
              mainCategory: cat,
              mainCategoryName: row.mainCategoryName,
              performances: []
            }
          }
          grouped[cat].performances.push({
            id: row.id,
            code: row.code,
            description: row.description
          })
        }
        return NextResponse.json(Object.values(grouped))
      }

      return NextResponse.json(results)
    }

    // === 國小查詢（原有邏輯） ===
    let sql = `
      SELECT 
        id,
        code,
        category,
        category_name AS categoryName,
        stage,
        stage_name AS stageName,
        serial,
        description
      FROM english_learning_performances
      WHERE 1=1
    `
    const params: any[] = []

    // 篩選類別
    if (category) {
      sql += ' AND category = ?'
      params.push(parseInt(category))
    }

    // 篩選階段
    if (stage) {
      sql += ' AND stage = ?'
      params.push(stage)
    }

    // 按類別、階段、流水號排序
    sql += ' ORDER BY category, stage, serial'

    const results = await query(sql, params)

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('取得英文學習表現錯誤:', error)
    return NextResponse.json(
      { error: '取得英文學習表現失敗', details: error.message },
      { status: 500 }
    )
  }
}

