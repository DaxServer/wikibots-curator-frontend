import { usePresets } from '@/composables/usePresets'
import { useCollectionsStore } from '@/stores/collections.store'
import { beforeEach, describe, expect, it } from 'bun:test'
import { createPinia, setActivePinia } from 'pinia'

describe('usePresets', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('currentPreset', () => {
    it('returns null when no preset is selected', () => {
      const { currentPreset } = usePresets()

      expect(currentPreset.value).toBeNull()
    })

    it('returns the current preset when one is selected', () => {
      const store = useCollectionsStore()
      const { currentPreset } = usePresets()
      store.setPresets([
        {
          id: 1,
          title: 'Test Preset',
          title_template: 'Test {{test}}',
          handler: 'mapillary',
          is_default: false,
          exclude_from_date_category: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ])
      store.setCurrentPresetId(1)

      expect(currentPreset.value?.title).toBe('Test Preset')
    })

    it('returns null when presetId does not match any preset', () => {
      const store = useCollectionsStore()
      const { currentPreset } = usePresets()
      store.setPresets([
        {
          id: 1,
          title: 'Test Preset',
          title_template: 'Test {{test}}',
          handler: 'mapillary',
          is_default: false,
          exclude_from_date_category: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ])
      store.setCurrentPresetId(999)

      expect(currentPreset.value).toBeNull()
    })
  })

  describe('isPresetMode', () => {
    it('returns false when no preset is selected', () => {
      const { isPresetMode } = usePresets()

      expect(isPresetMode.value).toBe(false)
    })

    it('returns true when a preset is selected', () => {
      const store = useCollectionsStore()
      const { isPresetMode } = usePresets()
      store.setPresets([
        {
          id: 1,
          title: 'Test Preset',
          title_template: 'Test {{test}}',
          handler: 'mapillary',
          is_default: false,
          exclude_from_date_category: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ])
      store.setCurrentPresetId(1)

      expect(isPresetMode.value).toBe(true)
    })

    it('returns false when clearing preset selection', () => {
      const store = useCollectionsStore()
      const { isPresetMode } = usePresets()
      store.setPresets([
        {
          id: 1,
          title: 'Test Preset',
          title_template: 'Test {{test}}',
          handler: 'mapillary',
          is_default: false,
          exclude_from_date_category: false,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ])
      store.setCurrentPresetId(1)
      expect(isPresetMode.value).toBe(true)

      store.setCurrentPresetId(null)
      expect(isPresetMode.value).toBe(false)
    })
  })
})
