'use client'

import { useState, useEffect } from 'react'

interface Version {
  id: string
  versionNumber: string // 版本流水編號
  lastModifiedDate: string // 最後修改日期
  lastModifiedTime: string // 最後修改時間
  lastModifiedUser: string // 最後修改的使用者
}

interface VersionControlModalProps {
  isOpen: boolean
  onClose: () => void
  activityId: string
  activityName: string
  onRestore?: (versionId: string) => void
}

/**
 * 版本管控視窗組件
 * 顯示活動的所有版本，包含最後修改日期、使用者、版本流水編號
 * 點擊版本後可以選擇回覆
 */
export default function VersionControlModal({
  isOpen,
  onClose,
  activityId,
  activityName,
  onRestore,
}: VersionControlModalProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentVersionNumber, setCurrentVersionNumber] = useState<string>('')

  // 從 API 讀取版本資料
  useEffect(() => {
    const loadVersions = async () => {
      if (!isOpen || !activityId) {
        setVersions([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/activity-versions/${activityId}`)
        
        if (!response.ok) {
          throw new Error('讀取版本列表失敗')
        }

        const data = await response.json()
        
        // 轉換 API 回應格式為組件需要的格式
        const formattedVersions = data.versions.map((v: any) => ({
          id: v.id,
          versionNumber: `v${v.versionNumber}`,
          lastModifiedDate: v.lastModifiedDate,
          lastModifiedTime: v.lastModifiedTime,
          lastModifiedUser: v.lastModifiedUser,
        }))
        
        setVersions(formattedVersions)
        
        // 從 localStorage 讀取當前版本號，如果沒有則使用最新版本
        const storageKey = `currentVersion_${activityId}`
        const storedVersion = localStorage.getItem(storageKey)
        if (storedVersion) {
          setCurrentVersionNumber(storedVersion)
        } else if (formattedVersions.length > 0) {
          setCurrentVersionNumber(formattedVersions[0].versionNumber)
          localStorage.setItem(storageKey, formattedVersions[0].versionNumber)
        }
      } catch (error) {
        console.error('載入版本資料錯誤:', error)
        setVersions([])
      } finally {
        setIsLoading(false)
      }
    }

    loadVersions()
  }, [isOpen, activityId])

  if (!isOpen) return null

  const handleClose = () => {
    setSelectedVersionId(null)
    onClose()
  }

  const handleVersionClick = (versionId: string) => {
    setSelectedVersionId(selectedVersionId === versionId ? null : versionId)
  }

  const handleRestore = (versionId: string) => {
    if (window.confirm('確定要回復到此版本嗎？')) {
      // 找到對應的版本號
      const version = versions.find(v => v.id === versionId)
      if (version) {
        // 儲存當前版本號到 localStorage
        const storageKey = `currentVersion_${activityId}`
        localStorage.setItem(storageKey, version.versionNumber)
        setCurrentVersionNumber(version.versionNumber)
      }
      
      onRestore?.(versionId)
      handleClose()
    }
  }

  return (
    <>
      {/* 背景遮罩 - 變暗效果 */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleClose}
      />

      {/* 對話框主體 */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className="bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 標題 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              版本管控 - {activityName}
            </h2>
          </div>

          <div className="p-6">
            {/* 載入中狀態 */}
            {isLoading && (
              <div className="text-center py-8 text-gray-400">
                <p>載入版本資料中...</p>
              </div>
            )}

            {/* 版本列表 */}
            {!isLoading && (
              <div className="space-y-3">
                {versions.map((version) => (
                <div
                  key={version.id}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all
                    ${
                      selectedVersionId === version.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                    }
                  `}
                  onClick={() => handleVersionClick(version.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 版本流水編號 */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-semibold text-purple-600">
                          {version.versionNumber}
                        </span>
                        {/* 當前版本標示 */}
                        {currentVersionNumber === version.versionNumber && (
                          <span className="text-sm text-gray-500 font-normal">
                            （這是當前版本）
                          </span>
                        )}
                      </div>

                      {/* 最後修改日期和時間 */}
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">最後修改日期：</span>
                        {version.lastModifiedDate} {version.lastModifiedTime}
                      </div>

                      {/* 最後修改的使用者 */}
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">最後修改的使用者：</span>
                        {version.lastModifiedUser}
                      </div>
                    </div>

                    {/* 選中標記 */}
                    {selectedVersionId === version.id && (
                      <div className="ml-4">
                        <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 3L4.5 8.5L2 6"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 回覆按鈕 - 只在選中時顯示 */}
                  {selectedVersionId === version.id && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRestore(version.id)
                        }}
                        className="w-full px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                      >
                        回復到此版本
                      </button>
                    </div>
                  )}
                </div>
                ))}
              </div>
            )}

            {/* 如果沒有版本 */}
            {!isLoading && versions.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>目前沒有版本記錄</p>
              </div>
            )}

            {/* 底部按鈕 */}
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


