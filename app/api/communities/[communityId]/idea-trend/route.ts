// ============================================
// 社群想法貢獻數量變化統計 API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: 統計社群中每個使用者的想法貢獻數量變化（按日期）
export async function GET(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams

    if (!communityId) {
      return NextResponse.json(
        { error: '請提供社群ID' },
        { status: 400 }
      )
    }

    // 計算最近30天的日期範圍
    const today = new Date()
    today.setHours(23, 59, 59, 999) // 設定為今天的結束時間
    
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 29) // 30天前（包含今天）
    startDate.setHours(0, 0, 0, 0) // 設定為開始時間

    // 格式化日期為 YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const startDateStr = formatDate(startDate)
    const endDateStr = formatDate(today)

    // 調試：記錄日期範圍
    console.log('想法趨勢統計 - 日期範圍:', { startDateStr, endDateStr, communityId })

    // 1. 獲取所有社群成員（作為統計的基礎）
    const members = await query(
      `SELECT DISTINCT
        cm.user_id AS userId,
        u.nickname,
        u.account
      FROM community_members cm
      INNER JOIN users u ON cm.user_id = u.id
      WHERE cm.community_id = ?`,
      [communityId]
    ) as any[]

    console.log('想法趨勢統計 - 社群成員數:', members.length)

    // 2. 先檢查該社群的所有想法（調試用）
    const allIdeasCheck = await query(
      `SELECT 
        COUNT(*) AS totalIdeas,
        COUNT(CASE WHEN parent_id IS NULL OR parent_id = '' THEN 1 END) AS newIdeas,
        COUNT(CASE WHEN parent_id IS NOT NULL AND parent_id != '' THEN 1 END) AS replyIdeas,
        MIN(DATE(created_at)) AS earliestDate,
        MAX(DATE(created_at)) AS latestDate
      FROM ideas
      WHERE community_id = ?`,
      [communityId]
    ) as any[]

    console.log('想法趨勢統計 - 想法統計:', allIdeasCheck[0])

    // 3. 統計每個使用者在最近30天內每天的想法建立數量
    // 統計新增+回覆（所有想法）
    const dailyStats = await query(
      `SELECT 
        DATE_FORMAT(i.created_at, '%Y-%m-%d') AS date,
        i.creator_id AS userId,
        COUNT(*) AS createdCount
      FROM ideas i
      WHERE i.community_id = ?
        AND DATE(i.created_at) >= CAST(? AS DATE)
        AND DATE(i.created_at) <= CAST(? AS DATE)
      GROUP BY DATE_FORMAT(i.created_at, '%Y-%m-%d'), i.creator_id
      ORDER BY date ASC, userId ASC`,
      [communityId, startDateStr, endDateStr]
    ) as any[]

    console.log('想法趨勢統計 - 最近30天統計結果數:', dailyStats.length)
    if (dailyStats.length > 0) {
      console.log('想法趨勢統計 - 前5筆統計:', dailyStats.slice(0, 5))
      console.log('想法趨勢統計 - dailyStats 原始資料（前3筆）:', dailyStats.slice(0, 3))
      
      // 調試：計算總數驗證
      const totalCount = dailyStats.reduce((sum, stat) => sum + parseInt(stat.createdCount || 0), 0)
      console.log('想法趨勢統計 - dailyStats 總想法數:', totalCount)
    }
    
    // 調試：查詢所有想法驗證（不限日期範圍）
    const allIdeasInRange = await query(
      `SELECT 
        DATE_FORMAT(i.created_at, '%Y-%m-%d') AS date,
        i.creator_id AS userId,
        i.id AS ideaId,
        i.parent_id AS parentId
      FROM ideas i
      WHERE i.community_id = ?
        AND DATE(i.created_at) >= CAST(? AS DATE)
        AND DATE(i.created_at) <= CAST(? AS DATE)
      ORDER BY date ASC, userId ASC`,
      [communityId, startDateStr, endDateStr]
    ) as any[]
    
    console.log('想法趨勢統計 - 範圍內所有想法總數:', allIdeasInRange.length)
    console.log('想法趨勢統計 - 範圍內想法詳細列表:', allIdeasInRange.map((idea: any) => ({
      date: idea.date,
      userId: idea.userId,
      ideaId: idea.ideaId,
      parentId: idea.parentId,
    })))

    // 3. 生成所有日期（最近30天）
    const allDates: string[] = []
    const currentDate = new Date(startDate)
    while (currentDate <= today) {
      allDates.push(formatDate(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // 4. 建立日期和使用者的統計 Map
    const statsMap = new Map<string, Map<string, number>>()
    
    // 初始化所有日期和使用者的統計為0
    members.forEach((member: any) => {
      const userStatsMap = new Map<string, number>()
      allDates.forEach(date => {
        userStatsMap.set(date, 0)
      })
      statsMap.set(member.userId, userStatsMap)
    })

    // 填充實際統計資料
    dailyStats.forEach((stat: any) => {
      // 確保日期格式一致（YYYY-MM-DD）
      let date = stat.date
      // 如果日期是時間戳格式，轉換為日期字串
      if (date instanceof Date) {
        date = formatDate(date)
      } else if (typeof date === 'string' && date.includes('T')) {
        // 如果是 ISO 格式的時間戳，提取日期部分
        date = date.split('T')[0]
      }
      
      const userId = stat.userId
      const count = parseInt(stat.createdCount) || 0
      
      console.log('填充統計資料:', { 
        date, 
        userId, 
        count, 
        dateType: typeof date, 
        dateValue: date,
        hasUserInMap: statsMap.has(userId),
        allDatesIncludes: allDates.includes(date)
      })
      
      if (statsMap.has(userId)) {
        const userStatsMap = statsMap.get(userId)!
        if (userStatsMap.has(date)) {
          userStatsMap.set(date, count)
          console.log(`  ✓ 成功設置: userId=${userId}, date=${date}, count=${count}`)
        } else {
          console.warn(`  ⚠ 日期 ${date} 不在 allDates 中，allDates 包含:`, allDates.slice(0, 5), '...')
        }
      } else {
        console.warn(`  ⚠ userId ${userId} 不在 members 列表中`)
        console.log(`  成員列表中的 userIds:`, members.map((m: any) => m.userId))
      }
    })

    // 5. 構建返回資料（改為累計統計）
    const userStats = members.map((member: any) => {
      const userId = member.userId
      const userStatsMap = statsMap.get(userId) || new Map()
      
      // 計算累計數量（從最早日期到當前日期）
      let cumulativeCount = 0
      const dailyCounts = allDates.map(date => {
        const dayCount = userStatsMap.get(date) || 0
        cumulativeCount += dayCount // 累計
        return {
          date,
          count: cumulativeCount, // 返回累計值，而不是當日值
        }
      })

      // 只返回有建立過想法的使用者（在30天內）
      const hasData = dailyCounts.some(dc => dc.count > 0)

      return {
        userId,
        userName: member.nickname || member.account || '未知使用者',
        userAccount: member.account || '',
        dailyCounts,
        hasData, // 標記是否有資料
      }
    }).filter(user => user.hasData) // 過濾掉沒有資料的使用者

    console.log('想法趨勢統計 - 返回的使用者數:', userStats.length)

    return NextResponse.json({
      dateRange: {
        startDate: startDateStr,
        endDate: endDateStr,
        days: allDates.length, // 天數（應該是30）
      },
      userStats,
      communityId,
      debug: {
        totalIdeas: allIdeasCheck[0]?.totalIdeas || 0,
        newIdeas: allIdeasCheck[0]?.newIdeas || 0,
        replyIdeas: allIdeasCheck[0]?.replyIdeas || 0,
        earliestDate: allIdeasCheck[0]?.earliestDate || null,
        latestDate: allIdeasCheck[0]?.latestDate || null,
        membersCount: members.length,
        dailyStatsCount: dailyStats.length,
      },
    })
  } catch (error: any) {
    console.error('統計想法趨勢資料錯誤:', error)
    return NextResponse.json(
      { error: '統計想法趨勢資料失敗', details: error.message },
      { status: 500 }
    )
  }
}

