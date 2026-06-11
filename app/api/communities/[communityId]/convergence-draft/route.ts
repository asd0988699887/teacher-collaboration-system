// ============================================
// 想法收斂草稿 API
// GET: 取得指定階段已儲存的勾選節點與收斂結果文字
// PUT: 管理員儲存指定階段的勾選節點與收斂結果文字
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

const EMPTY_DRAFT = { selectedIdeaIds: [] as string[], convergenceContent: '' }

function parseSelectedIdeaIds(raw: unknown): string[] {
  if (!raw || typeof raw !== 'string') return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

// GET: 取得草稿
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const { communityId } = await params
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')

    if (!communityId) {
      return NextResponse.json({ error: '請提供社群ID' }, { status: 400 })
    }
    if (!stage) {
      return NextResponse.json({ error: '請提供收斂階段' }, { status: 400 })
    }

    try {
      const results = (await query(
        `SELECT selected_idea_ids AS selectedIdeaIds, convergence_content AS convergenceContent
         FROM convergence_drafts
         WHERE community_id = ? AND stage = ?`,
        [communityId, stage]
      )) as any[]

      if (results.length === 0) {
        return NextResponse.json(EMPTY_DRAFT)
      }

      return NextResponse.json({
        selectedIdeaIds: parseSelectedIdeaIds(results[0].selectedIdeaIds),
        convergenceContent: results[0].convergenceContent || '',
      })
    } catch (dbError: any) {
      // 表尚未建立時回傳空草稿，避免影響使用
      if (
        dbError.code === 'ER_NO_SUCH_TABLE' ||
        dbError.message?.includes("doesn't exist") ||
        dbError.message?.includes('convergence_drafts')
      ) {
        return NextResponse.json(EMPTY_DRAFT)
      }
      throw dbError
    }
  } catch (error: any) {
    console.error('讀取收斂草稿錯誤:', error)
    return NextResponse.json(
      { error: '讀取收斂草稿失敗', details: error.message },
      { status: 500 }
    )
  }
}

// PUT: 儲存草稿
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string }> }
) {
  try {
    const { communityId } = await params

    if (!communityId) {
      return NextResponse.json({ error: '請提供社群ID' }, { status: 400 })
    }

    const body = await request.json()
    const { stage, selectedIdeaIds, convergenceContent, userId } = body

    if (!stage) {
      return NextResponse.json({ error: '請提供收斂階段' }, { status: 400 })
    }

    const idsJson = JSON.stringify(
      Array.isArray(selectedIdeaIds) ? selectedIdeaIds.filter((id: unknown) => typeof id === 'string') : []
    )
    const content = typeof convergenceContent === 'string' ? convergenceContent : ''

    try {
      await query(
        `INSERT INTO convergence_drafts (community_id, stage, selected_idea_ids, convergence_content, updated_by, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           selected_idea_ids = VALUES(selected_idea_ids),
           convergence_content = VALUES(convergence_content),
           updated_by = VALUES(updated_by),
           updated_at = NOW()`,
        [communityId, stage, idsJson, content, userId || null]
      )
    } catch (dbError: any) {
      if (
        dbError.code === 'ER_NO_SUCH_TABLE' ||
        dbError.message?.includes("doesn't exist") ||
        dbError.message?.includes('convergence_drafts')
      ) {
        return NextResponse.json(
          { error: '資料表尚未建立，請先執行 database/migrations/create_convergence_draft_table.sql' },
          { status: 503 }
        )
      }
      throw dbError
    }

    return NextResponse.json({ message: '收斂草稿已儲存' })
  } catch (error: any) {
    console.error('儲存收斂草稿錯誤:', error)
    return NextResponse.json(
      { error: '儲存收斂草稿失敗', details: error.message },
      { status: 500 }
    )
  }
}
