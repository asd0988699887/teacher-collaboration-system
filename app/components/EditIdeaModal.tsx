'use client'

import { useState, useEffect, useRef } from 'react'

interface Activity {
  id: string
  name: string
}

interface EditIdeaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (ideaData: {
    activityId?: string
    stage: string
    title: string
    content: string
  }) => void
  onDelete: () => void
  onExtend: () => void
  initialData: {
    activityId?: string
    stage: string
    title: string
    content: string
  }
  isConvergence?: boolean
  communityId?: string
}

/**
 * 編輯想法模態框組件
 */
export default function EditIdeaModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onExtend,
  initialData,
  isConvergence,
  communityId,
}: EditIdeaModalProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('')
  const [stage, setStage] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)

  // 載入活動列表
  useEffect(() => {
    const loadActivities = async () => {
      if (!communityId || !isOpen) {
        setActivities([])
        return
      }

      setIsLoadingActivities(true)
      try {
        const response = await fetch(`/api/communities/${communityId}/activities`)
        if (response.ok) {
          const data = await response.json()
          setActivities(Array.isArray(data) ? data : [])
        } else {
          console.error('載入活動列表失敗')
          setActivities([])
        }
      } catch (error) {
        console.error('載入活動列表錯誤:', error)
        setActivities([])
      } finally {
        setIsLoadingActivities(false)
      }
    }

    loadActivities()
  }, [communityId, isOpen])

  // 當模態框打開時，載入初始資料
  useEffect(() => {
    if (isOpen) {
      setSelectedActivityId(initialData.activityId || '')
      setStage(initialData.stage)
      setTitle(initialData.title)
      setContent(initialData.content)
    }
  }, [isOpen, initialData])

  // 處理儲存
  const handleSave = () => {
    onSave({
      activityId: selectedActivityId || undefined,
      stage,
      title,
      content,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />
      {/* 模態框內容 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 標題 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {isConvergence ? '收斂內容' : '檢視節點'}
            </h2>
          </div>

          {/* 表單內容 */}
          <div className="px-6 py-4">
            <div className="space-y-6">
              {/* 活動名稱 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活動名稱
                </label>
                <select
                  value={selectedActivityId}
                  onChange={(e) => setSelectedActivityId(e.target.value)}
                  disabled={activities.length === 0 || isLoadingActivities}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                >
                  <option value="">
                    {isLoadingActivities 
                      ? '載入中...' 
                      : activities.length === 0 
                        ? '目前沒有共備活動' 
                        : '請選擇活動名稱（可選）'}
                  </option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 階段 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  階段
                </label>
                <input
                  type="text"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="請輸入階段"
                />
              </div>

              {/* 標題 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  標題
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="請輸入標題"
                />
              </div>

              {/* 內容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  內容
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={8}
                  placeholder="請輸入內容"
                />
              </div>
            </div>
          </div>

          {/* 底部按鈕 */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            {/* 左側：刪除和延伸想法 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                刪除
              </button>
              {/* 只有非收斂節點才顯示延伸想法按鈕 */}
              {!isConvergence && (
                <button
                  type="button"
                  onClick={onExtend}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  延伸想法
                </button>
              )}
            </div>

            {/* 右側：取消和儲存 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 bg-[rgba(138,99,210,0.9)] hover:bg-[rgba(138,99,210,1)] text-white rounded-lg font-medium transition-colors"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

