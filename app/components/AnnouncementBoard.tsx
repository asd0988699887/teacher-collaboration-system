'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Announcement {
  id: string
  content: string
  createdAt: string
  createdBy: string
  createdByName: string
}

interface AnnouncementBoardProps {
  communityId?: string
  userId?: string | null
  userNickname?: string
  /** 是否為社群管理員（可發布／刪除公告） */
  isAdmin?: boolean
  /** 與 Header 頭像同色（由父層傳入 getUserColor） */
  getAvatarColor?: (userId: string) => string
  readOnly?: boolean
}

const USER_COLORS = [
  'rgba(138,99,210,0.9)',
  'rgba(59,130,246,0.9)',
  'rgba(16,185,129,0.9)',
  'rgba(245,158,11,0.9)',
  'rgba(239,68,68,0.9)',
  'rgba(14,165,233,0.9)',
  'rgba(168,85,247,0.9)',
  'rgba(236,72,153,0.9)',
  'rgba(34,197,94,0.9)',
  'rgba(249,115,22,0.9)',
]

function getUserColorByUserId(userId?: string): string {
  if (!userId) return USER_COLORS[0]
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
}

function getInitial(name?: string) {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hour}:${minute}`
}

/**
 * 公告欄：發布公告、顯示內容／發布時間／發布人，依最新時間排序
 */
export default function AnnouncementBoard({
  communityId,
  userId,
  isAdmin = false,
  getAvatarColor,
  readOnly = false,
}: AnnouncementBoardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const canManageAnnouncements = isAdmin && !readOnly

  const loadAnnouncements = useCallback(async () => {
    if (!communityId) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/communities/${communityId}/announcements`)
      const data = await response.json()
      if (response.ok) {
        setAnnouncements(data.announcements || [])
      } else {
        console.error('載入公告失敗:', data.error)
      }
    } catch (error) {
      console.error('載入公告錯誤:', error)
    } finally {
      setIsLoading(false)
    }
  }, [communityId])

  useEffect(() => {
    if (isOpen) {
      loadAnnouncements()
    }
  }, [isOpen, loadAnnouncements])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handlePublish = async () => {
    const content = draft.trim()
    if (!content) {
      alert('請輸入公告內容')
      return
    }
    if (!communityId) {
      alert('社群資訊錯誤')
      return
    }
    if (!userId) {
      alert('請先登入')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/communities/${communityId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, createdBy: userId }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '發布公告失敗')
      }
      setDraft('')
      if (data.announcement) {
        setAnnouncements((prev) => [data.announcement, ...prev])
      } else {
        await loadAnnouncements()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '發布公告失敗'
      alert(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (announcementId: string) => {
    if (!communityId || !userId) return
    if (!confirm('確定要刪除此公告嗎？')) return

    setDeletingId(announcementId)
    try {
      const response = await fetch(
        `/api/communities/${communityId}/announcements/${announcementId}?operatorId=${encodeURIComponent(userId)}`,
        { method: 'DELETE' }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '刪除公告失敗')
      }
      setAnnouncements((prev) => prev.filter((item) => item.id !== announcementId))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '刪除公告失敗'
      alert(message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
          isOpen ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="公告欄"
        title="公告欄"
        aria-expanded={isOpen}
      >
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 11l18-5v12L3 14v-3z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[340px] max-w-[90vw] rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-base font-bold text-gray-900">公告欄</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="關閉"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* 發布區（僅管理員） */}
          {canManageAnnouncements && (
          <div className="border-b border-gray-100 px-4 py-3">
            <textarea
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="發布新公告…"
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-200"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting || !draft.trim()}
                className="rounded-lg bg-[rgba(138,99,210,0.9)] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[rgba(138,99,210,1)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? '發布中…' : '發布公告'}
              </button>
            </div>
          </div>
          )}

          {/* 公告列表 */}
          <div className="max-h-80 overflow-y-auto px-4 py-3">
            {isLoading ? (
              <p className="py-8 text-center text-sm text-gray-400">載入中…</p>
            ) : announcements.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">目前沒有公告</p>
            ) : (
              <ul className="space-y-3">
                {announcements.map((item) => (
                  <li key={item.id} className="relative rounded-lg border border-gray-100 bg-gray-50/60 p-3">
                    {canManageAnnouncements && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="absolute top-2 right-2 rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        title="刪除公告"
                        aria-label="刪除公告"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                    <p className={`whitespace-pre-wrap break-words text-sm text-gray-800 ${canManageAnnouncements ? 'pr-6' : ''}`}>
                      {item.content}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                          style={{
                            backgroundColor: getAvatarColor
                              ? getAvatarColor(item.createdBy)
                              : getUserColorByUserId(item.createdBy),
                          }}
                        >
                          {getInitial(item.createdByName)}
                        </span>
                        <span>{item.createdByName}</span>
                      </div>
                      <span>{formatTime(item.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
