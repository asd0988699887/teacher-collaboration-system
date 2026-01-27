// ============================================
// 社群管理 API - 列表和建立
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { query, transaction } from '@/lib/db'

// GET: 讀取使用者的社群列表
export async function GET(request: NextRequest) {
  try {
    // 從查詢參數獲取使用者ID（暫時從 query 參數獲取，後續可改為從 session/token）
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '請提供使用者ID' },
        { status: 400 }
      )
    }

    // 查詢使用者加入的所有社群
    const userCommunities = await query(
      `SELECT DISTINCT community_id 
       FROM community_members 
       WHERE user_id = ?`,
      [userId]
    ) as any[]

    const communityIds = userCommunities.map(uc => uc.community_id)

    if (communityIds.length === 0) {
      return NextResponse.json([])
    }

    // 查詢這些社群的詳細資訊和成員數量
    const placeholders = communityIds.map(() => '?').join(',')
    const communities = await query(
      `SELECT 
        c.id,
        c.name,
        c.description,
        c.invite_code AS inviteCode,
        c.creator_id AS creatorId,
        c.created_at AS createdDate,
        (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id) AS memberCount
      FROM communities c
      WHERE c.id IN (${placeholders})
      ORDER BY c.created_at DESC`,
      communityIds
    ) as any[]

    // 格式化日期
    const formattedCommunities = communities.map((community) => ({
      id: community.id,
      name: community.name,
      description: community.description || '',
      inviteCode: community.inviteCode,
      memberCount: parseInt(community.memberCount) || 0,
      createdDate: community.createdDate
        ? (() => {
            const date = new Date(community.createdDate)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}/${month}/${day}`
          })()
        : '',
    }))

    return NextResponse.json(formattedCommunities)
  } catch (error: any) {
    console.error('讀取社群列表錯誤:', error)
    return NextResponse.json(
      { error: '讀取社群列表失敗', details: error.message },
      { status: 500 }
    )
  }
}

// POST: 建立新社群
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, inviteCode, creatorId } = body

    // 驗證必填欄位
    if (!name || !inviteCode || !creatorId) {
      return NextResponse.json(
        { error: '請填寫所有必填欄位（名稱、邀請碼、建立者ID）' },
        { status: 400 }
      )
    }

    // 檢查邀請碼是否已存在
    const existingCommunity = await query(
      'SELECT id FROM communities WHERE invite_code = ?',
      [inviteCode]
    ) as any[]

    if (existingCommunity.length > 0) {
      return NextResponse.json(
        { error: '此邀請碼已被使用，請選擇其他邀請碼' },
        { status: 400 }
      )
    }

    // 檢查建立者是否存在
    const users = await query(
      'SELECT id FROM users WHERE id = ?',
      [creatorId]
    ) as any[]

    if (users.length === 0) {
      return NextResponse.json(
        { error: '建立者不存在' },
        { status: 404 }
      )
    }

    // 使用事務建立社群（觸發器會自動將建立者加入成員表並設為管理員）
    const communityId = uuidv4()
    
    await transaction(async (connection) => {
      // 建立社群
      await connection.execute(
        'INSERT INTO communities (id, name, description, invite_code, creator_id) VALUES (?, ?, ?, ?, ?)',
        [communityId, name, description || null, inviteCode, creatorId]
      )
    })

    // 查詢新建立的社群（包含成員數量）
    const newCommunity = await query(
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

    if (newCommunity.length === 0) {
      return NextResponse.json(
        { error: '建立社群失敗' },
        { status: 500 }
      )
    }

    const formattedCommunity = {
      id: newCommunity[0].id,
      name: newCommunity[0].name,
      description: newCommunity[0].description || '',
      inviteCode: newCommunity[0].inviteCode,
      memberCount: parseInt(newCommunity[0].memberCount) || 1,
      createdDate: newCommunity[0].createdDate
        ? (() => {
            const date = new Date(newCommunity[0].createdDate)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}/${month}/${day}`
          })()
        : '',
    }

    return NextResponse.json(formattedCommunity, { status: 201 })
  } catch (error: any) {
    console.error('建立社群錯誤:', error)
    return NextResponse.json(
      { error: '建立社群失敗', details: error.message },
      { status: 500 }
    )
  }
}


