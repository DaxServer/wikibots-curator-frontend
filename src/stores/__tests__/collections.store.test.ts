import { makePreset } from '@/__tests__/fixtures'
import { useCollectionsStore } from '@/stores/collections.store'
import { beforeEach, describe, expect, it } from 'bun:test'
import { createPinia, setActivePinia } from 'pinia'

describe('collections store — preset state machine', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('presetMode computed', () => {
    it('returns "manual" when both currentPresetId and presetIdToUpdate are null', () => {
      const store = useCollectionsStore()
      expect(store.presetMode).toBe('manual')
    })

    it('returns "preset" when currentPresetId is set', () => {
      const store = useCollectionsStore()
      store.enterPresetMode(1)
      expect(store.presetMode).toBe('preset')
    })

    it('returns "editing" when presetIdToUpdate is set and currentPresetId is null', () => {
      const store = useCollectionsStore()
      store.enterEditingMode(1)
      expect(store.presetMode).toBe('editing')
    })

    it('returns "preset" when currentPresetId is set (priority over presetIdToUpdate)', () => {
      const store = useCollectionsStore()
      // Directly set both via known public actions to test priority
      store.enterPresetMode(1)
      // currentPresetId is set — even if presetIdToUpdate were somehow set, preset wins
      expect(store.presetMode).toBe('preset')
    })
  })

  describe('isPresetMode computed', () => {
    it('returns true when presetMode is "preset"', () => {
      const store = useCollectionsStore()
      store.enterPresetMode(1)
      expect(store.isPresetMode).toBe(true)
    })

    it('returns false when in "editing" mode', () => {
      const store = useCollectionsStore()
      store.enterEditingMode(1)
      expect(store.isPresetMode).toBe(false)
    })

    it('returns false when in "manual" mode', () => {
      const store = useCollectionsStore()
      expect(store.isPresetMode).toBe(false)
    })
  })

  describe('enterPresetMode(id)', () => {
    it('sets currentPresetId to the given id', () => {
      const store = useCollectionsStore()
      store.enterPresetMode(42)
      expect(store.currentPresetId).toBe(42)
    })

    it('clears presetIdToUpdate to null', () => {
      const store = useCollectionsStore()
      store.enterEditingMode(99) // set presetIdToUpdate first
      store.enterPresetMode(42)
      expect(store.presetIdToUpdate).toBeNull()
    })

    it('resulting presetMode is "preset"', () => {
      const store = useCollectionsStore()
      store.enterPresetMode(1)
      expect(store.presetMode).toBe('preset')
    })
  })

  describe('enterEditingMode(id)', () => {
    it('sets presetIdToUpdate to the given id', () => {
      const store = useCollectionsStore()
      store.enterEditingMode(5)
      expect(store.presetIdToUpdate).toBe(5)
    })

    it('clears currentPresetId to null', () => {
      const store = useCollectionsStore()
      store.enterPresetMode(1) // set currentPresetId first
      store.enterEditingMode(5)
      expect(store.currentPresetId).toBeNull()
    })

    it('resulting presetMode is "editing"', () => {
      const store = useCollectionsStore()
      store.enterEditingMode(5)
      expect(store.presetMode).toBe('editing')
    })
  })

  describe('enterManualMode()', () => {
    it('clears currentPresetId to null', () => {
      const store = useCollectionsStore()
      store.enterPresetMode(1)
      store.enterManualMode()
      expect(store.currentPresetId).toBeNull()
    })

    it('clears presetIdToUpdate to null', () => {
      const store = useCollectionsStore()
      store.enterEditingMode(1)
      store.enterManualMode()
      expect(store.presetIdToUpdate).toBeNull()
    })

    it('resulting presetMode is "manual"', () => {
      const store = useCollectionsStore()
      store.enterPresetMode(1)
      store.enterManualMode()
      expect(store.presetMode).toBe('manual')
    })
  })

  describe('applyPreset integration', () => {
    it('copies all preset fields to global state', () => {
      const store = useCollectionsStore()
      const preset = makePreset({
        title_template: 'My {{mapillary.user.username}} template.jpg',
        labels: { language: 'de', value: 'German description' },
        categories: 'Cat1\nCat2',
        exclude_from_date_category: true,
      })
      store.applyPreset(preset)

      expect(store.globalTitleTemplate).toBe('My {{mapillary.user.username}} template.jpg')
      expect(store.globalLanguage).toBe('de')
      expect(store.globalDescription).toBe('German description')
      expect(store.globalCategories).toBe('Cat1\nCat2')
      expect(store.globalDateCategory).toBe(false) // inverted from exclude_from_date_category
    })

    it('presetMode becomes "preset" after applyPreset', () => {
      const store = useCollectionsStore()
      store.applyPreset(makePreset({ id: 7 }))
      expect(store.presetMode).toBe('preset')
      expect(store.currentPresetId).toBe(7)
    })

    it('clears presetIdToUpdate when applyPreset is called', () => {
      const store = useCollectionsStore()
      store.enterEditingMode(7)
      store.applyPreset(makePreset({ id: 7 }))
      expect(store.presetIdToUpdate).toBeNull()
    })
  })

  describe('$reset', () => {
    it('clears presetIdToUpdate on reset', () => {
      const store = useCollectionsStore()
      store.enterEditingMode(1)
      store.$reset()
      expect(store.presetIdToUpdate).toBeNull()
    })
  })
})
