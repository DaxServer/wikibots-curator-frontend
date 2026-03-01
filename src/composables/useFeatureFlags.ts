import { useAuthStore } from '@/stores/auth.store'
import { computed } from 'vue'

const PRESET_ALLOWED_USERS = ['DaxServer', 'PantheraLeo1359531'] as const

export const useFeatureFlags = () => {
  const auth = useAuthStore()

  const presetsEnabled = computed(() => {
    if (!auth.user) return false
    return PRESET_ALLOWED_USERS.includes(auth.user as (typeof PRESET_ALLOWED_USERS)[number])
  })

  return {
    presetsEnabled,
  }
}
