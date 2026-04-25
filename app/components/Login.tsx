'use client'

import { useState, useEffect, type ReactNode } from 'react'
import RegisterInlineForm from './RegisterInlineForm'
import ForgotPasswordInlineForm from './ForgotPasswordInlineForm'
import { resetCommunityOnboardingSeen } from '@/lib/communityOnboardingStorage'
import { resetCoPrepOnboardingSeen } from '@/lib/coPrepOnboardingStorage'

interface LoginProps {
  onLoginSuccess: () => void
}

type AuthSecondaryPanel = null | 'register' | 'reset'

/** 功能卡 — 捲動後全寬區：白底卡片 + 紫系 icon（對齊第四張參考） */
const featureCardsRow1 = [
  {
    title: '想法牆討論收斂',
    desc: '協助成員想法討論、凝聚共識',
    // 與 CommunityDetail 左欄「想法牆」tab 相同（燈泡 + 放射線）
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M9 14.5C9 14.5 9 16 9 17C9 17.5 9.5 18 10 18H14C14.5 18 15 17.5 15 17C15 16 15 14.5 15 14.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10 21H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M19 9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 9H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M17.5 4.5L16.8 5.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6.5 4.5L7.2 5.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: '活動歷程',
    desc: '以三種圖式呈現討論歷程與結果',
    // 與 CommunityDetail 左欄「活動歷程」tab 相同（摺角文件 + 三行）
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path
          d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: '團隊分工',
    desc: '分配任務、進度同步',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
  },
  {
    title: '社群資源共享',
    desc: '教材、檔案共用',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
    ),
  },
]

const featureCardsRow2 = [
  {
    title: '通知功能',
    desc: '隨時掌握成員修改的地方',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    ),
  },
  {
    title: '教案版本回溯',
    desc: '協助管控教案版本',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
  },
  {
    title: '教案輸出',
    desc: '生成 Word 檔，方便下載後修改、列印',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
]

function FeatureCard({
  title,
  desc,
  icon,
}: {
  title: string
  desc: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-md shadow-gray-200/60 transition hover:shadow-lg">
      <div className="mb-3 flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
        {icon}
      </div>
      <h3 className="text-base font-bold leading-snug text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{desc}</p>
    </div>
  )
}

/**
 * 登入頁面元件 — 淺紫首屏、登入靠上；捲動時整段首屏（含登入）自然上移，不套用 JS 隱藏避免閃退
 */
