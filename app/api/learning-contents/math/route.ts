import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/learning-contents/math
 * 取得數學領域學習內容列表
 * 
 * 查詢參數：
 * - category: 類別 (N/S/G/R/A/F/D) - 用於國小查詢
 * - grade: 年級 (1-6) - 用於國小查詢
 * - schoolLevel: 學段 (國小/國中/高中) - 用於國中/高中查詢
 * - gradeLevel: 年級 (7年級/8年級/9年級/10年級/11年級A類/11年級B類/12年級甲類/12年級乙類) - 用於國中/高中查詢
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const grade = searchParams.get('grade')
    const schoolLevel = searchParams.get('schoolLevel')
    const gradeLevel = searchParams.get('gradeLevel')

    // === 國中/高中查詢 ===
    if (schoolLevel === '國中' || schoolLevel === '高中') {
      let sql = `
        SELECT 
          id,
          school_level AS schoolLevel,
          grade,
          code,
          description
        FROM math_middle_high_contents
        WHERE school_level = ?
      `
      const params: string[] = [schoolLevel]

      // 篩選年級
      if (gradeLevel) {
        sql += ' AND grade = ?'
        params.push(gradeLevel)
      }

      // 按年級、代碼排序
      sql += ' ORDER BY grade, code'

      const results = await query(sql, params)

      // 如果沒有指定 gradeLevel，按年級分組返回
      if (!gradeLevel) {
        const grouped: Record<string, any> = {}
        for (const row of results as any[]) {
          const gradeKey = row.grade
          if (!grouped[gradeKey]) {
            grouped[gradeKey] = {
              grade: gradeKey,
              contents: []
            }
          }
          grouped[gradeKey].contents.push({
            id: row.id,
            code: row.code,
            description: row.description
          })
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

    // 如果沒有指定 category 和 grade，按年級分組返回
    if (!category && !grade) {
      const grouped: Record<string, any> = {}
      for (const row of results as any[]) {
        // 確保 grade 是數字類型
        const gradeKey = parseInt(row.grade) || row.grade
        if (!grouped[gradeKey]) {
          grouped[gradeKey] = {
            grade: gradeKey,
            contents: [] as any[]
          }
        }
        grouped[gradeKey].contents.push({
          id: row.id,
          code: row.code,
          category: row.category,
          categoryName: row.categoryName,
          description: row.description
        })
      }
      return NextResponse.json(Object.values(grouped))
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('取得數學學習內容錯誤:', error)
    return NextResponse.json(
      { error: '取得數學學習內容失敗', details: error.message },
      { status: 500 }
    )
  }
}

