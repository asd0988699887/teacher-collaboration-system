import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/learning-contents/chinese
 * 取得國文領域學習內容列表
 * 
 * 查詢參數：
 * - topic: 主題代碼 (Aa, Ab, Ac, Ad, Ba, Bb, Bc, Bd, Be, Ca, Cb, Cc) - 用於國小查詢
 * - stage: 階段 (I/II/III) - 用於國小查詢
 * - schoolLevel: 學段 (國小/國中/高中) - 用於國中/高中查詢
 * - mainCategoryCode: 主分類代碼 (Ab, Ac, Ad, Ba, Bb, Bc, Bd, Be, Ca, Cb, Cc) - 用於國中/高中查詢
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const topic = searchParams.get('topic')
    const stage = searchParams.get('stage')
    const schoolLevel = searchParams.get('schoolLevel')
    const mainCategoryCode = searchParams.get('mainCategoryCode')

    // === 國中/高中查詢 ===
    if (schoolLevel === '國中' || schoolLevel === '高中') {
      let sql = `
        SELECT 
          id,
          school_level AS schoolLevel,
          main_category_code AS mainCategoryCode,
          main_category_name AS mainCategoryName,
          code,
          description
        FROM chinese_middle_high_contents
        WHERE school_level = ?
      `
      const params: string[] = [schoolLevel]

      // 篩選主分類
      if (mainCategoryCode) {
        sql += ' AND main_category_code = ?'
        params.push(mainCategoryCode)
      }

      // 按主分類代碼、代碼排序
      sql += ' ORDER BY main_category_code, code'

      const results = await query(sql, params)

      // 如果沒有指定 mainCategoryCode，按主分類分組返回
      if (!mainCategoryCode) {
        const grouped: Record<string, any> = {}
        for (const row of results as any[]) {
          const cat = row.mainCategoryCode
          if (!grouped[cat]) {
            grouped[cat] = {
              mainCategoryCode: cat,
              mainCategoryName: row.mainCategoryName,
              contents: []
            }
          }
          grouped[cat].contents.push({
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
        topic,
        topic_name AS topicName,
        stage,
        stage_name AS stageName,
        serial,
        description
      FROM chinese_learning_contents
      WHERE 1=1
    `
    const params: any[] = []

    // 篩選主題
    if (topic) {
      sql += ' AND topic = ?'
      params.push(topic)
    }

    // 篩選階段
    if (stage) {
      sql += ' AND stage = ?'
      params.push(stage)
    }

    // 按主題、階段、流水號排序
    sql += ' ORDER BY topic, stage, serial'

    const results = await query(sql, params)

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('取得國文學習內容錯誤:', error)
    return NextResponse.json(
      { error: '取得國文學習內容失敗', details: error.message },
      { status: 500 }
    )
  }
}

