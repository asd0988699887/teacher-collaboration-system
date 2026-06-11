// ============================================
// 個人資源下載 API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string; resourceId: string }> }
) {
  try {
    const { userId, resourceId } = await params

    const resources = (await query(
      'SELECT id, file_name, file_path FROM personal_resources WHERE id = ? AND user_id = ?',
      [resourceId, userId]
    )) as { id: string; file_name: string; file_path: string | null }[]

    if (resources.length === 0) {
      return NextResponse.json({ error: '資源不存在' }, { status: 404 })
    }

    const resource = resources[0]
    if (!resource.file_path) {
      return NextResponse.json({ error: '檔案路徑不存在' }, { status: 404 })
    }

    const fullPath = join(process.cwd(), 'public', resource.file_path)
    if (!existsSync(fullPath)) {
      return NextResponse.json({ error: '檔案不存在' }, { status: 404 })
    }

    const fileBuffer = await readFile(fullPath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(resource.file_name)}"`,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知錯誤'
    console.error('下載個人資源錯誤:', error)
    return NextResponse.json(
      { error: '下載個人資源失敗', details: message },
      { status: 500 }
    )
  }
}
