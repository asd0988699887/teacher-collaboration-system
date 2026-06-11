// ============================================
// 活動資源分享至個人資源
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string; resourceId: string }> }
) {
  try {
    const { communityId, resourceId } = await params
    const body = await request.json()
    const userId = body.userId as string | undefined

    if (!userId) {
      return NextResponse.json({ error: '請提供使用者ID' }, { status: 400 })
    }

    const resourceRows = (await query(
      `SELECT id, file_name, file_path, file_size, file_type
       FROM resources WHERE id = ? AND community_id = ?`,
      [resourceId, communityId]
    )) as {
      id: string
      file_name: string
      file_path: string | null
      file_size: number | null
      file_type: string | null
    }[]

    if (resourceRows.length === 0) {
      return NextResponse.json({ error: '活動資源不存在' }, { status: 404 })
    }

    const resource = resourceRows[0]
    if (!resource.file_path) {
      return NextResponse.json({ error: '檔案路徑不存在' }, { status: 404 })
    }

    const members = (await query(
      'SELECT 1 FROM community_members WHERE community_id = ? AND user_id = ?',
      [communityId, userId]
    )) as unknown[]

    if (members.length === 0) {
      return NextResponse.json({ error: '您不是該共備活動的成員' }, { status: 403 })
    }

    const users = (await query('SELECT id FROM users WHERE id = ?', [userId])) as { id: string }[]
    if (users.length === 0) {
      return NextResponse.json({ error: '使用者不存在' }, { status: 404 })
    }

    const sourcePath = join(process.cwd(), 'public', resource.file_path)
    if (!existsSync(sourcePath)) {
      return NextResponse.json({ error: '來源檔案不存在' }, { status: 404 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'personal', userId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const fileExtension = resource.file_name.split('.').pop() || ''
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const destPath = join(uploadDir, uniqueFileName)
    const fileBuffer = await readFile(sourcePath)
    await writeFile(destPath, fileBuffer)

    if (process.platform !== 'win32') {
      try {
        const { chmod } = await import('fs/promises')
        await chmod(destPath, 0o644)
      } catch {
        // 非致命
      }
    }

    const relativePath = `/uploads/personal/${userId}/${uniqueFileName}`
    const newResourceId = uuidv4()

    await query(
      `INSERT INTO personal_resources (id, user_id, file_name, file_path, file_size, file_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        newResourceId,
        userId,
        resource.file_name,
        relativePath,
        resource.file_size,
        resource.file_type,
      ]
    )

    return NextResponse.json({
      message: '已分享至個人資源',
      personalResourceId: newResourceId,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知錯誤'
    console.error('分享活動資源至個人資源錯誤:', error)
    return NextResponse.json(
      { error: '分享失敗', details: message },
      { status: 500 }
    )
  }
}
