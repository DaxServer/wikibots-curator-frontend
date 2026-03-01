import { useCollectionsStore } from '@/stores/collections.store'
import { computed } from 'vue'

export const usePresets = () => {
  const store = useCollectionsStore()

  const currentPreset = computed(() => {
    if (!store.currentPresetId) return null
    return store.presets.find((p) => p.id === store.currentPresetId) ?? null
  })

  const isPresetMode = computed(() => currentPreset.value !== null)

  return {
    currentPreset,
    isPresetMode,
  }
}
