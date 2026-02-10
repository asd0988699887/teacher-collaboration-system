// ============================================
// 社群資源下載 API
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// GET: 下載資源檔案
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string; resourceId: string }> }
) {
  try {
    const resolvedParams = await params
    const { communityId, resourceId } = resolvedParams

    // 查詢資源資訊
    const resources = await query(
      'SELECT id, file_name, file_path FROM resources WHERE id = ? AND community_id = ?',
      [resourceId, communityId]
    ) as any[]

    if (resources.length === 0) {
      return NextResponse.json(
        { error: '資源不存在' },
        { status: 404 }
      )
    }

    const resource = resources[0]
    const filePath = resource.file_path

    if (!filePath) {
      return NextResponse.json(
        { error: '檔案路徑不存在' },
        { status: 404 }
      )
    }

    // 讀取檔案
    const fullPath = join(process.cwd(), 'public', filePath)
    
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: '檔案不存在' },
        { status: 404 }
      )
    }

    const fileBuffer = await readFile(fullPath)

    // 返回檔案
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(resource.file_name)}"`,
      },
    })
  } catch (error: any) {
    console.error('下載資源錯誤:', error)
    return NextResponse.json(
      { error: '下載資源失敗', details: error.message },
      { status: 500 }
    )
  }
}

