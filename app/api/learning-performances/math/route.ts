import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/learning-performances/math
 * 取得數學領域學習表現列表
 * 
 * 查詢參數：
 * - category: 類別 (n/s/g/r/a/f/d)
 * - stage: 階段 (I/II/III/IV/V) - 用於國小查詢
 * - schoolLevel: 學段 (國小/國中/高中) - 用於國中/高中查詢
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const stage = searchParams.get('stage')
    const schoolLevel = searchParams.get('schoolLevel')

    // === 國中/高中查詢 ===
    if (schoolLevel === '國中' || schoolLevel === '高中') {
      let sql = `
        SELECT 
          id,
          school_level AS schoolLevel,
          category,
          category_name AS categoryName,
          code,
          description
        FROM math_middle_high_performances
        WHERE school_level = ?
      `
      const params: string[] = [schoolLevel]

      // 篩選項目
      if (category) {
        sql += ' AND category = ?'
        params.push(category)
      }

      // 按項目、代碼排序
      sql += ' ORDER BY category, code'

      const results = await query(sql, params)

      // 如果沒有指定 category，按項目分組返回
      if (!category) {
        const grouped: Record<string, any> = {}
        for (const row of results as any[]) {
          const cat = row.category
          if (!grouped[cat]) {
            grouped[cat] = {
              category: cat,
              categoryName: row.categoryName,
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
      FROM math_learning_performances
      WHERE 1=1
    `
    const params: string[] = []

    // 篩選類別
    if (category) {
      sql += ' AND category = ?'
      params.push(category)
    }

    // 篩選階段
    if (stage) {
      sql += ' AND stage = ?'
      params.push(stage)
    }

    // 按類別、階段、流水號排序（注意：流水號不代表順序，僅用於識別）
    sql += ' ORDER BY category, stage, serial'

    const results = await query(sql, params)

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('取得數學學習表現錯誤:', error)
    return NextResponse.json(
      { error: '取得數學學習表現失敗', details: error.message },
      { status: 500 }
    )
  }
}

