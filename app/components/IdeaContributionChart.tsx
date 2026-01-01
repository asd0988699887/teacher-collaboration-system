'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface IdeaStat {
  userId: string
  userName: string
  userAccount: string
  addCount: number
  replyCount: number
  totalCount: number
}

interface IdeaContributionChartProps {
  communityId: string
}

/**
 * 社群想法貢獻數量圖表組件
 * 顯示社群中每個使用者在想法發散面板上的動作數量
 */
export default function IdeaContributionChart({ communityId }: IdeaContributionChartProps) {
  const [stats, setStats] = useState<IdeaStat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      if (!communityId) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/communities/${communityId}/idea-stats`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '載入統計資料失敗')
        }

        setStats(data.stats || [])
      } catch (err: any) {
        console.error('載入想法貢獻統計錯誤:', err)
        setError(err.message || '載入統計資料失敗')
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [communityId])

  // 準備圖表資料
  const chartData = stats.map((stat) => ({
    userName: stat.userName,
    userId: stat.userId,
    新增: stat.addCount,
    回覆: stat.replyCount,
  }))

  // 計算最大次數，用於動態調整 X 軸刻度
  const maxCount = Math.max(
    ...stats.map((stat) => stat.addCount + stat.replyCount),
    1
  )
  // 根據最大次數決定 X 軸刻度間隔（如果次數多，1格可能是5次）
  const tickInterval = maxCount > 10 ? 5 : 1
  // 生成 X 軸刻度數組
  const xAxisTicks = []
  for (let i = 0; i <= maxCount; i += tickInterval) {
    xAxisTicks.push(i)
  }

  // 顏色定義
  const addColor = '#60A5FA' // 淺藍色（新增）
  const replyColor = '#34D399' // 青色/藍綠色（回覆）

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>載入中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <p>錯誤：{error}</p>
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>目前沒有想法貢獻記錄</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        社群想法貢獻數量圖表
      </h3>
      
      <div style={{ width: '100%', height: Math.max(400, stats.length * 80) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 120, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              label={{ value: '次數', position: 'insideBottom', offset: -5 }}
              domain={[0, 'dataMax']}
              ticks={xAxisTicks}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="userName"
              width={100}
              tick={{ fontSize: 14 }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
              labelFormatter={(label) => `使用者: ${label}`}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="rect"
            />
            <Bar dataKey="新增" fill={addColor} name="新增" />
            <Bar dataKey="回覆" fill={replyColor} name="回覆" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

