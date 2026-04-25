'use client'

import { useState, useEffect, useRef } from 'react'
import { activityDisplayLabel } from '@/lib/activityDisplay'

interface Activity {
  id: string
  name: string
  /** 與 /api/communities/.../activities 回傳一致，有則優先顯示 */
  lessonPlanTitle?: string
}

interface EditHistoryItem {
  id: string
  editorName: string
  editedAt: string
  oldActivityId: string | null
  newActivityId: string | null
  oldStage: string | null
  newStage: string | null
  oldTitle: string | null
  newTitle: string | null
  oldContent: string | null
  newContent: string | null
}

interface EditIdeaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (ideaData: {
    activityId?: string
    stage: string
    title: string
    content: string
  }) => void
  onDelete: () => void
  /** 僅在為本人建立之節點時為 true，才顯示刪除按鈕 */
  showDeleteButton?: boolean
  onExtend: () => void
  /** 節點 ID，用於查詢修改紀錄 */
  ideaId?: string
  initialData: {
    activityId?: string
    stage: string
    title: string
    content: string
  }
  isConvergence?: boolean
  communityId?: string
  /** 最後編輯者姓名（有值代表曾被修改過） */
  lastEditedByName?: string
  /** 最後編輯時間（已格式化：YYYY/MM/DD HH:mm） */
  lastEditedAt?: string
}

/**
 * 編輯想法模態框組件
 */
