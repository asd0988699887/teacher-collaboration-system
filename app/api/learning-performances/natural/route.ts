import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/learning-performances/natural
 * 取得自然科領域學習表現列表
 * 
 * 查詢參數：
 * - schoolLevel: 學段 (國中/高中) - 用於國中/高中查詢
 * - mainCategory: 項目（探究能力、科學的態度與本質） - 用於國中/高中查詢
 * - subCategoryCode: 子項代碼（t, p, a） - 用於國中/高中查詢
 * - itemCode: 子項項目代碼（i, r, c, m, o, e, a, c, h, n） - 用於國中/高中查詢
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const schoolLevel = searchParams.get('schoolLevel')
    const mainCategory = searchParams.get('mainCategory')
    const subCategoryCode = searchParams.get('subCategoryCode')
    const itemCode = searchParams.get('itemCode')

    // === 國中/高中查詢 ===
    if (schoolLevel === '國中' || schoolLevel === '高中') {
      let sql = `
        SELECT 
          id,
          school_level AS schoolLevel,
          main_category AS mainCategory,
          sub_category_code AS subCategoryCode,
          sub_category_name AS subCategoryName,
          item_code AS itemCode,
          item_name AS itemName,
          code,
          description
        FROM natural_middle_high_performances
        WHERE school_level = ?
      `
      const params: string[] = [schoolLevel]

      // 篩選項目
      if (mainCategory) {
        sql += ' AND main_category = ?'
        params.push(mainCategory)
      }

      // 篩選子項
      if (subCategoryCode) {
        sql += ' AND sub_category_code = ?'
        params.push(subCategoryCode)
      }

      // 篩選子項項目
      if (itemCode) {
        sql += ' AND item_code = ?'
        params.push(itemCode)
      }

      // 按項目、子項、子項項目、代碼排序
      sql += ' ORDER BY main_category, sub_category_code, item_code, code'

      const results = await query(sql, params)

      // 如果沒有指定篩選條件，按三層結構分組返回
      // 第一層：sub_category_code（t, p, a）
      // 第二層：item_code（i, r, c, m, o, e, a, c, h, n）
      // 第三層：performances（ti-IV-1 等）
      if (!mainCategory && !subCategoryCode && !itemCode) {
        const grouped: Record<string, any> = {}
        for (const row of results as any[]) {
          // 第一層：使用 sub_category_code 作為 key
          // 顯示名稱：main_category + sub_category_name（例如：探究能力-思考智能（t））
          const subCatKey = row.subCategoryCode
          if (!grouped[subCatKey]) {
            // 根據 main_category 決定顯示名稱
            let displayName = row.subCategoryName
            if (row.mainCategory === '探究能力') {
              displayName = `探究能力-${row.subCategoryName}（${row.subCategoryCode}）`
            } else {
              displayName = `${row.subCategoryName}（${row.subCategoryCode}）`
            }
            grouped[subCatKey] = {
              subCategoryCode: row.subCategoryCode,
              subCategoryName: displayName,
              items: [] as any[]
            }
          }

          // 查找或創建子項項目（第二層）
          let item = grouped[subCatKey].items.find(
            (it: any) => it.itemCode === row.itemCode
          )
          if (!item) {
            item = {
              itemCode: row.itemCode,
              itemName: row.itemName,
              performances: [] as any[]
            }
            grouped[subCatKey].items.push(item)
          }

          // 第三層：學習表現
          item.performances.push({
            id: row.id,
            code: row.code,
            description: row.description
          })
        }
        return NextResponse.json(Object.values(grouped))
      }

      return NextResponse.json(results)
    }

    // === 國小查詢（如果未來需要） ===
    return NextResponse.json([])
  } catch (error: any) {
    console.error('取得自然科學習表現錯誤:', error)
    return NextResponse.json(
      { error: '取得自然科學習表現失敗', details: error.message },
      { status: 500 }
    )
  }
}

