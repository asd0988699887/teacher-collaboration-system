// ============================================
// 社群網絡圖資料統計 API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: 統計社群成員間的互動關係資料（用於網絡圖）
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

    // 1. 獲取所有社群成員（作為節點的基礎）
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

    // 2. 統計每個使用者建立的節點數（新增想法，parent_id IS NULL）
    const createdStats = await query(
      `SELECT 
        creator_id AS userId,
        COUNT(*) AS createdCount
      FROM ideas
      WHERE community_id = ? 
        AND (parent_id IS NULL OR parent_id = '')
      GROUP BY creator_id`,
      [communityId]
    ) as any[]

    // 3. 統計每個使用者回覆的節點數（有 parent_id 的想法）
    const replyStats = await query(
      `SELECT 
        creator_id AS userId,
        COUNT(*) AS replyCount
      FROM ideas
      WHERE community_id = ? 
        AND parent_id IS NOT NULL 
        AND parent_id != ''
      GROUP BY creator_id`,
      [communityId]
    ) as any[]

    // 4. 統計每個使用者被回覆的節點數量
    // 當 A 回覆了 B 建立的節點時，B 的被回覆數 +1
    const receivedReplyStats = await query(
      `SELECT 
        parent_idea.creator_id AS userId,
        COUNT(*) AS receivedReplyCount
      FROM ideas reply_idea
      INNER JOIN ideas parent_idea ON reply_idea.parent_id = parent_idea.id
      WHERE reply_idea.community_id = ?
        AND reply_idea.creator_id != parent_idea.creator_id  -- 排除自我回覆
      GROUP BY parent_idea.creator_id`,
      [communityId]
    ) as any[]

    // 5. 統計回覆關係（網絡圖的邊）
    // 當 A 回覆了 B 建立的節點時，建立一條從 A 到 B 的邊
    const edgeStats = await query(
      `SELECT 
        reply_idea.creator_id AS fromUserId,
        parent_idea.creator_id AS toUserId,
        COUNT(*) AS replyFrequency
      FROM ideas reply_idea
      INNER JOIN ideas parent_idea ON reply_idea.parent_id = parent_idea.id
      WHERE reply_idea.community_id = ?
        AND reply_idea.creator_id != parent_idea.creator_id  -- 排除自我回覆
      GROUP BY reply_idea.creator_id, parent_idea.creator_id`,
      [communityId]
    ) as any[]

    // 6. 統計總數
    const totalStats = await query(
      `SELECT 
        COUNT(*) AS totalCreated,
        COUNT(CASE WHEN parent_id IS NOT NULL AND parent_id != '' THEN 1 END) AS totalReplies
      FROM ideas
      WHERE community_id = ?`,
      [communityId]
    ) as any[]

    // 建立統計資料 Map 以便快速查找
    const createdMap = new Map<string, number>()
    createdStats.forEach((stat: any) => {
      createdMap.set(stat.userId, parseInt(stat.createdCount) || 0)
    })

    const replyMap = new Map<string, number>()
    replyStats.forEach((stat: any) => {
      replyMap.set(stat.userId, parseInt(stat.replyCount) || 0)
    })

    const receivedReplyMap = new Map<string, number>()
    receivedReplyStats.forEach((stat: any) => {
      receivedReplyMap.set(stat.userId, parseInt(stat.receivedReplyCount) || 0)
    })

    // 7. 獲取保存的節點位置（如果有）
    // 如果表不存在，優雅地處理，不影響主要功能
    let savedPositions: any[] = []
    try {
      savedPositions = await query(
        `SELECT user_id, position_x, position_y
         FROM network_graph_positions
         WHERE community_id = ?`,
        [communityId]
      ) as any[]
    } catch (positionError: any) {
      // 如果表不存在或其他錯誤，記錄但不中斷流程
      console.warn('獲取節點位置失敗（表可能尚未創建）:', positionError.message)
      savedPositions = []
    }

    const positionMap = new Map<string, { x: number; y: number }>()
    savedPositions.forEach((pos: any) => {
      positionMap.set(pos.user_id, {
        x: parseFloat(pos.position_x),
        y: parseFloat(pos.position_y),
      })
    })

    // 構建節點資料
    const nodes = members.map((member: any) => {
      const userId = member.userId
      const savedPosition = positionMap.get(userId)
      
      return {
        id: userId,
        label: member.nickname || member.account || '未知使用者',
        userName: member.nickname || member.account || '未知使用者',
        userAccount: member.account || '',
        createdCount: createdMap.get(userId) || 0,
        replyCount: replyMap.get(userId) || 0,
        receivedReplyCount: receivedReplyMap.get(userId) || 0,
        // 如果有保存的位置，添加到節點資料中
        savedPosition: savedPosition || null,
      }
    })

    // 構建邊資料
    const edges = edgeStats.map((edge: any) => {
      const fromMember = members.find((m: any) => m.userId === edge.fromUserId)
      const toMember = members.find((m: any) => m.userId === edge.toUserId)

      return {
        from: edge.fromUserId,
        to: edge.toUserId,
        fromLabel: fromMember?.nickname || fromMember?.account || '未知使用者',
        toLabel: toMember?.nickname || toMember?.account || '未知使用者',
        value: parseInt(edge.replyFrequency) || 0,
        replyCount: parseInt(edge.replyFrequency) || 0,
      }
    })

    // 構建統計資料
    const statistics = {
      totalCreated: totalStats[0] ? parseInt(totalStats[0].totalCreated) || 0 : 0,
      totalReplies: totalStats[0] ? parseInt(totalStats[0].totalReplies) || 0 : 0,
    }

    // 構建每個使用者的詳細統計（用於點擊顯示）
    // 7. 統計每個使用者回覆過的節點（按來源使用者分組）
    const replyTableStats = await query(
      `SELECT 
        reply_idea.creator_id AS userId,
        parent_idea.creator_id AS repliedToUserId,
        COUNT(*) AS replyCount
      FROM ideas reply_idea
      INNER JOIN ideas parent_idea ON reply_idea.parent_id = parent_idea.id
      WHERE reply_idea.community_id = ?
        AND reply_idea.creator_id != parent_idea.creator_id  -- 排除自我回覆
      GROUP BY reply_idea.creator_id, parent_idea.creator_id`,
      [communityId]
    ) as any[]

    // 8. 統計每個使用者被回覆的節點（按回覆者分組）
    const receivedReplyTableStats = await query(
      `SELECT 
        parent_idea.creator_id AS userId,
        reply_idea.creator_id AS repliedByUserId,
        COUNT(*) AS receivedReplyCount
      FROM ideas reply_idea
      INNER JOIN ideas parent_idea ON reply_idea.parent_id = parent_idea.id
      WHERE reply_idea.community_id = ?
        AND reply_idea.creator_id != parent_idea.creator_id  -- 排除自我回覆
      GROUP BY parent_idea.creator_id, reply_idea.creator_id`,
      [communityId]
    ) as any[]

    // 構建每個使用者的詳細統計
    const userStatistics: Record<string, any> = {}
    
    members.forEach((member: any) => {
      const userId = member.userId
      
      // 回覆過的節點列表
      const replyTable = replyTableStats
        .filter((stat: any) => stat.userId === userId)
        .map((stat: any) => {
          const repliedToMember = members.find((m: any) => m.userId === stat.repliedToUserId)
          return {
            userId: stat.repliedToUserId,
            userName: repliedToMember?.nickname || repliedToMember?.account || '未知使用者',
            replyCount: parseInt(stat.replyCount) || 0,
          }
        })
        .sort((a: any, b: any) => b.replyCount - a.replyCount)

      // 被回覆的節點列表
      const receivedReplyTable = receivedReplyTableStats
        .filter((stat: any) => stat.userId === userId)
        .map((stat: any) => {
          const repliedByMember = members.find((m: any) => m.userId === stat.repliedByUserId)
          return {
            userId: stat.repliedByUserId,
            userName: repliedByMember?.nickname || repliedByMember?.account || '未知使用者',
            receivedReplyCount: parseInt(stat.receivedReplyCount) || 0,
          }
        })
        .sort((a: any, b: any) => b.receivedReplyCount - a.receivedReplyCount)

      userStatistics[userId] = {
        createdCount: createdMap.get(userId) || 0,
        replyCount: replyMap.get(userId) || 0,
        receivedReplyCount: receivedReplyMap.get(userId) || 0,
        replyTable, // 回覆過的節點列表
        receivedReplyTable, // 被回覆的節點列表
      }
    })

    return NextResponse.json({
      nodes,
      edges,
      statistics,
      userStatistics, // 每個使用者的詳細統計（用於點擊顯示）
      communityId,
    })
  } catch (error: any) {
    console.error('統計網絡圖資料錯誤:', error)
    return NextResponse.json(
      { error: '統計網絡圖資料失敗', details: error.message },
      { status: 500 }
    )
  }
}

