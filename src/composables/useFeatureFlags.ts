import { useAuthStore } from '@/stores/auth.store'
import { computed } from 'vue'

const REDLINKS_ALLOWED_USERS = ['DaxServer'] as const

export const useFeatureFlags = () => {
  const auth = useAuthStore()

  const redlinksEnabled = computed(() => {
    if (!auth.user) return false
    return REDLINKS_ALLOWED_USERS.includes(auth.user as (typeof REDLINKS_ALLOWED_USERS)[number])
  })

  return {
    redlinksEnabled,
  }
}
