'use client'

import { useState, useRef, useEffect } from 'react'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: {
    category: string
    content: string
    startDate: string
    endDate: string
    assignees: string[]
  }) => void
  communityMembers?: Array<{ id: string; name: string; avatar?: string }>
  editMode?: boolean
  initialData?: {
    category: string
    content: string
    startDate: string
    endDate: string
    assignees: string[]
  }
}

export default function AddTaskModal({
  isOpen,
  onClose,
  onSubmit,
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

  // 當模態框打開或 initialData 改變時，重置表單
  useEffect(() => {
    if (isOpen) {
      if (editMode && initialData) {
        setCategory(initialData.category || '')
        setContent(initialData.content || '')
        setStartDate(initialData.startDate || '')
        setEndDate(initialData.endDate || '')
        setAssignees(initialData.assignees || [])
      } else {
        setCategory('')
        setContent('')
        setStartDate('')
        setEndDate('')
        setAssignees([])
      }
      setAssigneeInput('')
      setShowAssigneeDropdown(false)
    }
  }, [isOpen, editMode, initialData])

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
  }

  // 處理提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!category.trim() || !content.trim()) {
      alert('請填寫任務類別和任務內容')
      return
    }

    onSubmit({
      category,
      content,
      startDate,
      endDate,
      assignees,
    })

    resetForm()
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
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* 標題 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {editMode ? '編輯任務' : '新增任務'}
          </h2>
        </div>

        {/* 表單內容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 任務類別 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任務類別
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="請輸入任務類別"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent text-gray-800"
            />
          </div>

          {/* 任務內容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任務內容
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
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  lang="en-US"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent text-gray-800 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
                    !startDate
                      ? '[&::-webkit-datetime-edit-text]:opacity-0 [&::-webkit-datetime-edit-month-field]:opacity-0 [&::-webkit-datetime-edit-day-field]:opacity-0 [&::-webkit-datetime-edit-year-field]:opacity-0'
                      : ''
                  }`}
                  style={{ colorScheme: 'light' }}
                />
                {!startDate && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    yyyy/mm/dd
                  </span>
                )}
              </div>
              <span className="text-gray-500">~</span>
              <div className="flex-1 relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  lang="en-US"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent text-gray-800 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
                    !endDate
                      ? '[&::-webkit-datetime-edit-text]:opacity-0 [&::-webkit-datetime-edit-month-field]:opacity-0 [&::-webkit-datetime-edit-day-field]:opacity-0 [&::-webkit-datetime-edit-year-field]:opacity-0'
                      : ''
                  }`}
                  style={{ colorScheme: 'light' }}
                />
                {!endDate && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    yyyy/mm/dd
                  </span>
                )}
              </div>
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

          {/* 按鈕 */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              返回
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
            >
              {editMode ? '更新' : '確認'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  )
}

