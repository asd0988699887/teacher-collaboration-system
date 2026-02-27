'use client'

import { useState } from 'react'

interface RegisterProps {
  onSwitchToLogin: () => void
  onRegisterSuccess: () => void
}

/**
 * 註冊頁面元件
 * 符合教師共同備課系統的紫色系風格
 */
export default function Register({ 
  onSwitchToLogin,
  onRegisterSuccess 
}: RegisterProps) {
  const [accountNumber, setAccountNumber] = useState('')
  const [nickname, setNickname] = useState('')
  const [school, setSchool] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    // 清除之前的錯誤訊息
    setError('')

    // 驗證必填欄位
    if (!accountNumber || !nickname || !email || !password) {
      setError('請填寫所有必填欄位')
      return
    }

    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('請輸入有效的電子郵件地址（必須包含 @ 符號和網域）')
      return
    }

    // 驗證密碼長度
    if (password.length < 6) {
      setError('密碼長度至少需要 6 個字元')
      return
    }

    // 驗證密碼
    if (password !== confirmPassword) {
      setError('密碼與確認密碼不相符')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: accountNumber,
          nickname,
          school,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '註冊失敗，請稍後再試')
        setIsLoading(false)
        return
      }

      // 註冊成功，儲存使用者資料到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          userId: data.user.id,
          accountNumber: data.user.account,
          nickname: data.user.nickname,
          email: data.user.email,
          school: data.user.school,
        }))
      }

      onRegisterSuccess()
    } catch (error: any) {
      console.error('註冊錯誤:', error)
      setError('註冊失敗，請稍後再試')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* 左側插圖區域：標題與插圖往上對齊，不貼底 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-50 to-purple-100 items-start justify-center p-12 pt-20 lg:pt-24">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            教師共同備課系統
          </h1>
          
          {/* 多位教師協作備課插圖 */}
          <div className="mt-6">
            <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 陰影 */}
              <ellipse cx="130" cy="380" rx="80" ry="15" fill="#E9D5FF" opacity="0.3"/>
              <ellipse cx="270" cy="380" rx="80" ry="15" fill="#E9D5FF" opacity="0.3"/>
              
              {/* 左側教師 */}
              <circle cx="130" cy="130" r="35" fill="#FDE68A"/>
              <path d="M95 115 Q95 95 110 92 Q125 89 130 89 Q135 89 150 92 Q165 95 165 115 Q165 125 130 125 Q95 125 95 115 Z" fill="#1F2937"/>
              <circle cx="120" cy="130" r="4" fill="#1F2937"/>
              <circle cx="140" cy="130" r="4" fill="#1F2937"/>
              <path d="M120 142 Q130 148 140 142" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round"/>
              
              {/* 左側教師身體 */}
              <path d="M100 170 Q100 155 115 155 L145 155 Q160 155 160 170 L160 250 Q160 265 145 265 L115 265 Q100 265 100 250 Z" fill="#C084FC"/>
              <path d="M100 190 Q80 210 70 240" stroke="#C084FC" strokeWidth="20" strokeLinecap="round"/>
              <circle cx="70" cy="240" r="12" fill="#FDE68A"/>
              <path d="M160 190 Q170 210 180 240" stroke="#C084FC" strokeWidth="20" strokeLinecap="round"/>
              <circle cx="180" cy="240" r="12" fill="#FDE68A"/>
              
              {/* 左側腿 */}
              <path d="M115 265 L115 300" stroke="#A855F7" strokeWidth="18" strokeLinecap="round"/>
              <path d="M145 265 L145 300" stroke="#A855F7" strokeWidth="18" strokeLinecap="round"/>
              <ellipse cx="115" cy="303" rx="15" ry="10" fill="#1F2937"/>
              <ellipse cx="145" cy="303" rx="15" ry="10" fill="#1F2937"/>
              
              {/* 右側教師 */}
              <circle cx="270" cy="140" r="35" fill="#FDE68A"/>
              <path d="M235 125 Q235 105 250 102 Q265 99 270 99 Q275 99 290 102 Q305 105 305 125 Q305 135 270 135 Q235 135 235 125 Z" fill="#1F2937"/>
              <circle cx="260" cy="140" r="4" fill="#1F2937"/>
              <circle cx="280" cy="140" r="4" fill="#1F2937"/>
              <path d="M260 152 Q270 158 280 152" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round"/>
              
              {/* 右側教師身體 */}
              <path d="M240 180 Q240 165 255 165 L285 165 Q300 165 300 180 L300 260 Q300 275 285 275 L255 275 Q240 275 240 260 Z" fill="#7C3AED"/>
              <path d="M300 200 Q320 220 330 250" stroke="#7C3AED" strokeWidth="20" strokeLinecap="round"/>
              <circle cx="330" cy="250" r="12" fill="#FDE68A"/>
              <path d="M240 200 Q230 220 220 250" stroke="#7C3AED" strokeWidth="20" strokeLinecap="round"/>
              <circle cx="220" cy="250" r="12" fill="#FDE68A"/>
              
              {/* 右側腿 */}
              <path d="M255 275 L255 310" stroke="#6D28D9" strokeWidth="18" strokeLinecap="round"/>
              <path d="M285 275 L285 310" stroke="#6D28D9" strokeWidth="18" strokeLinecap="round"/>
              <ellipse cx="255" cy="313" rx="15" ry="10" fill="#1F2937"/>
              <ellipse cx="285" cy="313" rx="15" ry="10" fill="#1F2937"/>
              
              {/* 中間的文件/教案 */}
              <rect x="170" y="220" width="60" height="80" rx="4" fill="#FFF" stroke="#A855F7" strokeWidth="3"/>
              <line x1="178" y1="235" x2="222" y2="235" stroke="#C084FC" strokeWidth="3" strokeLinecap="round"/>
              <line x1="178" y1="245" x2="215" y2="245" stroke="#E9D5FF" strokeWidth="3" strokeLinecap="round"/>
              <line x1="178" y1="255" x2="222" y2="255" stroke="#E9D5FF" strokeWidth="3" strokeLinecap="round"/>
              <line x1="178" y1="265" x2="210" y2="265" stroke="#E9D5FF" strokeWidth="3" strokeLinecap="round"/>
              <line x1="178" y1="275" x2="222" y2="275" stroke="#E9D5FF" strokeWidth="3" strokeLinecap="round"/>
              <line x1="178" y1="285" x2="218" y2="285" stroke="#E9D5FF" strokeWidth="3" strokeLinecap="round"/>
              
              {/* 星星裝飾 */}
              <path d="M320 100 L323 107 L331 108 L325 113 L327 121 L320 116 L313 121 L315 113 L309 108 L317 107 Z" fill="#C084FC"/>
              <path d="M80 90 L82 95 L88 96 L83 100 L85 106 L80 102 L75 106 L77 100 L72 96 L78 95 Z" fill="#A855F7"/>
              <path d="M350 180 L352 185 L358 186 L353 190 L355 196 L350 192 L345 196 L347 190 L342 186 L348 185 Z" fill="#DDD6FE"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 右側註冊表單 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* 頂部歡迎文字 */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">歡迎來到 <span className="text-purple-600 font-semibold">教師共同備課系統</span></p>
            <h2 className="text-3xl font-bold text-gray-800">註冊帳號</h2>
          </div>

          {/* 註冊表單 */}
          <div className="space-y-5">
            {/* 帳號欄位 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                帳號
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder=""
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* 暱稱欄位 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                暱稱
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder=""
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* 學校欄位 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                學校
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder=""
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* 電子郵件欄位 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電子郵件
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* 密碼欄位 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* 確認密碼欄位 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                確認密碼
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=""
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* 錯誤訊息 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* 註冊按鈕 */}
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '註冊中...' : '註冊'}
            </button>

            {/* 底部連結 */}
            <div className="text-center text-sm">
              <span className="text-gray-600">已經有帳號了？</span>{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
              >
                返回登入
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

