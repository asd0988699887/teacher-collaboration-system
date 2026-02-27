import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/core-competencies/english
 * 取得英語領域核心素養列表
 * 
 * 查詢參數：
 * - schoolLevel: 學段 (國小/國中/高中)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const schoolLevel = searchParams.get('schoolLevel')

    // 檢查是否有對應的資料表
    // 如果資料表不存在，返回空陣列
    // 未來可以根據資料庫結構實作查詢邏輯
    
    // 暫時返回空陣列，避免 405 錯誤
    // 如果後續有資料表，可以在這裡實作查詢邏輯
    return NextResponse.json([])
  } catch (error: any) {
    console.error('取得英語核心素養錯誤:', error)
    return NextResponse.json(
      { error: '取得英語核心素養失敗', details: error.message },
      { status: 500 }
    )
  }
}


