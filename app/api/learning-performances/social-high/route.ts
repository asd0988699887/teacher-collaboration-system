import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/learning-performances/social-high
 * 取得高中（V）社會科學習表現
 * 
 * 回傳格式：
 * {
 *   dimensions: [
 *     {
 *       dimension: "1",
 *       dimensionName: "理解及思辯",
 *       categories: [
 *         {
 *           category: "a",
 *           categoryName: "覺察說明",
 *           performances: [
 *             { id, code, subject, description }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
export async function GET() {
  try {
    // 查詢高中（stage='V'）的所有學習表現
    const performances = await query(
      `SELECT 
        id, code, stage, subject, dimension, dimension_name, 
        category, category_name, description, sort_order
      FROM social_learning_performances_middle_high
      WHERE stage = 'V'
      ORDER BY sort_order ASC`,
      []
    ) as any[]

    if (!performances || performances.length === 0) {
      return NextResponse.json({ dimensions: [] })
    }

    // 按照構面（dimension）分組
    const dimensionsMap = new Map<string, {
      dimension: string
      dimensionName: string
      categories: Map<string, {
        category: string
        categoryName: string
        performances: any[]
      }>
    }>()

    for (const perf of performances) {
      // 取得或創建構面
      if (!dimensionsMap.has(perf.dimension)) {
        dimensionsMap.set(perf.dimension, {
          dimension: perf.dimension,
          dimensionName: perf.dimension_name,
          categories: new Map()
        })
      }
      const dimensionData = dimensionsMap.get(perf.dimension)!

      // 取得或創建項目
      if (!dimensionData.categories.has(perf.category)) {
        dimensionData.categories.set(perf.category, {
          category: perf.category,
          categoryName: perf.category_name,
          performances: []
        })
      }
      const categoryData = dimensionData.categories.get(perf.category)!

      // 加入學習表現
      categoryData.performances.push({
        id: perf.id,
        code: perf.code,
        subject: perf.subject,
        description: perf.description
      })
    }

    // 轉換為陣列格式
    const dimensions = Array.from(dimensionsMap.values()).map(dim => ({
      dimension: dim.dimension,
      dimensionName: dim.dimensionName,
      categories: Array.from(dim.categories.values())
    }))

    return NextResponse.json({ dimensions })

  } catch (error: any) {
    console.error('載入高中社會學習表現錯誤:', error)
    return NextResponse.json(
      { 
        error: '載入高中社會學習表現失敗', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

