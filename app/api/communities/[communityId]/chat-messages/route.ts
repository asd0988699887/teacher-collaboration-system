// ============================================
// 聊天室訊息 API
// GET: 訊息列表（依時間由舊到新）
// POST: 發送訊息（自動記錄 createdAt 與 senderId）
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'

interface ChatMessageRow {
  id: string
  content: string
  senderId: string | null
  senderName: string | null
  createdAt: string | Date | null
}

function formatMessage(row: ChatMessageRow) {
  return {
    id: row.id,
    content: row.content,
    senderId: row.senderId || '',
    senderName: row.senderName || '未知使用者',
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
  }
}

// GET: 讀取訊息列表（舊到新）
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const { communityId } = await params

    if (!communityId) {
      return NextResponse.json({ error: '請提供社群ID' }, { status: 400 })
    }

    let rows: ChatMessageRow[] = []
    try {
      rows = (await query(
        `SELECT 
          c.id,
          c.content,
          c.sender_id AS senderId,
          u.nickname AS senderName,
          c.created_at AS createdAt
        FROM chat_messages c
        LEFT JOIN users u ON c.sender_id = u.id
        WHERE c.community_id = ?
        ORDER BY c.created_at ASC`,
        [communityId]
      )) as ChatMessageRow[]
    } catch (dbError: unknown) {
      const err = dbError as { code?: string; message?: string }
      if (err.code === 'ER_NO_SUCH_TABLE' || err.message?.includes('chat_messages')) {
        console.warn('chat_messages 表尚未建立，返回空訊息列表')
        return NextResponse.json({ messages: [] })
      }
      throw dbError
    }

    return NextResponse.json({ messages: rows.map(formatMessage) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知錯誤'
    console.error('讀取聊天訊息錯誤:', error)
    return NextResponse.json(
      { error: '讀取聊天訊息失敗', details: message },
      { status: 500 }
    )
  }
}

// POST: 發送訊息
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
    const senderId = body.senderId as string | undefined

    if (!content) {
      return NextResponse.json({ error: '請輸入訊息內容' }, { status: 400 })
    }

    if (!senderId) {
      return NextResponse.json({ error: '請提供發送者ID' }, { status: 400 })
    }

    const communities = (await query('SELECT id FROM communities WHERE id = ?', [
      communityId,
    ])) as { id: string }[]
    if (communities.length === 0) {
      return NextResponse.json({ error: '社群不存在' }, { status: 404 })
    }

    const messageId = uuidv4()

    try {
      await query(
        `INSERT INTO chat_messages (id, community_id, content, sender_id)
         VALUES (?, ?, ?, ?)`,
        [messageId, communityId, content, senderId]
      )
    } catch (dbError: unknown) {
      const err = dbError as { code?: string; message?: string }
      if (err.code === 'ER_NO_SUCH_TABLE' || err.message?.includes('chat_messages')) {
        return NextResponse.json(
          { error: '資料庫表尚未建立，請先執行 database/migrations/add_chat_messages.sql' },
          { status: 503 }
        )
      }
      throw dbError
    }

    const rows = (await query(
      `SELECT 
        c.id,
        c.content,
        c.sender_id AS senderId,
        u.nickname AS senderName,
        c.created_at AS createdAt
      FROM chat_messages c
      LEFT JOIN users u ON c.sender_id = u.id
      WHERE c.id = ?`,
      [messageId]
    )) as ChatMessageRow[]

    if (rows.length === 0) {
      return NextResponse.json({ error: '發送訊息失敗' }, { status: 500 })
    }

    return NextResponse.json(
      { message: formatMessage(rows[0]), success: true },
      { status: 201 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知錯誤'
    console.error('發送聊天訊息錯誤:', error)
    return NextResponse.json(
      { error: '發送訊息失敗', details: message },
      { status: 500 }
    )
  }
}
