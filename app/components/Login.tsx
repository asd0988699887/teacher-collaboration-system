'use client'

import { useEffect, useState, type ReactNode } from 'react'
import LoginModal from './LoginModal'

interface LoginProps {
  onLoginSuccess: () => void
}

interface FeatureCardData {
  title: string
  desc: string
  icon: ReactNode
}

/** 核心功能卡片資料（共 8 項，使用單一 grid 排列） */
const featureCards: FeatureCardData[] = [
  {
    title: '想法牆討論與收斂',
    desc: '發表想法、回覆想法，並將討論內容整理成共識',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 14.5C9 14.5 9 16 9 17C9 17.5 9.5 18 10 18H14C14.5 18 15 17.5 15 17C15 16 15 14.5 15 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    desc: '以圖表查看想法牆互動軌跡',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: '任務看板',
    desc: '分配任務、進度同步',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: '活動資源共享',
    desc: '教材、檔案共用',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: '通知功能',
    desc: '隨時掌握成員修改的地方',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    title: '教案版本回溯',
    desc: '協助管控教案版本',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: '教案輸出',
    desc: '生成 Word 檔，方便下載後修改、列印',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    title: '聊天室',
    desc: '提供成員討論的地方',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
]

function FeatureCard({ title, desc, icon }: FeatureCardData) {
  return (
    <div className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100">
      <div className="mb-2.5 flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
        {icon}
      </div>
      <h3 className="mb-1 text-sm font-bold text-gray-900 sm:text-base">{title}</h3>
      <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">{desc}</p>
    </div>
  )
}

/**
 * 首頁 Landing Page
 * - Header（左 Logo / 右 登入或進入系統）
 * - Hero（主標 + 副標 + 介紹 + 兩個 CTA）
 * - 核心功能卡片區（id="features"，供平滑捲動）
 * - 登入抽成 LoginModal，由 Header 與 Hero CTA 觸發
 */
export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loggedInNickname, setLoggedInNickname] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const user = JSON.parse(raw)
        if (user && (user.id || user.userId)) {
          setLoggedInNickname(user.nickname || user.accountNumber || '使用者')
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const openLogin = () => setIsLoginOpen(true)
  const closeLogin = () => setIsLoginOpen(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF5FF] via-[#F5F3FF] to-[#F5F3FF]">
      {/* ============= Hero ============= */}
      <section className="relative overflow-hidden">
        {/* 背景裝飾：淡紫色光暈 */}
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -left-24 top-0 h-56 w-56 rounded-full bg-purple-200/40 blur-3xl" />
          <div className="absolute -right-24 top-10 h-64 w-64 rounded-full bg-fuchsia-200/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-2 pt-6 text-center sm:px-6 sm:pb-3 sm:pt-8 lg:px-8 lg:pb-4 lg:pt-10">
          {/* 系統名稱：放大為主視覺品牌標 */}
          <div className="mb-4 inline-flex items-center rounded-2xl border border-purple-200/90 bg-white/90 px-5 py-2.5 text-lg font-bold tracking-tight text-purple-800 shadow-md backdrop-blur-sm sm:mb-5 sm:px-7 sm:py-3 sm:text-xl">
            教師共同備課系統
          </div>

          {/* 主標 */}
          <h1 className="mx-auto max-w-3xl text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
            把備課變成一件「一起完成」的事
          </h1>

          {/* 副標 */}
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-purple-900/85 sm:text-base">
            以社群協作、想法收斂與歷程記錄，支援教師完成共同備課。
          </p>

          {/* CTA button */}
          <div className="mt-4 flex justify-center">
            {loggedInNickname ? (
              <button
                type="button"
                onClick={onLoginSuccess}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-200 transition-all hover:from-purple-700 hover:to-purple-600 hover:shadow-lg hover:shadow-purple-300 sm:text-base"
              >
                進入系統
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-200 transition-all hover:from-purple-700 hover:to-purple-600 hover:shadow-lg hover:shadow-purple-300 sm:text-base"
              >
                立即登入
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ============= 功能卡片 ============= */}
      <section className="relative px-4 pb-8 pt-0 sm:px-6 sm:pb-10 lg:px-8 lg:pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3 xl:grid-cols-4">
            {featureCards.map((item) => (
              <FeatureCard key={item.title} title={item.title} desc={item.desc} icon={item.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* ============= 登入 Modal ============= */}
      <LoginModal
        open={isLoginOpen}
        onClose={closeLogin}
        onLoginSuccess={() => {
          closeLogin()
          onLoginSuccess()
        }}
      />
    </div>
  )
}
