'use client'

import { useState } from 'react'

interface LoginProps {
  onSwitchToRegister: () => void
  onSwitchToResetPassword: () => void
  onLoginSuccess: () => void
}

/**
 * 登入頁面元件
 * 符合教師共同備課系統的紫色系風格
 */
export default function Login({ 
  onSwitchToRegister, 
  onSwitchToResetPassword,
  onLoginSuccess 
}: LoginProps) {
  const [accountNumber, setAccountNumber] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    // 清除之前的錯誤訊息
    setError('')

    // 驗證必填欄位
    if (!accountNumber || !password) {
      setError('請輸入帳號和密碼')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountNumber,
          password,
        }),
      })

      const data = await response.json()

      // 調試日誌
      console.log('登入 API 回應:', {
        ok: response.ok,
        status: response.status,
        data: data
      })

      if (!response.ok || !data.success || !data.user) {
        console.log('登入失敗:', {
          responseOk: response.ok,
          dataSuccess: data.success,
          hasUser: !!data.user,
          error: data.error
        })
        setError(data.error || '登入失敗，請稍後再試')
        setIsLoading(false)
        return
      }

      console.log('登入成功，準備儲存使用者資料')

      // 登入成功，儲存使用者資料到 localStorage
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

      onLoginSuccess()
    } catch (error: any) {
      console.error('登入錯誤:', error)
      setError('登入失敗，請稍後再試')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* 左側插圖區域 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-50 to-purple-100 items-center justify-center p-12">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            教師共同備課系統
          </h1>
          
          {/* 多位教師共同備課插圖 */}
          <div className="mt-8">
            <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 陰影 */}
              <ellipse cx="120" cy="370" rx="70" ry="15" fill="#E9D5FF" opacity="0.3"/>
              <ellipse cx="200" cy="370" rx="70" ry="15" fill="#E9D5FF" opacity="0.3"/>
              <ellipse cx="280" cy="370" rx="70" ry="15" fill="#E9D5FF" opacity="0.3"/>
              
              {/* 燈泡 - 創意符號（移到最上方）*/}
              <circle cx="200" cy="40" r="22" fill="#FCD34D" opacity="0.9"/>
              <path d="M191 62 L200 62 L205 76 L195 76 Z" fill="#F59E0B"/>
              <rect x="193" y="76" width="14" height="4" rx="2" fill="#D97706"/>
              
              {/* 對話泡泡 - 表示討論（移到頭部上方）*/}
              <ellipse cx="120" cy="85" rx="32" ry="22" fill="#FFF" stroke="#C084FC" strokeWidth="2"/>
              <line x1="100" y1="82" x2="140" y2="82" stroke="#C084FC" strokeWidth="2" strokeLinecap="round"/>
              <line x1="100" y1="88" x2="133" y2="88" stroke="#C084FC" strokeWidth="2" strokeLinecap="round"/>
              
              <ellipse cx="280" cy="85" rx="32" ry="22" fill="#FFF" stroke="#A855F7" strokeWidth="2"/>
              <line x1="260" y1="82" x2="300" y2="82" stroke="#A855F7" strokeWidth="2" strokeLinecap="round"/>
              <line x1="260" y1="88" x2="293" y2="88" stroke="#A855F7" strokeWidth="2" strokeLinecap="round"/>
              
              {/* 左側教師 */}
              <circle cx="120" cy="145" r="32" fill="#FDE68A"/>
              <path d="M88 133 Q88 113 103 110 Q115 107 120 107 Q125 107 137 110 Q152 113 152 133 Q152 143 120 143 Q88 143 88 133 Z" fill="#1F2937"/>
              <circle cx="110" cy="145" r="4" fill="#1F2937"/>
              <circle cx="130" cy="145" r="4" fill="#1F2937"/>
              <path d="M110 155 Q120 161 130 155" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round"/>
              
              {/* 左側教師身體 */}
              <path d="M95 180 Q95 167 108 167 L132 167 Q145 167 145 180 L145 255 Q145 268 132 268 L108 268 Q95 268 95 255 Z" fill="#C084FC"/>
              <path d="M95 195 Q78 215 70 245" stroke="#C084FC" strokeWidth="18" strokeLinecap="round"/>
              <circle cx="70" cy="245" r="11" fill="#FDE68A"/>
              <path d="M145 195 Q155 215 160 245" stroke="#C084FC" strokeWidth="18" strokeLinecap="round"/>
              <circle cx="160" cy="245" r="11" fill="#FDE68A"/>
              
              {/* 左側教師腿 */}
              <path d="M108 268 L108 305" stroke="#A855F7" strokeWidth="16" strokeLinecap="round"/>
              <path d="M132 268 L132 305" stroke="#A855F7" strokeWidth="16" strokeLinecap="round"/>
              <ellipse cx="108" cy="308" rx="13" ry="9" fill="#1F2937"/>
              <ellipse cx="132" cy="308" rx="13" ry="9" fill="#1F2937"/>
              
              {/* 中間教師 */}
              <circle cx="200" cy="155" r="35" fill="#FDE68A"/>
              <path d="M165 143 Q165 120 182 117 Q195 114 200 114 Q205 114 218 117 Q235 120 235 143 Q235 153 200 153 Q165 153 165 143 Z" fill="#1F2937"/>
              <circle cx="188" cy="155" r="4" fill="#1F2937"/>
              <circle cx="212" cy="155" r="4" fill="#1F2937"/>
              <path d="M188 167 Q200 173 212 167" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round"/>
              
              {/* 中間教師身體 */}
              <path d="M172 190 Q172 175 187 175 L213 175 Q228 175 228 190 L228 270 Q228 285 213 285 L187 285 Q172 285 172 270 Z" fill="#7C3AED"/>
              <path d="M172 210 Q155 230 148 260" stroke="#7C3AED" strokeWidth="20" strokeLinecap="round"/>
              <circle cx="148" cy="260" r="12" fill="#FDE68A"/>
              <path d="M228 210 Q245 230 252 260" stroke="#7C3AED" strokeWidth="20" strokeLinecap="round"/>
              <circle cx="252" cy="260" r="12" fill="#FDE68A"/>
              
              {/* 中間教師腿 */}
              <path d="M187 285 L187 325" stroke="#6D28D9" strokeWidth="18" strokeLinecap="round"/>
              <path d="M213 285 L213 325" stroke="#6D28D9" strokeWidth="18" strokeLinecap="round"/>
              <ellipse cx="187" cy="328" rx="15" ry="10" fill="#1F2937"/>
              <ellipse cx="213" cy="328" rx="15" ry="10" fill="#1F2937"/>
              
              {/* 右側教師 */}
              <circle cx="280" cy="145" r="32" fill="#FDE68A"/>
              <path d="M248 133 Q248 113 263 110 Q275 107 280 107 Q285 107 297 110 Q312 113 312 133 Q312 143 280 143 Q248 143 248 133 Z" fill="#1F2937"/>
              <circle cx="270" cy="145" r="4" fill="#1F2937"/>
              <circle cx="290" cy="145" r="4" fill="#1F2937"/>
              <path d="M270 155 Q280 161 290 155" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round"/>
              
              {/* 右側教師身體 */}
              <path d="M255 180 Q255 167 268 167 L292 167 Q305 167 305 180 L305 255 Q305 268 292 268 L268 268 Q255 268 255 255 Z" fill="#A855F7"/>
              <path d="M255 195 Q245 215 240 245" stroke="#A855F7" strokeWidth="18" strokeLinecap="round"/>
              <circle cx="240" cy="245" r="11" fill="#FDE68A"/>
              <path d="M305 195 Q322 215 330 245" stroke="#A855F7" strokeWidth="18" strokeLinecap="round"/>
              <circle cx="330" cy="245" r="11" fill="#FDE68A"/>
              
              {/* 右側教師腿 */}
              <path d="M268 268 L268 305" stroke="#9333EA" strokeWidth="16" strokeLinecap="round"/>
              <path d="M292 268 L292 305" stroke="#9333EA" strokeWidth="16" strokeLinecap="round"/>
              <ellipse cx="268" cy="308" rx="13" ry="9" fill="#1F2937"/>
              <ellipse cx="292" cy="308" rx="13" ry="9" fill="#1F2937"/>
              
              {/* 中央的教案文件（放在三位教師之間的桌上位置）*/}
              <rect x="175" y="220" width="50" height="55" rx="4" fill="#FFF" stroke="#A855F7" strokeWidth="3"/>
              <line x1="182" y1="230" x2="218" y2="230" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="182" y1="238" x2="210" y2="238" stroke="#E9D5FF" strokeWidth="2" strokeLinecap="round"/>
              <line x1="182" y1="246" x2="218" y2="246" stroke="#E9D5FF" strokeWidth="2" strokeLinecap="round"/>
              <line x1="182" y1="254" x2="205" y2="254" stroke="#E9D5FF" strokeWidth="2" strokeLinecap="round"/>
              <line x1="182" y1="262" x2="218" y2="262" stroke="#E9D5FF" strokeWidth="2" strokeLinecap="round"/>
              
              {/* 星星裝飾 */}
              <path d="M340 120 L342 126 L349 127 L344 131 L346 138 L340 134 L334 138 L336 131 L331 127 L338 126 Z" fill="#C084FC"/>
              <path d="M60 120 L62 125 L68 126 L63 130 L65 136 L60 132 L55 136 L57 130 L52 126 L58 125 Z" fill="#A855F7"/>
              <path d="M350 200 L352 205 L358 206 L353 210 L355 216 L350 212 L345 216 L347 210 L342 206 L348 205 Z" fill="#DDD6FE"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 右側登入表單 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* 頂部歡迎文字 */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">歡迎來到 <span className="text-purple-600 font-semibold">教師共同備課系統</span></p>
            <h2 className="text-3xl font-bold text-gray-800">登入</h2>
          </div>

          {/* 登入表單 */}
          <div className="space-y-6">
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

            {/* 錯誤訊息 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* 登入按鈕 */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '登入中...' : '登入'}
            </button>

            {/* 底部連結 */}
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                還沒有帳號？{' '}
                <button
                  onClick={onSwitchToRegister}
                  className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
                >
                  註冊帳號
                </button>
              </div>
              <button
                onClick={onSwitchToResetPassword}
                className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
              >
                忘記密碼？重設密碼
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

