'use client'

import { useState, useRef, useEffect } from 'react'

interface ResourceCardProps {
  fileName: string
  uploadDate: string
  uploadTime: string
  uploaderName?: string
  uploaderId?: string
  onDelete?: () => void
  onDownload?: () => void
}

/**
 * 資源卡片組件
 * 顯示上傳的檔案資訊
 */
export default function ResourceCard({
  fileName,
  uploadDate,
  uploadTime,
  uploaderName,
  uploaderId,
  onDelete,
  onDownload,
}: ResourceCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // 移除副檔名，只顯示檔名
  const displayName = fileName.replace(/\.[^/.]+$/, '')

  // 用戶顏色陣列（與 IdeaCard 保持一致）
  const USER_COLORS = [
    'rgba(138,99,210,0.9)',  // 紫色
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

  // 根據使用者ID生成固定顏色
  const getUserColor = (userId?: string): string => {
    if (!userId) return USER_COLORS[0]
    
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    const index = Math.abs(hash) % USER_COLORS.length
    return USER_COLORS[index]
  }

  // 獲取名稱的首字作為頭像
  const getInitial = (name?: string) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isMenuOpen])

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
  }

  const handleDownload = () => {
    setIsMenuOpen(false)
    onDownload?.()
  }

  const handleDelete = () => {
    setIsMenuOpen(false)

    // 使用瀏覽器原生確認對話框
    if (window.confirm('確定要刪除此資源嗎？此操作無法復原。')) {
    onDelete?.()
  }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-visible border-t border-r border-b border-purple-300" style={{ width: '240px', borderLeftWidth: '4px', borderLeftColor: '#8A63D2' }}>
      {/* 卡片內容 */}
      <div className="pl-5 pr-4 py-3">
        {/* 標題與選項按鈕 */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-gray-900 flex-1">
            {displayName}
          </h3>
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={handleMenuToggle}
              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
              title="選項"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="10" cy="4" r="1.5" fill="currentColor" />
                <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                <circle cx="10" cy="16" r="1.5" fill="currentColor" />
              </svg>
            </button>

            {/* 下拉選單 - 顯示在右邊 */}
            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute left-full ml-2 top-0 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                {/* 下載資源 */}
                <button
                  onClick={handleDownload}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 11L8 2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11 8L8 11L5 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 11V13C2 13.5304 2.21071 14.0391 2.58579 14.4142C2.96086 14.7893 3.46957 15 4 15H12C12.5304 15 13.0391 14.7893 13.4142 14.4142C13.7893 14.0391 14 13.5304 14 13V11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  下載資源
                </button>

                {/* 刪除資源 */}
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 4H14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.33333 4V2.66667C5.33333 2 6 1.33334 6.66667 1.33334H9.33333C10 1.33334 10.6667 2 10.6667 2.66667V4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  刪除資源
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 日期時間和上傳者 */}
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-gray-500">
            {uploadDate} {uploadTime}
          </p>
          {/* 上傳者頭像 */}
          {uploaderName && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: getUserColor(uploaderId) }}
              title={uploaderName}
            >
              <span className="text-white font-semibold text-xs">
                {getInitial(uploaderName)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

