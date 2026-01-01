'use client'

import { useState } from 'react'

interface ResetPasswordProps {
  onSwitchToLogin: () => void
  onSwitchToRegister: () => void
}

/**
 * 重設密碼頁面元件
 * 符合教師共同備課系統的紫色系風格
 */
export default function ResetPassword({ 
  onSwitchToLogin,
  onSwitchToRegister 
}: ResetPasswordProps) {
  const [email, setEmail] = useState('')
  const [isSent, setIsSent] = useState(false)

  const handleSendResetEmail = () => {
    // TODO: 實作發送重設密碼郵件的 API 邏輯
    console.log('發送重設密碼郵件至:', email)
    setIsSent(true)
  }

  return (
    <div className="min-h-screen flex">
      {/* 左側插圖區域 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-50 to-purple-100 items-center justify-center p-12">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            教師共同備課系統
          </h1>
          
          {/* 教師密碼重設插圖 */}
          <div className="mt-8">
            <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 陰影 */}
              <ellipse cx="200" cy="380" rx="120" ry="20" fill="#E9D5FF" opacity="0.3"/>
              
              {/* 教師形象 */}
              <circle cx="200" cy="140" r="40" fill="#FDE68A"/>
              <path d="M160 125 Q160 100 180 96 Q195 92 200 92 Q205 92 220 96 Q240 100 240 125 Q240 138 200 138 Q160 138 160 125 Z" fill="#1F2937"/>
              <circle cx="185" cy="140" r="5" fill="#1F2937"/>
              <circle cx="215" cy="140" r="5" fill="#1F2937"/>
              <path d="M185 155 Q200 162 215 155" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round"/>
              
              {/* 身體 */}
              <path d="M165 185 Q165 167 182 167 L218 167 Q235 167 235 185 L235 270 Q235 285 218 285 L182 285 Q165 285 165 270 Z" fill="#A855F7"/>
              
              {/* 手臂 - 左（指向鎖頭） */}
              <path d="M165 200 Q145 220 140 250" stroke="#A855F7" strokeWidth="22" strokeLinecap="round"/>
              <circle cx="140" cy="250" r="13" fill="#FDE68A"/>
              
              {/* 手臂 - 右（拿著鑰匙） */}
              <path d="M235 200 Q260 230 280 240" stroke="#A855F7" strokeWidth="22" strokeLinecap="round"/>
              <circle cx="280" cy="240" r="13" fill="#FDE68A"/>
              
              {/* 腿 */}
              <path d="M180 285 L180 330" stroke="#7C3AED" strokeWidth="20" strokeLinecap="round"/>
              <path d="M220 285 L220 330" stroke="#7C3AED" strokeWidth="20" strokeLinecap="round"/>
              <ellipse cx="180" cy="333" rx="18" ry="12" fill="#1F2937"/>
              <ellipse cx="220" cy="333" rx="18" ry="12" fill="#1F2937"/>
              
              {/* 鎖頭 - 大型 */}
              <rect x="85" y="260" width="70" height="80" rx="8" fill="#C084FC" stroke="#7C3AED" strokeWidth="3"/>
              <path d="M100 260 Q100 230 120 220 Q140 230 140 260" stroke="#7C3AED" strokeWidth="8" fill="none" strokeLinecap="round"/>
              <circle cx="120" cy="295" r="12" fill="#7C3AED"/>
              <rect x="116" y="295" width="8" height="25" rx="4" fill="#7C3AED"/>
              
              {/* 鑰匙 */}
              <circle cx="290" cy="245" r="18" fill="#FCD34D" stroke="#F59E0B" strokeWidth="3"/>
              <circle cx="290" cy="245" r="8" fill="#FFF"/>
              <rect x="303" y="240" width="35" height="10" rx="2" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2"/>
              <rect x="325" y="237" width="5" height="6" fill="#F59E0B"/>
              <rect x="332" y="237" width="5" height="6" fill="#F59E0B"/>
              <rect x="325" y="247" width="5" height="6" fill="#F59E0B"/>
              
              {/* 郵件信封 */}
              <rect x="240" y="300" width="80" height="60" rx="5" fill="#FFF" stroke="#A855F7" strokeWidth="3"/>
              <path d="M240 300 L280 330 L320 300" stroke="#A855F7" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="240" y1="300" x2="280" y2="330" stroke="#C084FC" strokeWidth="2"/>
              <line x1="320" y1="300" x2="280" y2="330" stroke="#C084FC" strokeWidth="2"/>
              
              {/* 郵件符號 */}
              <circle cx="280" cy="340" r="8" fill="#A855F7"/>
              <path d="M277 340 L279 342 L285 336" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              
              {/* 盾牌保護符號 */}
              <path d="M200 320 Q180 325 175 345 Q175 365 200 380 Q225 365 225 345 Q220 325 200 320 Z" fill="#DDD6FE" stroke="#A855F7" strokeWidth="2"/>
              <path d="M193 350 L198 355 L210 343" stroke="#7C3AED" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              
              {/* 星星裝飾 */}
              <path d="M330 180 L333 187 L341 188 L335 193 L337 201 L330 196 L323 201 L325 193 L319 188 L327 187 Z" fill="#C084FC"/>
              <path d="M70 200 L72 205 L78 206 L73 210 L75 216 L70 212 L65 216 L67 210 L62 206 L68 205 Z" fill="#A855F7"/>
              <path d="M340 130 L342 135 L348 136 L343 140 L345 146 L340 142 L335 146 L337 140 L332 136 L338 135 Z" fill="#DDD6FE"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 右側重設密碼表單 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* 頂部歡迎文字 */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">歡迎來到 <span className="text-purple-600 font-semibold">教師共同備課系統</span></p>
            <h2 className="text-3xl font-bold text-gray-800">忘記密碼</h2>
          </div>

          {!isSent ? (
            /* 輸入郵件表單 */
            <div className="space-y-6">
              <p className="text-gray-600 text-center">
                請輸入您的電子郵件地址，我們將發送重設密碼的連結給您。
              </p>

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

              {/* 發送按鈕 */}
              <button
                onClick={handleSendResetEmail}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                發送重設郵件
              </button>

              {/* 底部連結 */}
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  記起密碼了？{' '}
                  <button
                    onClick={onSwitchToLogin}
                    className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
                  >
                    返回登入
                  </button>
                </div>
                <div className="text-gray-600">
                  還沒有帳號？{' '}
                  <button
                    onClick={onSwitchToRegister}
                    className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
                  >
                    註冊帳號
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 郵件已發送訊息 */
            <div className="space-y-6">
              {/* 成功圖示 */}
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 24L18 34L40 12" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="text-center space-y-3">
                <h3 className="text-xl font-semibold text-gray-800">
                  郵件已發送
                </h3>
                <p className="text-gray-600">
                  我們已將重設密碼的連結發送至 <span className="font-semibold text-purple-600">{email}</span>
                </p>
                <p className="text-sm text-gray-500">
                  請檢查您的郵箱（包括垃圾郵件資料夾）並點擊連結以重設密碼。
                </p>
              </div>

              {/* 返回登入按鈕 */}
              <button
                onClick={onSwitchToLogin}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                返回登入
              </button>

              {/* 重新發送連結 */}
              <div className="text-center text-sm">
                <span className="text-gray-600">沒有收到郵件？</span>{' '}
                <button
                  onClick={() => setIsSent(false)}
                  className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
                >
                  重新發送
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

