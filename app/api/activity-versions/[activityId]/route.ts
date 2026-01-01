// ============================================
// 版本管理 API 路由
// GET: 讀取活動的所有版本
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// 生成 UUID（簡單實作）
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// GET: 讀取活動的所有版本
export async function GET(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { activityId } = resolvedParams

    if (!activityId) {
      return NextResponse.json(
        { error: '缺少活動 ID' },
        { status: 400 }
      )
    }

    // 讀取版本列表，包含使用者資訊
    const versions = await query(
      `SELECT 
        av.id,
        av.version_number,
        av.modified_by,
        av.created_at,
        u.nickname,
        u.account
      FROM activity_versions av
      LEFT JOIN users u ON av.modified_by = u.id
      WHERE av.activity_id = ?
      ORDER BY av.version_number DESC`,
      [activityId]
    ) as any[]

    // 格式化日期和時間
    const formattedVersions = (versions || []).map((version: any) => {
      const date = new Date(version.created_at)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')

      return {
        id: version.id,
        versionNumber: version.version_number,
        lastModifiedDate: `${year}/${month}/${day}`,
        lastModifiedTime: `${hours}:${minutes}`,
        lastModifiedUser: version.nickname || version.account || '未知使用者',
        userId: version.modified_by,
      }
    })

    return NextResponse.json({
      versions: formattedVersions,
    })
  } catch (error: any) {
    console.error('讀取版本列表錯誤:', error)
    return NextResponse.json(
      { error: '讀取版本列表失敗', details: error.message },
      { status: 500 }
    )
  }
}


