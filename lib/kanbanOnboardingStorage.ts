/** localStorage key: kanban_onboarding_seen_${userId} */
const STORAGE_PREFIX = 'kanban_onboarding_seen_'

export function getKanbanOnboardingStorageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`
}

export function markKanbanOnboardingSeen(userId: string | null) {
  if (!userId || typeof window === 'undefined') return
  try {
    localStorage.setItem(getKanbanOnboardingStorageKey(userId), 'true')
  } catch {
    // ignore
  }
}

export function hasSeenKanbanOnboarding(userId: string | null): boolean {
  if (!userId || typeof window === 'undefined') return true
  try {
    return localStorage.getItem(getKanbanOnboardingStorageKey(userId)) === 'true'
  } catch {
    return true
  }
}

/** 登出時清除，下次登入可再次顯示引導 */
export function clearKanbanOnboardingOnLogout() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return
    const userData = JSON.parse(raw) as { id?: string; userId?: string }
    const uid = userData.id || userData.userId
    if (uid) {
      localStorage.removeItem(getKanbanOnboardingStorageKey(String(uid)))
    }
  } catch {
    // ignore
  }
}
