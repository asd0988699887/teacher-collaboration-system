'use client'

import { useState, useEffect } from 'react'
import Header from './Header'
import CommunityButton from './CommunityButton'
import SearchBar from './SearchBar'
import JoinCommunityModal from './JoinCommunityModal'
import CreateCommunityModal from './CreateCommunityModal'
import CommunityCard from './CommunityCard'
import CommunityDetail from './CommunityDetail'
import CommunityOnboardingModal from './CommunityOnboardingModal'
import { type HistoryActivityItem } from './HistoryActivitiesSection'
import UsefulLinksSection from './UsefulLinksSection'
import PersonalResourcesSection from './PersonalResourcesSection'

type OverviewPanel = 'list' | 'links' | 'personal-resources'
import {
  hasSeenCommunityOnboarding,
  markCommunityOnboardingSeen,
} from '@/lib/communityOnboardingStorage'
import {
  computeKanbanTaskStatusSummary,
  type TaskStatusSummary,
} from '@/lib/taskDeadline'

interface Community {
  id: string
  name: string
  description: string
  inviteCode: string
  memberCount: number
  createdDate: string
}

interface CommunityOverviewProps {
  onNavigateToLogin?: () => void
}

/**
 * 進行中活動列表頁面組件
 * 根據 Figma 設計 (nodeId: 1:2) 實現
 */
