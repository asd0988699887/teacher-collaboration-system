'use client'

import { useState } from 'react'
import ActivityCard from './ActivityCard'
import HistoryLessonPreviewModal from './HistoryLessonPreviewModal'
import { activityDisplayLabel, buildHistoryActivityIntro } from '@/lib/activityDisplay'
import { downloadHistoryLessonPlan } from '@/lib/downloadHistoryLessonPlan'

export interface HistoryActivityItem {
  id: string
  name: string
  introduction: string
  createdDate: string
  createdTime: string
  creatorName?: string
  designer?: string
  lessonPlanTitle?: string
  courseDomain?: string
  unitName?: string
  implementationGrade?: string
  schoolLevel?: string
  lastModifiedDate?: string
  lastModifiedTime?: string
  communityId: string
  communityName: string
}

interface HistoryActivitiesSectionProps {
  activities: HistoryActivityItem[]
  onDeleteActivity: (activityId: string) => void | Promise<void>
  onActivitiesRefresh?: () => void | Promise<void>
  /** 點擊歷史活動卡片：進入該活動所屬社群的完整共備視圖 */
  onOpenCommunity?: (communityId: string) => void
}

export default function HistoryActivitiesSection({
  activities,
  onDeleteActivity,
  onActivitiesRefresh,
  onOpenCommunity,
}: HistoryActivitiesSectionProps) {
  const [historyPreviewActivityId, setHistoryPreviewActivityId] = useState<string | null>(null)

  return (
    <section className="mt-10 md:mt-12">
      <h2 className="text-xl md:text-[24px] font-bold text-[#6D28D9] leading-[32px] md:leading-[40px] mb-4 md:mb-6">
        歷史活動
      </h2>
      {activities.length === 0 ? (
        <p className="text-gray-500 py-6">尚無已結束的共備活動</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => {
            const cardTitle = activityDisplayLabel(act)
            const summary = buildHistoryActivityIntro(act)
            const intro = act.communityName
              ? `${act.communityName} · ${summary}`
              : summary
            const designerName =
              (act.designer && act.designer.trim()) || act.creatorName || ''
            const hasMod =
              act.lastModifiedDate &&
              act.lastModifiedTime &&
              act.lastModifiedDate.trim() !== ''
            const dateStr = hasMod
              ? { d: act.lastModifiedDate!, t: act.lastModifiedTime! }
              : { d: act.createdDate, t: act.createdTime }

            return (
              <ActivityCard
                key={act.id}
                activityName={cardTitle}
                introduction={intro}
                createdDate={dateStr.d}
                createdTime={dateStr.t}
                creatorName={designerName || undefined}
                personLabel="設計者"
                hidePersonAvatar
                hideEdit
                actionPlacement="footer"
                timeCaption="最後修改"
                onDownloadLessonPlan={() => {
                  void downloadHistoryLessonPlan(act.id, cardTitle).catch((e: unknown) => {
                    alert(e instanceof Error ? e.message : '下載教案失敗')
                  })
                }}
                onPreviewLessonPlan={() => setHistoryPreviewActivityId(act.id)}
                onDelete={async () => {
                  await onDeleteActivity(act.id)
                  await onActivitiesRefresh?.()
                  if (historyPreviewActivityId === act.id) {
                    setHistoryPreviewActivityId(null)
                  }
                }}
                onCardClick={() =>
                  onOpenCommunity
                    ? onOpenCommunity(act.communityId)
                    : setHistoryPreviewActivityId(act.id)
                }
              />
            )
          })}
        </div>
      )}

      <HistoryLessonPreviewModal
        open={historyPreviewActivityId !== null}
        activityId={historyPreviewActivityId}
        subtitle={
          historyPreviewActivityId
            ? activityDisplayLabel(
                activities.find((a) => a.id === historyPreviewActivityId) ?? { name: '' }
              ) || undefined
            : undefined
        }
        onClose={() => setHistoryPreviewActivityId(null)}
      />
    </section>
  )
}
