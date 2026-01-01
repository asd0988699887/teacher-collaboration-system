// ============================================
// 使用者註冊 API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { account, nickname, school, email, password } = body

    // 驗證必填欄位
    if (!account || !nickname || !email || !password) {
      return NextResponse.json(
        { error: '請填寫所有必填欄位' },
        { status: 400 }
      )
    }

    // 驗證密碼長度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密碼長度至少需要 6 個字元' },
        { status: 400 }
      )
    }

    // 驗證 Email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '請輸入有效的電子郵件地址' },
        { status: 400 }
      )
    }

    // 檢查帳號是否已存在
    const existingAccount = await query(
      'SELECT id FROM users WHERE account = ?',
      [account]
    ) as any[]

    if (existingAccount.length > 0) {
      return NextResponse.json(
        { error: '此帳號已被使用' },
        { status: 409 }
      )
    }

    // 檢查 Email 是否已存在
    const existingEmail = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as any[]

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: '此電子郵件已被使用' },
        { status: 409 }
      )
    }

    // 加密密碼
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 產生使用者 ID
    const userId = uuidv4()

    // 插入使用者資料
    await query(
      `INSERT INTO users (id, account, nickname, email, school, password_hash) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, account, nickname, email, school || null, passwordHash]
    )

    // 回傳成功訊息（不包含密碼）
    return NextResponse.json(
      {
        success: true,
        message: '註冊成功',
        user: {
          id: userId,
          account,
          nickname,
          email,
          school: school || null,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('註冊錯誤:', error)
    
    // 處理資料庫錯誤
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: '帳號或電子郵件已被使用' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: '註冊失敗，請稍後再試' },
      { status: 500 }
    )
  }
}


