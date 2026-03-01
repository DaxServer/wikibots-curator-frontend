import { useFeatureFlags } from '@/composables/useFeatureFlags'
import { useAuthStore } from '@/stores/auth.store'
import { beforeEach, describe, expect, it } from 'bun:test'
import { createPinia, setActivePinia } from 'pinia'

describe('useFeatureFlags', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('presetsEnabled', () => {
    it('returns false when no user is authenticated', () => {
      const { presetsEnabled } = useFeatureFlags()

      expect(presetsEnabled.value).toBe(false)
    })

    it('returns false for non-allowed users', () => {
      const auth = useAuthStore()
      auth.user = 'testuser'
      const { presetsEnabled } = useFeatureFlags()

      expect(presetsEnabled.value).toBe(false)
    })

    it('returns true for DaxServer', () => {
      const auth = useAuthStore()
      auth.user = 'DaxServer'
      const { presetsEnabled } = useFeatureFlags()

      expect(presetsEnabled.value).toBe(true)
    })

    it('returns true for PantheraLeo1359531', () => {
      const auth = useAuthStore()
      auth.user = 'PantheraLeo1359531'
      const { presetsEnabled } = useFeatureFlags()

      expect(presetsEnabled.value).toBe(true)
    })

    it('updates reactively when user changes', () => {
      const auth = useAuthStore()
      const { presetsEnabled } = useFeatureFlags()

      expect(presetsEnabled.value).toBe(false)

      auth.user = 'DaxServer'
      expect(presetsEnabled.value).toBe(true)

      auth.user = 'someoneelse'
      expect(presetsEnabled.value).toBe(false)
    })
  })
})
