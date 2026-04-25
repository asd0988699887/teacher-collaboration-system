/**
 * 活動在 UI 上的顯示名稱：優先教案標題，否則活動名稱。
 * 與 /api/communities/[communityId]/activities 等回傳的 lessonPlanTitle 對齊。
 */
export function activityDisplayLabel(
  activity: { name: string; lessonPlanTitle?: string | null } | null | undefined
): string {
  if (!activity) return ''
  const t =
    typeof activity.lessonPlanTitle === 'string'
      ? activity.lessonPlanTitle.trim()
      : ''
  return t || activity.name
}
