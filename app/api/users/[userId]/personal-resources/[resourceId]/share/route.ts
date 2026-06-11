// ============================================
// 個人資源分享至共備活動（社群資源）
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'
import { createNotificationsForCommunity } from '@/lib/notifications'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; resourceId: string }> }
) {
  try {
    const { userId, resourceId } = await params
    const body = await request.json()
    const communityId = body.communityId as string | undefined

    if (!communityId) {
      return NextResponse.json({ error: '請選擇要分享到的共備活動' }, { status: 400 })
    }

    const personalRows = (await query(
      `SELECT id, file_name, file_path, file_size, file_type
       FROM personal_resources WHERE id = ? AND user_id = ?`,
      [resourceId, userId]
    )) as {
      id: string
      file_name: string
      file_path: string | null
      file_size: number | null
      file_type: string | null
    }[]

    if (personalRows.length === 0) {
      return NextResponse.json({ error: '個人資源不存在' }, { status: 404 })
    }

    const personal = personalRows[0]
    if (!personal.file_path) {
      return NextResponse.json({ error: '檔案路徑不存在' }, { status: 404 })
    }

    const members = (await query(
      'SELECT 1 FROM community_members WHERE community_id = ? AND user_id = ?',
      [communityId, userId]
    )) as unknown[]

    if (members.length === 0) {
      return NextResponse.json({ error: '您不是該共備活動的成員' }, { status: 403 })
    }

    const communities = (await query(
      'SELECT id FROM communities WHERE id = ?',
      [communityId]
    )) as { id: string }[]

    if (communities.length === 0) {
      return NextResponse.json({ error: '共備活動不存在' }, { status: 404 })
    }

    const sourcePath = join(process.cwd(), 'public', personal.file_path)
    if (!existsSync(sourcePath)) {
      return NextResponse.json({ error: '來源檔案不存在' }, { status: 404 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', communityId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const fileExtension = personal.file_name.split('.').pop() || ''
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

    const relativePath = `/uploads/${communityId}/${uniqueFileName}`
    const newResourceId = uuidv4()

    await query(
      `INSERT INTO resources (id, community_id, file_name, file_path, file_size, file_type, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        newResourceId,
        communityId,
        personal.file_name,
        relativePath,
        personal.file_size,
        personal.file_type,
        userId,
      ]
    )

    const uploaderRows = (await query(
      'SELECT nickname FROM users WHERE id = ?',
      [userId]
    )) as { nickname: string }[]
    const uploaderName = uploaderRows[0]?.nickname || ''

    await createNotificationsForCommunity({
      communityId,
      actorId: userId,
      type: 'file',
      action: 'create',
      content: `${uploaderName} 分享了檔案「${personal.file_name}」至社群資源`,
      relatedId: newResourceId,
    })

    return NextResponse.json({
      message: '已分享至共備活動',
      communityResourceId: newResourceId,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知錯誤'
    console.error('分享個人資源錯誤:', error)
    return NextResponse.json(
      { error: '分享失敗', details: message },
      { status: 500 }
    )
  }
}
