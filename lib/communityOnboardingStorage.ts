const STORAGE_PREFIX = 'community_onboarding_seen_'

export function getCommunityOnboardingStorageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`
}

export function markCommunityOnboardingSeen(userId: string | null) {
  if (!userId || typeof window === 'undefined') return
  try {
    localStorage.setItem(getCommunityOnboardingStorageKey(userId), 'true')
  } catch {
    // ignore
  }
}

export function hasSeenCommunityOnboarding(userId: string | null): boolean {
  if (!userId || typeof window === 'undefined') return true
  try {
    return localStorage.getItem(getCommunityOnboardingStorageKey(userId)) === 'true'
  } catch {
    return true
  }
}

/**
 * 登入成功後呼叫：移除該使用者的「已看過共備社群列表引導」標記，
 * 與登出時清除效果一致，確保重新登入帳密後會再次顯示引導。
 */
export function resetCommunityOnboardingSeen(userId: string | number | null | undefined) {
  if (userId == null || typeof window === 'undefined') return
  try {
    localStorage.removeItem(getCommunityOnboardingStorageKey(String(userId)))
  } catch {
    // ignore
  }
}

/**
 * 登出時呼叫：清除「已看過共備社群引導」標記，下次登入後進入列表頁會再次顯示引導。
 * 請在 `localStorage.removeItem('user')` 之前呼叫（需從 `user` 讀取 userId）。
 */
export function clearCommunityOnboardingOnLogout() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return
    const userData = JSON.parse(raw) as { id?: string; userId?: string }
    const uid = userData.id || userData.userId
    if (uid) {
      localStorage.removeItem(getCommunityOnboardingStorageKey(String(uid)))
    }
  } catch {
    // ignore
  }
}
