// ============================================
// 收斂討論區留言 API
// GET: 獲取指定階段的留言列表
// POST: 建立新留言
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'
import { createNotificationsForCommunity } from '@/lib/notifications'

// GET: 獲取指定階段的留言列表
export async function GET(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams

    // 從查詢參數獲取階段
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')

    if (!communityId) {
      return NextResponse.json(
        { error: '請提供社群ID' },
        { status: 400 }
      )
    }

    if (!stage) {
      return NextResponse.json(
        { error: '請提供收斂階段' },
        { status: 400 }
      )
    }

    // 查詢該社群和階段的所有留言（JOIN users 表獲取 nickname）
    // 如果表不存在，返回空數組（優雅處理）
    let comments: any[] = []
    try {
      comments = await query(
        `SELECT 
          cc.id,
          cc.content,
          cc.author_id AS authorId,
          COALESCE(u.nickname, cc.author_account, '未知使用者') AS authorNickname,
          cc.created_at AS createdAt
        FROM convergence_comments cc
        LEFT JOIN users u ON cc.author_id = u.id
        WHERE cc.community_id = ? AND cc.stage = ?
        ORDER BY cc.created_at ASC`,
        [communityId, stage]
      ) as any[]
    } catch (dbError: any) {
      // 如果表不存在（錯誤碼 1146），返回空數組
      if (dbError.code === 'ER_NO_SUCH_TABLE' || dbError.message?.includes('convergence_comments')) {
        console.warn('convergence_comments 表尚未建立，返回空留言列表')
        return NextResponse.json({
          comments: [],
          communityId,
          stage,
        })
      }
      // 其他錯誤重新拋出
      throw dbError
    }

    // 格式化留言資料
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId || '',
      authorNickname: comment.authorNickname || '未知使用者',
      createdAt: comment.createdAt ? new Date(comment.createdAt).toISOString() : new Date().toISOString(),
    }))

    return NextResponse.json({
      comments: formattedComments,
      communityId,
      stage,
    })
  } catch (error: any) {
    console.error('讀取收斂討論區留言錯誤:', error)
    return NextResponse.json(
      { error: '讀取討論區留言失敗', details: error.message },
      { status: 500 }
    )
  }
}

// POST: 建立新留言
export async function POST(
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

    const body = await request.json()
    const { stage, content, authorId } = body

    // 驗證必填欄位
    if (!stage || !content || !authorId) {
      return NextResponse.json(
        { error: '請提供收斂階段、留言內容和留言者ID' },
        { status: 400 }
      )
    }

    // 檢查社群是否存在
    const communities = await query(
      'SELECT id FROM communities WHERE id = ?',
      [communityId]
    ) as any[]

    if (communities.length === 0) {
      return NextResponse.json(
        { error: '社群不存在' },
        { status: 404 }
      )
    }

    // 查詢留言者資訊（nickname 和 account）
    const users = await query(
      'SELECT nickname, account FROM users WHERE id = ?',
      [authorId]
    ) as any[]

    if (users.length === 0) {
      return NextResponse.json(
        { error: '留言者不存在' },
        { status: 404 }
      )
    }

    const authorNickname = users[0].nickname || users[0].account || '未知使用者'
    const authorAccount = users[0].account || '未知使用者' // 保留 account 用於資料庫儲存（向後兼容）

    // 建立留言
    const commentId = uuidv4()

    try {
      await query(
        `INSERT INTO convergence_comments (
          id, community_id, stage, content, author_id, author_account
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [commentId, communityId, stage, content, authorId, authorAccount]
      )
    } catch (dbError: any) {
      // 如果表不存在（錯誤碼 1146），返回友好錯誤訊息
      if (dbError.code === 'ER_NO_SUCH_TABLE' || dbError.message?.includes('convergence_comments')) {
        return NextResponse.json(
          { error: '資料庫表尚未建立，請先執行 database/convergence_comments_schema.sql' },
          { status: 503 }
        )
      }
      // 其他錯誤重新拋出
      throw dbError
    }

    // 查詢新建立的留言（JOIN users 表獲取 nickname）
    const newComments = await query(
      `SELECT 
        cc.id,
        cc.content,
        COALESCE(u.nickname, cc.author_account, '未知使用者') AS authorNickname,
        cc.created_at AS createdAt
      FROM convergence_comments cc
      LEFT JOIN users u ON cc.author_id = u.id
      WHERE cc.id = ?`,
      [commentId]
    ) as any[]

    if (newComments.length === 0) {
      return NextResponse.json(
        { error: '建立留言失敗' },
        { status: 500 }
      )
    }

    const formattedComment = {
      id: newComments[0].id,
      content: newComments[0].content,
      authorNickname: newComments[0].authorNickname || '未知使用者',
      createdAt: newComments[0].createdAt ? new Date(newComments[0].createdAt).toISOString() : new Date().toISOString(),
    }

    // 創建通知給社群內其他成員
    // 截取留言內容前 20 個字作為摘要（避免通知內容過長）
    const contentPreview = content.length > 20 ? content.substring(0, 20) + '...' : content
    let notificationCreated = false
    try {
      await createNotificationsForCommunity({
        communityId,
        actorId: authorId,
        type: 'convergence',
        action: 'create',
        content: `${authorNickname} 在想法收斂討論區留言「${contentPreview}」`,
        relatedId: commentId,
      })
      notificationCreated = true
      console.log('✅ 收斂討論區留言通知創建成功')
    } catch (notificationError: any) {
      // 通知失敗不影響留言建立，但記錄錯誤
      console.error('❌ 創建收斂討論區留言通知失敗:', notificationError)
      console.error('通知錯誤詳情:', {
        message: notificationError.message,
        stack: notificationError.stack,
      })
    }

    return NextResponse.json({
      comment: formattedComment,
      message: '留言建立成功',
      notificationCreated, // 返回通知創建狀態
    })
  } catch (error: any) {
    console.error('建立收斂討論區留言錯誤:', error)
    return NextResponse.json(
      { error: '建立討論區留言失敗', details: error.message },
      { status: 500 }
    )
  }
}

