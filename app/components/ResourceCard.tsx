'use client'

interface ResourceCardProps {
  fileName: string
  filePath?: string
  fileType?: string
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
// 根據 MIME type 或副檔名判斷是否為圖片
function isImageFile(fileType?: string, fileName?: string): boolean {
  if (fileType) {
    return fileType.startsWith('image/')
  }
  if (fileName) {
    return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName)
  }
  return false
}

// 根據檔名副檔名取得檔案類別
function getFileCategory(fileName: string): 'pdf' | 'word' | 'excel' | 'ppt' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (['xls', 'xlsx'].includes(ext)) return 'excel'
  if (['ppt', 'pptx'].includes(ext)) return 'ppt'
  return 'other'
}

// 各類型圖示（SVG inline）
function FileTypeIcon({ category }: { category: ReturnType<typeof getFileCategory> }) {
  if (category === 'pdf') {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
        <svg viewBox="0 0 32 32" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill="#EF4444" />
          <text x="5" y="22" fontSize="11" fontWeight="bold" fill="white" fontFamily="Arial,sans-serif">PDF</text>
        </svg>
      </div>
    )
  }
  if (category === 'word') {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
        <svg viewBox="0 0 32 32" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill="#2563EB" />
          <text x="5" y="22" fontSize="11" fontWeight="bold" fill="white" fontFamily="Arial,sans-serif">DOC</text>
        </svg>
      </div>
    )
  }
  if (category === 'excel') {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
        <svg viewBox="0 0 32 32" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill="#16A34A" />
          <text x="5" y="22" fontSize="11" fontWeight="bold" fill="white" fontFamily="Arial,sans-serif">XLS</text>
        </svg>
      </div>
    )
  }
  if (category === 'ppt') {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
        <svg viewBox="0 0 32 32" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill="#EA580C" />
          <text x="5" y="22" fontSize="11" fontWeight="bold" fill="white" fontFamily="Arial,sans-serif">PPT</text>
        </svg>
      </div>
    )
  }
  // other
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 13H8" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 17H8" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 9H9H8" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

export default function ResourceCard({
  fileName,
  filePath,
  fileType,
  uploadDate,
  uploadTime,
  uploaderName,
  uploaderId,
  onDelete,
  onDownload,
}: ResourceCardProps) {
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

  const handleCardActivate = () => {
    onDownload?.()
  }

  const cardBody = (
    <>
      {/* 預覽區：圖片縮圖 or 檔案類型圖示 */}
      <div className="mb-2">
        {isImageFile(fileType, fileName) && filePath ? (
          <div className="h-24 w-full overflow-hidden rounded-md bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={filePath}
              alt={displayName}
              className="h-full w-full object-cover pointer-events-none"
            />
          </div>
        ) : (
          <FileTypeIcon category={getFileCategory(fileName)} />
        )}
      </div>

      {/* 標題 */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-gray-900 flex-1">
          {displayName}
        </h3>
      </div>

      {/* 日期時間和上傳者 */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-gray-500">
          {uploadDate} {uploadTime}
        </p>
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
    </>
  )

  return (
    <div
      className={`bg-white rounded-lg shadow-sm transition-shadow duration-200 relative border-t border-r border-b border-purple-300 ${
        onDownload ? 'hover:shadow-md' : ''
      }`}
      style={{ width: '240px', borderLeftWidth: '4px', borderLeftColor: '#8A63D2' }}
    >
      {onDelete && (
        <button
          type="button"
          className="absolute right-2 top-2 z-10 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          onClick={() => {
            if (window.confirm('確定要刪除此資源嗎？此操作無法復原。')) {
              onDelete()
            }
          }}
          aria-label="刪除資源"
          title="刪除資源"
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        </button>
      )}

      {onDownload ? (
        <button
          type="button"
          className="block w-full cursor-pointer rounded-lg bg-transparent pl-5 pr-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-0"
          onClick={handleCardActivate}
          title="點擊下載或開啟資源"
          aria-label={`下載或開啟：${displayName}`}
        >
          {cardBody}
        </button>
      ) : (
        <div className="pl-5 pr-4 py-3">{cardBody}</div>
      )}
    </div>
  )
}

