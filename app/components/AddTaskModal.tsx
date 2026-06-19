'use client'

import { useState, useRef, useEffect } from 'react'
import { toDatetimeLocalValue } from '@/lib/kanbanTaskDateTime'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: {
    category: string
    content: string
    startDate: string
    endDate: string
    assignees: string[]
    /** 編輯時一併儲存任務繳交草稿（不變更完成狀態） */
    completionDescription?: string
    attachmentFile?: File | null
  }) => void | Promise<void>
  /** 編輯模式：完成任務（需填寫完成說明） */
  onComplete?: (payload: {
    completionDescription: string
    file: File | null
  }) => void | Promise<void>
  communityMembers?: Array<{ id: string; name: string; avatar?: string }>
  editMode?: boolean
  initialData?: {
    category: string
    content: string
    startDate: string
    endDate: string
    assignees: string[]
    status?: 'incomplete' | 'completed'
    completionDescription?: string
    attachmentPath?: string
    attachmentName?: string
  }
}

function FieldHint({ text, wide }: { text: string; wide?: boolean }) {
  return (
    <span className="group relative ml-1 inline-flex align-middle">
      <span
        tabIndex={0}
        role="button"
        aria-label={text}
        className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full text-gray-400 outline-none hover:text-purple-500 focus:text-purple-500"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.5 9.5a2.5 2.5 0 0 1 4.2 1.8c0 1.5-2.2 2-2.2 3.7V15" strokeLinecap="round" />
          <circle cx="12" cy="18" r="0.75" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-[calc(100%+6px)] top-1/2 z-[110] hidden -translate-y-1/2 rounded-md border border-gray-200 bg-white px-2.5 py-2 text-left text-xs font-normal leading-relaxed text-gray-600 shadow-md group-hover:block group-focus-within:block ${
          wide ? 'w-56' : 'w-52'
        }`}
      >
        {text}
      </span>
    </span>
  )
}

export default function AddTaskModal({
  isOpen,
  onClose,
  onSubmit,
  onComplete,
  communityMembers = [],
  editMode = false,
  initialData,
}: AddTaskModalProps) {
  const [category, setCategory] = useState(initialData?.category || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [startDate, setStartDate] = useState(initialData?.startDate || '')
  const [endDate, setEndDate] = useState(initialData?.endDate || '')
  const [assignees, setAssignees] = useState<string[]>(initialData?.assignees || [])
  const [assigneeInput, setAssigneeInput] = useState('')
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)
  const [completionDescription, setCompletionDescription] = useState('')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [existingAttachmentPath, setExistingAttachmentPath] = useState('')
  const [existingAttachmentName, setExistingAttachmentName] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)
  const [taskStatus, setTaskStatus] = useState<'incomplete' | 'completed'>('incomplete')
  
  // 拖移相關狀態
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // 定義一組色調差異明顯的顏色（用於區分不同使用者）
  const USER_COLORS = [
    'rgba(138,99,210,0.9)',  // 紫色（原本的顏色）
    'rgba(59,130,246,0.9)',  // 藍色
    'rgba(16,185,129,0.9)',  // 綠色
    'rgba(245,158,11,0.9)',  // 橙色
    'rgba(239,68,68,0.9)',   // 紅色
    'rgba(14,165,233,0.9)',  // 青色
    'rgba(168,85,247,0.9)',  // 淺紫色
    'rgba(236,72,153,0.9)',  // 粉色
    'rgba(34,197,94,0.9)',   // 淺綠色
    'rgba(249,115,22,0.9)',  // 橘色
  ]

  // 根據使用者ID生成固定顏色（確保同一個使用者總是得到相同顏色）
  const getUserColor = (userId: string): string => {
    if (!userId) return USER_COLORS[0]
    
    // 簡單的 hash 函數：將 userId 轉換為數字
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 轉換為 32 位整數
    }
    
    // 使用絕對值取模，確保索引在範圍內
    const index = Math.abs(hash) % USER_COLORS.length
    return USER_COLORS[index]
  }

  // 當模態框打開或 initialData 改變時，重置表單和位置
  useEffect(() => {
    if (isOpen) {
      if (editMode && initialData) {
        setCategory(initialData.category || '')
        setContent(initialData.content || '')
        setStartDate(toDatetimeLocalValue(initialData.startDate))
        setEndDate(toDatetimeLocalValue(initialData.endDate))
        setAssignees(initialData.assignees || [])
        setCompletionDescription(initialData.completionDescription || '')
        setExistingAttachmentPath(initialData.attachmentPath || '')
        setExistingAttachmentName(initialData.attachmentName || '')
        setTaskStatus(initialData.status === 'completed' ? 'completed' : 'incomplete')
      } else {
        setCategory('')
        setContent('')
        setStartDate('')
        setEndDate('')
        setAssignees([])
        setCompletionDescription('')
        setExistingAttachmentPath('')
        setExistingAttachmentName('')
        setTaskStatus('incomplete')
      }
      setAttachmentFile(null)
      setAssigneeInput('')
      setShowAssigneeDropdown(false)
      // 重置位置到中心（但允許用戶拖移）
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen, editMode, initialData])

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

  const modalRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 過濾符合輸入的成員
  const filteredMembers = communityMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(assigneeInput.toLowerCase()) &&
      !assignees.includes(member.id)
  )

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowAssigneeDropdown(false)
      }
    }

    if (showAssigneeDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAssigneeDropdown])

  // 重置表單
  const resetForm = () => {
    setCategory('')
    setContent('')
    setStartDate('')
    setEndDate('')
    setAssignees([])
    setAssigneeInput('')
    setShowAssigneeDropdown(false)
    setCompletionDescription('')
    setAttachmentFile(null)
    setExistingAttachmentPath('')
    setExistingAttachmentName('')
  }

  const handleCompleteTask = async () => {
    if (!onComplete) return
    if (!completionDescription.trim()) {
      alert('請填寫完成任務說明')
      return
    }
    setIsCompleting(true)
    try {
      await onComplete({
        completionDescription: completionDescription.trim(),
        file: attachmentFile,
      })
      resetForm()
    } finally {
      setIsCompleting(false)
    }
  }

  // 處理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category.trim() || !content.trim()) {
      alert('請填寫任務主題和任務內容')
      return
    }

    try {
      await onSubmit({
        category,
        content,
        startDate,
        endDate,
        assignees,
        ...(editMode
          ? {
              completionDescription: completionDescription.trim(),
              attachmentFile,
            }
          : {}),
      })
    } catch {
      // 儲存失敗時保留表單內容，由父層 alert
    }
  }

  // 處理關閉
  const handleClose = () => {
    resetForm()
    onClose()
  }

  // 添加負責人
  const handleAddAssignee = (memberId: string) => {
    if (!assignees.includes(memberId)) {
      setAssignees([...assignees, memberId])
    }
    setAssigneeInput('')
    setShowAssigneeDropdown(false)
  }

  // 移除負責人
  const handleRemoveAssignee = (memberId: string) => {
    setAssignees(assignees.filter((id) => id !== memberId))
  }

  // 獲取成員名稱
  const getMemberName = (memberId: string) => {
    const member = communityMembers.find((m) => m.id === memberId)
    return member?.name || memberId
  }

  // 獲取成員頭像
  const getMemberAvatar = (memberId: string) => {
    const member = communityMembers.find((m) => m.id === memberId)
    return member?.avatar
  }

  if (!isOpen) return null

  return (
    <>
      {/* 背景遮罩 - 變暗效果 */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleClose}
      />

      {/* 對話框主體 */}
      <div className="fixed inset-0 flex items-start sm:items-center justify-center z-[100] pointer-events-none p-2 sm:p-4 overflow-y-auto">
        <div
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl w-full max-w-[600px] flex flex-col pointer-events-auto my-2 sm:my-0"
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            cursor: isDragging ? 'grabbing' : 'default',
            maxHeight: 'calc(100vh - 1rem - 80px)', // 手機版：減去底部導航欄高度
            height: 'auto', // 改為 auto，讓內容決定高度
            minHeight: 'min(calc(100vh - 1rem - 80px), 400px)', // 最小高度
          }}
        >
        {/* 標題（可拖移區域） */}
        <div
          className="px-6 py-4 border-b border-gray-200 cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            {editMode ? '編輯任務' : '新增任務'}
          </h2>
        </div>

        {/* 表單內容 - 可滾動區域 */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 任務主題 */}
          <div>
            <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
              任務主題
              <FieldHint text="任務主題是此任務的重點，用於讓成員快速了解此任務要處理的主題是什麼。" />
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="請輸入任務主題"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent text-gray-800"
            />
          </div>

          {/* 任務內容 */}
          <div>
            <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
              任務內容
              <FieldHint
                wide
                text="任務內容是此任務的詳細說明，可描述需要完成的事項、繳交內容或注意事項，讓被指派成員清楚知道要做什麼。"
              />
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="請輸入任務內容"
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6D28D9] resize-none text-gray-800"
            />
          </div>

          {/* 任務時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任務時間
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent text-gray-800 text-sm"
                style={{ colorScheme: 'light' }}
              />
              <span className="hidden sm:inline text-gray-500 shrink-0">~</span>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent text-gray-800 text-sm"
                style={{ colorScheme: 'light' }}
              />
            </div>
          </div>

          {/* 任務負責人 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任務負責人
            </label>
            <div className="relative">
              {/* 標籤輸入框 */}
              <div
                onClick={() => setShowAssigneeDropdown(true)}
                className="w-full min-h-[42px] px-4 py-2 border border-gray-300 rounded-lg focus-within:border-[#6D28D9] flex flex-wrap items-center gap-2 cursor-text bg-white"
              >
                {/* 已選擇的負責人標籤 */}
                {assignees.map((assigneeId) => (
                  <div
                    key={assigneeId}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: getUserColor(assigneeId) }}
                  >
                    {getMemberAvatar(assigneeId) ? (
                      <img
                        src={getMemberAvatar(assigneeId)}
                        alt={getMemberName(assigneeId)}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div 
                        className="w-5 h-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                      >
                        {getMemberName(assigneeId).charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {getMemberName(assigneeId)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveAssignee(assigneeId)
                      }}
                      className="text-white hover:text-gray-200 ml-0.5"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18 6L6 18M6 6L18 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* 輸入框 */}
                <input
                  type="text"
                  value={assigneeInput}
                  onChange={(e) => {
                    setAssigneeInput(e.target.value)
                    setShowAssigneeDropdown(true)
                  }}
                  onFocus={() => setShowAssigneeDropdown(true)}
                  placeholder={assignees.length === 0 ? '輸入或選擇負責人' : ''}
                  className="flex-1 min-w-[120px] outline-none text-gray-800 bg-transparent"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* 下拉選單 */}
              {showAssigneeDropdown && filteredMembers.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                >
                  {filteredMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleAddAssignee(member.id)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-800"
                    >
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#6D28D9] flex items-center justify-center text-white font-semibold">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <span>{member.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 任務繳交（僅編輯模式） */}
          {editMode && onComplete && (
            <div className="border-t border-gray-200 pt-4 mt-2 space-y-4">
              <h3 className="text-base font-semibold text-gray-800">任務繳交</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500 mr-0.5">*</span>
                  完成任務說明
                </label>
                <textarea
                  value={completionDescription}
                  onChange={(e) => setCompletionDescription(e.target.value)}
                  placeholder="請說明任務完成方式與成果"
                  rows={4}
                  readOnly={taskStatus === 'completed'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6D28D9] resize-none text-gray-800 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  附件上傳
                </label>
                <input
                  type="file"
                  disabled={taskStatus === 'completed'}
                  onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-[#6D28D9] hover:file:bg-purple-100 disabled:opacity-50"
                />
                {attachmentFile && (
                  <p className="mt-1 text-xs text-gray-500">已選擇：{attachmentFile.name}</p>
                )}
                {!attachmentFile && existingAttachmentPath && existingAttachmentName && (
                  <p className="mt-1 text-xs text-gray-500">
                    目前已上傳：
                    <a
                      href={existingAttachmentPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6D28D9] hover:underline ml-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {existingAttachmentName}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          </div>
          
          {/* 按鈕 - 固定在底部 */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[rgba(138,99,210,0.9)] hover:bg-[rgba(138,99,210,1)] text-white rounded-lg font-medium transition-colors"
            >
              {editMode ? '儲存' : '新增'}
            </button>
            {editMode && onComplete && taskStatus !== 'completed' && (
              <button
                type="button"
                disabled={isCompleting}
                onClick={() => void handleCompleteTask()}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg font-medium transition-colors"
              >
                {isCompleting ? '處理中…' : '完成任務'}
              </button>
            )}
          </div>
        </form>
        </div>
      </div>
    </>
  )
}