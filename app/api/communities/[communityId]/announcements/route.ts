// ============================================
// 社群公告欄 API
// GET: 公告列表（依最新時間排序）
// POST: 發布公告（自動記錄 createdAt 與 createdBy）
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'
import { upsertMergedAnnouncementNotifications } from '@/lib/notifications'

interface AnnouncementRow {
  id: string
  content: string
  createdBy: string | null
  createdByName: string | null
  createdAt: string | Date | null
}

function formatAnnouncement(row: AnnouncementRow) {
  return {
    id: row.id,
    content: row.content,
    createdBy: row.createdBy || '',
    createdByName: row.createdByName || '未知使用者',
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
  }
}

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

// GET: 讀取公告列表
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const { communityId } = await params

    if (!communityId) {
      return NextResponse.json({ error: '請提供社群ID' }, { status: 400 })
    }

    let rows: AnnouncementRow[] = []
    try {
      rows = (await query(
        `SELECT 
          a.id,
          a.content,
          a.created_by AS createdBy,
          u.nickname AS createdByName,
          a.created_at AS createdAt
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        WHERE a.community_id = ?
        ORDER BY a.created_at DESC`,
        [communityId]
      )) as AnnouncementRow[]
    } catch (dbError: unknown) {
      const err = dbError as { code?: string; message?: string }
      if (err.code === 'ER_NO_SUCH_TABLE' || err.message?.includes('announcements')) {
        console.warn('announcements 表尚未建立，返回空公告列表')
        return NextResponse.json({ announcements: [] })
      }
      throw dbError
    }

    return NextResponse.json({ announcements: rows.map(formatAnnouncement) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知錯誤'
    console.error('讀取公告列表錯誤:', error)
    return NextResponse.json(
      { error: '讀取公告列表失敗', details: message },
      { status: 500 }
    )
  }
}

// POST: 發布公告
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const { communityId } = await params

    if (!communityId) {
      return NextResponse.json({ error: '請提供社群ID' }, { status: 400 })
    }

    const body = await request.json()
    const content = typeof body.content === 'string' ? body.content.trim() : ''
    const createdBy = body.createdBy as string | undefined

    if (!content) {
      return NextResponse.json({ error: '請輸入公告內容' }, { status: 400 })
    }

    if (!createdBy) {
      return NextResponse.json({ error: '請提供發布人ID' }, { status: 400 })
    }

    const canManage = await isCommunityAdmin(communityId, createdBy)
    if (!canManage) {
      return NextResponse.json({ error: '只有管理員可以發布公告' }, { status: 403 })
    }

    const communities = (await query('SELECT id FROM communities WHERE id = ?', [
      communityId,
    ])) as { id: string }[]
    if (communities.length === 0) {
      return NextResponse.json({ error: '社群不存在' }, { status: 404 })
    }

    const announcementId = uuidv4()

    try {
      await query(
        `INSERT INTO announcements (id, community_id, content, created_by)
         VALUES (?, ?, ?, ?)`,
        [announcementId, communityId, content, createdBy]
      )
    } catch (dbError: unknown) {
      const err = dbError as { code?: string; message?: string }
      if (err.code === 'ER_NO_SUCH_TABLE' || err.message?.includes('announcements')) {
        return NextResponse.json(
          { error: '資料庫表尚未建立，請先執行 database/migrations/add_announcements.sql' },
          { status: 503 }
        )
      }
      throw dbError
    }

    const rows = (await query(
      `SELECT 
        a.id,
        a.content,
        a.created_by AS createdBy,
        u.nickname AS createdByName,
        a.created_at AS createdAt
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = ?`,
      [announcementId]
    )) as AnnouncementRow[]

    if (rows.length === 0) {
      return NextResponse.json({ error: '建立公告失敗' }, { status: 500 })
    }

    const publisherName = rows[0].createdByName || '管理員'
    try {
      await upsertMergedAnnouncementNotifications({
        communityId,
        actorId: createdBy,
        publisherName,
      })
    } catch (notificationError) {
      console.error('創建公告通知失敗:', notificationError)
    }

    return NextResponse.json(
      { announcement: formatAnnouncement(rows[0]), message: '公告發布成功' },
      { status: 201 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知錯誤'
    console.error('發布公告錯誤:', error)
    return NextResponse.json(
      { error: '發布公告失敗', details: message },
      { status: 500 }
    )
  }
}
