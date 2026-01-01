'use client'

import { useState, useEffect } from 'react'
import Header from './Header'
import CommunityButton from './CommunityButton'
import SearchBar from './SearchBar'
import JoinCommunityModal from './JoinCommunityModal'
import CreateCommunityModal from './CreateCommunityModal'
import CommunityCard from './CommunityCard'
import CommunityDetail from './CommunityDetail'

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
 * 社群總覽頁面組件
 * 根據 Figma 設計 (nodeId: 1:2) 實現
 */
export default function CommunityOverview({ onNavigateToLogin }: CommunityOverviewProps = {}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [communities, setCommunities] = useState<Community[]>([])
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

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

  // 載入社群列表
  useEffect(() => {
    if (userId) {
      loadCommunities()
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
    } catch (err: any) {
      setError(err.message || '讀取社群列表失敗')
      console.error('載入社群列表錯誤:', err)
    } finally {
      setIsLoading(false)
    }
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
      return
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
      alert('成功加入社群！')
    } catch (err: any) {
      setError(err.message || '加入社群失敗')
      alert(err.message || '加入社群失敗')
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
        alert('修改社群成功！')
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
        alert('建立社群成功！')
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

  // 根據搜尋關鍵字過濾社群
  const filteredCommunities = communities.filter((community) => {
    if (!searchQuery.trim()) return true // 如果搜尋欄位為空，顯示所有社群
    return community.name.toLowerCase().startsWith(searchQuery.toLowerCase().trim())
  })

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

    if (!confirm('確定要刪除此社群嗎？此操作無法復原。')) {
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
      alert('社群已刪除')
    } catch (err: any) {
      setError(err.message || '刪除社群失敗')
      alert(err.message || '刪除社群失敗')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeaveCommunity = async (communityId: string) => {
    if (!userId) {
      if (window.confirm('請先登入')) {
        onNavigateToLogin?.()
      }
      return
    }

    if (!confirm('確定要退出此社群嗎？')) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(
        `/api/communities/${communityId}/members?userId=${userId}&operatorId=${userId}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '退出社群失敗')
      }

      // 重新載入社群列表
      await loadCommunities()
      alert('已退出社群')
    } catch (err: any) {
      setError(err.message || '退出社群失敗')
      alert(err.message || '退出社群失敗')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommunityClick = (community: Community) => {
    setSelectedCommunity(community)
  }

  const handleBackToOverview = () => {
    setSelectedCommunity(null)
  }

  // 如果選中了社群，顯示社群詳情頁面
  if (selectedCommunity) {
    return (
      <CommunityDetail
        communityName={selectedCommunity.name}
        communityId={selectedCommunity.id}
        onBack={handleBackToOverview}
      />
    )
  }

  // 否則顯示社群總覽頁面
  return (
    <div className="w-screen h-screen min-w-[1280px] min-h-[800px] bg-[#F5F3FA]">
      {/* 畫布 */}
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        <Header />

        {/* 主要內容區 */}
        <div className="flex-1 bg-[#FEFBFF] px-16 pb-16">
          {/* 標題與操作按鈕列 */}
          <div className="flex items-center mb-8 pt-8">
            {/* 標題 */}
            <h1 className="text-[24px] font-bold text-[#6D28D9] leading-[40px]">
              社群總覽
            </h1>

            {/* 搜尋框 - 置中 */}
            <div className="flex-1 flex justify-center px-8">
              <SearchBar
                placeholder="搜尋社群名稱"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {/* 右側按鈕群組 */}
            <div className="flex items-center gap-4">
              {/* 新增社群按鈕 */}
              <CommunityButton
                label="新增社群"
                onClick={handleNewCommunity}
              />

              {/* 加入社群按鈕 */}
              <CommunityButton
                label="加入社群"
                onClick={handleJoinCommunity}
              />
            </div>
          </div>

          {/* 社群列表區域 */}
          {communities.length === 0 ? (
            /* 空白狀態 */
            <div className="w-full h-full bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p className="text-lg">目前沒有社群</p>
              </div>
            </div>
          ) : filteredCommunities.length === 0 ? (
            /* 搜尋無結果 */
            <div className="w-full h-full bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p className="text-lg">找不到符合「{searchQuery}」的社群</p>
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
                  onClick={() => handleCommunityClick(community)}
                  onEdit={() => handleEditCommunity(community.id)}
                  onDelete={() => handleDeleteCommunity(community.id)}
                  onLeave={() => handleLeaveCommunity(community.id)}
                />
              ))}
            </div>
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
    </div>
  )
}

