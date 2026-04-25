/** localStorage key: ideaWall_onboarding_seen_${userId} */
const STORAGE_PREFIX = 'ideaWall_onboarding_seen_'

export function getIdeaWallOnboardingStorageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`
}

export function markIdeaWallOnboardingSeen(userId: string | null) {
  if (!userId || typeof window === 'undefined') return
  try {
    localStorage.setItem(getIdeaWallOnboardingStorageKey(userId), 'true')
  } catch {
    // ignore
  }
}

export function hasSeenIdeaWallOnboarding(userId: string | null): boolean {
  if (!userId || typeof window === 'undefined') return true
  try {
    return localStorage.getItem(getIdeaWallOnboardingStorageKey(userId)) === 'true'
  } catch {
    return true
  }
}

/** 登出時清除，下次登入可再次顯示引導（與共備社群引導一致） */
export function clearIdeaWallOnboardingOnLogout() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return
    const userData = JSON.parse(raw) as { id?: string; userId?: string }
    const uid = userData.id || userData.userId
    if (uid) {
      localStorage.removeItem(getIdeaWallOnboardingStorageKey(String(uid)))
    }
  } catch {
    // ignore
  }
}
