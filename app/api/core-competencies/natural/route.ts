import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/core-competencies/natural
 * 取得自然科核心素養列表
 * 
 * 查詢參數：
 * - schoolLevel: 學段 (國小/國中/高中)
 * - mainCategory: 總綱核心素養面向 (A/B/C)
 * - subCategory: 子項目 (A1/A2/A3/B1/B2/B3/C1/C2/C3)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const schoolLevel = searchParams.get('schoolLevel')
    const mainCategory = searchParams.get('mainCategory')
    const subCategory = searchParams.get('subCategory')

    let sql = `
      SELECT 
        id,
        school_level AS schoolLevel,
        main_category AS mainCategory,
        main_category_name AS mainCategoryName,
        sub_category AS subCategory,
        sub_category_name AS subCategoryName,
        code,
        general_description AS generalDescription,
        specific_description AS specificDescription
      FROM natural_core_competencies
      WHERE 1=1
    `
    const params: any[] = []

    // 篩選學段
    if (schoolLevel) {
      sql += ' AND school_level = ?'
      params.push(schoolLevel)
    }

    // 篩選總綱核心素養面向
    if (mainCategory) {
      sql += ' AND main_category = ?'
      params.push(mainCategory)
    }

    // 篩選子項目
    if (subCategory) {
      sql += ' AND sub_category = ?'
      params.push(subCategory)
    }

    // 按總綱核心素養面向、子項目、編碼排序
    sql += ' ORDER BY main_category, sub_category, code'

    const results = await query(sql, params)

    // 如果沒有指定 mainCategory 和 subCategory，按總綱核心素養面向和子項目分組返回
    if (!mainCategory && !subCategory) {
      const grouped: Record<string, any> = {}
      
      for (const row of results as any[]) {
        const mainCat = row.mainCategory
        if (!grouped[mainCat]) {
          grouped[mainCat] = {
            mainCategory: mainCat,
            mainCategoryName: row.mainCategoryName,
            subCategories: [] as any[]
          }
        }

        // 查找或創建子分類
        let subCat = grouped[mainCat].subCategories.find(
          (sc: any) => sc.subCategory === row.subCategory
        )
        
        if (!subCat) {
          subCat = {
            subCategory: row.subCategory,
            subCategoryName: row.subCategoryName,
            items: [] as any[]
          }
          grouped[mainCat].subCategories.push(subCat)
        }
        
        subCat.items.push({
          id: row.id,
          code: row.code,
          generalDescription: row.generalDescription,
          specificDescription: row.specificDescription
        })
      }
      
      return NextResponse.json(Object.values(grouped))
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('取得自然科核心素養錯誤:', error)
    return NextResponse.json(
      { error: '取得自然科核心素養失敗', details: error.message },
      { status: 500 }
    )
  }
}

