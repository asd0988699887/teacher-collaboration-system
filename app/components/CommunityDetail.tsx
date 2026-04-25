'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import Header from './Header'
import NotificationBell from './NotificationBell'
import ResourceCard from './ResourceCard'
import AddActivityModal from './AddActivityModal'
import CourseObjectives from './CourseObjectives'
import AddTaskModal from './AddTaskModal'
import AddIdeaModal from './AddIdeaModal'
import EditIdeaModal from './EditIdeaModal'
import IdeaCard from './IdeaCard'
import DraggableIdeaCard from './DraggableIdeaCard'
import DraggableTaskCard from './DraggableTaskCard'
import DroppableList from './DroppableList'
import ArrowsOverlay from './ArrowsOverlay'
import ZoomableIdeasContainer from './ZoomableIdeasContainer'
import ConvergenceModal from './ConvergenceModal'
import VersionControlModal from './VersionControlModal'
import IdeaContributionChart from './IdeaContributionChart'
import IdeaTrendChart from './IdeaTrendChart'
import NetworkGraph from './NetworkGraph'
import { clearCommunityOnboardingOnLogout } from '@/lib/communityOnboardingStorage'
import {
  hasSeenIdeaWallOnboarding,
  markIdeaWallOnboardingSeen,
  clearIdeaWallOnboardingOnLogout,
} from '@/lib/ideaWallOnboardingStorage'
import {
  hasSeenNetworkGraphOnboarding,
  markNetworkGraphOnboardingSeen,
  clearNetworkGraphOnboardingOnLogout,
} from '@/lib/networkGraphOnboardingStorage'
import {
  hasSeenKanbanOnboarding,
  markKanbanOnboardingSeen,
  clearKanbanOnboardingOnLogout,
} from '@/lib/kanbanOnboardingStorage'
import { clearCoPrepOnboardingOnLogout } from '@/lib/coPrepOnboardingStorage'
import IdeaWallOnboardingModal from './IdeaWallOnboardingModal'
import KanbanOnboardingModal from './KanbanOnboardingModal'
import { activityDisplayLabel } from '@/lib/activityDisplay'

interface CommunityDetailProps {
  communityName: string
  communityId?: string // 可選的社群ID
  onBack: () => void
}

type TabType = 'resources' | 'activities' | 'ideas' | 'teamwork' | 'history' | 'management' | 'links'

interface Resource {
  id: string
  fileName: string
  filePath?: string
  fileType?: string
  uploadDate: string
  uploadTime: string
  uploaderName?: string
  uploaderId?: string
}

interface Activity {
  id: string
  name: string
  introduction: string
  createdDate: string
  createdTime: string
  isPublic: boolean
  password: string
  creatorId?: string
  creatorName?: string
  lessonPlanTitle?: string
  courseDomain?: string
  designer?: string
  unitName?: string
  implementationGrade?: string
  schoolLevel?: string
  lastModifiedDate?: string
  lastModifiedTime?: string
  /** 是否已按「結束共備」標記完成 */
  coPrepCompleted?: boolean
}

interface KanbanTask {
  id: string
  title: string
  content: string
  startDate: string
  endDate: string
  assignees: string[]
  createdAt?: string // ISO 日期字符串（可選，用於向後兼容）
}

interface KanbanList {
  id: string
  title: string
  tasks: KanbanTask[]
}

interface Idea {
  id: string
  activityId?: string // 關聯的共備活動ID
  stage: string
  title: string
  content: string
  createdDate: string
  createdTime: string
  creatorName?: string
  /** 建立者使用者 ID（與 API ideas 列表 creatorId 一致） */
  creatorId?: string
  creatorAccount?: string // 建立者帳號（用於權限檢查）
  creatorAvatar?: string
  parentId?: string // 延伸關係：指向父節點的 ID
  position?: { x: number; y: number } // 卡片位置
  rotation?: number // 卡片旋轉角度
  isConvergence?: boolean // 是否為收斂結果節點
  convergedIdeaIds?: string[] // 被收斂的想法節點 IDs
  lastEditedByName?: string // 最後編輯者姓名
  lastEditedAt?: string // 最後編輯時間（已格式化）
}

/**
 * 社群詳情頁面組件
 * 對應 Figma 設計 (nodeId: 0:1) - 社群資源(空)
 */
