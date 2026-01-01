import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/learning-performances/chinese
 * 取得國文領域學習表現列表
 * 
 * 查詢參數：
 * - category: 類別 (1-6: 聆聽/口語表達/標音符號與運用/識字與寫字/閱讀/寫作)
 * - stage: 階段 (I/II/III)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const stage = searchParams.get('stage')

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
      FROM chinese_learning_performances
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
    console.error('取得國文學習表現錯誤:', error)
    return NextResponse.json(
      { error: '取得國文學習表現失敗', details: error.message },
      { status: 500 }
    )
  }
}

