'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ResourceCard from './ResourceCard'
import SharePersonalResourceModal from './SharePersonalResourceModal'

interface PersonalResource {
  id: string
  fileName: string
  filePath?: string
  fileType?: string
  uploadDate: string
  uploadTime: string
  uploaderName?: string
  uploaderId?: string
}

interface ShareCommunityOption {
  id: string
  name: string
}

interface PersonalResourcesSectionProps {
  userId: string
  /** 進行中的共備活動（可分享目標） */
  communities: ShareCommunityOption[]
}

/**
 * 個人資源區（版面同社群資源，卡片多分享按鈕）
 */
export default function PersonalResourcesSection({
  userId,
  communities,
}: PersonalResourcesSectionProps) {
  const [resources, setResources] = useState<PersonalResource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [shareTarget, setShareTarget] = useState<PersonalResource | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [isPersonalResourceHelperOpen, setIsPersonalResourceHelperOpen] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadResources = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}/personal-resources`)
      const data = await response.json()
      if (response.ok) {
        setResources(data)
      } else {
        console.error('載入個人資源失敗:', data.error)
      }
    } catch (error) {
      console.error('載入個人資源錯誤:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const handleAddFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('uploadedBy', userId)

      const response = await fetch(`/api/users/${userId}/personal-resources`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        const errorMessage = data.details
          ? `${data.error}: ${data.details}`
          : data.error || '上傳資源失敗'
        throw new Error(errorMessage)
      }

      await loadResources()
      alert('檔案上傳成功！')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '上傳檔案失敗'
      alert(message)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    try {
      const response = await fetch(
        `/api/users/${userId}/personal-resources?resourceId=${resourceId}`,
        { method: 'DELETE' }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '刪除資源失敗')
      }
      await loadResources()
      alert('資源已刪除')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '刪除資源失敗'
      alert(message)
    }
  }

  const handleDownloadResource = async (resourceId: string) => {
    try {
      const response = await fetch(
        `/api/users/${userId}/personal-resources/${resourceId}/download`
      )
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '下載資源失敗')
      }

      const contentDisposition = response.headers.get('Content-Disposition')
      let fileName = 'download'
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?$/i)
        if (fileNameMatch) {
          fileName = decodeURIComponent(fileNameMatch[1])
        }
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '下載資源失敗'
      alert(message)
    }
  }

  const handleShareToCommunity = async (communityId: string) => {
    if (!shareTarget) return
    setIsSharing(true)
    try {
      const response = await fetch(
        `/api/users/${userId}/personal-resources/${shareTarget.id}/share`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ communityId }),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '分享失敗')
      }
      setShareTarget(null)
      alert('已成功分享至共備活動的社群資源！')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '分享失敗'
      alert(message)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="pt-6 md:pt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#6D28D9]">個人資源</h1>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="*/*"
          />
          <button
            type="button"
            onClick={handleAddFileClick}
            className="px-6 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
          >
            新增檔案
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm min-h-[400px] p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <p className="text-lg">載入中...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[320px] text-gray-400">
            <p className="text-lg">目前沒有資源</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                fileName={resource.fileName}
                filePath={resource.filePath}
                fileType={resource.fileType}
                uploadDate={resource.uploadDate}
                uploadTime={resource.uploadTime}
                uploaderName={resource.uploaderName}
                uploaderId={resource.uploaderId}
                onShare={() => setShareTarget(resource)}
                onDelete={() => handleDeleteResource(resource.id)}
                onDownload={() => handleDownloadResource(resource.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 右下角操作小幫手 */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {isPersonalResourceHelperOpen && (
          <div className="mb-3 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                <span className="text-purple-600">操作小幫手</span>
              </h4>
              <button
                onClick={() => setIsPersonalResourceHelperOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                title="關閉"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <ul className="space-y-2.5 text-sm leading-relaxed text-gray-600">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                <span>點選右上角「<span className="font-medium text-gray-800">+ 新增檔案</span>」按鈕可上傳檔案</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                <span>點擊<span className="font-medium text-gray-800">檔案卡片</span>可以下載檔案</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                <span>
                  點擊
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-0.5 inline align-[-2px] shrink-0 text-gray-400" aria-hidden>
                    <path d="M2 4H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5.33333 4V2.66667C5.33333 2 6 1.33334 6.66667 1.33334H9.33333C10 1.33334 10.6667 2 10.6667 2.66667V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  可以刪除檔案
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                <span className="flex flex-wrap items-center gap-1">
                  點擊
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline shrink-0 text-gray-400" aria-hidden>
                    <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  可分享至進行中活動的「<span className="font-medium text-gray-800">活動資源</span>」；活動資源也可分享回個人資源
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                <span>可上傳的檔案格式：圖片（jpg、png、gif、webp、svg）及文件（pdf、doc、docx、xls、xlsx、ppt、pptx、txt），單檔最大 10MB</span>
              </li>
            </ul>
          </div>
        )}
        <div className="flex flex-col items-center">
          {!isPersonalResourceHelperOpen && (
            <span className="mb-1.5 text-[13px] leading-none font-semibold text-[rgba(138,99,210,1)] whitespace-nowrap">
              需要幫助？
            </span>
          )}
          <button
            onClick={() => setIsPersonalResourceHelperOpen((prev) => !prev)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(138,99,210,0.9)] text-white shadow-lg transition-colors hover:bg-[rgba(138,99,210,1)]"
            title="操作小幫手"
            aria-label="操作小幫手"
          >
            {isPersonalResourceHelperOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <SharePersonalResourceModal
        isOpen={!!shareTarget}
        fileName={shareTarget?.fileName ?? ''}
        communities={communities}
        isSubmitting={isSharing}
        onClose={() => !isSharing && setShareTarget(null)}
        onShare={handleShareToCommunity}
      />
    </div>
  )
}