export default function CommunityDetail({ communityName, communityId: propCommunityId, onBack }: CommunityDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('activities')
  // 自定義水平卷軸狀態
  const [scrollInfo, setScrollInfo] = useState<{
    scrollLeft: number
    scrollWidth: number
    clientWidth: number
    hasHorizontalScroll: boolean
  }>({
    scrollLeft: 0,
    scrollWidth: 0,
    clientWidth: 0,
    hasHorizontalScroll: false,
  })
  const [isDraggingScrollbar, setIsDraggingScrollbar] = useState(false)
  const scrollbarRef = useRef<HTMLDivElement>(null)
  const prevHasHorizontalScrollRef = useRef(false) // 用於穩定 hasHorizontalScroll 狀態
  const [isMobile, setIsMobile] = useState(false) // 檢測是否為手機版
  const savedScrollLeftRef = useRef<number>(0) // 保存滾動位置
  const prevActiveTabRef = useRef<TabType>('activities') // 追蹤上一個 tab
  const [resources, setResources] = useState<Resource[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [communityId, setCommunityId] = useState<string | null>(propCommunityId || null)
  const [userId, setUserId] = useState<string | null>(null)
  const [showIdeaWallOnboarding, setShowIdeaWallOnboarding] = useState(false)
  const [showNetworkGraphOnboardingModal, setShowNetworkGraphOnboardingModal] = useState(false)
  const [showKanbanOnboarding, setShowKanbanOnboarding] = useState(false)
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [isVersionControlModalOpen, setIsVersionControlModalOpen] = useState(false)
  const [versionControlActivityId, setVersionControlActivityId] = useState<string | null>(null)
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 使用者頭像下拉選單狀態
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const [userNickname, setUserNickname] = useState('使用者')
  const [userAccount, setUserAccount] = useState('未登入')
  
  // 團隊分工 Kanban 列表狀態
  const [kanbanLists, setKanbanLists] = useState<KanbanList[]>([])
  const [isAddingList, setIsAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [currentListId, setCurrentListId] = useState<string>('')
  const [editingTask, setEditingTask] = useState<{ taskId: string; listId: string } | null>(null)
  const [openTaskMenuId, setOpenTaskMenuId] = useState<string | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  
  // 拖拽 sensors 配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移動 8px 後才開始拖拽，避免誤觸
      },
    })
  )
  const [isAddIdeaModalOpen, setIsAddIdeaModalOpen] = useState(false)
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const [isEditIdeaModalOpen, setIsEditIdeaModalOpen] = useState(false)
  const [extendingFromIdeaId, setExtendingFromIdeaId] = useState<string | null>(null)
  const [isConvergenceModalOpen, setIsConvergenceModalOpen] = useState(false)
  const kanbanInitializedRef = useRef<Set<string>>(new Set()) // 追蹤每個社群是否已初始化
  const [activeHistoryChart, setActiveHistoryChart] = useState<'contribution' | 'network' | 'trend'>('contribution') // 活動歷程圖表類型
  const positionUpdateTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map()) // 位置更新節流
  const lastUpdatePositionRef = useRef<Map<string, { x: number; y: number }>>(new Map()) // 記錄最後更新位置

  // 從 localStorage 載入使用者資料
  useEffect(() => {
    const loadUserData = () => {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser)
            setUserNickname(userData.nickname || '使用者')
            setUserAccount(userData.accountNumber || '未登入')
            setUserId(userData.id || userData.userId || null)
          } catch (e) {
            // 忽略解析錯誤
          }
        }
      }
    }
    
    loadUserData()
  }, [])

  // 如果沒有 communityId，根據 communityName 查詢
  useEffect(() => {
    const fetchCommunityId = async () => {
      if (!communityId && communityName) {
        try {
          // 從 localStorage 獲取使用者ID
          const savedUser = localStorage.getItem('user')
          if (savedUser) {
            const userData = JSON.parse(savedUser)
            const currentUserId = userData.id || userData.userId

            if (currentUserId) {
              // 查詢使用者的社群列表，找到對應名稱的社群
              const response = await fetch(`/api/communities?userId=${currentUserId}`)
              const communities = await response.json()

              if (response.ok && Array.isArray(communities)) {
                const foundCommunity = communities.find((c: any) => c.name === communityName)
                if (foundCommunity) {
                  setCommunityId(foundCommunity.id)
                }
              }
            }
          }
        } catch (error) {
          console.error('查詢社群ID失敗:', error)
        }
      }
    }

    fetchCommunityId()
  }, [communityId, communityName])

  // 載入活動列表
  useEffect(() => {
    if (communityId) {
      loadActivities()
      loadResources()
      loadIdeas(false) // 初始載入時不保留滾動位置
      loadKanban()
      loadCommunityMembers()
    }
  }, [communityId])

  // 共備活動：自動進入「進行中」教案編輯；已結束共備者僅在歷史活動瀏覽，不當作預設編輯對象
  useEffect(() => {
    if (activeTab !== 'activities' || !communityId) return
    if (activities.length === 0) {
      setViewingActivity(null)
      return
    }
    setViewingActivity((prev) => {
      if (prev) {
        const updated = activities.find((a) => a.id === prev.id)
        if (updated) {
          if (updated.coPrepCompleted) {
            const next = activities.find((a) => !a.coPrepCompleted)
            // 無進行中活動時仍保留目前活動，才能用「預覽教案／歷史活動」瀏覽已結束教案
            return next ?? updated
          }
          return updated
        }
      }
      const inProgress = activities.find((a) => !a.coPrepCompleted)
      // 全部已結束時仍開啟第一筆活動，避免共備活動頁只剩空白提示、看不到教案分頁
      return inProgress ?? activities[0] ?? null
    })
  }, [activeTab, communityId, activities])
  
  // 追蹤 activeTab 變化，更新 prevActiveTabRef
  useEffect(() => {
    if (activeTab !== prevActiveTabRef.current) {
      prevActiveTabRef.current = activeTab
    }
  }, [activeTab])

  // 想法牆：首次進入時顯示操作引導（ideaWall_onboarding_seen_${userId}）
  useEffect(() => {
    if (activeTab !== 'ideas' || !userId) {
      setShowIdeaWallOnboarding(false)
      return
    }
    if (!hasSeenIdeaWallOnboarding(userId)) {
      setShowIdeaWallOnboarding(true)
    }
  }, [activeTab, userId])

  // 網絡圖：第一次切到該圖表時顯示單頁操作提示（networkGraph_onboarding_seen_${userId}）
  useEffect(() => {
    if (activeTab !== 'history' || activeHistoryChart !== 'network') {
      setShowNetworkGraphOnboardingModal(false)
      return
    }
    if (!userId) return
    if (!hasSeenNetworkGraphOnboarding(userId)) {
      setShowNetworkGraphOnboardingModal(true)
    } else {
      setShowNetworkGraphOnboardingModal(false)
    }
  }, [activeTab, activeHistoryChart, userId])

  // 團隊分工：首次進入時顯示看板操作引導（kanban_onboarding_seen_${userId}）
  useEffect(() => {
    if (activeTab !== 'teamwork' || !userId) {
      setShowKanbanOnboarding(false)
      return
    }
    if (!hasSeenKanbanOnboarding(userId)) {
      setShowKanbanOnboarding(true)
    }
  }, [activeTab, userId])

  // 持續監聽滾動事件，即時保存滾動位置
  useEffect(() => {
    if (activeTab !== 'ideas') return

    const container = document.getElementById('ideas-container')
    if (!container) return

    const handleScroll = () => {
      savedScrollLeftRef.current = container.scrollLeft
    }

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [activeTab])

  // 在 ideas 狀態更新後立即恢復滾動位置
  useEffect(() => {
    if (activeTab !== 'ideas') return

    const container = document.getElementById('ideas-container')
    if (!container) return

    // 如果保存的滾動位置為 0，且當前滾動位置也為 0，則不需要恢復
    // 如果保存的滾動位置大於 0，則需要恢復
    const shouldRestore = savedScrollLeftRef.current > 0 || container.scrollLeft > 0

    if (!shouldRestore) return

    // 使用多重 requestAnimationFrame 和 setTimeout 確保 DOM 已完全更新
    // 因為 React 狀態更新和 DOM 渲染是異步的
    const restoreScroll = () => {
      if (!container) return
      
      // 再次檢查，避免在恢復過程中滾動位置被改變
      const currentScrollLeft = container.scrollLeft
      const savedScrollLeft = savedScrollLeftRef.current
      
      // 只有在保存的位置與當前位置不同時才恢復
      // 並且保存的位置必須大於 0（表示用戶曾經滾動過）
      if (savedScrollLeft > 0 && Math.abs(currentScrollLeft - savedScrollLeft) > 1) {
        container.scrollLeft = savedScrollLeft
      }
    }

    // 立即嘗試恢復
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        restoreScroll()
        // 如果還是沒有恢復，再延遲一點
        setTimeout(() => {
          restoreScroll()
        }, 50)
      })
    })
  }, [ideas, activeTab])

  // 組件卸載時清理所有 timeout
  useEffect(() => {
    return () => {
      // 清理所有位置更新的 timeout
      positionUpdateTimeoutRef.current.forEach((timeout) => {
        clearTimeout(timeout)
      })
      positionUpdateTimeoutRef.current.clear()
      lastUpdatePositionRef.current.clear()
    }
  }, [])

  // 載入社群成員列表
  const loadCommunityMembers = async () => {
    if (!communityId) return

    try {
      const response = await fetch(`/api/communities/${communityId}/members`)
      const data = await response.json()

      if (response.ok) {
        // 轉換為 AddTaskModal 需要的格式
        const members = data.map((member: any) => ({
          id: member.userId, // 使用 userId 作為 id
          name: member.nickname, // 使用 nickname 作為 name
          avatar: member.avatar || '',
        }))
        setCommunityMembers(members)
        
        // 儲存完整的成員資料用於社群管理頁面
        setFullCommunityMembers(data)
      } else {
        console.error('載入社群成員列表失敗:', data.error)
      }
    } catch (error) {
      console.error('載入社群成員列表錯誤:', error)
    }
  }

  // 設定成員為管理員或取消管理員
  const handleToggleAdmin = async (targetUserId: string, isCurrentlyAdmin: boolean) => {
    if (!communityId || !userId) {
      alert('系統錯誤，請重新登入')
      return
    }

    if (!confirm(`確定要${isCurrentlyAdmin ? '取消' : '設為'}管理員嗎？`)) {
      return
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/members`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: targetUserId,
          role: isCurrentlyAdmin ? 'member' : 'admin',
          operatorId: userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '操作失敗')
      }

      // 重新載入成員列表
      await loadCommunityMembers()
      alert(`已${isCurrentlyAdmin ? '取消' : '設為'}管理員`)
    } catch (error: any) {
      console.error('設定管理員錯誤:', error)
      alert(error.message || '操作失敗')
    }
  }

  // 移出社群成員
  const handleRemoveMember = async (targetUserId: string, targetUserName: string) => {
    if (!communityId || !userId) {
      alert('系統錯誤，請重新登入')
      return
    }

    if (!confirm(`確定要將「${targetUserName}」移出社群嗎？此操作無法復原。`)) {
      return
    }

    try {
      const response = await fetch(
        `/api/communities/${communityId}/members?userId=${targetUserId}&operatorId=${userId}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '移出成員失敗')
      }

      // 重新載入成員列表
      await loadCommunityMembers()
      alert('成員已移出社群')
    } catch (error: any) {
      console.error('移出成員錯誤:', error)
      alert(error.message || '移出成員失敗')
    }
  }

  const loadActivities = async () => {
    if (!communityId) return

    try {
      const response = await fetch(`/api/communities/${communityId}/activities`)
      const data = await response.json()

      if (response.ok) {
        setActivities(data)
      } else {
        console.error('載入活動列表失敗:', data.error)
      }
    } catch (error) {
      console.error('載入活動列表錯誤:', error)
    }
  }

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        avatarRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleAvatarClick = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleLogout = () => {
    // 清除 localStorage 中的使用者資料
    if (typeof window !== 'undefined') {
      clearCommunityOnboardingOnLogout()
      clearIdeaWallOnboardingOnLogout()
      clearNetworkGraphOnboardingOnLogout()
      clearKanbanOnboardingOnLogout()
      clearCoPrepOnboardingOnLogout()
      localStorage.removeItem('user')
      // 重新載入頁面以回到登入畫面
      window.location.href = '/'
    }
    setIsDropdownOpen(false)
  }

  // 社群成員數據（從 API 載入）
  const [communityMembers, setCommunityMembers] = useState<Array<{ id: string; name: string; avatar?: string }>>([]
  )
  
  // 完整的社群成員資料（用於社群管理頁面）
  const [fullCommunityMembers, setFullCommunityMembers] = useState<Array<{ 
    id: string
    userId: string
    nickname: string
    account: string
    email: string
    school: string
    role: string
  }>>([])

  const tabs = [
    { id: 'activities' as TabType, label: '共備活動', icon: '📝' },
    { id: 'ideas' as TabType, label: '想法牆', icon: '💡' },
    { id: 'resources' as TabType, label: '資源', icon: '📁' },
    { id: 'teamwork' as TabType, label: '團隊分工', icon: '🎯' },
    { id: 'history' as TabType, label: '活動歷程', icon: '📄' },
    { id: 'management' as TabType, label: '社群管理', icon: '👥' },
    { id: 'links' as TabType, label: '好站連結', icon: '🔗' },
  ]

  const handleAddFileClick = () => {
    fileInputRef.current?.click()
  }

  const loadResources = async () => {
    if (!communityId) return

    try {
      const response = await fetch(`/api/communities/${communityId}/resources`)
      const data = await response.json()

      if (response.ok) {
        setResources(data)
      } else {
        console.error('載入資源列表失敗:', data.error)
      }
    } catch (error) {
      console.error('載入資源列表錯誤:', error)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    // 詳細驗證
    if (!file) {
      alert('請選擇檔案')
      return
    }
    
    if (!communityId) {
      console.error('communityId 為空:', { communityId, propCommunityId, communityName })
      alert('社群ID不存在，請重新進入社群頁面')
      return
    }
    
    if (!userId) {
      alert('請先登入')
      return
    }

    try {
      // 使用 FormData 上傳檔案
      const formData = new FormData()
      formData.append('file', file)
      formData.append('uploadedBy', userId)

      const apiUrl = `/api/communities/${communityId}/resources`
      console.log('上傳檔案到:', apiUrl, { communityId, userId, fileName: file.name })

      const response = await fetch(apiUrl, {
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

      // 重新載入資源列表
      await loadResources()
      alert('檔案上傳成功！')
    } catch (error: any) {
      console.error('上傳檔案錯誤:', error)
      alert(error.message || '上傳檔案失敗')
    }

    // 重置 input，這樣可以選擇同一個檔案
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!communityId) {
      alert('社群資訊錯誤')
      return
    }

    if (!confirm('確定要刪除此資源嗎？')) {
      return
    }

    try {
      const response = await fetch(
        `/api/communities/${communityId}/resources?resourceId=${resourceId}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '刪除資源失敗')
      }

      // 重新載入資源列表
      await loadResources()
      alert('資源已刪除')
    } catch (error: any) {
      console.error('刪除資源錯誤:', error)
      alert(error.message || '刪除資源失敗')
    }
  }

  const handleDownloadResource = async (resourceId: string) => {
    if (!communityId) {
      alert('社群資訊錯誤')
      return
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/resources/${resourceId}/download`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '下載資源失敗')
      }

      // 獲取檔案名稱
      const contentDisposition = response.headers.get('Content-Disposition')
      let fileName = 'download'
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?$/i)
        if (fileNameMatch) {
          fileName = decodeURIComponent(fileNameMatch[1])
        }
      }

      // 將回應轉換為 Blob
      const blob = await response.blob()
      
      // 創建下載連結
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('下載資源錯誤:', error)
      alert(error.message || '下載資源失敗')
    }
  }

  const handleCloseAddActivityModal = () => {
    setIsAddActivityModalOpen(false)
    setEditingActivity(null) // 清除編輯狀態
  }

  const handleAddActivity = async (activityData: {
    name: string
    isPublic: boolean
    password: string
    introduction: string
  }) => {
    if (!communityId || !userId) {
      alert('請先登入並確保社群資訊正確')
      return
    }

    try {
      if (editingActivity) {
        // 編輯模式：更新現有活動
        const response = await fetch(`/api/activities/${editingActivity.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: activityData.name,
            introduction: activityData.introduction,
            isPublic: activityData.isPublic,
            password: activityData.password,
            userId,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '更新活動失敗')
        }

        // 重新載入活動列表
        await loadActivities()
        alert('修改活動成功！')
      } else {
        // 新增模式：創建新活動
        const response = await fetch(`/api/communities/${communityId}/activities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: activityData.name,
            introduction: activityData.introduction,
            isPublic: activityData.isPublic,
            password: activityData.password,
            creatorId: userId,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '建立活動失敗')
        }

        // 重新載入活動列表
        await loadActivities()
        alert('建立活動成功！')
      }

      setIsAddActivityModalOpen(false)
      setEditingActivity(null) // 清除編輯狀態
    } catch (error: any) {
      console.error('操作活動錯誤:', error)
      alert(error.message || '操作失敗')
    }
  }

  // 處理 tab 切換的通用函數
  const handleTabChange = (tabId: TabType) => {
    // 如果離開想法牆，重置滾動位置
    if (prevActiveTabRef.current === 'ideas' && tabId !== 'ideas') {
      savedScrollLeftRef.current = 0
    }
    // 如果進入想法牆，重置滾動位置（從其他頁面進入）
    if (prevActiveTabRef.current !== 'ideas' && tabId === 'ideas') {
      savedScrollLeftRef.current = 0
      setTimeout(() => {
        const container = document.getElementById('ideas-container')
        if (container) {
          container.scrollLeft = 0
        }
      }, 100)
    }
    
    prevActiveTabRef.current = tabId
    setActiveTab(tabId)
  }

  const handleSidebarClickFromActivity = (tabId: string) => {
    // 勿在此清空 viewingActivity：從教案頁切到想法牆等再切回「共備活動」時，
    // 需保留目前選中的活動，否則可能短暫看不到教案編輯／歷史活動入口。
    handleTabChange(tabId as TabType)
  }

  const handleManageVersion = (activityId: string) => {
    setVersionControlActivityId(activityId)
    setIsVersionControlModalOpen(true)
  }

  const handleCloseVersionControlModal = () => {
    setIsVersionControlModalOpen(false)
    setVersionControlActivityId(null)
  }

  const handleRestoreVersion = async (versionId: string) => {
    if (!versionControlActivityId || !userId) {
      alert('請先登入並確保活動資訊正確')
      return
    }

    if (!confirm('確定要回復到此版本嗎？這將覆蓋目前的教案內容。')) {
      return
    }

    try {
      const response = await fetch(`/api/activity-versions/${versionControlActivityId}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          versionId,
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '回覆版本失敗')
      }

      // 回復版本成功後，使用 API 返回的版本號更新 localStorage
      const storageKey = `currentVersion_${versionControlActivityId}`
      if (data.currentVersionNumber) {
        const versionNumber = `v${data.currentVersionNumber}`
        localStorage.setItem(storageKey, versionNumber)
        console.log('✅ CommunityDetail: 已更新版本號到 localStorage:', versionNumber)
        
        // 觸發自定義事件，並傳遞回復的版本號，通知 CourseObjectives 更新版本號
        console.log('✅ CommunityDetail: 準備觸發 versionRestored 事件，版本號:', versionNumber)
        const event = new CustomEvent('versionRestored', {
          detail: {
            activityId: versionControlActivityId,
            versionNumber: versionNumber,
          },
        })
        window.dispatchEvent(event)
        console.log('✅ CommunityDetail: 已觸發 versionRestored 事件')
      } else {
        // 如果 API 沒有返回版本號，清除 localStorage，強制重新從 API 讀取
        localStorage.removeItem(storageKey)
        console.log('⚠️ CommunityDetail: API 沒有返回版本號，已清除 localStorage')
        
        // 仍然觸發事件，讓 CourseObjectives 重新從 API 讀取
        console.log('✅ CommunityDetail: 準備觸發 versionRestored 事件（無版本號）')
        window.dispatchEvent(new Event('versionRestored'))
        console.log('✅ CommunityDetail: 已觸發 versionRestored 事件')
      }

      alert('版本已回覆！')
      setIsVersionControlModalOpen(false)
      // 重新載入活動列表以顯示更新後的資料
      await loadActivities()
    } catch (error: any) {
      console.error('回覆版本錯誤:', error)
      alert(error.message || '回覆版本失敗')
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    if (!userId) {
      alert('請先登入')
      return
    }

    if (!confirm('確定要刪除此活動嗎？此操作無法復原。')) {
      return
    }

    try {
      const response = await fetch(`/api/activities/${activityId}?userId=${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '刪除活動失敗')
      }

      // 重新載入活動列表
      await loadActivities()
      setViewingActivity((prev) => (prev?.id === activityId ? null : prev))
      alert('活動已刪除')
    } catch (error: any) {
      console.error('刪除活動錯誤:', error)
      alert(error.message || '刪除活動失敗')
    }
  }

  const loadKanban = async () => {
    if (!communityId) return

    try {
      const response = await fetch(`/api/communities/${communityId}/kanban`)
      const data = await response.json()

      if (response.ok) {
        // 如果沒有列表且該社群尚未初始化，建立預設的三個列表
        if (Array.isArray(data) && data.length === 0 && !kanbanInitializedRef.current.has(communityId)) {
          kanbanInitializedRef.current.add(communityId) // 標記為已初始化
          
          const defaultLists = [
            { title: '待處理' },
            { title: '進行中' },
            { title: '已完成' },
          ]

          // 依序建立預設列表
          for (const list of defaultLists) {
            try {
              const createResponse = await fetch(`/api/communities/${communityId}/kanban`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  type: 'list',
                  title: list.title,
                }),
              })

              if (!createResponse.ok) {
                console.error('建立預設列表失敗:', list.title)
              }
            } catch (error) {
              console.error('建立預設列表錯誤:', error)
            }
          }

          // 重新載入列表
          const reloadResponse = await fetch(`/api/communities/${communityId}/kanban`)
          const reloadData = await reloadResponse.json()
          if (reloadResponse.ok) {
            setKanbanLists(reloadData)
          }
        } else {
          // 如果已有列表，也標記為已初始化
          if (Array.isArray(data) && data.length > 0) {
            kanbanInitializedRef.current.add(communityId)
          }
          setKanbanLists(data)
        }
      } else {
        console.error('載入 Kanban 資料失敗:', data.error)
      }
    } catch (error) {
      console.error('載入 Kanban 資料錯誤:', error)
    }
  }

  // 團隊分工相關處理函數
  const handleAddList = async () => {
    if (!communityId) {
      alert('社群資訊錯誤')
      return
    }

    if (!newListTitle.trim()) {
      return
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/kanban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'list',
          title: newListTitle.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '建立列表失敗')
      }

      // 重新載入 Kanban 資料
      await loadKanban()
      setNewListTitle('')
      setIsAddingList(false)
    } catch (error: any) {
      console.error('建立列表錯誤:', error)
      alert(error.message || '建立列表失敗')
    }
  }

  const handleDeleteList = async (listId: string) => {
    if (!communityId) {
      alert('社群資訊錯誤')
      return
    }

    if (!confirm('確定要刪除此列表嗎？此操作會刪除列表中的所有任務。')) {
      return
    }

    try {
      const response = await fetch(
        `/api/communities/${communityId}/kanban?type=list&id=${listId}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '刪除列表失敗')
      }

      // 重新載入 Kanban 資料
      await loadKanban()
      alert('列表已刪除')
    } catch (error: any) {
      console.error('刪除列表錯誤:', error)
      alert(error.message || '刪除列表失敗')
    }
  }

  const handleAddTask = (listId: string) => {
    // 驗證 listId 是否為有效的 UUID（不是硬編碼的 '1', '2', '3'）
    if (!listId || listId === '1' || listId === '2' || listId === '3' || listId.length < 30) {
      console.error('無效的列表ID:', listId)
      alert('列表ID無效，請重新載入頁面')
      return
    }
    
    // 確認列表存在於當前載入的列表中
    const listExists = kanbanLists.some(list => list.id === listId)
    if (!listExists) {
      console.error('列表不存在於當前載入的列表中:', listId, kanbanLists)
      alert('列表不存在，請重新載入頁面')
      return
    }
    
    setCurrentListId(listId)
    setIsAddTaskModalOpen(true)
  }

  const handleSubmitTask = async (task: {
    category: string
    content: string
    startDate: string
    endDate: string
    assignees: string[] // 這裡是使用者ID陣列（從 AddTaskModal 傳入）
  }) => {
    if (!communityId) {
      alert('社群資訊錯誤')
      return
    }

    try {
      // assignees 已經是使用者ID陣列（從 AddTaskModal 傳入的 member.id）
      // 不需要轉換，直接使用
      const assigneeIds = task.assignees || []

      if (editingTask) {
        // 編輯任務
        const response = await fetch(`/api/communities/${communityId}/kanban`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'task',
            id: editingTask.taskId,
            title: task.category,
            content: task.content,
            startDate: task.startDate,
            endDate: task.endDate,
            assignees: assigneeIds, // 使用者ID陣列
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '更新任務失敗')
        }

        // 重新載入 Kanban 資料
        await loadKanban()
        setEditingTask(null)
        alert('更新任務成功！')
      } else {
        // 新增任務
        if (!currentListId) {
          alert('請選擇要新增任務的列表')
          return
        }

        // 再次驗證 currentListId 是否為有效的 UUID
        if (currentListId === '1' || currentListId === '2' || currentListId === '3' || currentListId.length < 30) {
          console.error('無效的列表ID:', currentListId)
          alert('列表ID無效，請重新載入頁面後再試')
          return
        }

        // 確認列表存在於當前載入的列表中
        const listExists = kanbanLists.some(list => list.id === currentListId)
        if (!listExists) {
          console.error('列表不存在於當前載入的列表中:', currentListId, kanbanLists)
          alert('列表不存在，請重新載入頁面後再試')
          return
        }

        console.log('新增任務:', { communityId, currentListId, task, assigneeIds, kanbanLists })

        const response = await fetch(`/api/communities/${communityId}/kanban`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'task',
            listId: currentListId,
            title: task.category || '',
            content: task.content || '',
            startDate: task.startDate || null,
            endDate: task.endDate || null,
            assignees: assigneeIds, // 使用者ID陣列
            creatorId: userId, // 添加創建者ID
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          const errorMessage = data.details 
            ? `${data.error}: ${data.details}` 
            : data.error || '建立任務失敗'
          console.error('建立任務失敗:', { response: data, status: response.status })
          throw new Error(errorMessage)
        }

        // 重新載入 Kanban 資料
        await loadKanban()
        alert('建立任務成功！')
      }

      setIsAddTaskModalOpen(false)
    } catch (error: any) {
      console.error('操作任務錯誤:', error)
      alert(error.message || '操作失敗')
    }
  }

  const loadIdeas = async (preserveScroll: boolean = true) => {
    if (!communityId) return

    // 如果保留滾動位置，先保存當前位置
    if (preserveScroll) {
      const container = document.getElementById('ideas-container')
      if (container) {
        savedScrollLeftRef.current = container.scrollLeft
      }
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/ideas`)
      const data = await response.json()

      if (response.ok) {
        // 直接更新狀態，滾動位置恢復由 useEffect 處理
        setIdeas(data)
      } else {
        console.error('載入想法列表失敗:', data.error)
      }
    } catch (error) {
      console.error('載入想法列表錯誤:', error)
    }
  }

  const handleAddIdea = async (ideaData: {
    activityId?: string
    stage: string
    title: string
    content: string
  }) => {
    if (!communityId || !userId) {
      alert('請先登入並確保社群資訊正確')
      return
    }

    try {
      // 計算初始位置
      let initialPosition = { x: 50, y: 50 }
      let initialRotation = 0

      if (extendingFromIdeaId) {
        // 如果是延伸想法，放在父節點的右側
        const parentIdea = ideas.find((i) => i.id === extendingFromIdeaId)
        if (parentIdea && parentIdea.position) {
          initialPosition = {
            x: parentIdea.position.x + 150, // 父節點右側 150px
            y: parentIdea.position.y,
          }
          initialRotation = parentIdea.rotation || 0 // 繼承父節點的旋轉角度
        }
      } else {
        // 如果是新想法，按順序排列
        const existingIdeasCount = ideas.filter((i) => !i.parentId).length
        const row = Math.floor(existingIdeasCount / 4)
        const col = existingIdeasCount % 4
        initialPosition = {
          x: 50 + col * 200,
          y: 50 + row * 150,
        }
      }

      const response = await fetch(`/api/communities/${communityId}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId: ideaData.activityId || null,
          stage: ideaData.stage,
          title: ideaData.title,
          content: ideaData.content,
          parentId: extendingFromIdeaId || null,
          position: initialPosition,
          rotation: initialRotation,
          isConvergence: false,
          convergedIdeaIds: null,
          creatorId: userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '建立想法失敗')
      }

      // 重新載入想法列表
      await loadIdeas(true) // 保留滾動位置
      setIsAddIdeaModalOpen(false)
      setExtendingFromIdeaId(null) // 清除延伸來源
      alert('建立想法成功！')
    } catch (error: any) {
      console.error('建立想法錯誤:', error)
      alert(error.message || '建立想法失敗')
    }
  }

  const handleEditIdea = (ideaId: string) => {
    // 保存當前滾動位置
    const container = document.getElementById('ideas-container')
    if (container) {
      savedScrollLeftRef.current = container.scrollLeft
    }
    
    const idea = ideas.find((i) => i.id === ideaId)
    if (idea) {
      setEditingIdea(idea)
      setIsEditIdeaModalOpen(true)
    }
  }

  const handleSaveIdea = async (ideaData: {
    activityId?: string
    stage: string
    title: string
    content: string
  }) => {
    if (!editingIdea || !userId) {
      alert('請先登入')
      return
    }

    try {
      const response = await fetch(`/api/ideas/${editingIdea.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId: ideaData.activityId ?? editingIdea.activityId ?? null,
          stage: ideaData.stage,
          title: ideaData.title,
          content: ideaData.content,
          position: editingIdea.position,
          rotation: editingIdea.rotation,
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '更新想法失敗')
      }

      // 重新載入想法列表（保留滾動位置）
      await loadIdeas(true)
      setEditingIdea(null)
      setIsEditIdeaModalOpen(false)
      alert('更新想法成功！')
    } catch (error: any) {
      console.error('更新想法錯誤:', error)
      alert(error.message || '更新想法失敗')
    }
  }

  const handleDeleteIdea = async () => {
    if (!editingIdea || !userId) {
      alert('請先登入')
      return
    }

    // 使用瀏覽器原生確認對話框
    if (window.confirm('確定要刪除此想法嗎？此操作無法復原。')) {
      try {
        const response = await fetch(`/api/ideas/${editingIdea.id}?userId=${userId}`, {
          method: 'DELETE',
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '刪除想法失敗')
        }

        // 重新載入想法列表（保留滾動位置）
        await loadIdeas(true)
        setEditingIdea(null)
        setIsEditIdeaModalOpen(false)
        alert('想法已刪除')
      } catch (error: any) {
        console.error('刪除想法錯誤:', error)
        alert(error.message || '刪除想法失敗')
      }
    }
  }

  const handleExtendIdea = () => {
    if (editingIdea) {
      console.log('延伸想法:', editingIdea.id)
      // TODO: 實作延伸想法的 API 邏輯
      
      // 設置延伸來源 ID，然後打開新增想法模態框
      setExtendingFromIdeaId(editingIdea.id)
      setIsEditIdeaModalOpen(false)
      setEditingIdea(null)
      setIsAddIdeaModalOpen(true)
    }
  }

  const handleCloseEditIdeaModal = () => {
    setIsEditIdeaModalOpen(false)
    setEditingIdea(null)
    // 滾動位置恢復由 useEffect 處理
  }

  const handleConvergenceSubmit = async (data: {
    activityId?: string
    stage: string
    selectedIdeaIds: string[]
    convergenceContent: string
    comments: { content: string; author: string; createdAt: string }[]
  }) => {
    if (!communityId || !userId) {
      alert('請先登入並確保社群資訊正確')
      return
    }

    try {
      // 計算收斂節點的位置（放在被收斂節點的右側）
      const convergedIdeas = ideas.filter(idea => data.selectedIdeaIds.includes(idea.id))
      let convergencePosition = { x: 0, y: 0 }

      if (convergedIdeas.length > 0) {
        // 找出所有被收斂節點中最右邊的位置
        const maxX = Math.max(...convergedIdeas.map(idea => idea.position?.x || 0))
        convergencePosition = { x: maxX + 250, y: 100 }
      }

      const response = await fetch(`/api/communities/${communityId}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId: data.activityId || null,
          stage: data.stage,
          title: '收斂結果',
          content: data.convergenceContent || '(尚未填寫收斂內容)',
          parentId: null,
          position: convergencePosition,
          rotation: 0,
          isConvergence: true,
          convergedIdeaIds: data.selectedIdeaIds,
          creatorId: userId,
        }),
      })

      const apiData = await response.json()

      if (!response.ok) {
        throw new Error(apiData.error || '建立收斂結果失敗')
      }

      // 重新載入想法列表
      await loadIdeas(true) // 保留滾動位置
      setIsConvergenceModalOpen(false)
      alert(`已收斂 ${data.selectedIdeaIds.length} 個想法節點`)
    } catch (error: any) {
      console.error('收斂想法錯誤:', error)
      alert(error.message || '收斂想法失敗')
    }
  }

  // 處理自定義水平卷軸拖動（支持滑鼠和觸控）
  const handleScrollbarDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = document.getElementById('ideas-container')
    if (!container || !scrollbarRef.current) return

    const scrollbarRect = scrollbarRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clickX = clientX - scrollbarRect.left
    const percentage = Math.max(0, Math.min(1, clickX / scrollbarRect.width))
    
    const maxScroll = scrollInfo.scrollWidth - scrollInfo.clientWidth
    container.scrollLeft = percentage * maxScroll
  }

  const handleScrollbarClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isDraggingScrollbar) return
    
    const container = document.getElementById('ideas-container')
    if (!container || !scrollbarRef.current) return

    const scrollbarRect = scrollbarRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clickX = clientX - scrollbarRect.left
    const percentage = Math.max(0, Math.min(1, clickX / scrollbarRect.width))
    
    const maxScroll = scrollInfo.scrollWidth - scrollInfo.clientWidth
    container.scrollLeft = percentage * maxScroll
  }

  // 穩定 hasHorizontalScroll 狀態，避免頻繁切換
  useEffect(() => {
    const shouldShow = scrollInfo.hasHorizontalScroll && scrollInfo.scrollWidth > scrollInfo.clientWidth + 10
    // 使用更長的延遲和更寬鬆的閾值，避免頻繁切換
    if (shouldShow !== prevHasHorizontalScrollRef.current) {
      const timeoutId = setTimeout(() => {
        // 再次確認，避免在延遲期間狀態又改變
        const currentShouldShow = scrollInfo.hasHorizontalScroll && scrollInfo.scrollWidth > scrollInfo.clientWidth + 10
        if (currentShouldShow === shouldShow) {
          prevHasHorizontalScrollRef.current = shouldShow
        }
      }, 500) // 500ms 延遲，大幅減少閃爍
      return () => clearTimeout(timeoutId)
    }
  }, [scrollInfo.hasHorizontalScroll, scrollInfo.scrollWidth, scrollInfo.clientWidth])

  // 監聽卷軸拖動（支持滑鼠和觸控）
  useEffect(() => {
    if (!isDraggingScrollbar) return

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const container = document.getElementById('ideas-container')
      if (!container || !scrollbarRef.current) return

      const scrollbarRect = scrollbarRef.current.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clickX = clientX - scrollbarRect.left
      const percentage = Math.max(0, Math.min(1, clickX / scrollbarRect.width))
      
      const maxScroll = scrollInfo.scrollWidth - scrollInfo.clientWidth
      container.scrollLeft = percentage * maxScroll
    }

    const handleEnd = () => {
      setIsDraggingScrollbar(false)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [isDraggingScrollbar, scrollInfo])

  const handleIdeaPositionChange = async (ideaId: string, position: { x: number; y: number }) => {
    if (!userId) return

    // 移除權限檢查：所有用戶都可以拖移任何想法卡片
    const idea = ideas.find((i) => i.id === ideaId)
    if (!idea) return

    // 允許卡片自由移動，包括往上移動到負數位置
    const constrainedPosition = {
      x: position.x,
      y: position.y
    }

    // 在更新狀態前，先保存當前滾動位置（防止拖動時重置）
    const container = document.getElementById('ideas-container')
    if (container) {
      savedScrollLeftRef.current = container.scrollLeft
    }

    // 先更新本地狀態（即時反饋）
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId ? { ...idea, position: constrainedPosition } : idea
      )
    )

    // 清除之前的節流計時器
    const existingTimeout = positionUpdateTimeoutRef.current.get(ideaId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // 記錄當前位置
    lastUpdatePositionRef.current.set(ideaId, constrainedPosition)

    // 設置節流：300ms 後才發送 API 請求
    const timeoutId = setTimeout(async () => {
      try {
        const lastPosition = lastUpdatePositionRef.current.get(ideaId)
        if (!lastPosition) return

        const response = await fetch(`/api/ideas/${ideaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            position: lastPosition,
            rotation: idea.rotation || 0,
            userId,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          // 403 權限錯誤時靜默處理（不顯示錯誤）
          if (response.status === 403) {
            // 靜默處理，不記錄錯誤
            // 恢復到最後已知的有效位置
            await loadIdeas(true) // 保留滾動位置
            return
          }
          
          // 其他錯誤：只有當不是常見的網絡錯誤時才記錄
          // 避免在正常操作中顯示過多錯誤訊息
          if (response.status !== 404 && response.status !== 500) {
            console.warn('更新想法位置失敗:', data.error || '未知錯誤')
          }
          // 恢復到最後已知的有效位置
          await loadIdeas(true) // 保留滾動位置
          return
        }

        // 清除記錄
        lastUpdatePositionRef.current.delete(ideaId)
      } catch (error) {
        console.error('更新想法位置錯誤:', error)
        // 如果失敗，重新載入想法列表以恢復正確位置
        await loadIdeas(true) // 保留滾動位置
      } finally {
        positionUpdateTimeoutRef.current.delete(ideaId)
      }
    }, 300) // 300ms 節流

    positionUpdateTimeoutRef.current.set(ideaId, timeoutId)
  }

  const handleIdeaRotationChange = async (ideaId: string, rotation: number) => {
    if (!userId) return

    // 在更新狀態前，先保存當前滾動位置（防止旋轉時重置）
    const container = document.getElementById('ideas-container')
    if (container) {
      savedScrollLeftRef.current = container.scrollLeft
    }

    // 先更新本地狀態（即時反饋）
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId ? { ...idea, rotation } : idea
      )
    )

    // 同步到資料庫
    try {
      const idea = ideas.find((i) => i.id === ideaId)
      if (idea) {
        await fetch(`/api/ideas/${ideaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            position: idea.position || { x: 50, y: 50 },
            rotation,
            userId,
          }),
        })
      }
    } catch (error) {
      console.error('更新想法旋轉錯誤:', error)
      // 如果失敗，重新載入想法列表
      await loadIdeas(true) // 保留滾動位置
    }
  }

  const handleEditTask = (taskId: string, listId: string) => {
    const list = kanbanLists.find((l) => l.id === listId)
    const task = list?.tasks.find((t) => t.id === taskId)
    
    if (task) {
      // 將 assignees（暱稱陣列）轉換為使用者ID陣列
      const assigneeIds = task.assignees.map((nickname: string) => {
        // 根據暱稱找到對應的使用者ID
        const member = communityMembers.find((m) => m.name === nickname)
        return member ? member.id : null
      }).filter((id: string | null) => id !== null) as string[]

      setEditingTask({ taskId, listId })
      setCurrentListId(listId)
      setIsAddTaskModalOpen(true)
      setOpenTaskMenuId(null)
      
      // 注意：這裡需要等待模態框打開後再設置 initialData
      // 但由於 AddTaskModal 已經有 useEffect 處理 initialData，我們需要在這裡設置
      // 實際上，我們需要修改 AddTaskModal 的 props 來傳遞完整的任務資料
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveTaskId(active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTaskId(null)

    if (!over) return

    const activeTaskId = active.id as string
    
    // 從 over.data 獲取列表ID，或者直接使用 over.id（當拖到空列表時）
    let overListId = over.data.current?.listId as string
    
    // 如果沒有 listId，檢查 over.id 是否是列表ID（用於空列表情況）
    if (!overListId) {
      // 檢查 over.id 是否匹配任何列表ID
      const matchingList = kanbanLists.find(list => list.id === over.id)
      if (matchingList) {
        overListId = matchingList.id
      }
    }

    // 找到被拖拽的任務所在的列表
    let sourceListId = ''
    for (const list of kanbanLists) {
      if (list.tasks.some(t => t.id === activeTaskId)) {
        sourceListId = list.id
        break
      }
    }

    if (!sourceListId || !overListId) {
      console.log('無法確定來源或目標列表', { sourceListId, overListId, over })
      return
    }

    // 如果沒有移動到不同的列表，則不做任何操作
    if (sourceListId === overListId && !over.data.current?.sortable) return

    try {
      // 調用 API 移動任務
      const response = await fetch(
        `/api/communities/${communityId}/kanban/tasks/${activeTaskId}/move`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetListId: overListId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '移動任務失敗')
      }

      // 重新載入 Kanban 資料以更新 UI
      await loadKanban()
    } catch (error: any) {
      console.error('移動任務錯誤:', error)
      alert(error.message || '移動任務失敗')
    }
  }

  const handleDeleteTask = async (taskId: string, listId: string) => {
    if (!communityId) {
      alert('社群資訊錯誤')
      return
    }

    setOpenTaskMenuId(null)

    // 使用瀏覽器原生確認對話框
    if (window.confirm('確定要刪除此任務嗎？此操作無法復原。')) {
      try {
        const response = await fetch(
          `/api/communities/${communityId}/kanban?type=task&id=${taskId}`,
          {
            method: 'DELETE',
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '刪除任務失敗')
        }

        // 重新載入 Kanban 資料
        await loadKanban()
        alert('任務已刪除')
      } catch (error: any) {
        console.error('刪除任務錯誤:', error)
        alert(error.message || '刪除任務失敗')
      }
    }
  }

  const handleCloseAddTaskModal = () => {
    setIsAddTaskModalOpen(false)
    setEditingTask(null)
  }

  // 點擊外部關閉任務選單
  useEffect(() => {
    if (!openTaskMenuId) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // 檢查點擊是否在選單內或三個點按鈕上
      const isClickInsideMenu = target.closest('.task-menu-container')
      const isClickOnMenuButton = target.closest('.task-menu-button')
      
      if (!isClickInsideMenu && !isClickOnMenuButton) {
        setOpenTaskMenuId(null)
      }
    }

    // 使用 setTimeout 確保在當前事件處理完成後再添加監聽器
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openTaskMenuId])

  // 計算多久前創立的任務
  const getTimeAgo = (createdAt: string): string => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return '剛剛'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}分鐘前`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}小時前`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}天前`
    } else if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800)
      return `${weeks}週前`
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000)
      return `${months}個月前`
    } else {
      const years = Math.floor(diffInSeconds / 31536000)
      return `${years}年前`
    }
  }

  // 格式化日期範圍
  const formatDateRange = (startDate: string, endDate: string): string => {
    // 處理日期格式：可能是 ISO 格式或 YYYY-MM-DD 格式
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return ''
      // 如果是 ISO 格式，提取日期部分
      const date = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
      // 轉換為 YYYY/MM/DD 格式
      return date.replace(/-/g, '/')
    }
    
    if (!startDate && !endDate) return ''
    if (!startDate) return formatDate(endDate)
    if (!endDate) return formatDate(startDate)
    return `${formatDate(startDate)}~${formatDate(endDate)}`
  }

  // 獲取成員信息（根據使用者ID）
  const getMemberInfo = (userId: string) => {
    // 先從 fullCommunityMembers 查找（包含 account）
    const fullMember = fullCommunityMembers.find((m) => m.userId === userId)
    if (fullMember) {
      return { name: fullMember.nickname, account: fullMember.account }
    }
    // 再從 communityMembers 查找
    const member = communityMembers.find((m) => m.id === userId)
    if (member) {
      return { name: member.name, account: member.id } // 使用 id 作為 account 的備用值
    }
    // 如果找不到，返回預設值
    return { name: '未知', account: userId }
  }

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

  // 計算所有成員的顏色映射（確保相同姓氏的成員使用不同顏色）
  const userColorMap = useMemo(() => {
    const colorMap = new Map<string, string>()
    
    if (fullCommunityMembers.length === 0) {
      return colorMap
    }
    
    // 按姓氏分組成員
    const surnameGroups = new Map<string, Array<{ userId: string; nickname: string }>>()
    
    fullCommunityMembers.forEach(member => {
      const surname = member.nickname ? member.nickname.charAt(0) : ''
      if (!surnameGroups.has(surname)) {
        surnameGroups.set(surname, [])
      }
      surnameGroups.get(surname)!.push({
        userId: member.userId,
        nickname: member.nickname
      })
    })
    
    // 為每個姓氏組分配顏色
    surnameGroups.forEach((members, surname) => {
      // 計算每個成員的初始顏色（基於 userId hash）
      const memberColors = members.map(member => {
        let hash = 0
        for (let i = 0; i < member.userId.length; i++) {
          const char = member.userId.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash
        }
        const index = Math.abs(hash) % USER_COLORS.length
        return {
          userId: member.userId,
          initialColor: USER_COLORS[index],
          initialIndex: index
        }
      })
      
      // 檢查是否有顏色衝突
      const usedColors = new Set<string>()
      const assignedColors = new Map<string, string>()
      
      // 第一輪：分配沒有衝突的顏色
      memberColors.forEach(({ userId, initialColor }) => {
        if (!usedColors.has(initialColor)) {
          usedColors.add(initialColor)
          assignedColors.set(userId, initialColor)
        }
      })
      
      // 第二輪：為有衝突的成員分配未使用的顏色
      memberColors.forEach(({ userId, initialColor, initialIndex }) => {
        if (!assignedColors.has(userId)) {
          // 找一個未使用的顏色
          for (let i = 0; i < USER_COLORS.length; i++) {
            const color = USER_COLORS[(initialIndex + i) % USER_COLORS.length]
            if (!usedColors.has(color)) {
              usedColors.add(color)
              assignedColors.set(userId, color)
              break
            }
          }
          // 如果所有顏色都被使用，使用初始顏色（極端情況）
          if (!assignedColors.has(userId)) {
            assignedColors.set(userId, initialColor)
          }
        }
      })
      
      // 將分配的顏色加入映射表
      assignedColors.forEach((color, userId) => {
        colorMap.set(userId, color)
      })
    })
    
    return colorMap
  }, [fullCommunityMembers])
  
  // 根據使用者ID獲取顏色
  const getUserColor = (userId: string, nickname?: string): string => {
    if (!userId) return USER_COLORS[0]
    
    // 如果顏色映射表中有該使用者，直接返回
    if (userColorMap.has(userId)) {
      return userColorMap.get(userId)!
    }
    
    // 如果顏色映射表中沒有（可能是外部使用者或成員列表未載入），使用原本的 hash 邏輯
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    const index = Math.abs(hash) % USER_COLORS.length
    return USER_COLORS[index]
  }

  // 共備活動：一進社群就要看到教案共編畫面（含預覽教案、歷史活動）；尚無活動時顯示空白編輯器
  const showCoPrepLessonEditor = activeTab === 'activities' && !!communityId

  // 全域 header（社群名稱返回鈕 + 通知 + 帳號），在主 layout 與共備活動頁共用同一份
  const globalHeader = (
    <div className="bg-[#FAFAFA] px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between flex-shrink-0">
      {/* 左側：社群圖標和名稱（可點擊返回） */}
      <button
        onClick={onBack}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        title="返回已加入社群"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="9"
              cy="7"
              r="4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">{communityName}</h2>
      </button>

      {/* 右側：通知和用戶頭像 */}
      <div className="flex items-center gap-6">
        {userId && (
          <NotificationBell
            userId={userId}
            communityId={communityId || undefined}
          />
        )}
        <div className="relative">
          <div
            ref={avatarRef}
            onClick={handleAvatarClick}
            className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: userId ? getUserColor(userId, userNickname) : 'rgba(138,99,210,0.9)' }}
          >
            <span className="text-white font-semibold text-sm">
              {userNickname.charAt(0).toUpperCase()}
            </span>
          </div>
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              <div className="px-4 py-3">
                <div className="text-gray-900 text-base mb-1">{userNickname}</div>
                <div className="text-sm text-gray-600">{userAccount}</div>
              </div>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                登出
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const convergenceResults = showCoPrepLessonEditor && viewingActivity
    ? ideas
        .filter((idea) => idea.isConvergence && idea.activityId === viewingActivity.id)
        .map((idea) => ({
          id: idea.id,
          stage: idea.stage,
          title: idea.title,
          content: idea.content,
          createdDate: idea.createdDate,
          createdTime: idea.createdTime,
        }))
    : []

  const headerTitle = viewingActivity ? activityDisplayLabel(viewingActivity) : '共備教案'

  return (
    <div className="w-full min-h-screen bg-[#F5F3FA] flex flex-col md:flex-row">
      {/* 左側導航欄 - 固定，捲動時不跟著動；手機版隱藏，桌面版顯示 */}
      <div className="hidden md:flex fixed left-0 top-0 h-screen w-[80px] bg-[#FAFAFA] flex-col items-center py-8 gap-6 z-10">
        {/* 導航選項 */}
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as TabType)}
            className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-100 text-purple-600'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            title={tab.label}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {tab.id === 'resources' && (
                // 資源圖標
                <>
                  <path
                    d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {tab.id === 'activities' && (
                // 共備活動圖標 - 書本
                <>
                  <path
                    d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {tab.id === 'ideas' && (
                // 想法牆圖標 - 發光的燈泡
                <>
                  <circle
                    cx="12"
                    cy="9"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 14.5C9 14.5 9 16 9 17C9 17.5 9.5 18 10 18H14C14.5 18 15 17.5 15 17C15 16 15 14.5 15 14.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 21H14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* 發光效果 */}
                  <path
                    d="M12 2V3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M19 9H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 9H5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M17.5 4.5L16.8 5.2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.5 4.5L7.2 5.2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </>
              )}
              {tab.id === 'teamwork' && (
                // 團隊分工圖標 — 與原「社群管理」相同（雙人）
                <>
                  <path
                    d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {tab.id === 'history' && (
                // 活動歷程圖標
                <>
                  <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2V8H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 13H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 17H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 9H9H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {tab.id === 'management' && (
                // 社群管理圖標 — 三人（左、中、右）
                <>
                  <circle
                    cx="6.5"
                    cy="8.5"
                    r="2.25"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.5 21v-1.25a3.75 3.75 0 0 1 3.75-3.75"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.5 21v-1.5a6.5 6.5 0 0 1 13 0V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="17.5"
                    cy="8.5"
                    r="2.25"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21.5 21v-1.25a3.75 3.75 0 0 0-3.75-3.75"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {tab.id === 'links' && (
                // 好站連結圖標 — 鏈條
                <>
                  <path
                    d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </svg>
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col pb-16 md:pb-0 md:ml-[80px]">
        {/* Header */}
        {globalHeader}

        {/* 共備活動：embedded 模式，沿用此 layout 的 header 與 fixed sidebar */}
        {showCoPrepLessonEditor && (
          <CourseObjectives
            embedded={true}
            activityName={headerTitle}
            activityId={viewingActivity?.id}
            onSidebarClick={handleSidebarClickFromActivity}
            convergenceResults={convergenceResults}
            activities={activities}
            onHistoryDelete={handleDeleteActivity}
            onActivitiesRefresh={loadActivities}
            onCoPrepCompleted={loadActivities}
            onOpenVersionManagement={
              viewingActivity ? () => handleManageVersion(viewingActivity.id) : () => {}
            }
            onVersionCreated={(activityId, versionData) => {
              console.log('版本已創建:', activityId, versionData)
            }}
          />
        )}

        {/* 內容區（非共備活動分頁） */}
        {!showCoPrepLessonEditor && (
        <div className="flex-1 bg-[#FEFBFF] px-4 sm:px-6 md:px-12 py-4 md:py-8">
          {/* 標題欄 */}
          <div className="flex items-center justify-between mb-8">
            {activeTab === 'ideas' ? (
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                <h1 className="shrink-0 text-2xl font-bold text-[#6D28D9]">備課想法牆</h1>
                <p className="text-sm leading-relaxed text-gray-600 sm:flex-1 sm:min-w-0 sm:pt-1">
                  想法牆提供一個促進成員之間意見交流的平台，透過想法發散與收斂的歷程，協助進行討論、整合多元觀點，並逐步凝聚共識。
                </p>
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-[#6D28D9]">
                {activeTab === 'resources' && '社群資源'}
                {activeTab === 'activities' && '共備活動'}
                {activeTab === 'teamwork' && '團隊分工'}
                {activeTab === 'history' && '活動歷程'}
                {activeTab === 'management' && '社群管理'}
                {activeTab === 'links' && '好站連結'}
              </h1>
            )}
            {activeTab === 'resources' && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="*/*"
                />
                <button
                  onClick={handleAddFileClick}
                  className="px-6 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                >
                  + 新增檔案
                </button>
              </>
            )}
          </div>

          {/* 內容區域 */}
          {activeTab !== 'ideas' && activeTab !== 'links' && (
          <div className="bg-white rounded-lg shadow-sm min-h-[400px] p-8">
            {activeTab === 'resources' && (
              <>
                {resources.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
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
                        onDelete={() => handleDeleteResource(resource.id)}
                        onDownload={() => handleDownloadResource(resource.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
            {activeTab === 'activities' && (
              <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-gray-500 px-4 text-center">
                {activities.length === 0 ? (
                  <p className="text-lg">目前沒有共備活動</p>
                ) : activities.every((a) => a.coPrepCompleted) ? (
                  <p className="text-base">
                    目前沒有進行中的共備。請從左側進入共備後，於「歷史活動」分頁檢視已結束的教案。
                  </p>
                ) : (
                  <p className="text-base">
                    已為您開啟教案編輯頁。若要切換活動，請點選頂部分頁的「歷史活動」。
                  </p>
                )}
              </div>
            )}
            {activeTab === 'teamwork' && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="w-full overflow-x-auto">
                  <div className="flex gap-4 min-w-max p-4">
                    {/* 新增列表按鈕 */}
                  {!isAddingList ? (
                    <button
                      onClick={() => setIsAddingList(true)}
                      className="h-fit px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors whitespace-nowrap"
                    >
                      + 新增列表
                    </button>
                  ) : (
                    <div className="w-48 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <input
                        type="text"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddList()
                          } else if (e.key === 'Escape') {
                            setIsAddingList(false)
                            setNewListTitle('')
                          }
                        }}
                        placeholder="輸入列表名稱"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 mb-2"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddList}
                          className="flex-1 px-3 py-1.5 bg-[rgba(138,99,210,0.9)] text-white rounded-lg text-sm font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                        >
                          新增
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingList(false)
                            setNewListTitle('')
                          }}
                          className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Kanban 列表 */}
                  {kanbanLists.map((list) => (
                    <div
                      key={list.id}
                      className="w-48 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col"
                    >
                      {/* 列表標題和刪除按鈕 */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800">{list.title}</h3>
                        <button
                          onClick={() => handleDeleteList(list.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="刪除列表"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M18 6L6 18M6 6L18 18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* 新增任務按鈕 - 緊貼在標題下方 */}
                      <div className="px-4 py-3">
                        <button
                          onClick={() => handleAddTask(list.id)}
                          className="w-full px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                        >
                          新增任務
                        </button>
                      </div>

                      {/* 任務列表區域 */}
                      <SortableContext
                        items={list.tasks.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                        id={list.id}
                      >
                        <DroppableList 
                          id={list.id} 
                          isEmpty={list.tasks.length === 0}
                        >
                          {list.tasks.map((task) => (
                            <DraggableTaskCard
                              key={task.id}
                              id={task.id}
                              task={task}
                              listId={list.id}
                              onEdit={() => handleEditTask(task.id, list.id)}
                              onDelete={() => handleDeleteTask(task.id, list.id)}
                              getUserColor={getUserColor}
                              getMemberInfo={getMemberInfo}
                              formatDateRange={formatDateRange}
                              openMenuId={openTaskMenuId}
                              setOpenMenuId={setOpenTaskMenuId}
                            />
                          ))}
                        </DroppableList>
                      </SortableContext>
                    </div>
                  ))}
                </div>
              </div>
              </DndContext>
            )}
            {activeTab === 'history' && (
              <div className="flex-1 py-4 md:py-6 overflow-x-auto overflow-y-auto w-full" style={{ paddingLeft: '1vw', paddingRight: '1vw' }}>
                <div className="bg-white min-w-0 w-full" style={{ padding: '1.5vw' }}>
                  {/* 圖表切換按鈕 */}
                  <div className="flex flex-row gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto">
                    <button
                      onClick={() => setActiveHistoryChart('contribution')}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                        activeHistoryChart === 'contribution'
                          ? 'bg-[rgba(138,99,210,0.9)] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      貢獻圖
                    </button>
                    <button
                      onClick={() => setActiveHistoryChart('network')}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                        activeHistoryChart === 'network'
                          ? 'bg-[rgba(138,99,210,0.9)] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      網絡圖
                    </button>
                    <button
                      onClick={() => setActiveHistoryChart('trend')}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                        activeHistoryChart === 'trend'
                          ? 'bg-[rgba(138,99,210,0.9)] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      變化圖
                    </button>
                  </div>

                  {activeHistoryChart === 'network' && (
                    <p className="text-sm text-gray-600 mb-3">
                      顯示成員之間在想法互動中的連結關係，用來觀察誰和誰有互動。
                    </p>
                  )}

                  {/* 根據選中的圖表類型顯示對應內容 */}
                  {communityId && (
                    <div className="overflow-x-auto overflow-y-auto min-w-0 w-full">
                      {activeHistoryChart === 'contribution' && (
                        <IdeaContributionChart communityId={communityId} />
                      )}
                      {activeHistoryChart === 'network' && (
                        communityId ? (
                          <NetworkGraph communityId={communityId} />
                        ) : (
                          <div className="flex items-center justify-center h-96 text-gray-400">
                            <p className="text-lg">載入中...</p>
                          </div>
                        )
                      )}
                      {activeHistoryChart === 'trend' && (
                        <IdeaTrendChart communityId={communityId} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'management' && (
              <div className="flex-1 px-4 sm:px-6 md:px-8 py-4 md:py-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {/* 標題 */}
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    所有成員({fullCommunityMembers.length})
                  </h2>

                  {/* 成員列表 */}
                  <div className="space-y-4">
                    {fullCommunityMembers.map((member) => {
                      // 判斷當前用戶是否為管理員
                      const currentUser = fullCommunityMembers.find(m => m.userId === userId)
                      const isCurrentUserAdmin = currentUser?.role === 'admin'
                      const isCurrentUser = member.userId === userId
                      const canManage = isCurrentUserAdmin && !isCurrentUser

                      return (
                        <div 
                          key={member.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            {/* 頭像 */}
                            <div 
                              className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white text-lg font-semibold"
                              style={{ backgroundColor: getUserColor(member.userId, member.nickname) }}
                            >
                              {member.nickname ? member.nickname.charAt(0).toUpperCase() : 'U'}
                            </div>

                            {/* 成員資訊 */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="text-base font-semibold text-gray-800 truncate">
                                  {member.nickname || member.account}
                                </h3>
                                {member.role === 'admin' && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded flex-shrink-0">
                                    管理員
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                {member.school || '未提供學校資訊'}
                              </p>
                            </div>
                          </div>

                          {/* 管理員操作按鈕（只對非自己的成員顯示） */}
                          {canManage && (
                            <div className="flex items-center justify-end gap-2 sm:shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleAdmin(member.userId, member.role === 'admin')
                                }}
                                className="px-3 py-2 text-sm font-medium rounded-lg border border-purple-300 text-purple-700 bg-white hover:bg-purple-50 transition-colors whitespace-nowrap"
                              >
                                {member.role === 'admin' ? '取消管理員' : '設為管理員'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveMember(member.userId, member.nickname || member.account)
                                }}
                                className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-600 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-800 transition-colors whitespace-nowrap"
                              >
                                移出社群
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    
                    {/* 如果沒有成員資料 */}
                    {fullCommunityMembers.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <p>載入中...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* 好站連結 */}
          {activeTab === 'links' && (
            <div className="bg-white rounded-lg shadow-sm min-h-[400px] p-8">
              <p className="text-sm text-gray-500 mb-6">點擊卡片即可在新分頁開啟對應網站。</p>
              <div className="space-y-3">
                {[
                  {
                    name: 'CIRN 教育資源網',
                    desc: '提供課程綱要、教案與教學資源，協助備課規劃。',
                    url: 'https://cirn.moe.edu.tw/',
                  },
                  {
                    name: 'NotebookLM',
                    desc: '可整理教材、摘要重點，協助快速理解與備課。',
                    url: 'https://notebooklm.google.com/',
                  },
                  {
                    name: 'Gemini',
                    desc: 'AI 工具，可協助教案設計、內容生成與靈感發想。',
                    url: 'https://gemini.google.com/',
                  },
                  {
                    name: '康軒數位資源',
                    desc: '提供教材、教案與數位教學資源。',
                    url: 'https://www.knsh.com.tw/',
                  },
                  {
                    name: '南一數位資源',
                    desc: '提供課本配套教材與教學輔助資源。',
                    url: 'https://www.nani.com.tw/',
                  },
                  {
                    name: '翰林數位資源',
                    desc: '提供教學內容、題庫與教案參考。',
                    url: 'https://www.hle.com.tw/',
                  },
                ].map((site) => (
                  <a
                    key={site.url}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 transition-all hover:border-purple-300 hover:shadow-md hover:shadow-purple-100/60 hover:-translate-y-[1px]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {/* favicon */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                          {site.name}
                        </p>
                        <p className="truncate text-xs text-gray-500 mt-0.5">{site.desc}</p>
                      </div>
                    </div>
                    {/* 外部連結 icon 已移除 */}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 想法牆（獨立容器，無白色背景） */}
          {activeTab === 'ideas' && (
            <div className="flex-1 relative overflow-x-auto overflow-y-auto m-2" style={{
              // 手機版：為底部導航欄留出空間，確保底部卷軸可見
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
            }}>
              {/* 想法收斂按鈕 */}
              <button 
                onClick={() => setIsConvergenceModalOpen(true)}
                className="px-6 py-2.5 bg-[rgba(138,99,210,0.9)] hover:bg-[rgba(138,99,210,1)] text-white rounded-lg font-medium transition-colors mb-2"
              >
                想法收斂
              </button>
              
              {/* 邊界線 */}
              <div className="border-t-2 border-gray-300 mb-4"></div>

              {/* 自定義水平卷軸 - 只在手機版顯示，放在想法收斂按鈕下方 */}
              {/* 使用穩定的判斷邏輯，避免頻繁切換 */}
              {isMobile && prevHasHorizontalScrollRef.current && (
                <div className="mb-2 px-0 sm:px-6 md:px-12">
                  <div
                    ref={scrollbarRef}
                    className="relative w-full h-2 bg-gray-200 rounded-full cursor-pointer touch-none"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setIsDraggingScrollbar(true)
                      handleScrollbarDrag(e)
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      setIsDraggingScrollbar(true)
                      handleScrollbarDrag(e)
                    }}
                    onClick={(e) => {
                      if (!isDraggingScrollbar) {
                        handleScrollbarClick(e)
                      }
                    }}
                    onTouchEnd={(e) => {
                      if (!isDraggingScrollbar) {
                        handleScrollbarClick(e)
                      }
                    }}
                  >
                    <div
                      className="absolute top-0 h-2 rounded-full transition-all"
                      style={{
                        backgroundColor: '#d1d5db', // 使用灰色，與垂直卷軸顏色一致
                        left: scrollInfo.scrollWidth > scrollInfo.clientWidth
                          ? `${(scrollInfo.scrollLeft / Math.max(1, scrollInfo.scrollWidth - scrollInfo.clientWidth)) * 100}%`
                          : '0%',
                        width: `${Math.min(100, (scrollInfo.clientWidth / Math.max(1, scrollInfo.scrollWidth)) * 100)}%`,
                        minWidth: '20px',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 想法內容區域 - 使用可縮放容器 */}
              <div className="px-0 sm:px-6 md:px-12 min-w-max">
                <ZoomableIdeasContainer 
                  containerId="ideas-container"
                  communityId={communityId || undefined}
                  onScrollInfoChange={setScrollInfo}
                >
                  {ideas.length === 0 ? (
                    <div className="text-gray-400 text-center py-12">
                      <p>目前還沒有想法</p>
                    </div>
                  ) : (
                    <>
                      {/* 想法卡片 - 自由拖拉布局 */}
                      <div className="relative" style={{ minHeight: '600px', minWidth: 'max-content', width: 'max-content' }}>
                        {ideas.map((idea, index) => {
                          // 根據 creatorName（nickname）從 communityMembers 中找到對應的 userId
                          const creatorMember = communityMembers.find(
                            (m) => m.name === idea.creatorName
                          )
                          const creatorId = creatorMember?.id || undefined
                          
                          return (
                            <DraggableIdeaCard
                              key={idea.id}
                              id={idea.id}
                              index={index}
                              stage={idea.stage}
                              title={idea.title}
                              createdDate={idea.createdDate}
                              createdTime={idea.createdTime}
                              creatorName={idea.creatorName}
                              creatorAvatar={idea.creatorAvatar}
                              creatorId={creatorId}
                              position={idea.position || { x: 50 + index * 200, y: 50 }}
                              rotation={idea.rotation || 0}
                              onClick={() => handleEditIdea(idea.id)}
                              onPositionChange={handleIdeaPositionChange}
                              onRotationChange={handleIdeaRotationChange}
                              isConvergence={idea.isConvergence}
                            />
                          )
                        })}
                      </div>
                      
                      {/* 箭頭連接線層 - 使用單一 SVG 覆蓋層 */}
                      <ArrowsOverlay ideas={ideas} />
                    </>
                  )}
                </ZoomableIdeasContainer>
              </div>

              {/* 右下角浮動新增按鈕 - 手機版和桌面版都顯示 */}
              <button
                onClick={() => setIsAddIdeaModalOpen(true)}
                className="fixed right-4 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 bg-[rgba(138,99,210,0.9)] hover:bg-[rgba(138,99,210,1)] rounded-full shadow-lg flex items-center justify-center text-white text-2xl font-light transition-colors z-50"
                style={{ 
                  // 確保按鈕在手機版上也能顯示，避免被底部導航欄遮擋
                  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)', // 手機版：底部導航欄高度約 80px
                }}
              >
                +
              </button>
            </div>
          )}
        </div>
        )}
      </div>

      {/* 新增/編輯活動模態框 */}
      <AddActivityModal
        isOpen={isAddActivityModalOpen}
        onClose={handleCloseAddActivityModal}
        onAdd={handleAddActivity}
        editMode={!!editingActivity}
        initialData={
          editingActivity
            ? {
                name: editingActivity.name,
                introduction: editingActivity.introduction,
              }
            : undefined
        }
        onManageVersion={
          editingActivity
            ? () => {
                setIsAddActivityModalOpen(false)
                handleManageVersion(editingActivity.id)
              }
            : undefined
        }
      />

      {/* 新增/編輯任務模態框 */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={handleCloseAddTaskModal}
        onSubmit={handleSubmitTask}
        communityMembers={communityMembers}
        editMode={!!editingTask}
        initialData={
          editingTask
            ? (() => {
                const list = kanbanLists.find((l) => l.id === editingTask.listId)
                const task = list?.tasks.find((t) => t.id === editingTask.taskId)
                if (task) {
                  // 將 assignees（暱稱陣列）轉換為使用者ID陣列
                  const assigneeIds = task.assignees.map((nickname: string) => {
                    const member = communityMembers.find((m) => m.name === nickname)
                    return member ? member.id : null
                  }).filter((id: string | null) => id !== null) as string[]

                  return {
                    category: task.title,
                    content: task.content,
                    startDate: task.startDate,
                    endDate: task.endDate,
                    assignees: assigneeIds, // 轉換為使用者ID陣列
                  }
                }
                return undefined
              })()
            : undefined
        }
      />

      {/* 新增想法模態框 */}
      <AddIdeaModal
        isOpen={isAddIdeaModalOpen}
        onClose={() => {
          setIsAddIdeaModalOpen(false)
          setExtendingFromIdeaId(null) // 清除延伸來源
        }}
        onSubmit={handleAddIdea}
        communityId={communityId || undefined}
        existingStages={[...new Set(ideas.map((i) => i.stage).filter(Boolean))]}
      />

      {/* 編輯想法模態框 */}
      {editingIdea && (
        <EditIdeaModal
          isOpen={isEditIdeaModalOpen}
          onClose={handleCloseEditIdeaModal}
          onSave={handleSaveIdea}
          onDelete={handleDeleteIdea}
          showDeleteButton={
            Boolean(userId && editingIdea.creatorId && editingIdea.creatorId === userId)
          }
          onExtend={handleExtendIdea}
          ideaId={editingIdea.id}
          initialData={{
            activityId: editingIdea.activityId,
            stage: editingIdea.stage,
            title: editingIdea.title,
            content: editingIdea.content,
          }}
          isConvergence={editingIdea.isConvergence}
          communityId={communityId || undefined}
          lastEditedByName={editingIdea.lastEditedByName}
          lastEditedAt={editingIdea.lastEditedAt}
        />
      )}

      {/* 想法收斂模態框 */}
      {isConvergenceModalOpen && (
        <ConvergenceModal
          ideas={ideas}
          onClose={() => setIsConvergenceModalOpen(false)}
          onSubmit={handleConvergenceSubmit}
          communityId={communityId || undefined}
          userId={userId}
          userAccount={userAccount}
        />
      )}

      {/* 版本管理視窗 */}
      <VersionControlModal
        isOpen={isVersionControlModalOpen}
        onClose={handleCloseVersionControlModal}
        activityId={versionControlActivityId || ''}
        onRestore={handleRestoreVersion}
      />

      <IdeaWallOnboardingModal
        open={showIdeaWallOnboarding}
        onDismiss={() => {
          markIdeaWallOnboardingSeen(userId)
          setShowIdeaWallOnboarding(false)
        }}
      />

      <KanbanOnboardingModal
        open={showKanbanOnboarding}
        onDismiss={() => {
          markKanbanOnboardingSeen(userId)
          setShowKanbanOnboarding(false)
        }}
      />

      {showNetworkGraphOnboardingModal && (
        <>
          <div className="fixed inset-0 z-[110] bg-black/50" aria-hidden />
          <div className="fixed inset-0 z-[111] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="network-graph-onboarding-title"
            >
              <div className="flex items-center justify-end px-5 pt-4 pb-2 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    markNetworkGraphOnboardingSeen(userId)
                    setShowNetworkGraphOnboardingModal(false)
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="關閉"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="px-6 pt-2 pb-4 overflow-y-auto flex-1">
                <h2
                  id="network-graph-onboarding-title"
                  className="text-xl font-bold text-gray-900 text-center mb-3"
                >
                  網絡圖操作提示
                </h2>
                <ul className="text-gray-600 text-sm leading-relaxed space-y-3 list-decimal pl-5">
                  <li>球體可拖曳移動位置</li>
                  <li>可使用滑鼠滾輪放大縮小</li>
                  <li>點擊球體右側可查看詳細資訊</li>
                </ul>
              </div>
              <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/80">
                <button
                  type="button"
                  onClick={() => {
                    markNetworkGraphOnboardingSeen(userId)
                    setShowNetworkGraphOnboardingModal(false)
                  }}
                  className="px-6 py-2.5 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors shadow-sm"
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 手機版底部導航欄 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around py-2 z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as TabType)}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'text-purple-600'
                : 'text-gray-600'
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={activeTab === tab.id ? 'text-purple-600' : 'text-gray-600'}
            >
              {tab.id === 'resources' && (
                <path
                  d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {tab.id === 'activities' && (
                <>
                  <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2V8H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {tab.id === 'ideas' && (
                <path
                  d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {tab.id === 'teamwork' && (
                <>
                  <path
                    d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {tab.id === 'history' && (
                <>
                  <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2V8H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {tab.id === 'management' && (
                <>
                  <circle
                    cx="6.5"
                    cy="8.5"
                    r="2.25"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.5 21v-1.25a3.75 3.75 0 0 1 3.75-3.75"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="7"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.5 21v-1.5a6.5 6.5 0 0 1 13 0V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="17.5"
                    cy="8.5"
                    r="2.25"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21.5 21v-1.25a3.75 3.75 0 0 0-3.75-3.75"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {tab.id === 'links' && (
                <>
                  <path
                    d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </svg>
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}



