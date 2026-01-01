'use client'

import { useState, useRef, useEffect, ChangeEvent } from 'react'

interface PasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (password: string) => boolean
  activityName: string
}

/**
 * 密碼驗證模態框組件
 * 用於驗證活動密碼
 */
export default function PasswordModal({
  isOpen,
  onClose,
  onVerify,
  activityName,
}: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const passwordInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setError('')
      // Focus on the password input when the modal opens
      const timer = setTimeout(() => {
        passwordInputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleClose = () => {
    setPassword('')
    setError('')
    onClose()
  }

  const handleVerify = () => {
    if (!password.trim()) {
      setError('請輸入密碼')
      return
    }

    const isValid = onVerify(password.trim())
    if (isValid) {
      setPassword('')
      setError('')
      onClose()
    } else {
      setError('密碼錯誤，請重新輸入')
      setPassword('')
      passwordInputRef.current?.focus()
    }
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setError('') // 清除錯誤訊息
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleVerify()
    }
  }

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
          className="bg-white rounded-lg shadow-xl w-[400px] p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 標題 */}
          <h2 className="text-2xl font-bold text-[#6D28D9] mb-2 text-center">
            輸入密碼
          </h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            {activityName}
          </p>

          {/* 密碼輸入 */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              密碼
            </label>
            <input
              ref={passwordInputRef}
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onKeyPress={handleKeyPress}
              placeholder="請輸入活動密碼"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
            />
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>

          {/* 按鈕區 */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
            >
              取消
            </button>
            <button
              onClick={handleVerify}
              className="px-6 py-2 rounded-lg text-white font-bold bg-[rgba(138,99,210,0.9)] hover:bg-[rgba(138,99,210,1)] transition-colors duration-200"
            >
              確認
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

