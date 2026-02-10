// ============================================
// 社群想法貢獻數量變化統計 API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: 統計社群中每個使用者的想法貢獻數量變化（按日期）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const resolvedParams = await params
    const { communityId } = resolvedParams

    if (!communityId) {
      return NextResponse.json(
        { error: '請提供社群ID' },
        { status: 400 }
      )
    }

    // 格式化日期為 YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

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

    // 2. 先檢查該社群的所有想法（用於判斷日期範圍）
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

    // 3. 決定日期範圍
    // 優先使用最近30天，但如果最近30天沒有資料，就使用所有可用的資料
    const today = new Date()
    today.setHours(23, 59, 59, 999) // 設定為今天的結束時間
    
    let startDate = new Date(today)
    startDate.setDate(today.getDate() - 29) // 30天前（包含今天）
    startDate.setHours(0, 0, 0, 0) // 設定為開始時間

    let startDateStr = formatDate(startDate)
    let endDateStr = formatDate(today)
    let useAllData = false // 標記是否使用所有資料

    // 先查詢最近30天的資料
    let dailyStats = await query(
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

    // 如果最近30天沒有資料，但有想法存在，就使用所有可用的資料
    if (dailyStats.length === 0 && allIdeasCheck[0] && parseInt(allIdeasCheck[0].totalIdeas) > 0) {
      console.log('最近30天沒有資料，改用所有可用的資料')
      useAllData = true
      
      // 使用最早和最新的想法日期作為範圍
      if (allIdeasCheck[0].earliestDate && allIdeasCheck[0].latestDate) {
        startDate = new Date(allIdeasCheck[0].earliestDate)
        startDate.setHours(0, 0, 0, 0)
        
        const latestDate = new Date(allIdeasCheck[0].latestDate)
        latestDate.setHours(23, 59, 59, 999)
        
        startDateStr = formatDate(startDate)
        endDateStr = formatDate(latestDate)
        
        // 重新查詢所有資料
        dailyStats = await query(
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
        
        console.log('想法趨勢統計 - 所有資料統計結果數:', dailyStats.length)
      }
    }
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

    // 4. 生成所有日期（根據實際日期範圍）
    // 如果日期範圍太小（只有1天或小於15天），自動擴展以確保圖表顯示為曲線
    let finalStartDate = new Date(startDate)
    let finalEndDate = useAllData ? new Date(endDateStr) : today
    
    // 計算日期範圍的天數
    const daysDiff = Math.ceil((finalEndDate.getTime() - finalStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    // 如果日期範圍小於15天，擴展日期範圍
    if (daysDiff < 15) {
      const daysToAdd = Math.ceil((15 - daysDiff) / 2) // 前後各加一半
      finalStartDate = new Date(finalStartDate)
      finalStartDate.setDate(finalStartDate.getDate() - daysToAdd)
      finalStartDate.setHours(0, 0, 0, 0)
      
      finalEndDate = new Date(finalEndDate)
      finalEndDate.setDate(finalEndDate.getDate() + daysToAdd)
      finalEndDate.setHours(23, 59, 59, 999)
      
      console.log(`日期範圍擴展：從 ${daysDiff} 天擴展到至少 15 天`)
      console.log(`擴展後的日期範圍：${formatDate(finalStartDate)} ~ ${formatDate(finalEndDate)}`)
    }
    
    const allDates: string[] = []
    const currentDate = new Date(finalStartDate)
    while (currentDate <= finalEndDate) {
      allDates.push(formatDate(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    console.log(`生成的日期總數：${allDates.length} 天`)

    // 5. 建立日期和使用者的統計 Map
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

    // 6. 構建返回資料（改為累計統計）
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

      // 檢查是否有資料：在日期範圍內有新增想法
      // 先檢查 dailyStats 中是否有該成員的數據
      let hasData = false
      
      // 方法1：檢查 dailyStats 中是否有該成員的數據
      for (const stat of dailyStats) {
        let statDate = stat.date
        if (statDate instanceof Date) {
          statDate = formatDate(statDate)
        } else if (typeof statDate === 'string' && statDate.includes('T')) {
          statDate = statDate.split('T')[0]
        }
        
        // 檢查 userId 是否匹配（使用字符串比較，因為可能類型不同）
        if (String(stat.userId) === String(userId)) {
          // 檢查日期是否在範圍內
          if (allDates.includes(statDate)) {
            hasData = true
            break
          }
        }
      }
      
      // 方法2：如果方法1沒找到，檢查 userStatsMap 中是否有非零值（備用檢查）
      if (!hasData) {
        for (const [date, count] of userStatsMap.entries()) {
          if (count > 0 && allDates.includes(date)) {
            hasData = true
            break
          }
        }
      }
      
      // 調試：記錄每個成員的 hasData 狀態
      console.log(`成員 ${member.nickname || member.account} (userId: ${userId}) hasData: ${hasData}`, {
        dailyStatsCount: dailyStats.filter((s: any) => String(s.userId) === String(userId)).length,
        userStatsMapEntries: Array.from(userStatsMap.entries()).filter(([date, count]) => count > 0 && allDates.includes(date)).length,
      })

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
        startDate: formatDate(finalStartDate), // 使用擴展後的開始日期
        endDate: formatDate(finalEndDate), // 使用擴展後的結束日期
        originalStartDate: startDateStr, // 保留原始開始日期（實際資料的開始日期）
        originalEndDate: endDateStr, // 保留原始結束日期（實際資料的結束日期）
        days: allDates.length, // 實際天數
        isAllData: useAllData, // 標記是否使用所有資料（而非最近30天）
        isExpanded: daysDiff < 15, // 標記是否擴展了日期範圍
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
        useAllData, // 調試資訊：是否使用所有資料
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

