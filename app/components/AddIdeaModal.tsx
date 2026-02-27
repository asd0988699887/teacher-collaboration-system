'use client'

import { useState, useEffect, useRef } from 'react'

interface AddIdeaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (ideaData: {
    activityId?: string
    stage: string
    title: string
    content: string
  }) => void
  communityId?: string
  /** 目前已有的階段名稱，用於自動建議（可選） */
  existingStages?: string[]
}

/**
 * 新增想法模態框組件
 * 對應 Figma 設計 (nodeId: 5-1487)
 */
interface Activity {
  id: string
  name: string
}

export default function AddIdeaModal({
  isOpen,
  onClose,
  onSubmit,
  communityId,
  existingStages = [],
}: AddIdeaModalProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('')
  const [stage, setStage] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [showStageDropdown, setShowStageDropdown] = useState(false)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const stageDropdownRef = useRef<HTMLDivElement>(null)
  
  // 拖移相關狀態
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  // 預設的文字按鈕
  const presetButtons = [
    '我想知道',
    '我的想法',
    '我的理論',
    '新資訊或參考來源',
    '另一個觀點是',
    '我覺得更好的想法',
    '有發展性的想法',
  ]

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

  // 當模態框打開時，重置表單和位置
  useEffect(() => {
    if (isOpen) {
      setSelectedActivityId('')
      setStage('')
      setTitle('')
      setContent('')
      setShowStageDropdown(false)
      // 重置位置到中心（但允許用戶拖移）
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  // 點擊外部關閉階段下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stageDropdownRef.current && !stageDropdownRef.current.contains(e.target as Node)) {
        setShowStageDropdown(false)
      }
    }
    if (showStageDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showStageDropdown])

  // 依輸入篩選的階段建議（不重複、含目前輸入）
  const uniqueStages = [...new Set(existingStages.filter(Boolean))]
  const filteredStages = uniqueStages.filter((s) =>
    s.toLowerCase().includes(stage.trim().toLowerCase())
  )

  // 處理拖移開始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // 只處理左鍵
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

  // 處理預設按鈕點擊
  const handlePresetButtonClick = (text: string) => {
    const textarea = contentTextareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const currentContent = content
      const newContent =
        currentContent.substring(0, start) +
        text +
        currentContent.substring(end)
      setContent(newContent)

      // 設置游標位置在插入文字之後
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + text.length, start + text.length)
      }, 0)
    } else {
      // 如果 textarea 還沒有 ref，直接追加到內容末尾
      setContent((prev) => prev + text)
    }
  }

  // 處理提交
  const handleSubmit = () => {
    onSubmit({
      activityId: selectedActivityId || undefined,
      stage,
      title,
      content,
    })
    onClose()
  }

  if (!isOpen) return null

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
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col pointer-events-auto my-2 sm:my-0"
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            cursor: isDragging ? 'grabbing' : 'default',
            maxHeight: 'calc(100vh - 1rem - 80px)', // 手機版：減去底部導航欄高度
            height: 'auto', // 改為 auto，讓內容決定高度
            minHeight: 'min(calc(100vh - 1rem - 80px), 500px)', // 最小高度
          }}
        >
          {/* 標題（可拖移區域） */}
          <div
            className="px-6 py-4 border-b border-gray-200 cursor-move select-none"
            onMouseDown={handleMouseDown}
          >
            <h2 className="text-xl font-semibold text-gray-800">新增想法</h2>
          </div>

          {/* 表單內容 - 可滾動區域 */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* 共備活動 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  共備活動
                </label>
                <select
                  value={selectedActivityId}
                  onChange={(e) => setSelectedActivityId(e.target.value)}
                  disabled={activities.length === 0 || isLoadingActivities}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                >
                  <option value="">
                    {isLoadingActivities 
                      ? '載入中...' 
                      : activities.length === 0 
                        ? '目前沒有共備活動' 
                        : '請選擇共備活動（可選）'}
                  </option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 階段（可輸入或從既有階段選擇） */}
              <div ref={stageDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  階段
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={stage}
                    onChange={(e) => {
                      setStage(e.target.value)
                      setShowStageDropdown(true)
                    }}
                    onFocus={() => setShowStageDropdown(true)}
                    placeholder="請輸入階段或選擇既有階段"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                  />
                  {showStageDropdown && filteredStages.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredStages.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setStage(s)
                            setShowStageDropdown(false)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-800"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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

              {/* 內容區域 */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* 左側：預設按鈕 */}
                <div className="flex flex-row sm:flex-col gap-2 sm:w-40 w-full sm:flex-shrink-0 overflow-x-auto sm:overflow-x-visible">
                  {presetButtons.map((buttonText, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handlePresetButtonClick(buttonText)}
                      className="px-3 sm:px-4 py-2 bg-white border border-purple-300 text-[#6D28D9] hover:bg-purple-50 text-xs sm:text-sm rounded-lg font-medium transition-colors text-left whitespace-nowrap flex-shrink-0"
                    >
                      {buttonText}
                    </button>
                  ))}
                </div>

                {/* 右側：內容輸入框 */}
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    內容
                  </label>
                  <textarea
                    ref={contentTextareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={12}
                    placeholder="請輸入內容"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 底部按鈕 */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              返回
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-[rgba(138,99,210,0.9)] hover:bg-[rgba(138,99,210,1)] text-white rounded-lg font-medium transition-colors"
            >
              新增
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

