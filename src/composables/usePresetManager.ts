import { useCollections } from '@/composables/useCollections'
import { useFeatureFlags } from '@/composables/useFeatureFlags'
import { useTitleTemplate } from '@/composables/useTitleTemplate'
import { useCollectionsStore } from '@/stores/collections.store'
import type { SavePreset } from '@/types/asyncapi'
import { useToast } from 'primevue/usetoast'
import { ref, watch } from 'vue'

export const usePresetManager = () => {
  const store = useCollectionsStore()
  const { savePreset } = useCollections()
  const { presetsEnabled } = useFeatureFlags()
  const { verifyTitlesWithTemplate } = useTitleTemplate()
  const toast = useToast()

  const showPresetSelectDialog = ref(false)
  const showPresetDetails = ref(false)
  const hasAutoAppliedDefault = ref(false)
  const pendingPresetSave = ref<{ id?: number; title?: string } | null>(null)

  const applyPreset = async (presetId: number) => {
    const preset = store.presets.find((p) => p.id === presetId)
    if (!preset) return
    store.applyPreset(preset)
    await verifyTitlesWithTemplate()
    showPresetDetails.value = false
  }

  const handlePresetSave = async ({
    title,
    setAsDefault: isDefault,
  }: {
    title: string
    setAsDefault: boolean
  }) => {
    if (!presetsEnabled.value) return

    const data: SavePreset['data'] = {
      title,
      title_template: store.globalTitleTemplate,
      labels: {
        language: store.globalLanguage,
        value: store.globalDescription,
      },
      categories: store.globalCategories,
      exclude_from_date_category: !store.globalDateCategory,
      is_default: isDefault,
      handler: store.handler,
    }

    if (store.presetIdToUpdate) {
      data.preset_id = store.presetIdToUpdate
      pendingPresetSave.value = { id: store.presetIdToUpdate }
    } else {
      pendingPresetSave.value = { title }
    }

    savePreset(data)

    const isUpdate = !!data.preset_id
    toast.add({
      severity: 'success',
      summary: isUpdate ? 'Preset updated' : 'Preset saved',
      detail: isUpdate
        ? `Preset "${data.title}" has been updated successfully.`
        : `Preset "${data.title}" has been saved successfully.`,
      life: 3000,
    })
  }

  const handleEditPreset = () => {
    if (store.currentPresetId === null) return
    store.enterEditingMode(store.currentPresetId)
  }

  const handleCancelEdit = () => {
    if (store.presetIdToUpdate === null) return
    store.enterPresetMode(store.presetIdToUpdate)
  }

  const handleEnterManually = () => {
    store.enterManualMode()
  }

  // Watch for preset updates after save to restore/set currentPresetId
  watch(
    () => store.presets,
    (newPresets) => {
      const pending = pendingPresetSave.value
      if (!pending) return

      if (pending.id) {
        store.enterPresetMode(pending.id)
        pendingPresetSave.value = null
      } else if (pending.title) {
        const newPreset = newPresets.findLast((p) => p.title === pending.title)
        if (newPreset) {
          store.enterPresetMode(newPreset.id)
          pendingPresetSave.value = null
        }
      }
    },
  )

  // Auto-apply default preset on initial load (once only)
  watch(
    () => store.presets,
    async (presets) => {
      if (!presetsEnabled.value) return
      if (pendingPresetSave.value) return
      if (
        presets.length > 0 &&
        store.defaultPreset &&
        !store.currentPresetId &&
        !hasAutoAppliedDefault.value
      ) {
        store.applyPreset(store.defaultPreset)
        await verifyTitlesWithTemplate()
        showPresetDetails.value = false
        hasAutoAppliedDefault.value = true
      }
    },
    { immediate: true },
  )

  // Show preset select dialog when entering step 3 with presets but no default/current
  watch(
    () => store.stepper,
    (newStep, oldStep) => {
      if (!presetsEnabled.value) return
      if (newStep === '3' && oldStep !== '3') {
        if (store.presets.length > 0 && !store.defaultPreset && !store.currentPresetId) {
          showPresetSelectDialog.value = true
        }
      }
    },
  )

  return {
    showPresetSelectDialog,
    showPresetDetails,

    applyPreset,
    handlePresetSave,
    handleEditPreset,
    handleCancelEdit,
    handleEnterManually,
  }
}
