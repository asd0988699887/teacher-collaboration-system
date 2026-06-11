'use client'

import { useState, useEffect } from 'react'
import { activityDisplayLabel } from '@/lib/activityDisplay'

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
  authorId: string  // 使用者ID，用於生成頭像顏色
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
  /** 是否為社群管理員：僅管理員可選取節點、開始收斂、編輯收斂結果 */
  isAdmin?: boolean
}

function FieldHint({ text, wide }: { text: string; wide?: boolean }) {
  return (
    <span className="group relative ml-1 inline-flex align-middle">
      <span
        tabIndex={0}
        role="button"
        aria-label={text}
        className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full text-gray-400 outline-none hover:text-purple-500 focus:text-purple-500"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.5 9.5a2.5 2.5 0 0 1 4.2 1.8c0 1.5-2.2 2-2.2 3.7V15" strokeLinecap="round" />
          <circle cx="12" cy="18" r="0.75" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-[calc(100%+6px)] top-1/2 z-[110] hidden -translate-y-1/2 rounded-md border border-gray-200 bg-white px-2.5 py-2 text-left text-xs font-normal leading-relaxed text-gray-600 shadow-md group-hover:block group-focus-within:block ${
          wide ? 'w-56' : 'w-52'
        }`}
      >
        {text}
      </span>
    </span>
  )
}

export default function ConvergenceModal({ ideas, onClose, onSubmit, communityId, userId, userAccount, isAdmin = false }: ConvergenceModalProps) {
  // 定義一組色調差異明顯的顏色（用於區分不同使用者，與社群管理保持一致）
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

  // 獲取使用者名稱的首字作為頭像
  const getInitial = (name?: string) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

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
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  // 計算每個 idea 被收斂的次數（每個節點僅能收斂一次，已收斂者不可再選）
  const convergedCountMap = new Map<string, number>()
  ideas.forEach(idea => {
    if (idea.isConvergence && idea.convergedIdeaIds) {
      idea.convergedIdeaIds.forEach(id => {
        convergedCountMap.set(id, (convergedCountMap.get(id) ?? 0) + 1)
      })
    }
  })

  // 根據選擇的階段篩選想法，排除收斂節點本身
  const filteredIdeas = selectedStage 
    ? ideas.filter(idea => 
        idea.stage === selectedStage && 
        !idea.isConvergence
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

  // 當階段選擇改變時，載入管理員先前儲存的草稿（勾選節點與收斂結果文字）
  useEffect(() => {
    const loadDraft = async () => {
      if (!selectedStage || !communityId) return

      try {
        const response = await fetch(
          `/api/communities/${communityId}/convergence-draft?stage=${encodeURIComponent(selectedStage)}`
        )
        const data = await response.json()

        if (response.ok) {
          const ids: string[] = Array.isArray(data.selectedIdeaIds) ? data.selectedIdeaIds : []
          setSelectedIdeaIds(new Set(ids))
          setConvergenceContent(typeof data.convergenceContent === 'string' ? data.convergenceContent : '')
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('載入收斂草稿錯誤:', error)
        }
      }
    }

    loadDraft()
  }, [selectedStage, communityId])

  const handleIdeaToggle = (ideaId: string) => {
    // 非管理員不可選取；已被收斂過的節點不可再次選取
    if (!isAdmin) return
    if ((convergedCountMap.get(ideaId) ?? 0) > 0) return

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
        if (data.notificationCreated) {
          console.log('✅ 留言發送成功，通知已創建')
        } else {
          console.warn('⚠️ 留言發送成功，但通知創建可能失敗（請查看伺服器端日誌）')
        }
      } else {
        console.error('❌ 留言發送失敗:', data.error)
        alert(data.error || '留言發送失敗')
      }
    } catch (error) {
      console.error('發送留言錯誤:', error)
      alert('留言發送失敗，請稍後再試')
    }
  }

  const handleSaveDraft = async () => {
    if (!isAdmin) {
      alert('只有社群管理員可以儲存收斂內容')
      return
    }
    if (!selectedStage) {
      alert('請先選擇收斂階段')
      return
    }
    if (!communityId) {
      alert('社群資訊錯誤')
      return
    }

    setIsSavingDraft(true)
    try {
      const response = await fetch(`/api/communities/${communityId}/convergence-draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: selectedStage,
          selectedIdeaIds: Array.from(selectedIdeaIds),
          convergenceContent,
          userId,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '儲存失敗')
      }
      alert('已儲存，其他成員進入後即可看到您勾選的節點與收斂結果並參與討論。')
    } catch (error: any) {
      console.error('儲存收斂草稿錯誤:', error)
      alert(error.message || '儲存失敗，請稍後再試')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleSubmit = () => {
    if (!isAdmin) {
      alert('只有社群管理員可以進行想法收斂')
      return
    }
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
      <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-2 sm:p-4 pointer-events-none overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col pointer-events-auto my-2 sm:my-0" style={{
          maxHeight: 'calc(100vh - 1rem - 80px)',
          height: 'auto',
          minHeight: 'min(calc(100vh - 1rem - 80px), 500px)',
        }}>
          {/* 標題列 */}
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-800">想法收斂</h2>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {/* 非管理員提示：僅可瀏覽與留言 */}
            {!isAdmin && (
              <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
                僅社群管理員可進行想法收斂與修改收斂結果，您可以瀏覽收斂內容並在討論區留言。
              </div>
            )}

            {/* 收斂階段選擇 */}
            <div className="mb-6">
              <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
                收斂階段
                <FieldHint text="收斂階段用於選擇要整理的想法類別，系統會篩選此類別底下的想法節點。" />
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
                      {filteredIdeas.map((idea) => {
                        const timesConverged = convergedCountMap.get(idea.id) ?? 0
                        const isConverged = timesConverged > 0
                        // 非管理員或已收斂節點皆不可勾選
                        const isDisabled = !isAdmin || isConverged
                        return (
                        <label
                          key={idea.id}
                          className={`flex items-start space-x-3 p-3 rounded transition-colors ${
                            isDisabled ? 'cursor-not-allowed opacity-70' : 'hover:bg-white cursor-pointer'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIdeaIds.has(idea.id)}
                            disabled={isDisabled}
                            onChange={() => handleIdeaToggle(idea.id)}
                            className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500 disabled:cursor-not-allowed"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-900">{idea.title}</span>
                              {isConverged && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-purple-100 text-purple-700 shrink-0">
                                  已收斂
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">{idea.content}</div>
                          </div>
                        </label>
                        )
                      })}
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
              <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
                收斂結果
                <FieldHint
                  wide
                  text="收斂結果是依據成員共同討論出的共識進行總結，可作為後續教案設計或任務執行的參考。"
                />
              </label>
              <textarea
                value={convergenceContent}
                onChange={(e) => setConvergenceContent(e.target.value)}
                readOnly={!isAdmin}
                placeholder={isAdmin ? '請輸入收斂後的內容...' : '尚無收斂結果內容'}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                  !isAdmin ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                }`}
                rows={4}
              />
            </div>

            {/* 討論區 */}
            <div className="mb-6">
              <label className="mb-2 flex items-center text-sm font-medium text-gray-700">
                討論區
                <FieldHint text="討論區是成員針對收斂內容進行補充、確認或討論的地方。" />
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
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold"
                        style={{ backgroundColor: getUserColor(comment.authorId) }}
                      >
                        {getInitial(comment.authorNickname)}
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

          </div>

          {/* 底部按鈕 - 固定在底部 */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              返回
            </button>
            {isAdmin && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={!selectedStage || isSavingDraft}
                  className="px-8 py-2 border border-[rgba(138,99,210,0.9)] text-[rgba(138,99,210,1)] rounded-lg hover:bg-purple-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSavingDraft ? '儲存中...' : '儲存'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedStage || selectedIdeaIds.size === 0}
                  className="px-8 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg hover:bg-[rgba(138,99,210,1)] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  開始收斂
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}