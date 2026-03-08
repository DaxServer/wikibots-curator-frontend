import { makePreset } from '@/__tests__/fixtures'
import { useCollectionsStore } from '@/stores/collections.store'
import { beforeEach, describe, expect, it } from 'bun:test'
import { createPinia, setActivePinia } from 'pinia'

describe('store preset computed properties', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('currentPreset', () => {
    it('returns null when no preset is selected', () => {
      const store = useCollectionsStore()

      expect(store.currentPreset).toBeNull()
    })

    it('returns the current preset when one is selected', () => {
      const store = useCollectionsStore()
      store.setPresets([makePreset({ id: 1, title: 'Test Preset' })])
      store.enterPresetMode(1)

      expect(store.currentPreset?.title).toBe('Test Preset')
    })

    it('returns null when presetId does not match any preset', () => {
      const store = useCollectionsStore()
      store.setPresets([makePreset({ id: 1 })])
      store.enterPresetMode(999)

      expect(store.currentPreset).toBeNull()
    })
  })

  describe('isPresetMode', () => {
    it('returns false when no preset is selected', () => {
      const store = useCollectionsStore()

      expect(store.isPresetMode).toBe(false)
    })

    it('returns true when a preset is selected', () => {
      const store = useCollectionsStore()
      store.setPresets([makePreset({ id: 1 })])
      store.enterPresetMode(1)

      expect(store.isPresetMode).toBe(true)
    })

    it('returns false when clearing preset selection', () => {
      const store = useCollectionsStore()
      store.setPresets([makePreset({ id: 1 })])
      store.enterPresetMode(1)
      expect(store.isPresetMode).toBe(true)

      store.enterManualMode()
      expect(store.isPresetMode).toBe(false)
    })
  })
})
