'use client'

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
 * 顯示社群的基本資訊；底部三按鈕：編輯社群、進入社群、退出社群
 */
export default function CommunityCard({
  name,
  description,
  memberCount,
  createdDate,
  onClick,
  onEdit,
  onLeave,
}: CommunityCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 relative flex flex-col">
      {/* 標題 */}
      <div className="mb-3">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
      </div>

      {/* 社群介紹 */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
        {description || '這是由中央國小的老師共同規劃的社群，歡迎中央國小的老師一同加入！'}
      </p>

      {/* 資訊列 */}
      <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
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

      {/* 底部分隔線與操作列：Primary 進入／Secondary 編輯 outline／Danger outline 退出（方案 A） */}
      <div className="border-t border-gray-200 -mx-6 px-6 pt-4 mt-auto">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.()
            }}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold border-2 border-[#7C3AED] text-[#7C3AED] bg-[rgba(124,58,237,0.06)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-[rgba(124,58,237,0.08)] active:bg-[rgba(124,58,237,0.12)] transition-all duration-200 box-border"
          >
            編輯社群
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold border-2 border-transparent bg-[rgba(138,99,210,0.6)] text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-[rgba(138,99,210,0.75)] active:bg-[rgba(138,99,210,0.85)] transition-all duration-200 box-border"
          >
            進入社群
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onLeave?.()
            }}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold border-2 border-gray-200 text-gray-600 bg-gray-50 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700 active:bg-gray-200 transition-all duration-200 box-border"
          >
            退出社群
          </button>
        </div>
      </div>
    </div>
  )
}
