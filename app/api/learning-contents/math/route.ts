import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/learning-contents/math
 * 取得數學領域學習內容列表
 * 
 * 查詢參數：
 * - category: 類別 (N/S/G/R/A/F/D)
 * - grade: 年級 (1-6)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const grade = searchParams.get('grade')

    let sql = `
      SELECT 
        id,
        code,
        category,
        category_name AS categoryName,
        grade,
        serial,
        description
      FROM math_learning_contents
      WHERE 1=1
    `
    const params: any[] = []

    // 篩選類別
    if (category) {
      sql += ' AND category = ?'
      params.push(category)
    }

    // 篩選年級
    if (grade) {
      sql += ' AND grade = ?'
      params.push(parseInt(grade))
    }

    // 按類別、年級、流水號排序
    sql += ' ORDER BY category, grade, serial'

    const results = await query(sql, params)

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('取得數學學習內容錯誤:', error)
    return NextResponse.json(
      { error: '取得數學學習內容失敗', details: error.message },
      { status: 500 }
    )
  }
}

