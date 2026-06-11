// ============================================
// 社群公告刪除 API（僅管理員）
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

async function isCommunityAdmin(communityId: string, userId: string): Promise<boolean> {
  const communities = (await query('SELECT creator_id FROM communities WHERE id = ?', [
    communityId,
  ])) as { creator_id: string }[]

  if (communities.length === 0) return false
  if (communities[0].creator_id === userId) return true

  const members = (await query(
    'SELECT role FROM community_members WHERE community_id = ? AND user_id = ?',
    [communityId, userId]
  )) as { role: string }[]

  return members.length > 0 && members[0].role === 'admin'
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string; announcementId: string }> }
) {
  try {
    const { communityId, announcementId } = await params
    const operatorId = request.nextUrl.searchParams.get('operatorId')

    if (!operatorId) {
      return NextResponse.json({ error: '請提供操作者ID' }, { status: 400 })
    }

    const canManage = await isCommunityAdmin(communityId, operatorId)
    if (!canManage) {
      return NextResponse.json({ error: '只有管理員可以刪除公告' }, { status: 403 })
    }

    const rows = (await query(
      'SELECT id FROM announcements WHERE id = ? AND community_id = ?',
      [announcementId, communityId]
    )) as { id: string }[]

    if (rows.length === 0) {
      return NextResponse.json({ error: '公告不存在' }, { status: 404 })
    }

    await query('DELETE FROM announcements WHERE id = ? AND community_id = ?', [
      announcementId,
      communityId,
    ])

    return NextResponse.json({ message: '公告已刪除' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知錯誤'
    console.error('刪除公告錯誤:', error)
    return NextResponse.json({ error: '刪除公告失敗', details: message }, { status: 500 })
  }
}