export default function EditIdeaModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  showDeleteButton = false,
  onExtend,
  ideaId,
  initialData,
  isConvergence,
  communityId,
  lastEditedByName,
  lastEditedAt,
}: EditIdeaModalProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('')
  const [stage, setStage] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)

  // 修改紀錄狀態
  const [showHistory, setShowHistory] = useState(false)
  const [historyItems, setHistoryItems] = useState<EditHistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<Set<string>>(new Set())

  // 拖移相關狀態
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  // 載入活動列表
  useEffect(() => {
    const loadActivities = async () => {
      if (!communityId || !isOpen) {
        setActivities([])
        return
      }

      setIsLoadingActivities(true)
      try {
        const response = await fetch(`/api/communities/${communityId}/activities`)
        if (response.ok) {
          const data = await response.json()
          setActivities(Array.isArray(data) ? data : [])
        } else {
          console.error('載入活動列表失敗')
          setActivities([])
        }
      } catch (error) {
        console.error('載入活動列表錯誤:', error)
        setActivities([])
      } finally {
        setIsLoadingActivities(false)
      }
    }

    loadActivities()
  }, [communityId, isOpen])

  // 當模態框打開時，載入初始資料和重置位置
  useEffect(() => {
    if (isOpen) {
      setSelectedActivityId(initialData.activityId || '')
      setStage(initialData.stage)
      setTitle(initialData.title)
      setContent(initialData.content)
      setPosition({ x: 0, y: 0 })
      setShowHistory(false)
      setHistoryItems([])
      setExpandedHistoryIds(new Set())
    }
  }, [isOpen, initialData])

  // 處理拖移開始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
    e.preventDefault()
  }

  // 處理拖移移動
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart])

  // 切換顯示修改紀錄
  const handleToggleHistory = async () => {
    if (!showHistory && historyItems.length === 0 && ideaId) {
      setIsLoadingHistory(true)
      try {
        const res = await fetch(`/api/ideas/${ideaId}/edit-history`)
        if (res.ok) {
          const data = await res.json()
          setHistoryItems(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error('載入修改紀錄失敗:', err)
      } finally {
        setIsLoadingHistory(false)
      }
    }
    setShowHistory((prev) => !prev)
  }

  // 切換紀錄展開/收合
  const toggleHistoryExpand = (id: string) => {
    setExpandedHistoryIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // 處理儲存
  const handleSave = () => {
    onSave({
      activityId: selectedActivityId || undefined,
      stage,
      title,
      content,
    })
    onClose()
  }

  if (!isOpen) return null

  const hasBeenEdited = Boolean(lastEditedByName && lastEditedAt)

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />
      {/* 模態框內容 */}
      <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-2 sm:p-4 pointer-events-none overflow-y-auto">
        <div
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col pointer-events-auto my-2 sm:my-0"
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            cursor: isDragging ? 'grabbing' : 'default',
            maxHeight: 'calc(100vh - 1rem - 80px)',
            height: 'auto',
            minHeight: 'min(calc(100vh - 1rem - 80px), 680px)',
          }}
        >
          {/* 標題（可拖移區域） */}
          <div
            className="px-6 py-4 border-b border-gray-200 cursor-move select-none"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-semibold text-gray-800">
                {isConvergence ? '收斂內容' : '檢視節點'}
              </h2>
              {hasBeenEdited && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  已編輯
                </span>
              )}
            </div>
            {hasBeenEdited && (
              <p className="mt-1 text-xs text-gray-500">
                {lastEditedByName} 於 {lastEditedAt} 修改
              </p>
            )}
          </div>

          {/* 表單內容 - 可滾動區域 */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* 階段 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  階段
                </label>
                <input
                  type="text"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="請輸入階段"
                />
              </div>

              {/* 標題 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  標題
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="請輸入標題"
                />
              </div>

              {/* 內容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  內容
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={8}
                  placeholder="請輸入內容"
                />
              </div>

              {/* 修改紀錄區塊（曾被修改過才顯示入口） */}
              {hasBeenEdited && ideaId && (
                <div>
                  <button
                    type="button"
                    onClick={handleToggleHistory}
                    className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {showHistory ? '收起修改紀錄' : '查看修改紀錄'}
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${showHistory ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showHistory && (
                    <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                      {isLoadingHistory ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                          載入中...
                        </div>
                      ) : historyItems.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                          目前沒有修改紀錄
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {historyItems.map((item) => {
                            const isExpanded = expandedHistoryIds.has(item.id)
                            const changedFields: { label: string; old: string | null; new: string | null }[] = []
                            if (item.oldTitle !== null || item.newTitle !== null) {
                              changedFields.push({ label: '標題', old: item.oldTitle, new: item.newTitle })
                            }
                            if (item.oldStage !== null || item.newStage !== null) {
                              changedFields.push({ label: '階段', old: item.oldStage, new: item.newStage })
                            }
                            if (item.oldContent !== null || item.newContent !== null) {
                              changedFields.push({ label: '內容', old: item.oldContent, new: item.newContent })
                            }

                            return (
                              <li key={item.id} className="px-4 py-3">
                                {/* 紀錄標頭 */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-sm font-medium text-gray-800 truncate">
                                      {item.editorName}
                                    </span>
                                    <span className="text-xs text-gray-400 shrink-0">
                                      {item.editedAt}
                                    </span>
                                  </div>
                                  {changedFields.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => toggleHistoryExpand(item.id)}
                                      className="shrink-0 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                                    >
                                      {isExpanded ? '收合' : '展開'}
                                      <svg
                                        className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </button>
                                  )}
                                </div>

                                {/* 修改詳情（展開後顯示） */}
                                {isExpanded && changedFields.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {changedFields.map((field) => (
                                      <div key={field.label} className="text-xs rounded-md overflow-hidden border border-gray-200">
                                        <div className="px-2 py-1 bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                          {field.label}
                                        </div>
                                        <div className="grid grid-cols-2 divide-x divide-gray-200">
                                          <div className="px-2 py-1.5">
                                            <div className="text-xs text-red-500 font-medium mb-0.5">修改前</div>
                                            <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                                              {field.old ?? '（空）'}
                                            </p>
                                          </div>
                                          <div className="px-2 py-1.5">
                                            <div className="text-xs text-green-600 font-medium mb-0.5">修改後</div>
                                            <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                                              {field.new ?? '（空）'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 底部按鈕 */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            {/* 左側：刪除和延伸想法 */}
            <div className="flex gap-3">
              {showDeleteButton && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                刪除
              </button>
              )}
              {/* 只有非收斂節點才顯示延伸想法按鈕 */}
              {!isConvergence && (
                <button
                  type="button"
                  onClick={onExtend}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  延伸想法
                </button>
              )}
            </div>

            {/* 右側：取消和儲存 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 bg-[rgba(138,99,210,0.9)] hover:bg-[rgba(138,99,210,1)] text-white rounded-lg font-medium transition-colors"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
