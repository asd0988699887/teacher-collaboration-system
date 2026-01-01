// ============================================
// 社群成員管理 API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: 讀取社群成員列表
export async function GET(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams

    // 查詢社群成員（使用視圖）
    const members = await query(
      `SELECT 
        cm.id,
        cm.user_id AS userId,
        cm.role,
        cm.joined_at AS joinedAt,
        u.account,
        u.nickname,
        u.email,
        u.school
      FROM community_members_detail cm
      INNER JOIN users u ON cm.user_id = u.id
      WHERE cm.community_id = ?
      ORDER BY 
        CASE cm.role 
          WHEN 'admin' THEN 1 
          ELSE 2 
        END,
        cm.joined_at`,
      [communityId]
    ) as any[]

    const formattedMembers = members.map((member) => ({
      id: member.id,
      userId: member.userId,
      account: member.account,
      nickname: member.nickname,
      email: member.email,
      school: member.school || '',
      role: member.role,
      joinedAt: member.joinedAt
        ? new Date(member.joinedAt).toISOString()
        : '',
    }))

    return NextResponse.json(formattedMembers)
  } catch (error: any) {
    console.error('讀取社群成員列表錯誤:', error)
    return NextResponse.json(
      { error: '讀取社群成員列表失敗', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE: 退出社群或刪除成員
export async function DELETE(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') // 要刪除的成員ID
    const operatorId = searchParams.get('operatorId') // 操作者ID

    if (!userId || !operatorId) {
      return NextResponse.json(
        { error: '請提供使用者ID和操作者ID' },
        { status: 400 }
      )
    }

    // 檢查操作者是否為管理員或建立者
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

    const isCreator = communities[0].creator_id === operatorId

    // 查詢操作者的角色
    const operatorMembers = await query(
      'SELECT role FROM community_members WHERE community_id = ? AND user_id = ?',
      [communityId, operatorId]
    ) as any[]

    const isAdmin = operatorMembers.length > 0 && operatorMembers[0].role === 'admin'

    // 只有建立者或管理員可以刪除成員
    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: '只有建立者或管理員可以刪除成員' },
        { status: 403 }
      )
    }

    // 建立者不能刪除自己
    if (userId === communities[0].creator_id) {
      return NextResponse.json(
        { error: '建立者不能刪除自己' },
        { status: 400 }
      )
    }

    // 刪除成員
    await query(
      'DELETE FROM community_members WHERE community_id = ? AND user_id = ?',
      [communityId, userId]
    )

    return NextResponse.json({ message: '成員已刪除' })
  } catch (error: any) {
    console.error('刪除社群成員錯誤:', error)
    return NextResponse.json(
      { error: '刪除社群成員失敗', details: error.message },
      { status: 500 }
    )
  }
}

// PUT: 更新成員角色
export async function PUT(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams
    const body = await request.json()
    const { userId, role, operatorId } = body

    // 驗證必填欄位
    if (!userId || !role || !operatorId) {
      return NextResponse.json(
        { error: '請提供使用者ID、角色和操作者ID' },
        { status: 400 }
      )
    }

    // 驗證角色
    if (role !== 'admin' && role !== 'member') {
      return NextResponse.json(
        { error: '角色必須是 admin 或 member' },
        { status: 400 }
      )
    }

    // 檢查社群是否存在
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

    const isCreator = communities[0].creator_id === operatorId

    // 查詢操作者的角色
    const operatorMembers = await query(
      'SELECT role FROM community_members WHERE community_id = ? AND user_id = ?',
      [communityId, operatorId]
    ) as any[]

    const isAdmin = operatorMembers.length > 0 && operatorMembers[0].role === 'admin'

    // 只有建立者或管理員可以修改成員角色
    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: '只有建立者或管理員可以修改成員角色' },
        { status: 403 }
      )
    }

    // 更新成員角色
    await query(
      'UPDATE community_members SET role = ? WHERE community_id = ? AND user_id = ?',
      [role, communityId, userId]
    )

    // 查詢更新後的成員資訊
    const updatedMembers = await query(
      `SELECT 
        cm.id,
        cm.user_id AS userId,
        cm.role,
        cm.joined_at AS joinedAt,
        u.account,
        u.nickname,
        u.email,
        u.school
      FROM community_members_detail cm
      INNER JOIN users u ON cm.user_id = u.id
      WHERE cm.community_id = ? AND cm.user_id = ?`,
      [communityId, userId]
    ) as any[]

    if (updatedMembers.length === 0) {
      return NextResponse.json(
        { error: '成員不存在' },
        { status: 404 }
      )
    }

    const formattedMember = {
      id: updatedMembers[0].id,
      userId: updatedMembers[0].userId,
      account: updatedMembers[0].account,
      nickname: updatedMembers[0].nickname,
      email: updatedMembers[0].email,
      school: updatedMembers[0].school || '',
      role: updatedMembers[0].role,
      joinedAt: updatedMembers[0].joinedAt
        ? new Date(updatedMembers[0].joinedAt).toISOString()
        : '',
    }

    return NextResponse.json(formattedMember)
  } catch (error: any) {
    console.error('更新成員角色錯誤:', error)
    return NextResponse.json(
      { error: '更新成員角色失敗', details: error.message },
      { status: 500 }
    )
  }
}


