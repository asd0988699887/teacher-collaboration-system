'use client'

import { useState } from 'react'

interface RegisterInlineFormProps {
  onSuccess: () => void
}

/**
 * 註冊表單內容（置中於登入頁模態框內；欄位與原 Register 頁相同）
 */
export default function RegisterInlineForm({ onSuccess }: RegisterInlineFormProps) {
  const [accountNumber, setAccountNumber] = useState('')
  const [nickname, setNickname] = useState('')
  const [school, setSchool] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    setError('')

    if (!accountNumber || !nickname || !email || !password) {
      setError('請填寫所有必填欄位')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('請輸入有效的電子郵件地址（必須包含 @ 符號和網域）')
      return
    }

    if (password.length < 6) {
      setError('密碼長度至少需要 6 個字元')
      return
    }

    if (password !== confirmPassword) {
      setError('密碼與確認密碼不相符')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: accountNumber,
          nickname,
          school,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '註冊失敗，請稍後再試')
        setIsLoading(false)
        return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: data.user.id,
            userId: data.user.id,
            accountNumber: data.user.account,
            nickname: data.user.nickname,
            email: data.user.email,
            school: data.user.school,
          }),
        )
      }

      setIsLoading(false)
      onSuccess()
    } catch {
      setError('註冊失敗，請稍後再試')
      setIsLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all'

  return (
    <div id="auth-register-panel" className="w-full">
      <div className="mb-6 pr-10">
        <h3 className="text-2xl font-bold text-gray-800">註冊帳號</h3>
        <p className="text-sm text-gray-500 mt-1">建立新帳號以使用教師共同備課系統</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">帳號</label>
          <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">暱稱</label>
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">學校</label>
          <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">電子郵件</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">密碼</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">確認密碼</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        <button
          type="button"
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '註冊中...' : '註冊'}
        </button>
      </div>
    </div>
  )
}
