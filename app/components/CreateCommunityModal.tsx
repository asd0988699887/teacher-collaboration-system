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
            {editMode ? '修改社群' : '新增社群'}
          </h2>

          {/* 社群名稱 */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              社群名稱
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={communityName}
              onChange={handleNameChange}
              placeholder="輸入社群名稱"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
            />
          </div>

          {/* 邀請碼 */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              邀請碼
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={handleInviteCodeChange}
              placeholder="輸入邀請碼"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
            />
          </div>

          {/* 社群介紹 */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              社群介紹
            </label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="輸入社群介紹"
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

