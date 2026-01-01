import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountNumber, password } = body

    // 調試日誌
    console.log('登入 API 收到請求:', {
      accountNumber: accountNumber,
      passwordLength: password?.length || 0,
      accountNumberType: typeof accountNumber,
      passwordType: typeof password,
      bodyKeys: Object.keys(body)
    })

    // 驗證輸入（檢查空字串和 null/undefined）
    const trimmedAccount = accountNumber?.trim() || ''
    const trimmedPassword = password?.trim() || ''
    
    if (!trimmedAccount || !trimmedPassword) {
      console.log('登入 API 驗證失敗: 帳號或密碼為空', {
        accountNumber: accountNumber,
        passwordLength: password?.length,
        trimmedAccount: trimmedAccount,
        trimmedPasswordLength: trimmedPassword.length
      })
      return NextResponse.json(
        { error: '請輸入帳號和密碼' },
        { status: 400 }
      )
    }

    console.log('查詢使用者:', { account: trimmedAccount })

    // 查詢使用者
    const users = await query(
      'SELECT * FROM users WHERE account = ?',
      [trimmedAccount]
    ) as any[]

    if (!users || users.length === 0) {
      console.log('登入 API: 找不到使用者', { account: trimmedAccount })
      return NextResponse.json(
        { error: '帳號或密碼錯誤' },
        { status: 401 }
      )
    }

    const user = users[0]
    console.log('登入 API: 找到使用者', { 
      id: user.id, 
      account: user.account,
      hasPasswordHash: !!user.password_hash 
    })

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password_hash)
    console.log('登入 API: 密碼驗證結果', { isValid: isPasswordValid })

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '帳號或密碼錯誤' },
        { status: 401 }
      )
    }

    // 返回使用者資訊（不包含密碼）
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        account: user.account,
        nickname: user.nickname,
        email: user.email,
        school: user.school,
      },
    })
  } catch (error: any) {
    console.error('登入錯誤:', error)
    return NextResponse.json(
      { error: '登入失敗，請稍後再試', details: error.message },
      { status: 500 }
    )
  }
}
