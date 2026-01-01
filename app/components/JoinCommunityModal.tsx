'use client'

import { useState, ChangeEvent } from 'react'

interface JoinCommunityModalProps {
  isOpen: boolean
  onClose: () => void
  onJoin: (inviteCode: string) => void
}

/**
 * 加入社群對話框組件
 * 根據 Figma 設計 (nodeId: 1:28) 實現
 */
export default function JoinCommunityModal({
  isOpen,
  onClose,
  onJoin,
}: JoinCommunityModalProps) {
  const [inviteCode, setInviteCode] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    if (inviteCode.trim()) {
      onJoin(inviteCode)
      setInviteCode('') // 清空輸入框
    }
  }

  const handleClose = () => {
    setInviteCode('') // 清空輸入框
    onClose()
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInviteCode(e.target.value)
  }

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
          onClick={(e) => e.stopPropagation()} // 防止點擊對話框內部關閉
        >
          {/* 標題 */}
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            邀請碼加入社群
          </h2>

          {/* 說明文字 */}
          <p className="text-sm text-gray-600 mb-6 text-center">
            請輸入社團邀請碼
          </p>

          {/* 輸入框 */}
          <div className="mb-6">
            <input
              type="text"
              value={inviteCode}
              onChange={handleInputChange}
              placeholder="輸入邀請碼"
              className="
                w-full
                px-4 py-3
                border border-gray-300
                rounded-lg
                text-base
                focus:outline-none
                focus:ring-2
                focus:ring-purple-500
                focus:border-transparent
                transition-all
              "
              autoFocus
            />
          </div>

          {/* 按鈕群組 */}
          <div className="flex gap-4">
            {/* 返回按鈕 */}
            <button
              onClick={handleClose}
              className="
                flex-1
                px-6 py-3
                bg-gray-100
                text-gray-700
                rounded-lg
                font-medium
                hover:bg-gray-200
                active:bg-gray-300
                transition-all
                duration-200
              "
            >
              返回
            </button>

            {/* 加入按鈕 */}
            <button
              onClick={handleSubmit}
              disabled={!inviteCode.trim()}
              className="
                flex-1
                px-6 py-3
                bg-[rgba(138,99,210,0.9)]
                text-white
                rounded-lg
                font-medium
                hover:bg-[rgba(138,99,210,1)]
                active:bg-[rgba(138,99,210,0.8)]
                disabled:bg-gray-300
                disabled:cursor-not-allowed
                transition-all
                duration-200
              "
            >
              加入
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

