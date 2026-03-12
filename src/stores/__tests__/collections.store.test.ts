import { makePreset } from '@/__tests__/fixtures'
import { useCollectionsStore } from '@/stores/collections.store'
import { beforeEach, describe, expect, it } from 'bun:test'
import { createPinia, setActivePinia } from 'pinia'

describe('collections store — preset state', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('setActivePreset(id | null)', () => {
    it('sets currentPresetId to the given id', () => {
      const store = useCollectionsStore()
      store.setActivePreset(5)
      expect(store.currentPresetId).toBe(5)
    })

    it('clears currentPresetId when called with null', () => {
      const store = useCollectionsStore()
      store.setActivePreset(null)
      expect(store.currentPresetId).toBeNull()
    })

    it('clears currentPresetId after having set it', () => {
      const store = useCollectionsStore()
      store.setActivePreset(5)
      store.setActivePreset(null)
      expect(store.currentPresetId).toBeNull()
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

    it('sets currentPresetId after applyPreset', () => {
      const store = useCollectionsStore()
      store.applyPreset(makePreset({ id: 7 }))
      expect(store.currentPresetId).toBe(7)
    })
  })

  describe('$reset', () => {
    it('clears currentPresetId on reset', () => {
      const store = useCollectionsStore()
      store.setActivePreset(1)
      store.$reset()
      expect(store.currentPresetId).toBeNull()
    })
  })
})
