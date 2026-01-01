'use client'

interface IdeaCardProps {
  stage: string
  title: string
  createdDate: string
  createdTime: string
  creatorName?: string
  creatorAvatar?: string
  creatorId?: string // 建立者ID（用於生成顏色）
  onClick?: () => void
  isConvergence?: boolean
}

/**
 * 想法卡片組件
 */
export default function IdeaCard({
  stage,
  title,
  createdDate,
  createdTime,
  creatorName,
  creatorAvatar,
  creatorId,
  onClick,
  isConvergence,
}: IdeaCardProps) {
  // 定義一組色調差異明顯的顏色（用於區分不同使用者）
  const USER_COLORS = [
    'rgba(138,99,210,0.9)',  // 紫色（原本的顏色）
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

  // 根據使用者ID生成固定顏色（確保同一個使用者總是得到相同顏色）
  const getUserColor = (userId?: string): string => {
    if (!userId) return USER_COLORS[0]
    
    // 簡單的 hash 函數：將 userId 轉換為數字
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 轉換為 32 位整數
    }
    
    // 使用絕對值取模，確保索引在範圍內
    const index = Math.abs(hash) % USER_COLORS.length
    return USER_COLORS[index]
  }

  // 獲取建立者名稱的首字作為頭像
  const getInitial = (name?: string) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 hover:shadow-md transition-shadow w-fit cursor-pointer"
    >
      {/* 階段（帶有燈泡圖標） */}
      <div className="flex items-center gap-1 mb-1">
        {isConvergence ? (
          // 實心燈泡（收斂結果）
          <svg
            className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        ) : (
          // 空心燈泡（普通想法）
          <svg
            className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        )}
        <span className="text-[11px] font-bold text-gray-700">
          [{stage}]
        </span>
      </div>

      {/* 標題 - 從階段文字下方開始 */}
      <h3 className="text-xs font-semibold text-gray-800 mb-1.5 line-clamp-2 leading-tight ml-[18px]">
        {title}
      </h3>

      {/* 建立者與日期時間 */}
      <div className="flex items-center gap-1.5">
        {/* 建立者頭像 */}
        <div 
          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-semibold flex-shrink-0"
          style={{ backgroundColor: getUserColor(creatorId) }}
        >
          {creatorAvatar ? (
            <img
              src={creatorAvatar}
              alt={creatorName || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitial(creatorName)
          )}
        </div>
        {/* 日期時間 */}
        <div className="text-[9px] text-gray-500 whitespace-nowrap">
          {createdDate} {createdTime}
        </div>
      </div>
    </div>
  )
}

