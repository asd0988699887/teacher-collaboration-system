'use client'

import { useState, useEffect } from 'react'
import CommunityOverview from './components/CommunityOverview'
import Login from './components/Login'
import Register from './components/Register'
import ResetPassword from './components/ResetPassword'

type PageView = 'login' | 'register' | 'reset-password' | 'community'

/**
 * 首頁 - 包含登入、註冊、重設密碼與社群總覽
 * 重新整理時若 localStorage 有 user 則維持登入狀態
 */
export default function Home() {
  const [currentView, setCurrentView] = useState<PageView>('login')
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  // 載入時還原登入狀態，避免重新整理後回到登入頁
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const user = JSON.parse(raw)
        if (user && (user.id || user.userId)) {
          setCurrentView('community')
        }
      }
    } catch (_) {
      // 忽略格式錯誤
    }
    setHasCheckedAuth(true)
  }, [])

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return (
          <Login
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToResetPassword={() => setCurrentView('reset-password')}
            onLoginSuccess={() => setCurrentView('community')}
          />
        )
      case 'register':
        return (
          <Register
            onSwitchToLogin={() => setCurrentView('login')}
            onRegisterSuccess={() => setCurrentView('community')}
          />
        )
      case 'reset-password':
        return (
          <ResetPassword
            onSwitchToLogin={() => setCurrentView('login')}
            onSwitchToRegister={() => setCurrentView('register')}
          />
        )
      case 'community':
        return (
          <CommunityOverview onNavigateToLogin={() => setCurrentView('login')} />
        )
      default:
        return null
    }
  }

  // 尚未檢查完 localStorage 前先顯示載入，避免短暫閃出登入頁
  if (!hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3FA]">
        <p className="text-gray-500">載入中...</p>
      </div>
    )
  }

  return renderView()
}
