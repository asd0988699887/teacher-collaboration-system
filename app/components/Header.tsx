'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import NotificationBell from './NotificationBell'
import { clearCommunityOnboardingOnLogout } from '@/lib/communityOnboardingStorage'
import { clearIdeaWallOnboardingOnLogout } from '@/lib/ideaWallOnboardingStorage'
import { clearNetworkGraphOnboardingOnLogout } from '@/lib/networkGraphOnboardingStorage'
import { clearKanbanOnboardingOnLogout } from '@/lib/kanbanOnboardingStorage'
import { clearCoPrepOnboardingOnLogout } from '@/lib/coPrepOnboardingStorage'
import { clearActivityEntryTourOnLogout } from '@/lib/activityEntryTourStorage'

// 用戶顏色陣列（與其他組件保持一致）
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
const getUserColor = (userId: string | null): string => {
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

function BrandLogo() {
  return (
    <div className="w-[24px] h-[24px] md:w-[30px] md:h-[30px] bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
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
  )
}

/**
 * Header 組件
 * 包含 Logo 和使用者頭像
 */
interface HeaderProps {
  communityId?: string // 可選的社群ID，用於過濾通知
  /** 左側品牌標題；列表頁傳「共備活動」，詳情頁維持預設 */
  brandTitle?: string
  /** 外層列表頁：在標題右側顯示導覽切換 */
  showOverviewNav?: boolean
  usefulLinksActive?: boolean
  personalResourcesActive?: boolean
  onUsefulLinksToggle?: () => void
  onPersonalResourcesToggle?: () => void
  /** 外層列表頁：點擊左側「共備活動」回到總覽 */
  onBrandClick?: () => void
}

export default function Header({
  communityId,
  brandTitle = '共備社群',
  showOverviewNav = false,
  usefulLinksActive = false,
  personalResourcesActive = false,
  onUsefulLinksToggle,
  onPersonalResourcesToggle,
  onBrandClick,
}: HeaderProps = {}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)

  // 從 localStorage 讀取使用者資料（如果有的話）
  const [userNickname, setUserNickname] = useState('使用者')
  const [userAccount, setUserAccount] = useState('未登入')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // 從 localStorage 載入使用者資料
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUserNickname(userData.nickname || '使用者')
          setUserAccount(userData.accountNumber || userData.email || '未登入')
          setUserId(userData.id || userData.userId || null)
        } catch (e) {
          // 忽略解析錯誤
        }
      }
    }
  }, [])

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
      clearActivityEntryTourOnLogout()
      localStorage.removeItem('user')
      // 重新載入頁面以回到登入畫面
      window.location.href = '/'
    }
    setIsDropdownOpen(false)
  }

  return (
    <header className="w-full bg-[#FAFAFA] px-4 sm:px-8 md:px-16 py-3 flex items-center justify-between relative">
      {/* Logo 區域 */}
      <div className="flex items-center gap-2 md:gap-4">
        {onBrandClick ? (
          <button
            type="button"
            onClick={onBrandClick}
            className="flex items-center gap-2 md:gap-4 rounded-lg hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
            title="回到共備活動總覽"
          >
            <BrandLogo />
            <span className="text-base md:text-lg font-semibold text-gray-800 whitespace-nowrap">
              {brandTitle}
            </span>
          </button>
        ) : (
          <>
            <BrandLogo />
            <span className="text-base md:text-lg font-semibold text-gray-800 whitespace-nowrap">
              {brandTitle}
            </span>
          </>
        )}
        {showOverviewNav && (
          <nav className="ml-2 md:ml-4 flex items-center gap-1">
            <button
              type="button"
              onClick={onUsefulLinksToggle}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                usefulLinksActive
                  ? 'bg-purple-100 text-purple-800'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-purple-700'
              }`}
              aria-pressed={usefulLinksActive}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
                aria-hidden
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              好站連結
            </button>
            <button
              type="button"
              onClick={onPersonalResourcesToggle}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                personalResourcesActive
                  ? 'bg-purple-100 text-purple-800'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-purple-700'
              }`}
              aria-pressed={personalResourcesActive}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
                aria-hidden
              >
                <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z" />
              </svg>
              個人資源
            </button>
          </nav>
        )}
      </div>

      {/* 右側使用者區域 */}
      <div className="flex items-center gap-4">
        {/* 通知鈴鐺 */}
        {userId && <NotificationBell userId={userId} communityId={communityId} />}

        {/* 使用者頭像與下拉選單 */}
        <div className="relative">
        {/* 使用者頭像 */}
          <div
            ref={avatarRef}
            onClick={handleAvatarClick}
            className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: getUserColor(userId) }}
          >
            <span className="text-white font-semibold text-sm">
              {userNickname.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* 下拉選單 */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              {/* 使用者資訊 */}
              <div className="px-4 py-3">
                <div className="font-semibold text-gray-900 text-base mb-1">
                  {userNickname}
                </div>
                <div className="text-sm text-gray-600">
                  {userAccount}
                </div>
              </div>

              {/* 分隔線 */}
              <div className="border-t border-gray-200 my-1"></div>

              {/* 登出 */}
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
    </header>
  )
}

