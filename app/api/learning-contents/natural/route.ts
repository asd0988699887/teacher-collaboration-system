import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/learning-contents/natural
 * 取得自然科領域學習內容列表
 * 
 * 查詢參數：
 * - schoolLevel: 學段 (國中/高中) - 用於國中/高中查詢
 * - subjectCode: 科目代碼 (B/P/C/E) - 僅用於高中查詢
 * - themeCode: 主題代碼 (A-N，國中) 或主題代碼 (D/G/M等，高中) - 用於國中/高中查詢
 * - subThemeCode: 次主題代碼 (Aa, Ab等) - 用於國中/高中查詢
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const schoolLevel = searchParams.get('schoolLevel')
    const subjectCode = searchParams.get('subjectCode')
    const themeCode = searchParams.get('themeCode')
    const subThemeCode = searchParams.get('subThemeCode')

    // === 國中/高中查詢 ===
    if (schoolLevel === '國中' || schoolLevel === '高中') {
      let sql = `
        SELECT 
          id,
          school_level AS schoolLevel,
          subject_code AS subjectCode,
          subject_name AS subjectName,
          theme_code AS themeCode,
          theme_name AS themeName,
          sub_theme_code AS subThemeCode,
          sub_theme_name AS subThemeName,
          code,
          description
        FROM natural_middle_high_contents
        WHERE school_level = ?
      `
      const params: string[] = [schoolLevel]

      // 篩選科目（僅高中）
      if (subjectCode) {
        sql += ' AND subject_code = ?'
        params.push(subjectCode)
      }

      // 篩選主題
      if (themeCode) {
        sql += ' AND theme_code = ?'
        params.push(themeCode)
      }

      // 篩選次主題
      if (subThemeCode) {
        sql += ' AND sub_theme_code = ?'
        params.push(subThemeCode)
      }

      // 按科目、主題、次主題、代碼排序
      sql += ' ORDER BY subject_code, theme_code, sub_theme_code, code'

      const results = await query(sql, params)

      // 如果沒有指定篩選條件，按結構分組返回
      if (!subjectCode && !themeCode && !subThemeCode) {
        if (schoolLevel === '國中') {
          // 國中：三層結構（主題 → 次主題 → 學習內容）
          const grouped: Record<string, any> = {}
          for (const row of results as any[]) {
            const themeKey = row.themeCode
            if (!grouped[themeKey]) {
              grouped[themeKey] = {
                themeCode: row.themeCode,
                themeName: row.themeName,
                subThemes: [] as any[]
              }
            }

            // 查找或創建次主題
            let subTheme = grouped[themeKey].subThemes.find(
              (st: any) => st.subThemeCode === row.subThemeCode
            )
            if (!subTheme) {
              subTheme = {
                subThemeCode: row.subThemeCode,
                subThemeName: row.subThemeName,
                contents: [] as any[]
              }
              grouped[themeKey].subThemes.push(subTheme)
            }

            // 添加學習內容
            subTheme.contents.push({
              id: row.id,
              code: row.code,
              description: row.description
            })
          }
          return NextResponse.json(Object.values(grouped))
        } else {
          // 高中：四層結構（科目 → 主題 → 次主題 → 學習內容）
          const grouped: Record<string, any> = {}
          for (const row of results as any[]) {
            const subjectKey = row.subjectCode || 'OTHER'
            if (!grouped[subjectKey]) {
              grouped[subjectKey] = {
                subjectCode: row.subjectCode,
                subjectName: row.subjectName,
                themes: [] as any[]
              }
            }

            // 查找或創建主題
            let theme = grouped[subjectKey].themes.find(
              (t: any) => t.themeCode === row.themeCode
            )
            if (!theme) {
              theme = {
                themeCode: row.themeCode,
                themeName: row.themeName,
                subThemes: [] as any[]
              }
              grouped[subjectKey].themes.push(theme)
            }

            // 查找或創建次主題
            let subTheme = theme.subThemes.find(
              (st: any) => st.subThemeCode === row.subThemeCode
            )
            if (!subTheme) {
              subTheme = {
                subThemeCode: row.subThemeCode,
                subThemeName: row.subThemeName,
                contents: [] as any[]
              }
              theme.subThemes.push(subTheme)
            }

            // 添加學習內容
            subTheme.contents.push({
              id: row.id,
              code: row.code,
              description: row.description
            })
          }
          return NextResponse.json(Object.values(grouped))
        }
      }

      return NextResponse.json(results)
    }

    // === 國小查詢（如果未來需要） ===
    return NextResponse.json([])
  } catch (error: any) {
    console.error('取得自然科學習內容錯誤:', error)
    return NextResponse.json(
      { error: '取得自然科學習內容失敗', details: error.message },
      { status: 500 }
    )
  }
}

