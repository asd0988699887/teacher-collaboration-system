// PUT: 將指定社群的未讀公告通知全部標記為已讀
import { NextRequest, NextResponse } from 'next/server'
import { markAnnouncementNotificationsAsRead } from '@/lib/notifications'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.userId as string | undefined
    const communityId = body.communityId as string | undefined

    if (!userId || !communityId) {
      return NextResponse.json({ error: '請提供使用者 ID 與社群 ID' }, { status: 400 })
    }

    await markAnnouncementNotificationsAsRead(userId, communityId)

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '未知錯誤'
    console.error('標記公告通知已讀失敗:', error)
    return NextResponse.json(
      { error: '標記公告通知已讀失敗', details: message },
      { status: 500 }
    )
  }
}
