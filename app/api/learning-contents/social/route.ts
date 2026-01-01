import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/learning-contents/social
 * 取得社會領域學習內容列表
 * 
 * 查詢參數：
 * - topic_item: 主題軸項目代碼 (Aa, Ab, Ac, Ad, Ae, Af, Ba, Bb, Bc, Ca, Cb, Cc, Cd, Ce, Da, Db, Dc)
 * - stage: 階段 (II/III)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const topicItem = searchParams.get('topic_item')
    const stage = searchParams.get('stage')

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
      FROM social_learning_contents
      WHERE 1=1
    `
    const params: any[] = []

    // 篩選主題軸項目
    if (topicItem) {
      sql += ' AND topic_item = ?'
      params.push(topicItem)
    }

    // 篩選階段
    if (stage) {
      sql += ' AND stage = ?'
      params.push(stage)
    }

    // 按主題軸項目、階段、流水號排序
    sql += ' ORDER BY topic_item, stage, serial'

    const results = await query(sql, params)

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('取得社會學習內容錯誤:', error)
    return NextResponse.json(
      { error: '取得社會學習內容失敗', details: error.message },
      { status: 500 }
    )
  }
}