export default function Login({ onLoginSuccess }: LoginProps) {
  const [accountNumber, setAccountNumber] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [secondaryPanel, setSecondaryPanel] = useState<AuthSecondaryPanel>(null)

  const closeAuthModal = () => setSecondaryPanel(null)

  /** 模態開啟時鎖定背景捲動、Esc 關閉 */
  useEffect(() => {
    if (!secondaryPanel || typeof document === 'undefined') return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSecondaryPanel(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [secondaryPanel])

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountNumber,
          password,
        }),
      })

      const data = await response.json()

      console.log('登入 API 回應:', {
        ok: response.ok,
        status: response.status,
        data: data,
      })

      if (!response.ok || !data.success || !data.user) {
        console.log('登入失敗:', {
          responseOk: response.ok,
          dataSuccess: data.success,
          hasUser: !!data.user,
          error: data.error,
        })
        setError(data.error || '登入失敗，請稍後再試')
        setIsLoading(false)
        return
      }

      console.log('登入成功，準備儲存使用者資料')

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
    } catch (error: any) {
      console.error('登入錯誤:', error)
      setError('登入失敗，請稍後再試')
      setIsLoading(false)
    }
  }

  const loginForm = (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <p className="text-base font-medium text-gray-600 mb-1">歡迎回來</p>
        <p className="text-sm text-gray-500 mb-3">輸入你的帳號與密碼繼續</p>
        <h2 className="text-3xl font-bold text-gray-800">登入</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">帳號</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder=""
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">密碼</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=""
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '登入中...' : '登入'}
        </button>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="text-gray-600">
            還沒有帳號？{' '}
            <button
              type="button"
              onClick={() => setSecondaryPanel('register')}
              className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
            >
              註冊帳號
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSecondaryPanel('reset')}
            className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
          >
            忘記密碼？重設密碼
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      {/* 首屏：左文案＋右登入；與頁面一起自然捲動，不於捲動時強制 display:none */}
      <div className="flex min-h-[min(100dvh,880px)] flex-col lg:flex-row">
        {/* 左側：淺薰衣草底 + 深字 */}
        <div className="flex flex-1 flex-col justify-start px-8 pb-10 pt-10 lg:w-1/2 lg:max-w-[50%] lg:px-10 lg:pb-16 lg:pt-12 xl:pt-14">
          <div className="relative z-[1] mx-auto w-full max-w-2xl lg:mx-0">
            <div className="flex justify-center lg:justify-start">
              {/* 系統名稱：字級對齊參考圖品牌區，明顯大於一般 badge */}
              <span className="inline-flex items-center rounded-2xl border border-purple-200/90 bg-white/80 px-5 py-2.5 text-lg font-bold tracking-tight text-purple-800 shadow-md backdrop-blur-sm sm:text-xl sm:px-6 sm:py-3">
                教師共同備課系統
              </span>
            </div>

            <div className="mt-8 space-y-4 text-center lg:text-left">
              <h1 className="text-3xl font-bold leading-tight text-gray-900 xl:text-4xl whitespace-nowrap">
                把備課變成一件「一起完成」的事
              </h1>
              <p className="text-lg font-medium leading-relaxed text-purple-900/85">
                以社群協作、想法收斂與歷程記錄，支援教師完成共同備課。
              </p>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-gray-700 text-center lg:text-left xl:text-[15px]">
              教師共同備課平台支援備課流程，透過社群促進協作。結合「想法牆」進行想法交流與共識凝聚，並以「活動歷程」呈現討論過程與結果，搭配資源共享、分工、通知、版本回溯與教案輸出等功能，提升共同備課效率。
            </p>

            <p className="mt-8 hidden text-center text-xs text-purple-600/70 lg:block">
              向下捲動瀏覽核心功能
            </p>
          </div>
        </div>

        {/* 右側登入：靠上；與整頁一起捲動，無捲動監聽、無強制隱藏 */}
        <div className="flex flex-1 flex-col bg-white px-8 pb-12 pt-8 shadow-[0_-4px_24px_rgba(91,33,182,0.06)] lg:min-h-[min(100dvh,880px)] lg:w-1/2 lg:max-w-[50%] lg:pt-10 lg:shadow-none">
          <div className="mx-auto w-full max-w-md lg:mr-auto lg:ml-0">{loginForm}</div>
        </div>
      </div>

      {/* 捲動後才進入視野：全寬功能卡（第一排 4、第二排 3），樣式近似第四張參考 */}
      <section className="border-t border-purple-100/80 bg-gradient-to-b from-[#FAF5FF] to-[#F5F3FF] px-6 py-14 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-wider text-purple-600 lg:text-left">
            核心功能
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-gray-600 lg:mx-0 lg:text-left">
            以下工具協助您完成共同備課全流程。
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featureCardsRow1.map((item) => (
              <FeatureCard key={item.title} title={item.title} desc={item.desc} icon={item.icon} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureCardsRow2.map((item) => (
              <FeatureCard key={item.title} title={item.title} desc={item.desc} icon={item.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* 註冊／忘記密碼：置中模態，背景登入頁變暗 */}
      {secondaryPanel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="關閉視窗"
            onClick={closeAuthModal}
          />
          <div
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
            role="dialog"
            aria-modal="true"
            aria-label={secondaryPanel === 'register' ? '註冊帳號' : '忘記密碼'}
          >
            <button
              type="button"
              onClick={closeAuthModal}
              className="absolute right-3 top-3 z-20 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              aria-label="關閉"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="max-h-[min(90dvh,720px)] overflow-y-auto px-6 pb-6 pt-10">
              {secondaryPanel === 'register' && <RegisterInlineForm onSuccess={onLoginSuccess} />}
              {secondaryPanel === 'reset' && (
                <ForgotPasswordInlineForm
                  onClose={closeAuthModal}
                  onSwitchToRegister={() => setSecondaryPanel('register')}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
