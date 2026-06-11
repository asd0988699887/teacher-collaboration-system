// ============================================
// 個人資源 API - 列表、上傳、刪除
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { storageConfig, isFileTypeAllowed, formatFileSize } from '@/lib/storage-config'

function formatUploadDate(uploadDate: unknown): string {
  if (!uploadDate) return ''
  const date = new Date(uploadDate as string)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

function mapPersonalResource(row: Record<string, unknown>) {
  return {
    id: row.id,
    fileName: row.fileName,
    filePath: row.filePath || '',
    fileSize: row.fileSize || 0,
    fileType: row.fileType || '',
    uploadDate: formatUploadDate(row.uploadDate),
    uploadTime: row.uploadTime || '',
    uploaderName: row.uploaderName || '',
    uploaderId: row.uploadedBy || row.user_id || '',
  }
}

// GET: 讀取個人資源列表
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const resources = (await query(
      `SELECT 
        r.id,
        r.file_name AS fileName,
        r.file_path AS filePath,
        r.file_size AS fileSize,
        r.file_type AS fileType,
        r.user_id AS uploadedBy,
        r.created_at AS uploadDate,
        DATE_FORMAT(r.created_at, '%H:%i') AS uploadTime,
        u.nickname AS uploaderName
      FROM personal_resources r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC`,
      [userId]
    )) as Record<string, unknown>[]

    return NextResponse.json(resources.map(mapPersonalResource))
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知錯誤'
    console.error('讀取個人資源列表錯誤:', error)
    return NextResponse.json(
      { error: '讀取個人資源列表失敗', details: message },
      { status: 500 }
    )
  }
}

// POST: 上傳個人資源
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const uploadedBy = formData.get('uploadedBy') as string | null

    if (!file || !uploadedBy) {
      return NextResponse.json({ error: '請提供檔案和上傳者ID' }, { status: 400 })
    }

    if (uploadedBy !== userId) {
      return NextResponse.json({ error: '無權限上傳至此帳號' }, { status: 403 })
    }

    const fileName = file.name || null
    const fileSize = file.size ?? null
    const fileType = file.type || null

    if (!fileSize || fileSize === 0) {
      return NextResponse.json({ error: '檔案大小無效' }, { status: 400 })
    }

    if (fileSize > storageConfig.maxFileSize) {
      return NextResponse.json(
        {
          error: `檔案過大，最大允許 ${formatFileSize(storageConfig.maxFileSize)}`,
        },
        { status: 400 }
      )
    }

    if (!fileName || !fileType || !isFileTypeAllowed(fileType, fileName)) {
      return NextResponse.json(
        {
          error:
            '不支援的檔案類型，僅允許圖片（jpg, png, gif, webp, svg）和文件（pdf, doc, docx, xls, xlsx, ppt, pptx, txt）',
        },
        { status: 400 }
      )
    }

    const users = (await query('SELECT id FROM users WHERE id = ?', [userId])) as { id: string }[]
    if (users.length === 0) {
      return NextResponse.json({ error: '使用者不存在' }, { status: 404 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'personal', userId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const fileExtension = fileName.split('.').pop() || ''
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const diskPath = join(uploadDir, uniqueFileName)

    const bytes = await file.arrayBuffer()
    await writeFile(diskPath, Buffer.from(bytes))

    if (process.platform !== 'win32') {
      try {
        const { chmod } = await import('fs/promises')
        await chmod(diskPath, 0o644)
      } catch {
        // 非致命
      }
    }

    const relativePath = `/uploads/personal/${userId}/${uniqueFileName}`
    const resourceId = uuidv4()

    await query(
      `INSERT INTO personal_resources (id, user_id, file_name, file_path, file_size, file_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [resourceId, userId, fileName, relativePath, fileSize, fileType]
    )

    const rows = (await query(
      `SELECT 
        r.id,
        r.file_name AS fileName,
        r.file_path AS filePath,
        r.file_size AS fileSize,
        r.file_type AS fileType,
        r.user_id AS uploadedBy,
        r.created_at AS uploadDate,
        DATE_FORMAT(r.created_at, '%H:%i') AS uploadTime,
        u.nickname AS uploaderName
      FROM personal_resources r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?`,
      [resourceId]
    )) as Record<string, unknown>[]

    if (rows.length === 0) {
      return NextResponse.json({ error: '建立資源記錄失敗' }, { status: 500 })
    }

    return NextResponse.json(mapPersonalResource(rows[0]), { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知錯誤'
    console.error('上傳個人資源錯誤:', error)
    return NextResponse.json(
      { error: '上傳個人資源失敗', details: message },
      { status: 500 }
    )
  }
}

// DELETE: 刪除個人資源
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const resourceId = request.nextUrl.searchParams.get('resourceId')

    if (!resourceId) {
      return NextResponse.json({ error: '請提供資源ID' }, { status: 400 })
    }

    const resources = (await query(
      'SELECT id, file_path FROM personal_resources WHERE id = ? AND user_id = ?',
      [resourceId, userId]
    )) as { id: string; file_path: string | null }[]

    if (resources.length === 0) {
      return NextResponse.json({ error: '資源不存在或無權限刪除' }, { status: 404 })
    }

    const filePath = resources[0].file_path
    if (filePath) {
      try {
        const fullPath = join(process.cwd(), 'public', filePath)
        if (existsSync(fullPath)) {
          await unlink(fullPath)
        }
      } catch (fileError) {
        console.error('刪除個人資源檔案錯誤:', fileError)
      }
    }

    await query('DELETE FROM personal_resources WHERE id = ?', [resourceId])

    return NextResponse.json({ message: '資源已刪除' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知錯誤'
    console.error('刪除個人資源錯誤:', error)
    return NextResponse.json(
      { error: '刪除個人資源失敗', details: message },
      { status: 500 }
    )
  }
}
