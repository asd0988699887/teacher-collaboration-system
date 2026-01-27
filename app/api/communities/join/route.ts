// ============================================
// 加入社群 API（使用邀請碼）
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inviteCode, userId } = body

    // 驗證必填欄位
    if (!inviteCode || !userId) {
      return NextResponse.json(
        { error: '請提供邀請碼和使用者ID' },
        { status: 400 }
      )
    }

    // 查詢社群
    const communities = await query(
      'SELECT id, name FROM communities WHERE invite_code = ?',
      [inviteCode]
    ) as any[]

    if (communities.length === 0) {
      return NextResponse.json(
        { error: '邀請碼無效' },
        { status: 404 }
      )
    }

    const communityId = communities[0].id

    // 檢查使用者是否已經加入
    const existingMembers = await query(
      'SELECT id FROM community_members WHERE community_id = ? AND user_id = ?',
      [communityId, userId]
    ) as any[]

    if (existingMembers.length > 0) {
      return NextResponse.json(
        { error: '您已經加入此社群' },
        { status: 400 }
      )
    }

    // 檢查使用者是否存在
    const users = await query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    ) as any[]

    if (users.length === 0) {
      return NextResponse.json(
        { error: '使用者不存在' },
        { status: 404 }
      )
    }

    // 加入社群（預設角色為 member）
    const memberId = uuidv4()
    await query(
      'INSERT INTO community_members (id, community_id, user_id, role) VALUES (?, ?, ?, ?)',
      [memberId, communityId, userId, 'member']
    )

    // 查詢加入後的社群資訊
    const updatedCommunities = await query(
      `SELECT 
        c.id,
        c.name,
        c.description,
        c.invite_code AS inviteCode,
        c.created_at AS createdDate,
        COUNT(DISTINCT cm.user_id) AS memberCount
      FROM communities c
      LEFT JOIN community_members cm ON c.id = cm.community_id
      WHERE c.id = ?
      GROUP BY c.id, c.name, c.description, c.invite_code, c.created_at`,
      [communityId]
    ) as any[]

    const formattedCommunity = {
      id: updatedCommunities[0].id,
      name: updatedCommunities[0].name,
      description: updatedCommunities[0].description || '',
      inviteCode: updatedCommunities[0].inviteCode,
      memberCount: parseInt(updatedCommunities[0].memberCount) || 0,
      createdDate: updatedCommunities[0].createdDate
        ? (() => {
            const date = new Date(updatedCommunities[0].createdDate)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}/${month}/${day}`
          })()
        : '',
    }

    return NextResponse.json(formattedCommunity, { status: 201 })
  } catch (error: any) {
    console.error('加入社群錯誤:', error)
    return NextResponse.json(
      { error: '加入社群失敗', details: error.message },
      { status: 500 }
    )
  }
}


