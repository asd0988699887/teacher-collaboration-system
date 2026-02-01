'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DailyCount {
  date: string
  count: number
}

interface UserTrendStat {
  userId: string
  userName: string
  userAccount: string
  dailyCounts: DailyCount[]
  hasData: boolean
}

interface IdeaTrendData {
  dateRange: {
    startDate: string
    endDate: string
    originalStartDate?: string
    originalEndDate?: string
    days: number
    isAllData?: boolean
    isExpanded?: boolean
  }
  userStats: UserTrendStat[]
  communityId: string
}

interface IdeaTrendChartProps {
  communityId: string
}

/**
 * 社群想法貢獻數量變化圖表組件
 * 顯示最近30天每個使用者的想法建立數量變化（折線圖）
 */
export default function IdeaTrendChart({ communityId }: IdeaTrendChartProps) {
  const [trendData, setTrendData] = useState<IdeaTrendData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTrendData = async () => {
      if (!communityId) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/communities/${communityId}/idea-trend`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '載入趨勢資料失敗')
        }

        // 調試：記錄返回的資料
        console.log('想法趨勢資料 - API 返回:', data)
        if (data.debug) {
          console.log('想法趨勢資料 - 調試資訊:', {
            總想法數: data.debug.totalIdeas,
            新增想法數: data.debug.newIdeas,
            回覆想法數: data.debug.replyIdeas,
            最早日期: data.debug.earliestDate,
            最新日期: data.debug.latestDate,
            成員數: data.debug.membersCount,
            統計結果數: data.debug.dailyStatsCount,
            使用者統計數: data.userStats?.length || 0,
          })
        }

        setTrendData(data)
      } catch (err: any) {
        console.error('載入想法趨勢資料錯誤:', err)
        setError(err.message || '載入趨勢資料失敗')
      } finally {
        setIsLoading(false)
      }
    }

    loadTrendData()
  }, [communityId])

  // 格式化日期為 MM/DD
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }

  // 準備圖表資料：將 userStats 轉換為 recharts 格式
  const chartData = trendData?.userStats.length
    ? (() => {
        // 獲取所有日期（從第一個使用者的 dailyCounts）
        const dates = trendData.userStats[0]?.dailyCounts.map(dc => dc.date) || []
        
        // 為每個日期建立一個資料點
        return dates.map(date => {
          const dataPoint: any = {
            date: formatDate(date),
            fullDate: date, // 保留完整日期用於 Tooltip
          }
          
          // 為每個使用者添加該日期的數量
          trendData.userStats.forEach(user => {
            const dailyCount = user.dailyCounts.find(dc => dc.date === date)
            dataPoint[user.userName] = dailyCount?.count || 0
          })
          
          return dataPoint
        })
      })()
    : []

  // 定義顏色陣列（為每個使用者分配不同顏色）
  const colors = [
    '#8B5CF6', // 紫色
    '#3B82F6', // 藍色
    '#10B981', // 綠色
    '#F59E0B', // 黃色
    '#EF4444', // 紅色
    '#06B6D4', // 青色
    '#EC4899', // 粉紅色
    '#6366F1', // 靛色
    '#14B8A6', // 藍綠色
    '#F97316', // 橙色
  ]

  // 載入狀態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <p>載入中...</p>
      </div>
    )
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-500">
        <p>錯誤：{error}</p>
      </div>
    )
  }

  // 沒有資料
  if (!trendData || !trendData.userStats || trendData.userStats.length === 0) {
    // 顯示更詳細的訊息
    const debugInfo = (trendData as any)?.debug
    const hasIdeasOutsideRange = debugInfo && 
      parseInt(debugInfo.totalIdeas) > 0 && 
      parseInt(debugInfo.newIdeas) > 0 &&
      parseInt(debugInfo.dailyStatsCount) === 0

    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <p className="mb-2">目前沒有想法貢獻記錄</p>
        {hasIdeasOutsideRange && debugInfo && (
          <div className="text-sm text-gray-400 mt-2 text-center max-w-md">
            <p>系統中有 {debugInfo.newIdeas} 個新增想法，</p>
            <p>但都不在最近30天範圍內。</p>
            <p className="mt-1">最早日期：{debugInfo.earliestDate || '未知'}</p>
            <p>最新日期：{debugInfo.latestDate || '未知'}</p>
          </div>
        )}
        {debugInfo && parseInt(debugInfo.totalIdeas) === 0 && (
          <p className="text-sm text-gray-400 mt-2">該社群目前還沒有任何想法節點</p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        社群想法貢獻數量變化圖表{trendData.dateRange?.isAllData ? '' : '（最近30天）'}
      </h3>
      
      <div style={{ width: '100%', height: Math.max(500, trendData.userStats.length * 60 + 200) }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 80, bottom: 60, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              label={{ value: '日期', position: 'insideBottom', offset: -10 }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={(() => {
                // 根據日期範圍長度動態調整X軸間隔
                const days = trendData.dateRange?.days || chartData.length
                if (days <= 30) {
                  return 2 // 30天以內：每2天顯示一個標籤
                } else if (days <= 90) {
                  return Math.ceil(days / 18) // 31-90天：約每5天顯示一個標籤（18個標籤）
                } else if (days <= 180) {
                  return Math.ceil(days / 18) // 91-180天：約每10天顯示一個標籤（18個標籤）
                } else {
                  return Math.ceil(days / 12) // 181天以上：約每30天顯示一個標籤（12個標籤）
                }
              })()}
            />
            <YAxis
              label={{ value: '想法數量', angle: -90, position: 'insideLeft' }}
              allowDecimals={false}
              domain={[0, 'dataMax']}
            />
            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
              labelFormatter={(label, payload) => {
                if (payload && payload[0] && payload[0].payload) {
                  const fullDate = payload[0].payload.fullDate
                  if (fullDate) {
                    const date = new Date(fullDate)
                    return date.toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }
                }
                return label
              }}
            />
            <Legend
              verticalAlign="top"
              height={Math.min(120, trendData.userStats.length * 20 + 20)}
              wrapperStyle={{ paddingBottom: '20px' }}
              iconType="line"
            />
            {trendData.userStats.map((user, index) => (
              <Line
                key={user.userId}
                type="monotone"
                dataKey={user.userName}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name={user.userName}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* 顯示日期範圍 */}
      {trendData.dateRange && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          日期範圍：{formatDate(trendData.dateRange.originalStartDate || trendData.dateRange.startDate)} ~ {formatDate(trendData.dateRange.originalEndDate || trendData.dateRange.endDate)}
          {trendData.dateRange.isExpanded && (
            <span className="ml-2 text-xs text-gray-400">
              （圖表已擴展顯示範圍以確保曲線可見）
            </span>
          )}
        </div>
      )}
    </div>
  )
}

