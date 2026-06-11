'use client'

import { useState } from 'react'

type FeatureId = 'announcement' | 'discussion' | 'resources'

const FEATURES: Array<{
  id: FeatureId
  label: string
  description: string
  defaultClass: string
  selectedClass: string
}> = [
  {
    id: 'announcement',
    label: '查看公告',
    description:
      '公布欄可協助你掌握共備活動的重要通知，例如共備時間、討論主題、準備事項或活動提醒。進入活動後可先查看公告，確認本次共備需要注意的內容，避免錯過發起者發布的會前資訊。',
    defaultClass: 'bg-[#3B82F6] text-white shadow-sm hover:bg-[#2563EB]',
    selectedClass: 'bg-[#2563EB] text-white ring-2 ring-blue-300 ring-offset-1 shadow-md',
  },
  {
    id: 'discussion',
    label: '參與討論',
    description:
      '討論功能可讓你參與共備的想法交流，你可以透過聊天室回覆發起者提出的問題，也可以在想法牆查看討論議題、新增自己的想法或回覆其他成員的意見。',
    defaultClass:
      'border-2 border-emerald-400 bg-white text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50/60',
    selectedClass:
      'border-2 border-emerald-500 bg-white text-emerald-700 ring-2 ring-emerald-300 ring-offset-1 shadow-md',
  },
  {
    id: 'resources',
    label: '查看資料',
    description:
      '活動檔案可用來上傳、分享、查看或下載教材、課綱資料與參考教案，協助成員在共備過程中取得所需資料，並作為討論、任務執行與教案設計的參考依據。',
    defaultClass: 'bg-[#7C3AED] text-white shadow-sm hover:bg-[#6D28D9]',
    selectedClass: 'bg-[#6D28D9] text-white ring-2 ring-violet-300 ring-offset-1 shadow-md',
  },
]

function AnnouncementIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function DiscussionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function ResourcesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z" />
    </svg>
  )
}

function FeatureIcon({ id, className }: { id: FeatureId; className?: string }) {
  if (id === 'announcement') return <AnnouncementIcon className={className} />
  if (id === 'discussion') return <DiscussionIcon className={className} />
  return <ResourcesIcon className={className} />
}

function GuideLightbulbIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18h6M10 21h4M12 3a5.5 5.5 0 0 0-3.5 9.8V15a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-2.2A5.5 5.5 0 0 0 12 3Z"
        stroke="#2563EB"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 1.5v1.2M5.8 5.8l.85.85M18.2 5.8l-.85.85" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

interface CoPrepFeatureIntroCardProps {
  userId: string | null
  communityId?: string
}

export default function CoPrepFeatureIntroCard({ userId, communityId }: CoPrepFeatureIntroCardProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [selectedId, setSelectedId] = useState<FeatureId | null>(null)

  if (!userId || !communityId) return null

  const selected = selectedId ? FEATURES.find((f) => f.id === selectedId) : null

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <div className="relative flex flex-col items-end">
        {isOpen ? (
          <div
            className="pointer-events-auto relative"
            role="dialog"
            aria-labelledby="coprep-feature-intro-title"
          >
            {/* 右側選項卡片 */}
            <div
              className={`relative flex w-[min(100%,18rem)] sm:w-72 max-h-[min(360px,calc(100vh-6rem))] flex-col overflow-visible border border-gray-200 bg-white shadow-xl ${
                selected ? 'rounded-2xl sm:rounded-l-none sm:rounded-r-2xl' : 'rounded-2xl'
              }`}
            >
              {/* 左側說明卡片（桌面，點選後才顯示，緊貼主卡片左側） */}
              {selected && (
                <div className="absolute right-full top-0 hidden sm:flex h-full items-stretch">
                  <div className="flex w-60 lg:w-64 max-h-[min(320px,calc(100vh-6rem))] flex-col overflow-hidden rounded-l-2xl border border-r-0 border-gray-200 bg-white shadow-xl">
                    <div className="shrink-0 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                      <h4 className="text-sm font-bold text-gray-800">{selected.label}</h4>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5">
                      <p className="text-[14px] leading-[1.65] text-gray-600">{selected.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center self-center -mr-px z-[1]" aria-hidden>
                    <div
                      className="h-0 w-0 border-y-[9px] border-y-transparent border-l-[9px] border-l-white"
                      style={{ filter: 'drop-shadow(1px 0 0 rgba(229,231,235,1))' }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setSelectedId(null)
                }}
                className="absolute right-0 top-0 z-10 flex h-full w-9 items-center justify-center rounded-r-2xl border-l border-gray-100 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                aria-label="關閉操作引導"
                title="關閉"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>

              <div className="min-h-0 flex-1 overflow-y-auto py-4 pl-4 pr-11">
                <h2 id="coprep-feature-intro-title" className="text-base font-bold text-gray-900">
                  開始你的共備活動
                </h2>
                <p className="mt-1 text-xs text-gray-500">請選擇你想了解的共備功能：</p>

                {/* 手機版：點選後才顯示說明 */}
                {selected && (
                  <div className="mt-3 rounded-lg border border-purple-100 bg-purple-50/60 px-3 py-2.5 sm:hidden max-h-28 overflow-y-auto">
                    <p className="text-xs font-semibold text-[#6D28D9] mb-1">{selected.label}</p>
                    <p className="text-[14px] leading-[1.65] text-gray-600">{selected.description}</p>
                  </div>
                )}

                <div className="mt-4 space-y-2.5">
                  {FEATURES.map((feature) => {
                    const isSelected = feature.id === selectedId
                    return (
                      <button
                        key={feature.id}
                        type="button"
                        onClick={() => setSelectedId(feature.id)}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-all ${
                          isSelected ? feature.selectedClass : feature.defaultClass
                        }`}
                        aria-pressed={isSelected}
                      >
                        <FeatureIcon id={feature.id} className="shrink-0" />
                        <span>{feature.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pointer-events-auto flex flex-col items-center">
            <span className="mb-1.5 text-[13px] leading-none font-semibold text-gray-800 whitespace-nowrap">
              操作引導
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FACC15] text-gray-800 shadow-lg transition-colors hover:bg-[#FDE047]"
              title="操作引導"
              aria-label="操作引導"
              aria-expanded={false}
            >
              <GuideLightbulbIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
