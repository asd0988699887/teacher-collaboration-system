import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/learning-performances/social
 * 取得社會領域學習表現列表
 * 
 * 查詢參數：
 * - dimension_item: 構面項目代碼 (1a, 1b, 1c, 2a, 2b, 2c, 3a, 3b, 3c, 3d)
 * - stage: 階段 (II/III)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dimensionItem = searchParams.get('dimension_item')
    const stage = searchParams.get('stage')

    let sql = `
      SELECT 
        id,
        code,
        dimension_item AS dimensionItem,
        dimension_item_name AS dimensionItemName,
        stage,
        stage_name AS stageName,
        serial,
        description
      FROM social_learning_performances
      WHERE 1=1
    `
    const params: any[] = []

    // 篩選構面項目
    if (dimensionItem) {
      sql += ' AND dimension_item = ?'
      params.push(dimensionItem)
    }

    // 篩選階段
    if (stage) {
      sql += ' AND stage = ?'
      params.push(stage)
    }

    // 按構面項目、階段、流水號排序
    sql += ' ORDER BY dimension_item, stage, serial'

    const results = await query(sql, params)

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('取得社會學習表現錯誤:', error)
    return NextResponse.json(
      { error: '取得社會學習表現失敗', details: error.message },
      { status: 500 }
    )
  }
}

