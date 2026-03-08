import { type Mock, afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { effectScope, ref } from 'vue'

// Mock useSocket before any imports that depend on it
export const mockSocketData = ref<string | null>(null)
export const mockSend: Mock<(data: string) => void> = mock(() => {})

const mockSocketImpl = () => ({
  useSocket: {
    data: mockSocketData,
    send: mockSend,
  },
})

mock.module('@/composables/useSocket', mockSocketImpl)
mock.module('../useSocket', mockSocketImpl)

import { resolve } from 'node:path'

mock.module(resolve(__dirname, '../useSocket.ts'), mockSocketImpl)

const mockToastAdd = mock(() => {})
mock.module('primevue/usetoast', () => ({
  useToast: () => ({ add: mockToastAdd }),
}))

import { makePreset } from '@/__tests__/fixtures'
import { useAuthStore } from '@/stores/auth.store'
import { useCollectionsStore } from '@/stores/collections.store'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { usePresetManager } from '../usePresetManager'

const enablePresets = () => {
  const auth = useAuthStore()
  auth.user = 'DaxServer'
}

// usePresetManager creates watchers (via useTitleTemplate) that must be stopped after each test
// to prevent watcher leaks across tests when called outside a component setup context.
let scope = effectScope()
const runManager = () => scope.run(() => usePresetManager())!

describe('usePresetManager', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockSend.mockClear()
    mockSocketData.value = null
    scope = effectScope()
  })

  afterEach(() => {
    scope.stop()
  })

  describe('initial state', () => {
    it('showPresetSelectDialog is false', () => {
      const { showPresetSelectDialog } = runManager()
      expect(showPresetSelectDialog.value).toBe(false)
    })

    it('showPresetDetails is false', () => {
      const { showPresetDetails } = runManager()
      expect(showPresetDetails.value).toBe(false)
    })
  })

  describe('applyPreset(presetId)', () => {
    it('applies the matching preset to the store', async () => {
      const store = useCollectionsStore()
      store.setPresets([makePreset({ id: 5 })])
      const { applyPreset } = runManager()

      await applyPreset(5)

      expect(store.currentPresetId).toBe(5)
      expect(store.presetMode).toBe('preset')
    })

    it('sets showPresetDetails to false after applying', async () => {
      const store = useCollectionsStore()
      store.setPresets([makePreset({ id: 5 })])
      const { applyPreset, showPresetDetails } = runManager()
      showPresetDetails.value = true

      await applyPreset(5)

      expect(showPresetDetails.value).toBe(false)
    })

    it('does nothing if preset id is not found', async () => {
      const store = useCollectionsStore()
      const { applyPreset } = runManager()

      await applyPreset(999)

      expect(store.currentPresetId).toBeNull()
    })
  })

  describe('handleEditPreset()', () => {
    it('switches to editing mode with the current preset id', () => {
      const store = useCollectionsStore()
      store.enterPresetMode(3)
      const { handleEditPreset } = runManager()

      handleEditPreset()

      expect(store.presetIdToUpdate).toBe(3)
      expect(store.presetMode).toBe('editing')
    })

    it('does nothing if currentPresetId is null', () => {
      const store = useCollectionsStore()
      const { handleEditPreset } = runManager()

      handleEditPreset()

      expect(store.presetMode).toBe('manual')
      expect(store.presetIdToUpdate).toBeNull()
    })
  })

  describe('handleCancelEdit()', () => {
    it('restores preset mode with the preset being edited', () => {
      const store = useCollectionsStore()
      store.enterEditingMode(7)
      const { handleCancelEdit } = runManager()

      handleCancelEdit()

      expect(store.currentPresetId).toBe(7)
      expect(store.presetMode).toBe('preset')
    })

    it('does nothing if presetIdToUpdate is null', () => {
      const store = useCollectionsStore()
      const { handleCancelEdit } = runManager()

      handleCancelEdit()

      expect(store.presetMode).toBe('manual')
    })
  })

  describe('handleEnterManually()', () => {
    it('clears preset mode', () => {
      const store = useCollectionsStore()
      store.enterPresetMode(1)
      const { handleEnterManually } = runManager()

      handleEnterManually()

      expect(store.presetMode).toBe('manual')
      expect(store.currentPresetId).toBeNull()
    })
  })

  describe('handlePresetSave() - update existing preset', () => {
    it('calls send() with preset_id when presetIdToUpdate is set', async () => {
      enablePresets()
      const store = useCollectionsStore()
      store.enterEditingMode(4)
      const { handlePresetSave } = runManager()

      await handlePresetSave({ title: 'My Preset', setAsDefault: false })

      expect(mockSend).toHaveBeenCalledTimes(1)
      const sent = JSON.parse(mockSend.mock.calls[0]![0])
      expect(sent.data.preset_id).toBe(4)
    })
  })

  describe('handlePresetSave() - create new preset', () => {
    it('calls send() without preset_id for new preset', async () => {
      enablePresets()
      const { handlePresetSave } = runManager()

      await handlePresetSave({ title: 'New Preset', setAsDefault: false })

      expect(mockSend).toHaveBeenCalledTimes(1)
      const sent = JSON.parse(mockSend.mock.calls[0]![0])
      expect(sent.data.preset_id).toBeUndefined()
    })

    it('does nothing when presetsEnabled is false', async () => {
      // auth.user is empty by default = presetsEnabled false
      const { handlePresetSave } = runManager()

      await handlePresetSave({ title: 'New Preset', setAsDefault: false })

      expect(mockSend).not.toHaveBeenCalled()
    })
  })

  describe('pending save watcher - update case', () => {
    it('restores preset mode when presets update after save', async () => {
      enablePresets()
      const store = useCollectionsStore()
      store.enterEditingMode(2)
      const { handlePresetSave } = runManager()
      await handlePresetSave({ title: 'Updated', setAsDefault: false })

      store.setPresets([makePreset({ id: 2, title: 'Updated' })])
      await nextTick()

      expect(store.currentPresetId).toBe(2)
      expect(store.presetMode).toBe('preset')
    })

    it('does not change state when presets update without a pending save', async () => {
      const store = useCollectionsStore()
      runManager()

      store.setPresets([makePreset({ id: 1 })])
      await nextTick()

      expect(store.currentPresetId).toBeNull()
    })
  })

  describe('pending save watcher - create case', () => {
    it('switches to preset mode when new preset found by title', async () => {
      enablePresets()
      const store = useCollectionsStore()
      const { handlePresetSave } = runManager()
      await handlePresetSave({ title: 'Brand New', setAsDefault: false })

      store.setPresets([makePreset({ id: 99, title: 'Brand New' })])
      await nextTick()

      expect(store.currentPresetId).toBe(99)
      expect(store.presetMode).toBe('preset')
    })

    it('does not resolve if preset with matching title is not in list', async () => {
      enablePresets()
      const store = useCollectionsStore()
      const { handlePresetSave } = runManager()
      await handlePresetSave({ title: 'Brand New', setAsDefault: false })

      store.setPresets([makePreset({ id: 99, title: 'Other Name' })])
      await nextTick()

      expect(store.currentPresetId).toBeNull()
    })
  })

  describe('auto-apply default watcher', () => {
    it('applies defaultPreset when presets load with a default and no currentPresetId', async () => {
      enablePresets()
      const store = useCollectionsStore()
      store.setPresets([makePreset({ id: 10, is_default: true })])

      runManager()
      await nextTick()

      expect(store.currentPresetId).toBe(10)
      expect(store.presetMode).toBe('preset')
    })

    it('does not auto-apply if currentPresetId is already set', async () => {
      enablePresets()
      const store = useCollectionsStore()
      store.setPresets([makePreset({ id: 10, is_default: true })])
      store.enterPresetMode(99)

      runManager()
      await nextTick()

      expect(store.currentPresetId).toBe(99)
    })

    it('does not auto-apply while a save is pending', async () => {
      enablePresets()
      const store = useCollectionsStore()
      store.enterEditingMode(2)
      const { handlePresetSave } = runManager()
      await handlePresetSave({ title: 'Saving...', setAsDefault: false })

      store.setPresets([makePreset({ id: 10, is_default: true })])
      await nextTick()

      // Pending save (id=2) resolves first; auto-apply is skipped
      expect(store.currentPresetId).toBe(2)
    })
  })
})
