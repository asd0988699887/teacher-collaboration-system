/** localStorage key: coprepOnboarding_seen_${userId} */
const STORAGE_PREFIX = 'coprep_onboarding_seen_'

export function getCoPrepOnboardingStorageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`
}

export function markCoPrepOnboardingSeen(userId: string | null) {
  if (!userId || typeof window === 'undefined') return
  try {
    localStorage.setItem(getCoPrepOnboardingStorageKey(userId), 'true')
  } catch {
    // ignore
  }
}

export function hasSeenCoPrepOnboarding(userId: string | null): boolean {
  if (!userId || typeof window === 'undefined') return true
  try {
    return localStorage.getItem(getCoPrepOnboardingStorageKey(userId)) === 'true'
  } catch {
    return true
  }
}

/**
 * 登入成功後呼叫：移除該使用者的「已看過進行共備教案編輯引導」標記，
 * 與登出時清除效果一致，重新登入後進入教案編輯會再次顯示引導。
 */
export function resetCoPrepOnboardingSeen(userId: string | number | null | undefined) {
  if (userId == null || typeof window === 'undefined') return
  try {
    localStorage.removeItem(getCoPrepOnboardingStorageKey(String(userId)))
  } catch {
    // ignore
  }
}

/** 登出時清除，下次登入可再次顯示引導 */
export function clearCoPrepOnboardingOnLogout() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return
    const userData = JSON.parse(raw) as { id?: string; userId?: string }
    const uid = userData.id || userData.userId
    if (uid) {
      localStorage.removeItem(getCoPrepOnboardingStorageKey(String(uid)))
    }
  } catch {
    // ignore
  }
}
