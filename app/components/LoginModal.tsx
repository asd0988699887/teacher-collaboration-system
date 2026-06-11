'use client'

import { useEffect, useRef, useState } from 'react'
import RegisterInlineForm from './RegisterInlineForm'
import ForgotPasswordInlineForm from './ForgotPasswordInlineForm'
import { resetCommunityOnboardingSeen } from '@/lib/communityOnboardingStorage'
import { resetCoPrepOnboardingSeen } from '@/lib/coPrepOnboardingStorage'

type Mode = 'login' | 'register' | 'reset'

interface LoginModalProps {
  open: boolean
  initialMode?: Mode
  onClose: () => void
  onLoginSuccess: () => void
}

/**
 * 統一登入／註冊／重設密碼模態框
 * - 同一個 Modal 內切換三種模式，不疊第二層
 * - 背景點擊、ESC、右上 X 皆可關閉
 * - 開啟時鎖背景捲動、自動 focus 第一個輸入欄
 */
export default function LoginModal({
  open,
  initialMode = 'login',
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [accountNumber, setAccountNumber] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const accountInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) setMode(initialMode)
  }, [open, initialMode])

  useEffect(() => {
    if (!open || typeof document === 'undefined') return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (open && mode === 'login') {
      const t = setTimeout(() => accountInputRef.current?.focus(), 60)
      return () => clearTimeout(t)
    }
  }, [open, mode])

  useEffect(() => {
    if (!open) {
      setAccountNumber('')
      setPassword('')
      setError('')
      setIsLoading(false)
    }
  }, [open])

  const handleLogin = async () => {
    setError('')
    if (!accountNumber || !password) {
      setError('請輸入帳號和密碼')
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, password }),
      })
      const data = await response.json()

      if (!response.ok || !data.success || !data.user) {
        setError(data.error || '登入失敗，請稍後再試')
        setIsLoading(false)
        return
      }

      if (typeof window !== 'undefined') {
        resetCommunityOnboardingSeen(data.user.id)
        resetCoPrepOnboardingSeen(data.user.id)
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

      onLoginSuccess()
    } catch (err) {
      console.error('登入錯誤:', err)
      setError('登入失敗，請稍後再試')
      setIsLoading(false)
    }
  }

  if (!open) return null

  const titleByMode: Record<Mode, string> = {
    login: '登入',
    register: '註冊帳號',
    reset: '重設密碼',
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="關閉視窗"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titleByMode[mode]}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="關閉"
          className="absolute right-3 top-3 z-20 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="max-h-[min(90dvh,720px)] overflow-y-auto px-6 pb-6 pt-10">
          {mode === 'login' && (
            <div className="w-full">
              <div className="mb-6 text-center">
                <p className="mb-1 text-sm font-medium text-gray-600">歡迎回來</p>
                <p className="mb-3 text-xs text-gray-500">輸入你的帳號與密碼繼續</p>
                <h2 className="text-2xl font-bold text-gray-800">登入</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">帳號</label>
                  <input
                    ref={accountInputRef}
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLogin()
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">密碼</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLogin()
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 py-3 font-semibold text-white shadow-md transition-all hover:from-purple-700 hover:to-purple-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? '登入中...' : '登入'}
                </button>

                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="text-gray-600">
                    還沒有帳號？{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                    >
                      註冊帳號
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    忘記密碼
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="w-full">
              <div className="mb-4 flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  返回登入
                </button>
              </div>
              <RegisterInlineForm onSuccess={onLoginSuccess} />
            </div>
          )}

          {mode === 'reset' && (
            <div className="w-full">
              <div className="mb-4 flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  返回登入
                </button>
              </div>
              <ForgotPasswordInlineForm
                onClose={() => setMode('login')}
                onSwitchToRegister={() => setMode('register')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
