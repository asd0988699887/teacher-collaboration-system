'use client'

import { useState, ChangeEvent, useEffect } from 'react'

interface JoinCommunityModalProps {
  isOpen: boolean
  onClose: () => void
  onJoin: (inviteCode: string) => void | Promise<void>
}

type Step = 'input' | 'confirm'

interface CommunityPreview {
  name: string
  description: string
  createdDate: string
  memberCount: number
}

/**
 * 加入社群對話框組件
 * 輸入邀請碼 → 預覽活動名稱與介紹 → 確認後才加入
 */
export default function JoinCommunityModal({
  isOpen,
  onClose,
  onJoin,
}: JoinCommunityModalProps) {
  const [step, setStep] = useState<Step>('input')
  const [inviteCode, setInviteCode] = useState('')
  const [preview, setPreview] = useState<CommunityPreview | null>(null)
  const [error, setError] = useState('')
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setStep('input')
      setInviteCode('')
      setPreview(null)
      setError('')
      setIsLookingUp(false)
      setIsJoining(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const resetAndClose = () => {
    setInviteCode('')
    setStep('input')
    setPreview(null)
    setError('')
    onClose()
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInviteCode(e.target.value)
    if (error) setError('')
  }

  const handleLookup = async () => {
    const code = inviteCode.trim()
    if (!code) return

    setIsLookingUp(true)
    setError('')

    try {
      const response = await fetch(
        `/api/communities/join?inviteCode=${encodeURIComponent(code)}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '邀請碼無效')
      }

      setPreview({
        name: data.name || '',
        description: data.description || '',
        createdDate: data.createdDate || '',
        memberCount: typeof data.memberCount === 'number' ? data.memberCount : 0,
      })
      setStep('confirm')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '查詢活動失敗'
      setError(message)
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleBackToInput = () => {
    setStep('input')
    setPreview(null)
    setError('')
  }

  const handleConfirmJoin = async () => {
    const code = inviteCode.trim()
    if (!code) return

    setIsJoining(true)
    setError('')

    try {
      await onJoin(code)
      setInviteCode('')
      setStep('input')
      setPreview(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '加入活動失敗'
      setError(message)
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        onClick={resetAndClose}
      />

      {/* 對話框主體 */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-[400px] p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {step === 'input' ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                邀請碼加入活動
              </h2>
              <p className="text-sm text-gray-600 mb-6 text-center">請輸入社團邀請碼</p>

              <div className="mb-4">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inviteCode.trim() && !isLookingUp) {
                      void handleLookup()
                    }
                  }}
                  placeholder="輸入邀請碼"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  autoFocus
                  disabled={isLookingUp}
                />
              </div>

              {error && (
                <p className="mb-4 text-sm text-red-600 text-center">{error}</p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={resetAndClose}
                  disabled={isLookingUp}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 disabled:opacity-60"
                >
                  返回
                </button>
                <button
                  type="button"
                  onClick={() => void handleLookup()}
                  disabled={!inviteCode.trim() || isLookingUp}
                  className="flex-1 px-6 py-3 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] active:bg-[rgba(138,99,210,0.8)] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLookingUp ? '查詢中…' : '下一步'}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                確認加入活動
              </h2>
              <p className="text-sm text-gray-600 mb-4 text-center">
                請確認以下活動是否為您要加入的社團
              </p>

              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">活動名稱</p>
                  <p className="text-base font-semibold text-gray-900">{preview?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">活動介紹</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {preview?.description?.trim() ? preview.description : '（尚無活動介紹）'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">建立日期</p>
                  <p className="text-sm text-gray-900">{preview?.createdDate || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">目前成員人數</p>
                  <p className="text-sm text-gray-900">{preview?.memberCount ?? 0} 人</p>
                </div>
              </div>

              {error && (
                <p className="mb-4 text-sm text-red-600 text-center">{error}</p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBackToInput}
                  disabled={isJoining}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 disabled:opacity-60"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => void handleConfirmJoin()}
                  disabled={isJoining}
                  className="flex-1 px-6 py-3 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] active:bg-[rgba(138,99,210,0.8)] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isJoining ? '加入中…' : '確定加入'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
