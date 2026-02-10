// ============================================
// 社群管理 API - 單一社群操作
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: 讀取單一社群資訊
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const resolvedParams = await params
    const { communityId } = resolvedParams

    // 查詢社群資訊（包含成員數量）
    const communities = await query(
      `SELECT 
        c.id,
        c.name,
        c.description,
        c.invite_code AS inviteCode,
        c.creator_id AS creatorId,
        c.created_at AS createdDate,
        COUNT(DISTINCT cm.user_id) AS memberCount
      FROM communities c
      LEFT JOIN community_members cm ON c.id = cm.community_id
      WHERE c.id = ?
      GROUP BY c.id, c.name, c.description, c.invite_code, c.creator_id, c.created_at`,
      [communityId]
    ) as any[]

    if (communities.length === 0) {
      return NextResponse.json(
        { error: '社群不存在' },
        { status: 404 }
      )
    }

    const formattedCommunity = {
      id: communities[0].id,
      name: communities[0].name,
      description: communities[0].description || '',
      inviteCode: communities[0].inviteCode,
      creatorId: communities[0].creatorId,
      memberCount: parseInt(communities[0].memberCount) || 0,
      createdDate: communities[0].createdDate
        ? (() => {
            const date = new Date(communities[0].createdDate)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}/${month}/${day}`
          })()
        : '',
    }

    return NextResponse.json(formattedCommunity)
  } catch (error: any) {
    console.error('讀取社群資訊錯誤:', error)
    return NextResponse.json(
      { error: '讀取社群資訊失敗', details: error.message },
      { status: 500 }
    )
  }
}

// PUT: 更新社群資訊
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const resolvedParams = await params
    const { communityId } = resolvedParams
    const body = await request.json()
    const { name, description, inviteCode, userId } = body

    // 驗證必填欄位
    if (!userId) {
      return NextResponse.json(
        { error: '請提供使用者ID' },
        { status: 400 }
      )
    }

    // 檢查使用者是否為社群建立者
    const communities = await query(
      'SELECT creator_id FROM communities WHERE id = ?',
      [communityId]
    ) as any[]

    if (communities.length === 0) {
      return NextResponse.json(
        { error: '社群不存在' },
        { status: 404 }
      )
    }

    if (communities[0].creator_id !== userId) {
      return NextResponse.json(
        { error: '只有建立者可以修改社群資訊' },
        { status: 403 }
      )
    }

    // 如果更新邀請碼，檢查是否已被使用
    if (inviteCode) {
      const existingCommunity = await query(
        'SELECT id FROM communities WHERE invite_code = ? AND id != ?',
        [inviteCode, communityId]
      ) as any[]

      if (existingCommunity.length > 0) {
        return NextResponse.json(
          { error: '此邀請碼已被使用，請選擇其他邀請碼' },
          { status: 400 }
        )
      }
    }

    // 更新社群資訊
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (name !== undefined) {
      updateFields.push('name = ?')
      updateValues.push(name)
    }
    if (description !== undefined) {
      updateFields.push('description = ?')
      updateValues.push(description)
    }
    if (inviteCode !== undefined) {
      updateFields.push('invite_code = ?')
      updateValues.push(inviteCode)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: '沒有需要更新的欄位' },
        { status: 400 }
      )
    }

    updateValues.push(communityId)

    await query(
      `UPDATE communities SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )

    // 查詢更新後的社群資訊
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

    return NextResponse.json(formattedCommunity)
  } catch (error: any) {
    console.error('更新社群資訊錯誤:', error)
    return NextResponse.json(
      { error: '更新社群資訊失敗', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE: 刪除社群
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const resolvedParams = await params
    const { communityId } = resolvedParams
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '請提供使用者ID' },
        { status: 400 }
      )
    }

    // 檢查使用者是否為社群建立者
    const communities = await query(
      'SELECT creator_id FROM communities WHERE id = ?',
      [communityId]
    ) as any[]

    if (communities.length === 0) {
      return NextResponse.json(
        { error: '社群不存在' },
        { status: 404 }
      )
    }

    if (communities[0].creator_id !== userId) {
      return NextResponse.json(
        { error: '只有建立者可以刪除社群' },
        { status: 403 }
      )
    }

    // 刪除社群（外鍵約束會自動刪除相關資料）
    await query('DELETE FROM communities WHERE id = ?', [communityId])

    return NextResponse.json({ message: '社群已刪除' })
  } catch (error: any) {
    console.error('刪除社群錯誤:', error)
    return NextResponse.json(
      { error: '刪除社群失敗', details: error.message },
      { status: 500 }
    )
  }
}


