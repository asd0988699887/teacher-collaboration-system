import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

const MH_TABLE = 'social_middle_high_contents'
const ELEMENTARY_TABLE = 'social_learning_contents'

/**
 * GET /api/learning-contents/social
 *
 * 國小：無 stage/subject（或 schoolLevel=國小）→ 回傳 topic_item 結構陣列
 * 國中/高中：stage (IV|V) + subject (歷|地|公) + 可選 theme、category
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stage = searchParams.get('stage')
    const subject = searchParams.get('subject')
    const theme = searchParams.get('theme')
    const category = searchParams.get('category')
    const schoolLevel = searchParams.get('schoolLevel')
    const topicItem = searchParams.get('topicItem')

    const isMiddleHigh =
      schoolLevel === '國中' ||
      schoolLevel === '高中' ||
      schoolLevel === '高中（高職）' ||
      (stage === 'IV' || stage === 'V') && !!subject

    if (!isMiddleHigh) {
      let sql = `
        SELECT
          id,
          code,
          topic_item AS topicItem,
          topic_item_name AS topicItemName,
          stage,
          stage_name AS stageName,
          serial,
          description
        FROM ${ELEMENTARY_TABLE}
        WHERE 1=1
      `
      const params: string[] = []

      if (topicItem) {
        sql += ' AND topic_item = ?'
        params.push(topicItem)
      }
      if (stage && (stage === 'II' || stage === 'III')) {
        sql += ' AND stage = ?'
        params.push(stage)
      }

      sql += ' ORDER BY topic_item, stage, serial'

      const results = await query(sql, params)
      return NextResponse.json(results)
    }

    if (!stage || !subject) {
      return NextResponse.json(
        { error: '缺少必要參數 (stage, subject)' },
        { status: 400 }
      )
    }

    // 情境 1：stage + subject → 主題列表
    if (!theme && !category) {
      const rows = await query(
        `SELECT theme, theme_name AS themeName
         FROM ${MH_TABLE}
         WHERE stage = ? AND subject = ?
         GROUP BY theme, theme_name
         ORDER BY theme`,
        [stage, subject]
      )

      return NextResponse.json({
        success: true,
        type: 'themes',
        data: rows,
      })
    }

    // 情境 2：stage + subject + theme → 項目 + 條目
    if (theme && !category) {
      const categories = await query(
        `SELECT DISTINCT category, category_name AS categoryName
         FROM ${MH_TABLE}
         WHERE stage = ? AND subject = ? AND theme = ? AND category IS NOT NULL
         ORDER BY category`,
        [stage, subject, theme]
      )

      const contents = await query(
        `SELECT id, code, theme, theme_name AS themeName, category,
                category_name AS categoryName, description, sort_order AS sortOrder
         FROM ${MH_TABLE}
         WHERE stage = ? AND subject = ? AND theme = ?
         ORDER BY sort_order`,
        [stage, subject, theme]
      )

      return NextResponse.json({
        success: true,
        type: 'theme_details',
        data: {
          categories,
          contents,
        },
      })
    }

    // 情境 3：stage + subject + theme + category → 條目
    if (theme && category) {
      const rows = await query(
        `SELECT id, code, theme, theme_name AS themeName, category,
                category_name AS categoryName, description, sort_order AS sortOrder
         FROM ${MH_TABLE}
         WHERE stage = ? AND subject = ? AND theme = ? AND category = ?
         ORDER BY sort_order`,
        [stage, subject, theme, category]
      )

      return NextResponse.json({
        success: true,
        type: 'contents',
        data: rows,
      })
    }

    return NextResponse.json(
      { error: '參數組合無效' },
      { status: 400 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('取得社會科學習內容錯誤:', error)

    if (/doesn't exist|unknown column|topic_item/i.test(message)) {
      const isMissingMhTable = /social_middle_high_contents/i.test(message)
      return NextResponse.json(
        {
          error: isMissingMhTable
            ? '社會科國中/高中學習內容資料表尚未就緒'
            : '社會科國小學習內容資料表尚未就緒',
          details: isMissingMhTable
            ? '請執行 database/migrations/add_social_middle_high_contents.sql 與 database/seeds/social_middle_high_contents.sql'
            : '請執行 database/create_social_learning_contents.sql 與 seed_social_learning_contents.sql',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: '取得社會科學習內容失敗', details: message },
      { status: 500 }
    )
  }
}
