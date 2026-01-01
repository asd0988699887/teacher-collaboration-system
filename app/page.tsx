'use client'

import { useState } from 'react'
import CommunityOverview from './components/CommunityOverview'
import Login from './components/Login'
import Register from './components/Register'
import ResetPassword from './components/ResetPassword'

type PageView = 'login' | 'register' | 'reset-password' | 'community'

/**
 * 首頁 - 包含登入、註冊、重設密碼與社群總覽
 */
export default function Home() {
  const [currentView, setCurrentView] = useState<PageView>('login')

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

  return renderView()
}
