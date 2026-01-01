'use client'

import { useState, useRef, useEffect } from 'react'

interface ActivityCardProps {
  activityName: string
  introduction: string
  createdDate: string
  createdTime: string
  password?: string
  isPasswordVerified?: boolean
  creatorId?: string
  creatorName?: string
  onEdit?: () => void
  onManageVersion?: () => void
  onDelete?: () => void
  onCardClick?: () => void
  onRequestPassword?: (action: 'edit' | 'view' | 'menu') => void
  onPasswordVerified?: () => void
}

/**
 * 活動卡片組件
 * 對應 Figma 設計 (nodeId: 2-601, 2-648)
 * 顯示活動名稱、活動介紹、建立日期時間
 */
// 定義一組色調差異明顯的顏色（用於區分不同使用者）
// 與社群管理、想法卡片等保持一致
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
];

const getUserColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 轉換為 32 位整數
  }
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
};

export default function ActivityCard({
  activityName,
  introduction,
  createdDate,
  createdTime,
  password,
  isPasswordVerified = false,
  creatorId,
  creatorName,
  onEdit,
  onManageVersion,
  onDelete,
  onCardClick,
  onRequestPassword,
  onPasswordVerified,
}: ActivityCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [localPasswordVerified, setLocalPasswordVerified] = useState(false)
  const [pendingMenuOpen, setPendingMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // 當外部傳入的驗證狀態改變時，更新本地狀態
  useEffect(() => {
    if (isPasswordVerified) {
      setLocalPasswordVerified(true)
      // 如果之前嘗試打開選單，現在打開它
      if (pendingMenuOpen) {
        setIsMenuOpen(true)
        setPendingMenuOpen(false)
      }
    }
  }, [isPasswordVerified, pendingMenuOpen])

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
    // 如果有密碼且尚未驗證，需要先驗證密碼
    if (password && password.trim() && !localPasswordVerified) {
      setPendingMenuOpen(true) // 標記為待打開選單
      onRequestPassword?.('menu')
    } else {
      setIsMenuOpen(!isMenuOpen)
    }
  }

  const handleEdit = () => {
    setIsMenuOpen(false)
    // 如果有密碼且尚未驗證，需要先驗證
    if (password && password.trim() && !localPasswordVerified) {
      onRequestPassword?.('edit')
    } else {
      onEdit?.()
    }
  }

  const handleManageVersion = () => {
    setIsMenuOpen(false)
    // 管理版本功能暫時不需要密碼驗證
    onManageVersion?.()
  }

  const handleCardClick = () => {
    // 如果有密碼且尚未驗證，需要先驗證
    if (password && password.trim() && !localPasswordVerified) {
      onRequestPassword?.('view')
    } else {
      onCardClick?.()
    }
  }

  // 當密碼驗證成功時，更新本地狀態
  useEffect(() => {
    if (isPasswordVerified && password && password.trim()) {
      setLocalPasswordVerified(true)
      onPasswordVerified?.()
    }
  }, [isPasswordVerified, password, onPasswordVerified])

  const handleDelete = () => {
    setIsMenuOpen(false)
    
    // 使用瀏覽器原生確認對話框
    if (window.confirm('確定要刪除此活動嗎？此操作無法復原。')) {
      onDelete?.()
    }
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-visible border-t border-r border-b border-purple-300 cursor-pointer" 
      style={{ width: '240px', borderLeftWidth: '4px', borderLeftColor: '#8A63D2' }}
      onClick={handleCardClick}
    >
      {/* 卡片內容 */}
      <div className="pl-5 pr-4 py-3">
        {/* 標題與選項按鈕 */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-gray-900 flex-1">
            {activityName}
          </h3>
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={handleMenuToggle}
              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
              title="選項"
              onMouseDown={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
              >
                {/* 編輯活動 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit()
                  }}
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
                      d="M11.3333 2.00001C11.5084 1.8249 11.7163 1.68601 11.9447 1.5913C12.1731 1.49659 12.4173 1.44775 12.6667 1.44775C12.916 1.44775 13.1602 1.49659 13.3886 1.5913C13.617 1.68601 13.8249 1.8249 14 2.00001C14.1751 2.17512 14.314 2.38301 14.4087 2.61141C14.5034 2.83981 14.5522 3.08403 14.5522 3.33334C14.5522 3.58265 14.5034 3.82687 14.4087 4.05527C14.314 4.28367 14.1751 4.49156 14 4.66668L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00001Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  編輯活動
                </button>

                {/* 管理版本 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleManageVersion()
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
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
                  管理版本
                </button>

                {/* 刪除活動 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
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
                  刪除活動
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 活動介紹 */}
        <p className="text-sm text-gray-700 mb-2 mt-2">
          {introduction || '（無活動介紹）'}
        </p>

        {/* 建立者 */}
        {creatorName && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">建立者:</span>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              style={{ backgroundColor: creatorId ? getUserColor(creatorId) : 'rgba(138,99,210,0.9)' }}
            >
              {creatorName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* 建立日期時間 */}
        <p className="text-sm text-gray-500">
          {createdDate} {createdTime}
        </p>
      </div>

    </div>
  )
}

