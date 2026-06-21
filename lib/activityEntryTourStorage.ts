/** localStorage key: activity_entry_tour_seen_${userId} → JSON string[] of activityIds */
const STORAGE_PREFIX = 'activity_entry_tour_seen_'

export function getActivityEntryTourStorageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`
}

function readSeenActivityIds(userId: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(getActivityEntryTourStorageKey(userId))
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

export function markActivityEntryTourSeen(userId: string | null, activityId: string | null) {
  if (!userId || !activityId || typeof window === 'undefined') return
  try {
    const seen = readSeenActivityIds(userId)
    seen.add(activityId)
    localStorage.setItem(getActivityEntryTourStorageKey(userId), JSON.stringify([...seen]))
  } catch {
    // ignore
  }
}

export function hasSeenActivityEntryTour(userId: string | null, activityId: string | null): boolean {
  if (!userId || !activityId || typeof window === 'undefined') return true
  try {
    return readSeenActivityIds(userId).has(activityId)
  } catch {
    return true
  }
}

/**
 * 登入成功後呼叫：清除該使用者所有活動導覽紀錄，
 * 重新登入後首次進入活動會再次顯示導覽。
 */
export function resetActivityEntryTourSeen(userId: string | number | null | undefined) {
  if (userId == null || typeof window === 'undefined') return
  try {
    localStorage.removeItem(getActivityEntryTourStorageKey(String(userId)))
  } catch {
    // ignore
  }
}

/** 登出時清除，下次登入可再次顯示導覽 */
export function clearActivityEntryTourOnLogout() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return
    const userData = JSON.parse(raw) as { id?: string; userId?: string }
    const uid = userData.id || userData.userId
    if (uid) {
      localStorage.removeItem(getActivityEntryTourStorageKey(String(uid)))
    }
  } catch {
    // ignore
  }
}
