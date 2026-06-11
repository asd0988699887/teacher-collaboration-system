'use client'

import type { TaskStatusSummary } from '@/lib/taskDeadline'

interface CommunityCardProps {
  name: string
  description: string
  memberCount: number
  createdDate: string
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  /** 歷史活動模式：底部僅顯示單一「查看活動」按鈕 */
  onView?: () => void
  /** 進行中活動：與活動內側邊欄任務狀態相同的四項摘要 */
  taskStatus?: TaskStatusSummary
}

/**
 * 活動卡片組件（列表頁）
 * 顯示活動基本資訊；底部兩按鈕：編輯活動、進入活動
 * 歷史活動模式（傳入 onView）：底部僅一顆「查看活動」按鈕
 */
export default function CommunityCard({
  name,
  description,
  memberCount,
  createdDate,
  onClick,
  onEdit,
  onView,
  taskStatus,
}: CommunityCardProps) {
  const taskStatusItems = taskStatus
    ? [
        { label: '截止提醒', count: taskStatus.deadlineReminder, color: 'text-red-600' },
        { label: '未完成(個人)', count: taskStatus.myIncomplete, color: 'text-purple-600' },
        { label: '未完成(共同)', count: taskStatus.incomplete, color: 'text-amber-600' },
        { label: '已完成(共同)', count: taskStatus.completed, color: 'text-green-600' },
      ]
    : []
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 relative flex flex-col">
      {onView && onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
          aria-label="編輯活動"
          title="編輯活動"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* 標題 */}
      <div className={`mb-3 ${onView && onEdit ? 'pr-8' : ''}`}>
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
      </div>

      {/* 活動介紹 */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
        {description || '這是由中央國小的老師共同規劃的活動，歡迎中央國小的老師一同加入！'}
      </p>

      {/* 資訊列 */}
      <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
        {/* 人數 */}
        <div className="flex items-center gap-1 cursor-default" title="活動人數">
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
        <div className="flex items-center gap-1 cursor-default" title="建立日期">
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

      {!onView && taskStatusItems.length > 0 && (
        <div className="mb-4 rounded-lg border border-gray-100 bg-[#FAFAFA] px-2 py-3">
          <div className="mb-2 text-center text-xs font-bold text-gray-800">任務狀態</div>
          <div className="grid grid-cols-4 gap-1">
            {taskStatusItems.map((item) => (
              <div key={item.label} className="flex flex-col items-center py-0.5">
                <span className={`text-base font-bold leading-none ${item.color}`}>{item.count}</span>
                <span className="mt-1 px-0.5 text-center text-[9px] leading-tight text-gray-500">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 底部分隔線與操作列 */}
      <div className="border-t border-gray-200 -mx-6 px-6 pt-4 mt-auto">
        {onView ? (
          /* 歷史活動：單一「查看活動」按鈕 */
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onView()
            }}
            className="w-full py-2.5 rounded-lg text-sm font-bold border-2 border-transparent bg-[rgba(138,99,210,0.6)] text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-[rgba(138,99,210,0.75)] active:bg-[rgba(138,99,210,0.85)] transition-all duration-200 box-border"
          >
            查看活動
          </button>
        ) : (
          /* 進行中活動：編輯活動、進入活動 */
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.()
              }}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold border-2 border-transparent bg-[rgba(138,99,210,0.6)] text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-[rgba(138,99,210,0.75)] active:bg-[rgba(138,99,210,0.85)] transition-all duration-200 box-border"
            >
              編輯活動
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClick?.()
              }}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold border-2 border-[#7C3AED] text-[#7C3AED] bg-[rgba(124,58,237,0.06)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-[rgba(124,58,237,0.08)] active:bg-[rgba(124,58,237,0.12)] transition-all duration-200 box-border"
            >
              進入活動
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
