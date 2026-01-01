// ============================================
// 社群想法貢獻統計 API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: 統計社群中每個使用者的想法貢獻數量
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

    // 統計每個使用者的想法操作數量
    // 1. 新增想法：所有想法（不包含回覆，即 parent_id IS NULL）
    // 2. 回覆想法：有 parent_id 的想法

    const stats = await query(
      `SELECT 
        u.id AS userId,
        u.nickname AS userName,
        u.account AS userAccount,
        COUNT(CASE WHEN i.parent_id IS NULL THEN 1 END) AS addCount,
        COUNT(CASE WHEN i.parent_id IS NOT NULL THEN 1 END) AS replyCount,
        COUNT(i.id) AS totalCount
      FROM ideas i
      INNER JOIN users u ON i.creator_id = u.id
      WHERE i.community_id = ?
      GROUP BY u.id, u.nickname, u.account
      HAVING totalCount > 0
      ORDER BY totalCount DESC, u.nickname ASC`,
      [communityId]
    ) as any[]

    // 格式化資料
    const formattedStats = stats.map((stat) => ({
      userId: stat.userId,
      userName: stat.userName || stat.userAccount || '未知使用者',
      userAccount: stat.userAccount || '',
      addCount: parseInt(stat.addCount) || 0,
      replyCount: parseInt(stat.replyCount) || 0,
      totalCount: parseInt(stat.totalCount) || 0,
    }))

    return NextResponse.json({
      stats: formattedStats,
      communityId,
    })
  } catch (error: any) {
    console.error('統計想法貢獻數量錯誤:', error)
    return NextResponse.json(
      { error: '統計想法貢獻數量失敗', details: error.message },
      { status: 500 }
    )
  }
}

