import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { storageConfig, isFileTypeAllowed, formatFileSize } from '@/lib/storage-config'
import { createNotificationsForCommunity } from '@/lib/notifications'

function isTaskAttachmentAllowed(file: File): boolean {
  if (file.type && isFileTypeAllowed(file.type, file.name)) {
    return true
  }
  const ext = file.name.split('.').pop()?.toLowerCase()
  return !!ext && storageConfig.allowedExtensions.includes(ext)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ communityId: string; taskId: string }> }
) {
  try {
    const { communityId, taskId } = await params

    const tasks = (await query(
      `SELECT kt.id, kt.title, kt.status
       FROM kanban_tasks kt
       INNER JOIN kanban_lists kl ON kt.list_id = kl.id
       WHERE kt.id = ? AND kl.community_id = ?`,
      [taskId, communityId]
    )) as { id: string; title: string; status?: string }[]

    if (tasks.length === 0) {
      return NextResponse.json({ error: '任務不存在' }, { status: 404 })
    }

    const taskRow = tasks[0]
    const wasAlreadyCompleted = taskRow.status === 'completed'

    const formData = await request.formData()
    const completionDescription = String(formData.get('completionDescription') || '').trim()
    const userId = String(formData.get('userId') || '').trim()
    const file = formData.get('file') as File | null

    if (!completionDescription) {
      return NextResponse.json({ error: '請填寫完成任務說明' }, { status: 400 })
    }

    let attachmentPath: string | null = null
    let attachmentName: string | null = null

    if (file && file.size > 0) {
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

    try {
      await query(
        `UPDATE kanban_tasks
         SET status = 'completed',
             completion_description = ?,
             attachment_path = COALESCE(?, attachment_path),
             attachment_name = COALESCE(?, attachment_name),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [completionDescription, attachmentPath, attachmentName, taskId]
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

    if (userId && !wasAlreadyCompleted) {
      try {
        const users = (await query('SELECT nickname FROM users WHERE id = ?', [userId])) as {
          nickname: string
        }[]
        const userName = users.length > 0 ? users[0].nickname : '使用者'
        const taskTitle = taskRow.title?.trim() || '任務'

        await createNotificationsForCommunity({
          communityId,
          actorId: userId,
          type: 'task',
          action: 'update',
          content: `${userName} 完成了分工任務「${taskTitle}」`,
          relatedId: taskId,
        })
      } catch (notificationError) {
        console.error('創建任務完成通知失敗:', notificationError)
      }
    }

    return NextResponse.json({ message: '任務已完成' })
  } catch (error: unknown) {
    console.error('完成任務錯誤:', error)
    return NextResponse.json(
      { error: '完成任務失敗', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
