// ============================================
// 想法牆 API - 修改紀錄查詢
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: 讀取指定想法節點的修改紀錄
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ideaId: string }> }
) {
  try {
    const { ideaId } = await params

    // 確認節點存在
    const ideas = await query(
      'SELECT id FROM ideas WHERE id = ?',
      [ideaId]
    ) as any[]

    if (ideas.length === 0) {
      return NextResponse.json(
        { error: '想法不存在' },
        { status: 404 }
      )
    }

    // 查詢修改紀錄（最新優先）
    const history = await query(
      `SELECT
        h.id,
        h.edited_at AS editedAt,
        h.old_activity_id AS oldActivityId,
        h.new_activity_id AS newActivityId,
        h.old_stage AS oldStage,
        h.new_stage AS newStage,
        h.old_title AS oldTitle,
        h.new_title AS newTitle,
        h.old_content AS oldContent,
        h.new_content AS newContent,
        u.nickname AS editorName
      FROM idea_edit_history h
      INNER JOIN users u ON h.editor_id = u.id
      WHERE h.idea_id = ?
      ORDER BY h.edited_at DESC`,
      [ideaId]
    ) as any[]

    const formatted = history.map((h: any) => {
      // 格式化編輯時間
      let editedAtFormatted = ''
      if (h.editedAt) {
        const dt = new Date(h.editedAt)
        const y = dt.getFullYear()
        const m = String(dt.getMonth() + 1).padStart(2, '0')
        const d = String(dt.getDate()).padStart(2, '0')
        const hh = String(dt.getHours()).padStart(2, '0')
        const mm = String(dt.getMinutes()).padStart(2, '0')
        editedAtFormatted = `${y}/${m}/${d} ${hh}:${mm}`
      }

      return {
        id: h.id,
        editorName: h.editorName || '',
        editedAt: editedAtFormatted,
        oldActivityId: h.oldActivityId || null,
        newActivityId: h.newActivityId || null,
        oldStage: h.oldStage ?? null,
        newStage: h.newStage ?? null,
        oldTitle: h.oldTitle ?? null,
        newTitle: h.newTitle ?? null,
        oldContent: h.oldContent ?? null,
        newContent: h.newContent ?? null,
      }
    })

    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error('讀取修改紀錄錯誤:', error)
    return NextResponse.json(
      { error: '讀取修改紀錄失敗', details: error.message },
      { status: 500 }
    )
  }
}