export default function CommunityOverview({ onNavigateToLogin }: CommunityOverviewProps = {}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [communities, setCommunities] = useState<Community[]>([])
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [selectedCommunityReadOnly, setSelectedCommunityReadOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [showCommunityOnboarding, setShowCommunityOnboarding] = useState(false)
  const [showOnboardingReopenHint, setShowOnboardingReopenHint] = useState(false)
  const [communitiesLoaded, setCommunitiesLoaded] = useState(false)
  const [historyActivities, setHistoryActivities] = useState<HistoryActivityItem[]>([])
  const [overviewPanel, setOverviewPanel] = useState<OverviewPanel>('list')
  const [historyEditTarget, setHistoryEditTarget] = useState<Community | null>(null)
  const [historyLessonEditMode, setHistoryLessonEditMode] = useState(false)
  const [taskStatusByCommunityId, setTaskStatusByCommunityId] = useState<
    Record<string, TaskStatusSummary>
  >({})

  // 從 localStorage 載入使用者ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUserId(userData.id || userData.userId || null)
        } catch (e) {
          console.error('解析使用者資料失敗:', e)
        }
      }
    }
  }, [])

  // 登入後進入列表頁：活動列表載入完成且確實沒有任何活動時，才自動顯示引導
  useEffect(() => {
    if (!userId || !communitiesLoaded || overviewPanel !== 'list') return
    if (communities.length === 0 && !hasSeenCommunityOnboarding(userId)) {
      setShowCommunityOnboarding(true)
    }
  }, [userId, communities, communitiesLoaded, overviewPanel])

  useEffect(() => {
    if (!showOnboardingReopenHint) return
    const timer = window.setTimeout(() => setShowOnboardingReopenHint(false), 2800)
    return () => window.clearTimeout(timer)
  }, [showOnboardingReopenHint])

  // 載入社群列表
  useEffect(() => {
    if (userId) {
      setCommunitiesLoaded(false)
      loadCommunities()
    } else {
      setCommunities([])
      setCommunitiesLoaded(false)
    }
  }, [userId])

  const loadCommunities = async () => {
    if (!userId) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/communities?userId=${userId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '讀取社群列表失敗')
      }

      setCommunities(data)
      await Promise.all([loadHistoryActivities(data as Community[]), loadTaskStatuses(data as Community[])])
    } catch (err: any) {
      setError(err.message || '讀取社群列表失敗')
      console.error('載入社群列表錯誤:', err)
    } finally {
      setIsLoading(false)
      setCommunitiesLoaded(true)
    }
  }

  const loadHistoryActivities = async (communityList: Community[]) => {
    if (!userId || communityList.length === 0) {
      setHistoryActivities([])
      return
    }

    const completed: HistoryActivityItem[] = []

    await Promise.all(
      communityList.map(async (community) => {
        try {
          const response = await fetch(`/api/communities/${community.id}/activities`)
          const data = await response.json()
          if (!response.ok || !Array.isArray(data)) return

          for (const act of data) {
            if (!act.coPrepCompleted) continue
            completed.push({
              id: act.id,
              name: act.name,
              introduction: act.introduction || '',
              createdDate: act.createdDate,
              createdTime: act.createdTime,
              creatorName: act.creatorName,
              designer: act.designer,
              lessonPlanTitle: act.lessonPlanTitle,
              courseDomain: act.courseDomain,
              unitName: act.unitName,
              implementationGrade: act.implementationGrade,
              schoolLevel: act.schoolLevel,
              lastModifiedDate: act.lastModifiedDate,
              lastModifiedTime: act.lastModifiedTime,
              communityId: community.id,
              communityName: community.name,
            })
          }
        } catch (e) {
          console.error('載入歷史活動錯誤:', community.id, e)
        }
      })
    )

    completed.sort((a, b) => {
      const ad = `${a.lastModifiedDate || a.createdDate} ${a.lastModifiedTime || a.createdTime}`
      const bd = `${b.lastModifiedDate || b.createdDate} ${b.lastModifiedTime || b.createdTime}`
      return bd.localeCompare(ad)
    })

    setHistoryActivities(completed)
  }

  const loadTaskStatuses = async (communityList: Community[]) => {
    if (!userId || communityList.length === 0) {
      setTaskStatusByCommunityId({})
      return
    }

    const entries = await Promise.all(
      communityList.map(async (community) => {
        try {
          const response = await fetch(`/api/communities/${community.id}/kanban`)
          const data = await response.json()
          if (!response.ok || !Array.isArray(data)) {
            return [community.id, computeKanbanTaskStatusSummary([], userId)] as const
          }
          const allTasks = data.flatMap(
            (list: { tasks?: Array<{ status?: string; endDate?: string; assignees?: string[] }> }) =>
              list.tasks || []
          )
          return [community.id, computeKanbanTaskStatusSummary(allTasks, userId)] as const
        } catch (e) {
          console.error('載入任務狀態錯誤:', community.id, e)
          return [community.id, computeKanbanTaskStatusSummary([], userId)] as const
        }
      })
    )

    const next: Record<string, TaskStatusSummary> = {}
    for (const [id, summary] of entries) {
      next[id] = summary
    }
    setTaskStatusByCommunityId(next)
  }

  const emptyTaskStatus: TaskStatusSummary = {
    deadlineReminder: 0,
    myIncomplete: 0,
    incomplete: 0,
    completed: 0,
  }

  const handleNewCommunity = () => {
    setEditingCommunity(null) // 清除編輯狀態
    setIsCreateModalOpen(true)
  }

  const handleJoinCommunity = () => {
    setIsJoinModalOpen(true)
  }

  const handleCloseJoinModal = () => {
    setIsJoinModalOpen(false)
  }

  const handleJoinWithCode = async (inviteCode: string) => {
    if (!userId) {
      if (window.confirm('請先登入')) {
        onNavigateToLogin?.()
      }
      throw new Error('請先登入')
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/communities/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode,
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '加入社群失敗')
      }

      // 重新載入社群列表
      await loadCommunities()
      setIsJoinModalOpen(false)
      alert('成功加入活動！')
    } catch (err: any) {
      setError(err.message || '加入活動失敗')
      alert(err.message || '加入活動失敗')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
    setEditingCommunity(null) // 清除編輯狀態
  }

  const handleCreateCommunity = async (
    communityName: string,
    inviteCode: string,
    description: string
  ) => {
    if (!userId) {
      if (window.confirm('請先登入')) {
        onNavigateToLogin?.()
      }
      return
    }

    setIsLoading(true)
    setError('')

    try {
      if (editingCommunity) {
        // 編輯模式：更新現有社群
        const response = await fetch(`/api/communities/${editingCommunity.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: communityName,
            description: description,
            inviteCode: inviteCode,
            userId,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '更新社群失敗')
        }

        // 重新載入社群列表
        await loadCommunities()
        alert('修改活動成功！')
      } else {
        // 新增模式：創建新社群
        const response = await fetch('/api/communities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: communityName,
            description: description,
            inviteCode: inviteCode,
            creatorId: userId,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '建立社群失敗')
        }

        // 重新載入社群列表
        await loadCommunities()
        alert('建立活動成功！')
      }

      setIsCreateModalOpen(false)
      setEditingCommunity(null)
    } catch (err: any) {
      setError(err.message || '操作失敗')
      alert(err.message || '操作失敗')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // 已結束共備的社群（有任一活動 coPrepCompleted）→ 視為歷史活動
  const historyCommunityIds = new Set(historyActivities.map((act) => act.communityId))

  const nameMatchesSearch = (community: Community) => {
    if (!searchQuery.trim()) return true
    return community.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  }

  // 進行中活動（上方）：排除已搬到歷史的社群
  const filteredCommunities = communities.filter(
    (community) => !historyCommunityIds.has(community.id) && nameMatchesSearch(community)
  )

  // 歷史活動（下方）：已結束共備的社群，沿用同一張社群卡
  const filteredHistoryCommunities = communities.filter(
    (community) => historyCommunityIds.has(community.id) && nameMatchesSearch(community)
  )

  const handleEditCommunity = (communityId: string) => {
    const community = communities.find((c) => c.id === communityId)
    if (community) {
      setEditingCommunity(community)
      setIsCreateModalOpen(true)
    }
  }

  const handleDeleteCommunity = async (communityId: string) => {
    if (!userId) {
      if (window.confirm('請先登入')) {
        onNavigateToLogin?.()
      }
      return
    }

    if (!confirm('確定要刪除此活動嗎？此操作無法復原。')) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/communities/${communityId}?userId=${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '刪除社群失敗')
      }

      // 重新載入社群列表
      await loadCommunities()
      alert('活動已刪除')
    } catch (err: any) {
      setError(err.message || '刪除活動失敗')
      alert(err.message || '刪除活動失敗')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommunityClick = (community: Community) => {
    setSelectedCommunityReadOnly(false)
    setHistoryLessonEditMode(false)
    setSelectedCommunity(community)
  }

  const handleViewHistoryCommunity = (community: Community) => {
    setSelectedCommunityReadOnly(true)
    setHistoryLessonEditMode(false)
    setSelectedCommunity(community)
  }

  const handleEnterHistoryLessonEditMode = (community: Community) => {
    setSelectedCommunityReadOnly(true)
    setHistoryLessonEditMode(true)
    setSelectedCommunity(community)
    setHistoryEditTarget(null)
  }

  const handleBackToOverview = () => {
    setSelectedCommunity(null)
    setSelectedCommunityReadOnly(false)
    setHistoryLessonEditMode(false)
    void loadCommunities()
  }

  // 如果選中了社群，顯示社群詳情頁面
  if (selectedCommunity) {
    return (
      <CommunityDetail
        key={selectedCommunity.id}
        communityName={selectedCommunity.name}
        communityId={selectedCommunity.id}
        readOnly={selectedCommunityReadOnly}
        historyLessonEditMode={historyLessonEditMode}
        onBack={handleBackToOverview}
      />
    )
  }

  // 否則顯示進行中活動列表頁
  return (
    <div className="w-full min-h-screen bg-[#F5F3FA]">
      {/* 畫布 */}
      <div className="w-full min-h-screen flex flex-col">
        {/* Header */}
        <Header
          brandTitle="共備活動"
          showOverviewNav
          usefulLinksActive={overviewPanel === 'links'}
          personalResourcesActive={overviewPanel === 'personal-resources'}
          onBrandClick={() => setOverviewPanel('list')}
          onUsefulLinksToggle={() =>
            setOverviewPanel((prev) => (prev === 'links' ? 'list' : 'links'))
          }
          onPersonalResourcesToggle={() =>
            setOverviewPanel((prev) =>
              prev === 'personal-resources' ? 'list' : 'personal-resources'
            )
          }
        />

        {/* 主要內容區 */}
        <div className="flex-1 bg-[#FEFBFF] px-4 sm:px-8 md:px-16 pb-8 md:pb-16">
          {overviewPanel === 'links' ? (
            <div className="pt-6 md:pt-8">
              <UsefulLinksSection />
            </div>
          ) : overviewPanel === 'personal-resources' && userId ? (
            <PersonalResourcesSection
              userId={userId}
              communities={communities.map((c) => ({ id: c.id, name: c.name }))}
            />
          ) : overviewPanel === 'personal-resources' ? (
            <div className="pt-6 md:pt-8 text-center text-gray-500">請先登入以使用個人資源</div>
          ) : (
          <>
          {/* 標題與操作按鈕列 */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-4 mb-6 md:mb-8 pt-6 md:pt-8">
            {/* 標題與說明（說明在標題右側，窄螢幕時可換行） */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 shrink-0 md:min-w-0 md:max-w-[min(100%,26rem)] lg:max-w-[min(100%,32rem)]">
              <h1 className="text-xl md:text-[24px] font-bold text-[#6D28D9] leading-[32px] md:leading-[40px] shrink-0">
                進行中活動
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed sm:border-l sm:border-gray-200 sm:pl-4">
                您可以建立備課活動，邀請其他老師們來共同備課
              </p>
            </div>

            {/* 搜尋框 - 佔滿中間剩餘寬度並靠右，與右側按鈕相鄰 */}
            <div className="flex-1 flex justify-end px-0 md:px-2 order-3 md:order-2 min-w-0">
              <SearchBar
                placeholder="搜尋活動名稱"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {/* 右側按鈕群組 */}
            <div className="flex items-center gap-2 md:gap-4 order-2 md:order-3">
              <div className="relative">
                <button
                  type="button"
                  data-community-onboarding-reopen
                  onClick={() => setShowCommunityOnboarding(true)}
                  className={`px-3 py-2 text-sm font-medium text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors whitespace-nowrap ${
                    showOnboardingReopenHint ? 'community-onboarding-reopen-highlight' : ''
                  }`}
                  title="操作說明"
                >
                  新手導覽
                </button>
                {showOnboardingReopenHint && (
                  <p
                    className="community-onboarding-reopen-tooltip absolute right-0 top-full mt-2 z-50 w-max max-w-[14rem] rounded-lg border border-purple-200 bg-white px-3 py-2 text-xs leading-relaxed text-purple-900 shadow-lg"
                    role="status"
                  >
                    之後可從這裡重新查看導覽
                  </p>
                )}
              </div>
              {/* 新增活動按鈕 */}
              <CommunityButton
                label="發起活動"
                onClick={handleNewCommunity}
              />

              {/* 加入活動按鈕 */}
              <CommunityButton
                label="加入活動"
                onClick={handleJoinCommunity}
              />
            </div>
          </div>

          {/* 社群列表區域 */}
          {communities.length === 0 ? (
            /* 空白狀態 */
            <div className="w-full h-full bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p className="text-lg">目前沒有活動</p>
              </div>
            </div>
          ) : filteredCommunities.length === 0 ? (
            /* 進行中活動為空：區分「搜尋無結果」與「全部已結束共備」 */
            <div className="w-full h-full bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p className="text-lg">
                  {searchQuery.trim()
                    ? `找不到符合「${searchQuery}」的活動`
                    : '目前沒有進行中活動'}
                </p>
              </div>
            </div>
          ) : (
            /* 社群卡片網格 */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  name={community.name}
                  description={community.description}
                  memberCount={community.memberCount}
                  createdDate={community.createdDate}
                  taskStatus={taskStatusByCommunityId[community.id] ?? emptyTaskStatus}
                  onClick={() => handleCommunityClick(community)}
                  onEdit={() => handleEditCommunity(community.id)}
                  onDelete={() => handleDeleteCommunity(community.id)}
                />
              ))}
            </div>
          )}

          {/* 歷史活動：已結束共備的社群，沿用同一張社群卡，改為「查看活動」 */}
          <section className="mt-10 md:mt-12">
            <h2 className="text-xl md:text-[24px] font-bold text-[#6D28D9] leading-[32px] md:leading-[40px] mb-4 md:mb-6">
              歷史活動
            </h2>
            {filteredHistoryCommunities.length === 0 ? (
              <p className="text-gray-500 py-6">尚無已結束的共備活動</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHistoryCommunities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    name={community.name}
                    description={community.description}
                    memberCount={community.memberCount}
                    createdDate={community.createdDate}
                    onView={() => handleViewHistoryCommunity(community)}
                    onEdit={() => setHistoryEditTarget(community)}
                  />
                ))}
              </div>
            )}
          </section>
          </>
          )}
        </div>
      </div>

      {/* 加入社群對話框 */}
      <JoinCommunityModal
        isOpen={isJoinModalOpen}
        onClose={handleCloseJoinModal}
        onJoin={handleJoinWithCode}
      />

      {/* 建立/修改社群對話框 */}
      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreate={handleCreateCommunity}
        editMode={!!editingCommunity}
        initialData={
          editingCommunity
            ? {
                name: editingCommunity.name,
                inviteCode: editingCommunity.inviteCode,
                description: editingCommunity.description,
              }
            : undefined
        }
      />

      <CommunityOnboardingModal
        open={showCommunityOnboarding}
        onDismiss={(options) => {
          markCommunityOnboardingSeen(userId)
          setShowCommunityOnboarding(false)
          if (options?.showReopenHint) {
            setShowOnboardingReopenHint(true)
          }
        }}
      />

      {historyEditTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-edit-confirm-title"
          >
            <p id="history-edit-confirm-title" className="text-base text-gray-800">
              確定要編輯此歷史活動嗎？
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setHistoryEditTarget(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => handleEnterHistoryLessonEditMode(historyEditTarget)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-[rgba(138,99,210,0.9)] hover:bg-[rgba(138,99,210,1)] transition-colors"
              >
                進入編輯模式
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

