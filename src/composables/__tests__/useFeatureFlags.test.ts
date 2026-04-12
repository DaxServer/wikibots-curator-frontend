import { useFeatureFlags } from '@/composables/useFeatureFlags'
import { useAuthStore } from '@/stores/auth.store'
import { beforeEach, describe, expect, it } from 'bun:test'
import { createPinia, setActivePinia } from 'pinia'

describe('useFeatureFlags', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('redlinksEnabled', () => {
    it('returns false when no user is authenticated', () => {
      const { redlinksEnabled } = useFeatureFlags()

      expect(redlinksEnabled.value).toBe(false)
    })

    it('returns false for non-allowed users', () => {
      const auth = useAuthStore()
      auth.user = 'testuser'
      const { redlinksEnabled } = useFeatureFlags()

      expect(redlinksEnabled.value).toBe(false)
    })

    it('returns true for DaxServer', () => {
      const auth = useAuthStore()
      auth.user = 'DaxServer'
      const { redlinksEnabled } = useFeatureFlags()

      expect(redlinksEnabled.value).toBe(true)
    })

    it('updates reactively when user changes', () => {
      const auth = useAuthStore()
      const { redlinksEnabled } = useFeatureFlags()

      expect(redlinksEnabled.value).toBe(false)

      auth.user = 'DaxServer'
      expect(redlinksEnabled.value).toBe(true)

      auth.user = 'someoneelse'
      expect(redlinksEnabled.value).toBe(false)
    })
  })
})
