'use client'

import { useState, useRef, useEffect } from 'react'

interface ActivityCardProps {
  activityName: string
  introduction: string
  createdDate: string
  createdTime: string
  creatorId?: string
  creatorName?: string
  /** 頭像顏色用字串（例如設計者姓名）；未傳則用 creatorId */
  avatarColorSeed?: string
  /** 預設「建立者」；歷史活動卡片可改為「設計者」 */
  personLabel?: string
  /** 為 true 時不顯示「編輯活動」選項 */
  hideEdit?: boolean
  /** 時間列前綴說明，例如「最後修改」；未傳則僅顯示日期與時間 */
  timeCaption?: string
  /** 為 true 時僅顯示「標籤：姓名」文字，不顯示圓形頭像（第一字 icon） */
  hidePersonAvatar?: boolean
  /**
   * menu：右上角 ⋮ 下拉（預設）
   * footer：隱藏選單，改在卡片底部並列按鈕（歷史活動用）
   */
  actionPlacement?: 'menu' | 'footer'
  onEdit?: () => void
  onManageVersion?: () => void
  /** 歷史活動等：下載教案（Word） */
  onDownloadLessonPlan?: () => void
  /** 歷史活動等：唯讀預覽教案 */
  onPreviewLessonPlan?: () => void
  onDelete?: () => void
  onCardClick?: () => void
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
  creatorId,
  creatorName,
  avatarColorSeed,
  personLabel = '建立者',
  hideEdit = false,
  timeCaption,
  hidePersonAvatar = false,
  actionPlacement = 'menu',
  onEdit,
  onManageVersion,
  onDownloadLessonPlan,
  onPreviewLessonPlan,
  onDelete,
  onCardClick,
}: ActivityCardProps) {
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
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
  }

  const handleEdit = () => {
    setIsMenuOpen(false)
    onEdit?.()
  }

  const handleManageVersion = () => {
    setIsMenuOpen(false)
    onManageVersion?.()
  }

  const handleCardClick = () => {
    onCardClick?.()
  }

  const handleDownloadLessonPlan = () => {
    setIsMenuOpen(false)
    onDownloadLessonPlan?.()
  }

  const handlePreviewLessonPlan = () => {
    setIsMenuOpen(false)
    onPreviewLessonPlan?.()
  }

  const handleDelete = () => {
    setIsMenuOpen(false)
    const msg =
      actionPlacement === 'footer'
        ? '確定要刪除此教案嗎？此操作無法復原。'
        : '確定要刪除此活動嗎？此操作無法復原。'
    if (window.confirm(msg)) {
      onDelete?.()
    }
  }

  const openPreview = () => {
    if (onPreviewLessonPlan) {
      onPreviewLessonPlan()
    } else {
      onCardClick?.()
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
        {/* 標題；選單僅 menu 模式顯示 */}
        <div
          className={
            actionPlacement === 'menu'
              ? 'flex items-start justify-between gap-2'
              : undefined
          }
        >
          <h3 className="text-base font-bold text-gray-900 flex-1">
            {activityName}
          </h3>
          {actionPlacement === 'menu' && (
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

              {isMenuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full mt-1 min-w-[10rem] w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[60]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!hideEdit && (
                    <>
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
                    </>
                  )}

                  {onManageVersion && (
                    <>
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
                    </>
                  )}

                  {onDownloadLessonPlan && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownloadLessonPlan()
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
                          d="M8 10.6667V2M8 10.6667L5.33333 8M8 10.6667L10.6667 8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 10.6667V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V10.6667"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      下載教案
                    </button>
                  )}

                  <button
                    type="button"
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
          )}
        </div>

        {/* 活動介紹 */}
        <p className="text-sm text-gray-700 mb-2 mt-2">
          {introduction || '（無活動介紹）'}
        </p>

        {/* 建立者 / 設計者 */}
        {creatorName && (
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-sm text-gray-600">{personLabel}:</span>
            {hidePersonAvatar ? (
              <span className="text-sm text-gray-800">{creatorName}</span>
            ) : (
              <>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: getUserColor(avatarColorSeed || creatorId || creatorName || 'x'),
                  }}
                >
                  {creatorName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-800">{creatorName}</span>
              </>
            )}
          </div>
        )}

        {/* 建立／最後修改等時間（實際意義由呼叫端以 timeCaption 標示） */}
        <p className="text-sm text-gray-500">
          {timeCaption ? (
            <>
              <span className="text-gray-500">{timeCaption}：</span>
              {createdDate} {createdTime}
            </>
          ) : (
            <>
              {createdDate} {createdTime}
            </>
          )}
        </p>
      </div>

      {actionPlacement === 'footer' &&
        (onDownloadLessonPlan || onPreviewLessonPlan || onCardClick || onDelete) && (
          <div
            className="border-t border-gray-200 px-3 pt-2 pb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-1.5">
              {onDownloadLessonPlan && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDownloadLessonPlan()
                  }}
                  className="flex-1 py-2 rounded-lg text-[10px] font-bold text-center border-2 border-[#7C3AED] text-[#7C3AED] bg-[rgba(124,58,237,0.06)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-[rgba(124,58,237,0.08)] transition-colors"
                >
                  下載教案
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  openPreview()
                }}
                className="flex-1 py-2 rounded-lg text-[10px] font-bold text-center border-2 border-transparent bg-[rgba(138,99,210,0.6)] text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-[rgba(138,99,210,0.75)] transition-colors"
              >
                流覽教案
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                  className="flex-1 py-2 rounded-lg text-[10px] font-bold text-center border-2 border-[#EF4444] text-[#EF4444] bg-transparent shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-[rgba(239,68,68,0.08)] transition-colors"
                >
                  刪除教案
                </button>
              )}
            </div>
          </div>
        )}

    </div>
  )
}

