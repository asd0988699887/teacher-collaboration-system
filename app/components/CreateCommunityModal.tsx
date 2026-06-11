'use client'

import { useState, useEffect, useRef, ChangeEvent } from 'react'

interface CreateCommunityModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (communityName: string, inviteCode: string, description: string) => void
  editMode?: boolean
  initialData?: {
    name: string
    inviteCode: string
    description: string
  }
}

function FieldHint({ text }: { text: string }) {
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
        className="pointer-events-none absolute left-[calc(100%+6px)] top-1/2 z-[60] hidden w-52 -translate-y-1/2 rounded-md border border-gray-200 bg-white px-2.5 py-2 text-left text-xs font-normal leading-relaxed text-gray-600 shadow-md group-hover:block group-focus-within:block"
      >
        {text}
      </span>
    </span>
  )
}

export default function CreateCommunityModal({
  isOpen,
  onClose,
  onCreate,
  editMode = false,
  initialData,
}: CreateCommunityModalProps) {
  const [communityName, setCommunityName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [description, setDescription] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      // 如果是編輯模式且有初始資料，使用初始資料；否則清空
      if (editMode && initialData) {
        setCommunityName(initialData.name)
        setInviteCode(initialData.inviteCode)
        setDescription(initialData.description)
      } else {
        setCommunityName('')
        setInviteCode('')
        setDescription('')
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

  const handleCreate = () => {
    if (communityName.trim() && inviteCode.trim()) {
      onCreate(communityName.trim(), inviteCode.trim(), description.trim())
    }
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCommunityName(e.target.value)
  }

  const handleInviteCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInviteCode(e.target.value)
  }

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
  }

  const isValid = communityName.trim() && inviteCode.trim()

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        onClick={handleClose}
      />

      {/* 對話框主體 */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className="bg-white rounded-lg shadow-xl w-[400px] p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 標題 */}
          <h2 className="text-2xl font-bold text-[#6D28D9] mb-6 text-center">
            {editMode ? '修改活動' : '新增活動'}
          </h2>

          {/* 活動名稱 */}
          <div className="mb-4">
            <label className="mb-2 flex items-center text-gray-700 font-medium">
              活動名稱
              <FieldHint text="可填寫本次要共同備課的內容，或某個團體／學校名稱" />
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={communityName}
              onChange={handleNameChange}
              placeholder="輸入活動名稱"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
            />
          </div>

          {/* 邀請碼 */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              邀請碼
              <span className="text-sm font-normal text-gray-500">
                (分享此邀請碼，邀請成員加入活動。)
              </span>
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={handleInviteCodeChange}
              placeholder="輸入邀請碼"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
            />
          </div>

          {/* 活動介紹 */}
          <div className="mb-6">
            <label className="mb-2 flex items-center text-gray-700 font-medium">
              活動介紹
              <FieldHint text="可簡要說明本次活動的主要任務，或告知加入活動成員條件或活動性質。" />
            </label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="輸入活動介紹"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
            />
          </div>

          {/* 按鈕區 */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
            >
              返回
            </button>
            <button
              onClick={handleCreate}
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
    </>
  )
}

