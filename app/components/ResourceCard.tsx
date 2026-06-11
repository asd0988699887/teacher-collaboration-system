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
  /** 個人資源：分享至共備活動 */
  onShare?: () => void
  shareLabel?: string
  shareTitle?: string
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

// 取得副檔名（不含點）
function getFileExtension(fileName: string): string {
  const match = fileName.match(/\.([^.]+)$/)
  return match ? match[1].toLowerCase() : ''
}

// 取得顯示用副檔名標籤
function getFileExtensionLabel(fileName: string, fileType?: string): string {
  const ext = getFileExtension(fileName)
  if (ext === 'jpeg') return 'JPG'
  if (ext) return ext.toUpperCase()
  if (fileType === 'text/plain') return 'TXT'
  if (fileType?.startsWith('image/')) {
    const sub = fileType.split('/')[1]?.toLowerCase()
    if (sub === 'jpeg') return 'JPG'
    if (sub) return sub.toUpperCase()
  }
  return ''
}

// 根據檔名副檔名取得檔案類別
function getFileCategory(fileName: string): 'pdf' | 'word' | 'excel' | 'ppt' | 'txt' | 'other' {
  const ext = getFileExtension(fileName)
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (['xls', 'xlsx'].includes(ext)) return 'excel'
  if (['ppt', 'pptx'].includes(ext)) return 'ppt'
  if (ext === 'txt') return 'txt'
  return 'other'
}

function ExtensionBadge({ label, bgClass, fill }: { label: string; bgClass: string; fill: string }) {
  const display = label.length > 4 ? label.slice(0, 4) : label
  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgClass}`}>
      <svg viewBox="0 0 32 32" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="6" fill={fill} />
        <text x="16" y="22" fontSize={display.length > 3 ? 9 : 11} fontWeight="bold" fill="white" fontFamily="Arial,sans-serif" textAnchor="middle">
          {display}
        </text>
      </svg>
    </div>
  )
}

// 各類型圖示（SVG inline）
function FileTypeIcon({
  category,
  extensionLabel,
}: {
  category: ReturnType<typeof getFileCategory>
  extensionLabel?: string
}) {
  if (category === 'pdf') {
    return <ExtensionBadge label="PDF" bgClass="bg-red-100" fill="#EF4444" />
  }
  if (category === 'word') {
    return <ExtensionBadge label="DOC" bgClass="bg-blue-100" fill="#2563EB" />
  }
  if (category === 'excel') {
    return <ExtensionBadge label="XLS" bgClass="bg-green-100" fill="#16A34A" />
  }
  if (category === 'ppt') {
    return <ExtensionBadge label="PPT" bgClass="bg-orange-100" fill="#EA580C" />
  }
  if (category === 'txt') {
    return <ExtensionBadge label="TXT" bgClass="bg-gray-100" fill="#6B7280" />
  }
  if (extensionLabel) {
    return <ExtensionBadge label={extensionLabel} bgClass="bg-gray-100" fill="#6B7280" />
  }
  // other without known extension
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
  onShare,
  shareLabel = '分享至共備活動',
  shareTitle = '分享至共備活動',
}: ResourceCardProps) {
  const extensionLabel = getFileExtensionLabel(fileName, fileType)
  const fileCategory = getFileCategory(fileName)

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
          <div className="relative h-24 w-full overflow-hidden rounded-md bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={filePath}
              alt={fileName}
              className="h-full w-full object-cover pointer-events-none"
            />
            {extensionLabel && (
              <span className="absolute bottom-1 right-1 rounded px-1 py-0.5 text-[9px] font-bold leading-none text-white bg-black/60">
                {extensionLabel}
              </span>
            )}
          </div>
        ) : (
          <FileTypeIcon category={fileCategory} extensionLabel={extensionLabel || undefined} />
        )}
      </div>

      {/* 標題 */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-gray-900 flex-1 break-all">
          {fileName}
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
      {(onShare || onDelete) && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5">
          {onShare && (
            <button
              type="button"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              onClick={(e) => {
                e.stopPropagation()
                onShare()
              }}
              aria-label={shareLabel}
              title={shareTitle}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              onClick={(e) => {
                e.stopPropagation()
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
        </div>
      )}

      {onDownload ? (
        <button
          type="button"
          className="block w-full cursor-pointer rounded-lg bg-transparent pl-5 pr-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-0"
          onClick={handleCardActivate}
          title="點擊下載或開啟資源"
          aria-label={`下載或開啟：${fileName}`}
        >
          {cardBody}
        </button>
      ) : (
        <div className="pl-5 pr-4 py-3">{cardBody}</div>
      )}
    </div>
  )
}

