'use client'

import { useState, useEffect } from 'react'

interface Idea {
  id: string
  stage: string
  title: string
  content: string
  createdDate: string
  createdTime: string
  creatorName?: string
  creatorAvatar?: string
  parentId?: string
  position?: { x: number; y: number }
  rotation?: number
  isConvergence?: boolean
  convergedIdeaIds?: string[]
}

interface ConvergenceComment {
  id: string
  content: string
  authorNickname: string  // 改為顯示使用者名稱
  createdAt: string
}

interface Activity {
  id: string
  name: string
}

interface ConvergenceModalProps {
  ideas: Idea[]
  onClose: () => void
  onSubmit: (data: {
    activityId?: string
    stage: string
    selectedIdeaIds: string[]
    convergenceContent: string
    comments: { content: string; author: string; createdAt: string }[]
  }) => void
  communityId?: string
  userId?: string | null
  userAccount?: string
}

export default function ConvergenceModal({ ideas, onClose, onSubmit, communityId, userId, userAccount }: ConvergenceModalProps) {
  // 從所有想法中提取不重複的階段（排除收斂節點）
  const stages = Array.from(new Set(ideas.filter(idea => !idea.isConvergence).map(idea => idea.stage))).filter(Boolean)
  
  const [selectedActivityId, setSelectedActivityId] = useState<string>('')
  const [selectedStage, setSelectedStage] = useState<string>('')
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<Set<string>>(new Set())
  const [convergenceContent, setConvergenceContent] = useState('')
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<ConvergenceComment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)

  // 找出所有已被收斂的節點 IDs
  const convergedIdeaIds = new Set<string>()
  ideas.forEach(idea => {
    if (idea.isConvergence && idea.convergedIdeaIds) {
      idea.convergedIdeaIds.forEach(id => convergedIdeaIds.add(id))
    }
  })

  // 根據選擇的階段篩選想法，排除：
  // 1. 收斂節點本身
  // 2. 已經被收斂過的節點
  const filteredIdeas = selectedStage 
    ? ideas.filter(idea => 
        idea.stage === selectedStage && 
        !idea.isConvergence && 
        !convergedIdeaIds.has(idea.id)
      )
    : []

  // 載入活動列表
  useEffect(() => {
    const loadActivities = async () => {
      if (!communityId) {
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
  }, [communityId])

  // 當階段選擇改變時，載入該階段的留言
  useEffect(() => {
    const loadComments = async () => {
      if (!selectedStage || !communityId) {
        setComments([])
        return
      }

      setIsLoadingComments(true)
      try {
        const response = await fetch(
          `/api/communities/${communityId}/convergence-comments?stage=${encodeURIComponent(selectedStage)}`
        )
        const data = await response.json()

        if (response.ok) {
          // 即使 API 返回成功，也檢查是否有 comments 欄位
          setComments(data.comments || [])
        } else {
          // API 返回錯誤時，僅在開發環境顯示錯誤，不影響用戶體驗
          if (process.env.NODE_ENV === 'development') {
            console.error('載入討論區留言失敗:', data.error)
          }
          setComments([])
        }
      } catch (error) {
        // 網絡錯誤時，僅在開發環境顯示錯誤
        if (process.env.NODE_ENV === 'development') {
          console.error('載入討論區留言錯誤:', error)
        }
        setComments([])
      } finally {
        setIsLoadingComments(false)
      }
    }

    loadComments()
  }, [selectedStage, communityId])

  const handleIdeaToggle = (ideaId: string) => {
    const newSelected = new Set(selectedIdeaIds)
    if (newSelected.has(ideaId)) {
      newSelected.delete(ideaId)
    } else {
      newSelected.add(ideaId)
    }
    setSelectedIdeaIds(newSelected)
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedStage || !communityId || !userId) {
      alert('請先選擇收斂階段並確保已登入')
      return
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/convergence-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: selectedStage,
          content: commentText.trim(),
          authorId: userId,
        }),
      })

      const data = await response.json()

      if (response.ok && data.comment) {
        // 新增留言到列表
        setComments([...comments, data.comment])
        setCommentText('')
      } else {
        alert(data.error || '留言發送失敗')
      }
    } catch (error) {
      console.error('發送留言錯誤:', error)
      alert('留言發送失敗，請稍後再試')
    }
  }

  const handleSubmit = () => {
    if (!selectedStage || selectedIdeaIds.size === 0) {
      alert('請選擇收斂階段並至少勾選一個想法節點')
      return
    }

    onSubmit({
      activityId: selectedActivityId || undefined,
      stage: selectedStage,
      selectedIdeaIds: Array.from(selectedIdeaIds),
      convergenceContent,
      comments: comments.map(c => ({
        content: c.content,
        author: c.authorNickname,
        createdAt: c.createdAt
      }))
    })
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return '剛剛'
    if (diffInMinutes < 60) return `${diffInMinutes}分鐘前`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小時前`
    return `${Math.floor(diffInMinutes / 1440)}天前`
  }

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />

      {/* 模態框主體 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* 標題列 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">想法收斂</h2>
          </div>

          <div className="p-6">
            {/* 活動名稱 */}
            <div className="mb-6">
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

            {/* 收斂階段選擇 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                收斂階段
              </label>
              <select
                value={selectedStage}
                onChange={(e) => {
                  setSelectedStage(e.target.value)
                  setSelectedIdeaIds(new Set()) // 清空已選擇的想法
                  setComments([]) // 清空留言列表，等待新階段的留言載入
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Convergence Stage</option>
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            {/* 想法節點列表 */}
            {selectedStage && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  想法節點
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                  {filteredIdeas.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">此階段沒有想法節點</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredIdeas.map((idea) => (
                        <label
                          key={idea.id}
                          className="flex items-start space-x-3 p-3 hover:bg-white rounded cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIdeaIds.has(idea.id)}
                            onChange={() => handleIdeaToggle(idea.id)}
                            className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{idea.title}</div>
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">{idea.content}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {filteredIdeas.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    已選擇 {selectedIdeaIds.size} / {filteredIdeas.length} 個想法節點
                  </div>
                )}
              </div>
            )}

            {/* 收斂結果輸入 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                收斂結果
              </label>
              <textarea
                value={convergenceContent}
                onChange={(e) => setConvergenceContent(e.target.value)}
                placeholder="請輸入收斂後的內容..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {/* 討論區 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                討論區
              </label>
              
              {/* 載入中狀態 */}
              {isLoadingComments && (
                <div className="mb-3 text-center text-gray-500 py-4">
                  載入留言中...
                </div>
              )}
              
              {/* 已有留言 */}
              {!isLoadingComments && comments.length > 0 && (
                <div className="mb-3 space-y-2 max-h-48 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-2 bg-gray-50 p-3 rounded-lg">
                      <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{comment.authorNickname}</span>
                          <span className="text-xs text-gray-500">{getTimeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 無留言提示 */}
              {!isLoadingComments && comments.length === 0 && selectedStage && (
                <div className="mb-3 text-center text-gray-400 py-4 text-sm">
                  尚無留言
                </div>
              )}

              {/* 新增留言 */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                  placeholder="輸入留言..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  送出
                </button>
              </div>
            </div>

            {/* 底部按鈕 */}
            <div className="flex items-center justify-between pt-4 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                返回
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedStage || selectedIdeaIds.size === 0}
                className="px-8 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg hover:bg-[rgba(138,99,210,1)] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                開始收斂
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

