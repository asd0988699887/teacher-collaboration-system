import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { storageConfig, isFileTypeAllowed, formatFileSize } from '@/lib/storage-config'

function isTaskAttachmentAllowed(file: File): boolean {
  if (file.type && isFileTypeAllowed(file.type, file.name)) {
    return true
  }
  const ext = file.name.split('.').pop()?.toLowerCase()
  return !!ext && storageConfig.allowedExtensions.includes(ext)
}

/** 儲存任務繳交草稿（說明與／或附件），不變更完成狀態 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string; taskId: string }> }
) {
  try {
    const { communityId, taskId } = await params

    const tasks = (await query(
      `SELECT kt.id
       FROM kanban_tasks kt
       INNER JOIN kanban_lists kl ON kt.list_id = kl.id
       WHERE kt.id = ? AND kl.community_id = ?`,
      [taskId, communityId]
    )) as { id: string }[]

    if (tasks.length === 0) {
      return NextResponse.json({ error: '任務不存在' }, { status: 404 })
    }

    const formData = await request.formData()
    const completionDescriptionRaw = formData.get('completionDescription')
    const completionDescription =
      completionDescriptionRaw !== null && completionDescriptionRaw !== undefined
        ? String(completionDescriptionRaw)
        : undefined
    const file = formData.get('file') as File | null

    const hasFile = !!(file && file.size > 0)
    const hasDescription = completionDescription !== undefined

    if (!hasFile && !hasDescription) {
      return NextResponse.json({ error: '沒有可儲存的繳交內容' }, { status: 400 })
    }

    let attachmentPath: string | null = null
    let attachmentName: string | null = null

    if (hasFile && file) {
      if (file.size > storageConfig.maxFileSize) {
        return NextResponse.json(
          { error: `檔案過大，最大允許 ${formatFileSize(storageConfig.maxFileSize)}` },
          { status: 400 }
        )
      }
      if (!isTaskAttachmentAllowed(file)) {
        return NextResponse.json({ error: '不支援的檔案類型' }, { status: 400 })
      }

      const uploadDir = join(process.cwd(), 'public', 'uploads', communityId, 'kanban-tasks')
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : ''
      const uniqueFileName = `${uuidv4()}${ext}`
      const filePath = join(uploadDir, uniqueFileName)
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, buffer)

      attachmentPath = `/uploads/${communityId}/kanban-tasks/${uniqueFileName}`
      attachmentName = file.name
    }

    const updateFields: string[] = []
    const updateValues: unknown[] = []

    if (hasDescription) {
      updateFields.push('completion_description = ?')
      updateValues.push(completionDescription || null)
    }
    if (attachmentPath && attachmentName) {
      updateFields.push('attachment_path = ?', 'attachment_name = ?')
      updateValues.push(attachmentPath, attachmentName)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ message: '已儲存' })
    }

    updateValues.push(taskId)

    try {
      await query(
        `UPDATE kanban_tasks SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )
    } catch (dbError: unknown) {
      const msg = dbError instanceof Error ? dbError.message : String(dbError)
      if (/unknown column/i.test(msg)) {
        return NextResponse.json(
          {
            error: '資料庫尚未支援任務繳交，請先執行 migration：add_kanban_task_submission.sql',
          },
          { status: 500 }
        )
      }
      throw dbError
    }

    return NextResponse.json({
      message: '任務繳交已儲存',
      attachmentPath: attachmentPath || undefined,
      attachmentName: attachmentName || undefined,
    })
  } catch (error: unknown) {
    console.error('儲存任務繳交錯誤:', error)
    return NextResponse.json(
      {
        error: '儲存任務繳交失敗',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
