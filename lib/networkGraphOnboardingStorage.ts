/** localStorage key: networkGraph_onboarding_seen_${userId} */
const STORAGE_PREFIX = 'networkGraph_onboarding_seen_'

export function getNetworkGraphOnboardingStorageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`
}

export function markNetworkGraphOnboardingSeen(userId: string | null) {
  if (!userId || typeof window === 'undefined') return
  try {
    localStorage.setItem(getNetworkGraphOnboardingStorageKey(userId), 'true')
  } catch {
    // ignore
  }
}

export function hasSeenNetworkGraphOnboarding(userId: string | null): boolean {
  if (!userId || typeof window === 'undefined') return true
  try {
    return localStorage.getItem(getNetworkGraphOnboardingStorageKey(userId)) === 'true'
  } catch {
    return true
  }
}

/** 登出時清除，下次登入可再次顯示引導 */
export function clearNetworkGraphOnboardingOnLogout() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return
    const userData = JSON.parse(raw) as { id?: string; userId?: string }
    const uid = userData.id || userData.userId
    if (uid) {
      localStorage.removeItem(getNetworkGraphOnboardingStorageKey(String(uid)))
    }
  } catch {
    // ignore
  }
}
