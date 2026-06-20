'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ChatMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  createdAt: string
}

interface ChatRoomProps {
  isOpen: boolean
  onClose: () => void
  communityId?: string
  userId?: string | null
  userNickname?: string
  /** 與 Header 頭像同色 */
  getAvatarColor?: (userId: string) => string
  /** 使用者已查看聊天室訊息（更新最後已讀時間） */
  onMessagesViewed?: (latestCreatedAt: string) => void
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

function fallbackColor(userId?: string): string {
  if (!userId) return USER_COLORS[0]
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
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
  const hour = date.getHours()
  const minute = String(date.getMinutes()).padStart(2, '0')
  const isPm = hour >= 12
  const h12 = hour % 12 === 0 ? 12 : hour % 12
  return `${isPm ? '下午' : '上午'}${h12}:${minute}`
}

// 日期分隔標題：今天 / 昨天 / M/D
function formatDateLabel(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(today) - startOfDay(date)) / 86400000)
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function dateKey(iso: string): string {
  const date = new Date(iso)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

/**
 * 聊天室
 */
export default function ChatRoom({
  isOpen,
  onClose,
  communityId,
  userId,
  getAvatarColor,
  readOnly = false,
  onMessagesViewed,
}: ChatRoomProps) {
  const selfId = userId || 'self'
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const colorOf = (id: string) =>
    getAvatarColor ? getAvatarColor(id) : fallbackColor(id)

  const loadMessages = useCallback(async () => {
    if (!communityId) return
    try {
      const response = await fetch(`/api/communities/${communityId}/chat-messages`)
      const data = await response.json()
      if (response.ok) {
        setMessages(data.messages || [])
      } else {
        console.error('載入聊天訊息失敗:', data.error)
      }
    } catch (error) {
      console.error('載入聊天訊息錯誤:', error)
    }
  }, [communityId])

  useEffect(() => {
    if (isOpen) {
      loadMessages()
    }
  }, [isOpen, loadMessages])

  useEffect(() => {
    if (!isOpen || !communityId || !userId) return

    fetch('/api/notifications/mark-chat-read', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, communityId }),
    }).catch((error) => {
      console.error('標記聊天通知已讀失敗:', error)
    })
  }, [isOpen, communityId, userId])

  useEffect(() => {
    if (!isOpen || !onMessagesViewed || messages.length === 0) return
    const sorted = [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    onMessagesViewed(sorted[sorted.length - 1].createdAt)
  }, [isOpen, messages, onMessagesViewed])

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [isOpen, messages])

  if (!isOpen) return null

  const handleSend = async () => {
    const content = draft.trim()
    if (!content || isSending) return
    if (!communityId) {
      alert('社群資訊錯誤')
      return
    }
    if (!userId) {
      alert('請先登入')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch(`/api/communities/${communityId}/chat-messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, senderId: userId }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '發送訊息失敗')
      }
      setDraft('')
      if (data.message) {
        setMessages((prev) => [...prev, data.message])
      } else {
        await loadMessages()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '發送訊息失敗'
      alert(message)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 依日期分組
  const groups: { key: string; label: string; items: ChatMessage[] }[] = []
  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  for (const msg of sorted) {
    const key = dateKey(msg.createdAt)
    const last = groups[groups.length - 1]
    if (last && last.key === key) {
      last.items.push(msg)
    } else {
      groups.push({ key, label: formatDateLabel(msg.createdAt), items: [msg] })
    }
  }

  return (
    <div
      className="fixed inset-y-0 right-0 z-[120] flex w-full max-w-[380px] flex-col overflow-hidden border-l border-gray-200 bg-[#EFF1F4] shadow-2xl"
      role="complementary"
      aria-label="聊天室"
    >
        {/* 標題列 */}
        <div className="flex items-center justify-between bg-[#FAFAFA] px-4 py-3">
          <h2 className="text-base font-semibold text-gray-800">聊天室</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            aria-label="關閉"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 訊息區 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
          {groups.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">目前沒有訊息</p>
          )}
          {groups.map((group) => (
            <div key={group.key}>
              {/* 日期分隔 */}
              <div className="my-3 flex justify-center">
                <span className="rounded-full bg-black/5 px-3 py-0.5 text-xs text-gray-500">
                  -{group.label}-
                </span>
              </div>

              <div className="space-y-3">
                {group.items.map((msg) => {
                  const isSelf = msg.senderId === selfId
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* 頭像 */}
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: colorOf(msg.senderId) }}
                        title={msg.senderName}
                      >
                        {getInitial(msg.senderName)}
                      </span>

                      {/* 內容 + meta */}
                      <div className={`flex max-w-[70%] flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                            isSelf
                              ? 'bg-[#8FBF9F] text-white'
                              : 'bg-white text-gray-800'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <div className="mt-1 text-[11px] text-gray-500">
                          {formatTime(msg.createdAt)} | {msg.senderName}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 輸入區 */}
        {!readOnly && (
        <div className="flex items-end gap-2 border-t border-gray-200 bg-white px-3 py-3">
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="輸入訊息…"
            className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-200"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim() || isSending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-purple-600 transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:text-gray-300"
            aria-label="送出"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        )}
    </div>
  )
}
