import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// 資料庫連線配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'teacher_collaboration_system',
}

// GET: 取得社會科學習內容
export async function GET(request: NextRequest) {
  let connection

  try {
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage') // 'IV' 或 'V'
    const subject = searchParams.get('subject') // '歷'、'地'、'公'
    const theme = searchParams.get('theme') // 主題代碼（如：'B'）
    const category = searchParams.get('category') // 項目代碼（如：'a'）

    connection = await mysql.createConnection(dbConfig)

    // 情境 1：只有 stage + subject → 返回所有主題（去重）
    if (stage && subject && !theme && !category) {
      const [rows] = await connection.execute(
        `SELECT theme, theme_name
         FROM social_learning_contents
         WHERE stage = ? AND subject = ?
         GROUP BY theme, theme_name
         ORDER BY theme`,
        [stage, subject]
      )

      return NextResponse.json({
        success: true,
        type: 'themes',
        data: rows
      })
    }

    // 情境 2：stage + subject + theme → 返回該主題下的項目（去重）+ 條目
    if (stage && subject && theme && !category) {
      // 查詢該主題下是否有項目
      const [categories] = await connection.execute(
        `SELECT DISTINCT category, category_name
         FROM social_learning_contents
         WHERE stage = ? AND subject = ? AND theme = ? AND category IS NOT NULL
         ORDER BY category`,
        [stage, subject, theme]
      )

      // 查詢該主題下的所有條目
      const [contents] = await connection.execute(
        `SELECT id, code, theme, theme_name, category, category_name, description, sort_order
         FROM social_learning_contents
         WHERE stage = ? AND subject = ? AND theme = ?
         ORDER BY sort_order`,
        [stage, subject, theme]
      )

      return NextResponse.json({
        success: true,
        type: 'theme_details',
        data: {
          categories: categories, // 可能為空陣列（表示無項目）
          contents: contents
        }
      })
    }

    // 情境 3：stage + subject + theme + category → 返回該項目下的條目
    if (stage && subject && theme && category) {
      const [rows] = await connection.execute(
        `SELECT id, code, theme, theme_name, category, category_name, description, sort_order
         FROM social_learning_contents
         WHERE stage = ? AND subject = ? AND theme = ? AND category = ?
         ORDER BY sort_order`,
        [stage, subject, theme, category]
      )

      return NextResponse.json({
        success: true,
        type: 'contents',
        data: rows
      })
    }

    // 情境 4：只有 stage + subject + theme（無項目的主題） → 返回條目
    // 這個情況已經在情境 2 中處理了

    return NextResponse.json(
      { error: '缺少必要參數 (stage, subject)' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('取得社會科學習內容錯誤:', error)
    return NextResponse.json(
      { error: '取得社會科學習內容失敗', details: error.message },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
