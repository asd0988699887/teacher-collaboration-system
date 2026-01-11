// ============================================
// 社群資源 API - 列表、上傳、刪除
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { query } from '@/lib/db'
import { createNotificationsForCommunity } from '@/lib/notifications'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { storageConfig, isFileTypeAllowed, formatFileSize } from '@/lib/storage-config'

// GET: 讀取社群資源列表
export async function GET(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams

    // 查詢社群的所有資源
    const resources = await query(
      `SELECT 
        r.id,
        r.file_name AS fileName,
        r.file_path AS filePath,
        r.file_size AS fileSize,
        r.file_type AS fileType,
        r.uploaded_by AS uploadedBy,
        r.created_at AS uploadDate,
        DATE_FORMAT(r.created_at, '%H:%i') AS uploadTime,
        u.nickname AS uploaderName
      FROM resources r
      LEFT JOIN users u ON r.uploaded_by = u.id
      WHERE r.community_id = ?
      ORDER BY r.created_at DESC`,
      [communityId]
    ) as any[]

    const formattedResources = resources.map((resource) => ({
      id: resource.id,
      fileName: resource.fileName,
      filePath: resource.filePath || '',
      fileSize: resource.fileSize || 0,
      fileType: resource.fileType || '',
      uploadDate: resource.uploadDate
        ? new Date(resource.uploadDate).toISOString().split('T')[0].replace(/-/g, '/')
        : '',
      uploadTime: resource.uploadTime || '',
      uploaderName: resource.uploaderName || '',
      uploaderId: resource.uploadedBy || '',
    }))

    return NextResponse.json(formattedResources)
  } catch (error: any) {
    console.error('讀取資源列表錯誤:', error)
    return NextResponse.json(
      { error: '讀取資源列表失敗', details: error.message },
      { status: 500 }
    )
  }
}

