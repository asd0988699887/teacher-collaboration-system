// ============================================
// 依信箱直接更新密碼（無郵件連結；請僅在受信任環境使用）
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: '請填寫電子郵件與新密碼' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密碼長度至少需要 6 個字元' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(email).trim())) {
      return NextResponse.json({ error: '請輸入有效的電子郵件地址' }, { status: 400 })
    }

    const trimmedEmail = String(email).trim()
    const rows = (await query('SELECT id FROM users WHERE email = ?', [trimmedEmail])) as { id: string }[]

    if (!rows?.length) {
      return NextResponse.json(
        { error: '找不到此電子郵件對應的帳號，請確認信箱是否與註冊時相同' },
        { status: 404 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await query('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, trimmedEmail])

    return NextResponse.json({ success: true, message: '密碼已更新' })
  } catch (error: any) {
    console.error('重設密碼錯誤:', error)
    return NextResponse.json({ error: '重設密碼失敗，請稍後再試' }, { status: 500 })
  }
}
