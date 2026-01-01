import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/learning-contents/english
 * 取得英文領域學習內容列表
 * 
 * 查詢參數：
 * - topic: 主題項目代碼 (Aa, Ab, Ac, Ad, Ae, B, C, D)
 * - stage: 階段 (I/II/III)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const topic = searchParams.get('topic')
    const stage = searchParams.get('stage')

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

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('取得英文學習內容錯誤:', error)
    return NextResponse.json(
      { error: '取得英文學習內容失敗', details: error.message },
      { status: 500 }
    )
  }
}