// POST: 上傳資源（支援實際檔案上傳）
export async function POST(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    // 在 Next.js 16 中，params 可能需要 await（如果是 Promise）
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams
    
    // 驗證 communityId
    if (!communityId || communityId === 'null' || communityId === 'undefined') {
      console.error('社群ID驗證失敗:', { communityId, params: resolvedParams, url: request.url })
      return NextResponse.json(
        { error: '社群ID不存在或無效', details: `communityId: ${communityId}` },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const uploadedBy = formData.get('uploadedBy') as string | null

    // 驗證必填欄位
    if (!file || !uploadedBy) {
      return NextResponse.json(
        { error: '請提供檔案和上傳者ID' },
        { status: 400 }
      )
    }

    // 確保所有值都不是 undefined
    const fileName = file.name || null
    const fileSize = file.size ?? null
    const fileType = file.type || null

    // ============================================
    // 檔案大小驗證
    // ============================================
    if (!fileSize || fileSize === 0) {
      return NextResponse.json(
        { error: '檔案大小無效' },
        { status: 400 }
      )
    }

    if (fileSize > storageConfig.maxFileSize) {
      return NextResponse.json(
        { 
          error: `檔案過大，最大允許 ${formatFileSize(storageConfig.maxFileSize)}`,
          maxSize: storageConfig.maxFileSize,
          actualSize: fileSize,
          maxSizeFormatted: formatFileSize(storageConfig.maxFileSize),
          actualSizeFormatted: formatFileSize(fileSize)
        },
        { status: 400 }
      )
    }

    // ============================================
    // 檔案類型驗證
    // ============================================
    if (!fileName) {
      return NextResponse.json(
        { error: '檔案名稱無效' },
        { status: 400 }
      )
    }

    if (!fileType || !isFileTypeAllowed(fileType, fileName)) {
      return NextResponse.json(
        { 
          error: '不支援的檔案類型，僅允許圖片（jpg, png, gif, webp, svg）和文件（pdf, doc, docx, xls, xlsx, ppt, pptx, txt）',
          fileType: fileType || '未知',
          fileName: fileName,
          allowedTypes: '圖片和文件（詳見錯誤訊息）'
        },
        { status: 400 }
      )
    }

    // 檢查社群是否存在
    const communities = await query(
      'SELECT id FROM communities WHERE id = ?',
      [communityId]
    ) as any[]

    if (communities.length === 0) {
      return NextResponse.json(
        { error: '社群不存在' },
        { status: 404 }
      )
    }

    // 建立上傳目錄（如果不存在）
    const uploadDir = join(process.cwd(), 'public', 'uploads', communityId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // 生成唯一檔案名稱
    const fileExtension = fileName ? fileName.split('.').pop() || '' : ''
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const filePath = join(uploadDir, uniqueFileName)

    // 將檔案寫入磁碟
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // ============================================
    // 設定檔案權限（僅限 Linux/Unix）
    // ============================================
    if (process.platform !== 'win32') {
      try {
        const { chmod } = await import('fs/promises')
        await chmod(filePath, 0o644) // rw-r--r-- (擁有者可讀寫，其他人唯讀)
        console.log('檔案權限已設定:', filePath)
      } catch (chmodError) {
        // 權限設定失敗不影響上傳，只記錄警告
        console.warn('設定檔案權限失敗（非致命錯誤）:', chmodError)
      }
    }

    // 儲存相對路徑到資料庫（相對於 public 目錄）
    const relativePath = `/uploads/${communityId}/${uniqueFileName}`

    // 建立資源記錄
    const resourceId = uuidv4()
    
    // 確保所有參數都不是 undefined
    const insertParams = [
      resourceId, 
      communityId, 
      fileName, 
      relativePath, 
      fileSize, 
      fileType, 
      uploadedBy
    ]
    
    // 驗證所有參數都不是 undefined
    if (insertParams.some(param => param === undefined)) {
      console.error('參數包含 undefined:', {
        resourceId,
        communityId,
        fileName,
        relativePath,
        fileSize,
        fileType,
        uploadedBy
      })
      return NextResponse.json(
        { error: '參數驗證失敗，請檢查上傳資料' },
        { status: 400 }
      )
    }
    
    await query(
      'INSERT INTO resources (id, community_id, file_name, file_path, file_size, file_type, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      insertParams
    )

    // 查詢新建立的資源
    const newResources = await query(
      `SELECT 
        r.id,
        r.file_name AS fileName,
        r.file_path AS filePath,
        r.file_size AS fileSize,
        r.file_type AS fileType,
        r.created_at AS uploadDate,
        DATE_FORMAT(r.created_at, '%H:%i') AS uploadTime,
        u.nickname AS uploaderName
      FROM resources r
      LEFT JOIN users u ON r.uploaded_by = u.id
      WHERE r.id = ?`,
      [resourceId]
    ) as any[]

    if (newResources.length === 0) {
      return NextResponse.json(
        { error: '建立資源記錄失敗' },
        { status: 500 }
      )
    }

    const formattedResource = {
      id: newResources[0].id,
      fileName: newResources[0].fileName,
      filePath: newResources[0].filePath || '',
      fileSize: newResources[0].fileSize || 0,
      fileType: newResources[0].fileType || '',
      uploadDate: newResources[0].uploadDate
        ? new Date(newResources[0].uploadDate).toISOString().split('T')[0].replace(/-/g, '/')
        : '',
      uploadTime: newResources[0].uploadTime || '',
      uploaderName: newResources[0].uploaderName || '',
    }

    // 創建通知給社群其他成員
    await createNotificationsForCommunity({
      communityId,
      actorId: uploadedBy,
      type: 'file',
      action: 'create',
      content: `${formattedResource.uploaderName} 上傳了新檔案「${fileName}」`,
      relatedId: resourceId,
    })

    return NextResponse.json(formattedResource, { status: 201 })
  } catch (error: any) {
    console.error('上傳資源錯誤:', error)
    console.error('錯誤堆疊:', error.stack)
    
    // ============================================
    // 判斷錯誤類型，提供友善訊息
    // ============================================
    let errorMessage = '上傳資源失敗'
    let statusCode = 500
    
    // 磁碟空間不足
    if (error.code === 'ENOSPC') {
      errorMessage = '伺服器儲存空間不足，請聯絡管理員'
      statusCode = 507
    }
    // 權限問題
    else if (error.code === 'EACCES' || error.code === 'EPERM') {
      errorMessage = '伺服器檔案權限錯誤，請聯絡管理員'
      statusCode = 500
    }
    // 其他檔案系統錯誤
    else if (error.code && error.code.startsWith('E')) {
      errorMessage = `檔案系統錯誤：${error.message}`
      statusCode = 500
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    )
  }
}

// DELETE: 刪除資源
export async function DELETE(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { communityId } = resolvedParams
    const searchParams = request.nextUrl.searchParams
    const resourceId = searchParams.get('resourceId')

    if (!resourceId) {
      return NextResponse.json(
        { error: '請提供資源ID' },
        { status: 400 }
      )
    }

    // 檢查資源是否存在且屬於該社群，並獲取檔案路徑
    const resources = await query(
      'SELECT id, file_path FROM resources WHERE id = ? AND community_id = ?',
      [resourceId, communityId]
    ) as any[]

    if (resources.length === 0) {
      return NextResponse.json(
        { error: '資源不存在或無權限刪除' },
        { status: 404 }
      )
    }

    // 刪除實際檔案
    const filePath = resources[0].file_path
    if (filePath) {
      try {
        const fullPath = join(process.cwd(), 'public', filePath)
        if (existsSync(fullPath)) {
          await unlink(fullPath)
        }
      } catch (fileError) {
        console.error('刪除檔案錯誤:', fileError)
        // 即使檔案刪除失敗，也繼續刪除資料庫記錄
      }
    }

    // 刪除資源記錄
    await query('DELETE FROM resources WHERE id = ?', [resourceId])

    return NextResponse.json({ message: '資源已刪除' })
  } catch (error: any) {
    console.error('刪除資源錯誤:', error)
    return NextResponse.json(
      { error: '刪除資源失敗', details: error.message },
      { status: 500 }
    )
  }
}


