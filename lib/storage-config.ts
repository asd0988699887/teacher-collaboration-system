// ============================================
// 檔案儲存配置與驗證
// ============================================

import { join } from 'path'

/**
 * 檔案儲存配置
 */
export const storageConfig = {
  // 檔案儲存基礎路徑（相對於專案根目錄）
  basePath: join(process.cwd(), 'public', 'uploads'),
  
  // URL 前綴（瀏覽器訪問用）
  urlPrefix: '/uploads',
  
  // 最大檔案大小（bytes）- 從環境變數讀取，預設 10MB
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB = 10 * 1024 * 1024
  
  // 允許的檔案類型（MIME types）
  allowedMimeTypes: [
    // 圖片
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    
    // 文件
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain', // .txt
  ],
  
  // 允許的副檔名（作為額外檢查）
  allowedExtensions: [
    // 圖片
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
    // 文件
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'
  ],
}

/**
 * 檢查檔案類型是否允許
 * @param mimeType 檔案的 MIME 類型
 * @param fileName 檔案名稱
 * @returns 是否允許上傳
 */
export function isFileTypeAllowed(mimeType: string, fileName: string): boolean {
  // 檢查 MIME type
  if (!storageConfig.allowedMimeTypes.includes(mimeType)) {
    return false
  }
  
  // 檢查副檔名
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (!ext || !storageConfig.allowedExtensions.includes(ext)) {
    return false
  }
  
  return true
}

/**
 * 格式化檔案大小（用於錯誤訊息）
 * @param bytes 檔案大小（bytes）
 * @returns 格式化後的字串（如 "10.5 MB"）
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

