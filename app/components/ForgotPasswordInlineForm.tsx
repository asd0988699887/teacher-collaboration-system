'use client'

import { useState } from 'react'

interface ForgotPasswordInlineFormProps {
  onClose: () => void
  onSwitchToRegister: () => void
}

/**
 * 登入頁右欄下方內嵌：輸入信箱 + 新密碼 + 確認密碼
 */
export default function ForgotPasswordInlineForm({
  onClose,
  onSwitchToRegister,
}: ForgotPasswordInlineFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async () => {
    setError('')

    if (!email || !password) {
      setError('請填寫電子郵件與新密碼')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('請輸入有效的電子郵件地址')
      return
    }

    if (password.length < 6) {
      setError('密碼長度至少需要 6 個字元')
      return
    }

    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不相符')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '重設失敗，請稍後再試')
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setIsLoading(false)
    } catch {
      setError('重設失敗，請稍後再試')
      setIsLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all'

  if (success) {
    return (
      <div id="auth-reset-panel" className="w-full space-y-4 pr-10">
        <h3 className="text-2xl font-bold text-gray-800">密碼已更新</h3>
        <p className="text-gray-600 text-sm">請關閉視窗後，使用新密碼登入。</p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false)
            setEmail('')
            setPassword('')
            setConfirmPassword('')
            onClose()
          }}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-lg"
        >
          完成
        </button>
      </div>
    )
  }

  return (
    <div id="auth-reset-panel" className="w-full">
      <div className="mb-6 pr-10">
        <h3 className="text-2xl font-bold text-gray-800">忘記密碼</h3>
        <p className="text-sm text-gray-500 mt-1">請輸入註冊時使用的信箱，並設定新密碼</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">請輸入信箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className={inputClass}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">請輸入密碼</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=""
            className={inputClass}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">請再次確認密碼</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder=""
            className={inputClass}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 border border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-50"
          >
            返回
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="w-full sm:w-auto py-3 px-5 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-lg shadow-md disabled:opacity-50"
          >
            {isLoading ? '處理中...' : '重設密碼'}
          </button>
        </div>

        <div className="flex flex-wrap justify-between gap-2 text-sm pt-2">
          <span className="text-gray-600">
            還沒有帳號？{' '}
            <button type="button" onClick={onSwitchToRegister} className="text-purple-600 font-semibold hover:underline">
              註冊帳號
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}
