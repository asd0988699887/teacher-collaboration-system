'use client'

import { useState, useRef, useEffect } from 'react'

interface CommunityCardProps {
  name: string
  description: string
  memberCount: number
  createdDate: string
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onLeave?: () => void
}

/**
 * 社群卡片組件
 * 顯示社群的基本資訊
 */
export default function CommunityCard({
  name,
  description,
  memberCount,
  createdDate,
  onClick,
  onEdit,
  onDelete,
  onLeave,
}: CommunityCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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
    e.stopPropagation() // 阻止事件冒泡到卡片
    setIsMenuOpen(!isMenuOpen)
  }

  const handleEdit = () => {
    setIsMenuOpen(false)
    onEdit?.()
  }

  const handleDelete = () => {
    setIsMenuOpen(false)
    onDelete?.()
  }

  const handleLeave = () => {
    setIsMenuOpen(false)
    onLeave?.()
  }

  const handleCardClick = () => {
    onClick?.()
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 relative cursor-pointer"
      onClick={handleCardClick}
    >
      {/* 標題與選項按鈕 */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={handleMenuToggle}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="4" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="10" cy="16" r="1.5" />
            </svg>
          </button>

          {/* 下拉選單 - 顯示在右邊 */}
          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute left-full ml-2 top-0 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 編輯社群 */}
              <button
                onClick={handleEdit}
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
                    d="M11.3337 2.00004C11.5089 1.82494 11.7169 1.68605 11.9457 1.59129C12.1745 1.49653 12.4197 1.44775 12.667 1.44775C12.9144 1.44775 13.1596 1.49653 13.3884 1.59129C13.6172 1.68605 13.8252 1.82494 14.0003 2.00004C14.1754 2.17513 14.3143 2.38311 14.4091 2.61193C14.5038 2.84075 14.5526 3.08591 14.5526 3.33337C14.5526 3.58084 14.5038 3.826 14.4091 4.05482C14.3143 4.28364 14.1754 4.49162 14.0003 4.66671L5.00033 13.6667L1.33366 14.6667L2.33366 11L11.3337 2.00004Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                編輯社群
              </button>

              {/* 刪除社群 */}
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
                刪除社群
              </button>

              {/* 退出社群 */}
              <button
                onClick={handleLeave}
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
                    d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10.6667 11.3333L14 8L10.6667 4.66666"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 8H6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                退出社群
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 社群介紹 */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {description || '這是由中央國小的老師共同規劃的社群，歡迎中央國小的老師一同加入！'}
      </p>

      {/* 資訊列 */}
      <div className="flex items-center gap-6 text-sm text-gray-500">
        {/* 人數 */}
        <div className="flex items-center gap-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 7C12.1046 7 13 6.10457 13 5C13 3.89543 12.1046 3 11 3C9.89543 3 9 3.89543 9 5C9 6.10457 9.89543 7 11 7Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 7C6.10457 7 7 6.10457 7 5C7 3.89543 6.10457 3 5 3C3.89543 3 3 3.89543 3 5C3 6.10457 3.89543 7 5 7Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11 13V11C11 10.4696 10.7893 9.96086 10.4142 9.58579C10.0391 9.21071 9.53043 9 9 9H3C2.46957 9 1.96086 9.21071 1.58579 9.58579C1.21071 9.96086 1 10.4696 1 11V13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 13V11C14.9999 10.5757 14.8624 10.1631 14.609 9.82798C14.3555 9.49289 13.9998 9.25526 13.6 9.15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{memberCount} 人</span>
        </div>

        {/* 建立日期 */}
        <div className="flex items-center gap-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="3"
              width="12"
              height="11"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11 1V5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 1V5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 7H14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{createdDate}</span>
        </div>
      </div>
    </div>
  )
}

