'use client'

import { useState, useEffect, useRef, ChangeEvent } from 'react'

interface AddActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (activityData: {
    name: string
    isPublic: boolean
    password: string
    introduction: string
  }) => void
  editMode?: boolean
  initialData?: {
    name: string
    isPublic: boolean
    password: string
    introduction: string
  }
  onManageVersion?: () => void
}

/**
 * 新增/編輯活動模態框組件
 * 對應 Figma 設計 (nodeId: 2-524)
 */
export default function AddActivityModal({
  isOpen,
  onClose,
  onAdd,
  editMode = false,
  initialData,
  onManageVersion,
}: AddActivityModalProps) {
  const [activityName, setActivityName] = useState('')
  const [isPublic, setIsPublic] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [introduction, setIntroduction] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      // 如果是編輯模式且有初始資料，使用初始資料；否則清空
      if (editMode && initialData) {
        setActivityName(initialData.name)
        setIsPublic(initialData.isPublic)
        setPassword(initialData.password)
        setIntroduction(initialData.introduction)
      } else {
        // 重置所有表單欄位
        setActivityName('')
        setIsPublic(null)
        setPassword('')
        setIntroduction('')
      }
      // Focus on the first input field when the modal opens
      const timer = setTimeout(() => {
        nameInputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, editMode, initialData])

  if (!isOpen) return null

  const handleClose = () => {
    onClose()
  }

  const handleAdd = () => {
    if (activityName.trim()) {
      onAdd({
        name: activityName.trim(),
        isPublic: isPublic ?? false,
        password: password.trim(),
        introduction: introduction.trim(),
      })
    }
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setActivityName(e.target.value)
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleIntroductionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setIntroduction(e.target.value)
  }

  const isValid = activityName.trim().length > 0

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
          className="bg-white rounded-lg shadow-xl w-[500px] max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 標題 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {editMode ? '修改活動' : '新增活動'}
            </h2>
          </div>

          <div className="p-8">

          {/* 活動名稱 */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              活動名稱
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={activityName}
              onChange={handleNameChange}
              placeholder="輸入活動名稱"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 text-gray-800"
            />
          </div>

          {/* 是否公開 */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              是否公開:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="isPublic"
                  checked={isPublic === true}
                  onChange={() => {
                    setIsPublic(true)
                    setPassword('') // 選擇「是」時清空密碼
                  }}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-700">是</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="isPublic"
                  checked={isPublic === false}
                  onChange={() => setIsPublic(false)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-700">否</span>
              </label>
            </div>
          </div>

          {/* 密碼 - 只在選擇「否」時顯示 */}
          {isPublic === false && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                密碼:
              </label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="輸入密碼（選填）"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 text-gray-800"
              />
            </div>
          )}

          {/* 活動介紹 */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              活動介紹
            </label>
            <textarea
              value={introduction}
              onChange={handleIntroductionChange}
              placeholder="輸入活動介紹"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 text-gray-800 resize-none"
            />
          </div>

          {/* 按鈕區 */}
          <div className="flex flex-col gap-3">
            {/* 版本管理按鈕 - 只在編輯模式時顯示 */}
            {editMode && onManageVersion && (
              <div className="flex justify-start">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onManageVersion()
                  }}
                  className="px-6 py-2 rounded-lg text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 4V8L10.6667 10.6667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  版本管理
                </button>
              </div>
            )}
            
            {/* 底部按鈕 */}
            <div className="flex justify-end gap-4">
              <button
                onClick={handleClose}
                className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
              >
                返回
              </button>
              <button
                onClick={handleAdd}
                disabled={!isValid}
                className={`px-6 py-2 rounded-lg text-white font-bold transition-colors duration-200 ${
                  isValid
                    ? 'bg-[rgba(138,99,210,0.9)] hover:bg-[rgba(138,99,210,1)]'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {editMode ? '修改' : '新增'}
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  )
}

