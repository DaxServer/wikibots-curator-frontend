<script setup lang="ts">
const toast = useToast()
const store = useCollectionsStore()
const { itemsMissingCameraFields, verifyTitlesWithTemplate } = useTitleTemplate()
const { currentPreset } = usePresets()
const { presetsEnabled } = useFeatureFlags()
const { savePreset, fetchPresets } = useCollections()

const showPresetSelectDialog = ref(false)
const showPresetDetails = ref(false)
const presetIdToUpdate = ref<number | null>(null)
const hasAutoAppliedDefault = ref(false)

// Track pending save operation to restore/set currentPresetId after WebSocket response
// Unified tracking: id for updates, title for creates (mutually exclusive)
const pendingPresetSave = ref<{ id?: number; title?: string } | null>(null)

const applyPreset = async (presetId: number) => {
  const preset = store.presets.find((p) => p.id === presetId)
  if (preset) {
    store.applyPreset(preset)
    await verifyTitlesWithTemplate()
    showPresetDetails.value = false
  }
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

  if (presetIdToUpdate.value) {
    data.preset_id = presetIdToUpdate.value
    pendingPresetSave.value = { id: presetIdToUpdate.value }
  } else {
    pendingPresetSave.value = { title }
  }

  savePreset(data)
  fetchPresets()

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

const handleEnterManually = () => {
  // Clear both the current preset and any pending update
  store.setCurrentPresetId(null)
  presetIdToUpdate.value = null
}

const handleEditPreset = () => {
  // Store the preset ID so we can update it later
  presetIdToUpdate.value = store.currentPresetId
  // Clear currentPresetId to show the editable forms
  // The preset values are already in the store (globalTitleTemplate, etc.)
  store.setCurrentPresetId(null)
}

const handleCancelEdit = () => {
  // Restore the preset that was being edited
  if (presetIdToUpdate.value) {
    store.setCurrentPresetId(presetIdToUpdate.value)
    presetIdToUpdate.value = null
  }
}

// Watch for preset updates after save operation to restore/set currentPresetId
watch(
  () => store.presets,
  (newPresets) => {
    const pending = pendingPresetSave.value
    if (!pending) return

    if (pending.id) {
      // Updating existing preset: restore currentPresetId
      store.setCurrentPresetId(pending.id)
      pendingPresetSave.value = null
      presetIdToUpdate.value = null
    } else if (pending.title) {
      // Creating new preset: find it by title and set as current
      const newPreset = newPresets.find((p) => p.title === pending.title)
      if (newPreset) {
        store.setCurrentPresetId(newPreset.id)
        pendingPresetSave.value = null
      }
    }
  },
)

// Apply default preset when presets are loaded or when component mounts
// Only auto-apply once on initial load to avoid overriding user's manual changes
watch(
  () => store.presets,
  async (presets) => {
    if (!presetsEnabled.value) return
    // Skip if we're in the middle of saving/updating a preset
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

// Show preset select dialog when entering step 3 if no preset is selected
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
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Preset toolbar -->
    <PresetToolbar
      v-if="presetsEnabled"
      :current-preset="currentPreset"
      :show-preset-details="showPresetDetails"
      :preset-id-to-update="presetIdToUpdate"
      @select-preset="showPresetSelectDialog = true"
      @toggle-details="showPresetDetails = !showPresetDetails"
      @edit-preset="handleEditPreset"
      @cancel-edit="handleCancelEdit"
    />

    <!-- Preset Mode: Show preset details when toggled -->
    <PresetDisplay
      v-if="presetsEnabled && currentPreset && showPresetDetails"
      :preset="currentPreset"
      @edit-manually="handleEditPreset"
      @edit-preset="handleEditPreset"
    />

    <!-- Manual Mode: Show editable forms -->
    <template v-if="!currentPreset">
      <TitleTemplateEditor />

      <Card class="bg-surface-50 border-l-4 border-blue-500">
        <template #title>
          <div class="flex items-center gap-2">
            <i class="pi pi-info-circle text-blue-600" />
            <span>Fallback Values</span>
          </div>
        </template>
        <template #subtitle>
          Applied to images that don't have values from Mapillary or other sources
        </template>
        <template #content>
          <ItemInputs
            class="mt-2"
            :language="store.globalLanguage"
            :description="store.globalDescription"
            :categories="store.globalCategories"
            :license="store.globalLicense"
            @update:language="(v: string) => (store.globalLanguage = v)"
            @update:description="(v: string) => (store.globalDescription = v)"
            @update:categories="(v: string) => (store.globalCategories = v)"
            @update:license="(v: string) => (store.globalLicense = v)"
          >
            <template #description-help>
              <div class="flex flex-col gap-4">
                <div class="inline-flex flex-none">
                  <SimpleMessage
                    severity="info"
                    variant="simple"
                    size="small"
                    icon="pi pi-info-circle"
                  >
                    Will be applied to all selected images
                    <span class="underline">only as a fallback</span>
                  </SimpleMessage>
                </div>
              </div>
            </template>
          </ItemInputs>
          <DateCategorySetting class="mt-4" />
        </template>
      </Card>

      <!-- Preset Save Form -->
      <PresetSaveForm
        v-if="presetsEnabled"
        :preset-id-to-update="presetIdToUpdate"
        @save="handlePresetSave"
        @cancel="handleCancelEdit"
      />
    </template>

    <SdcWarningMessage v-if="store.itemsWithExistingTitlesCount > 0" />

    <Message
      v-if="itemsMissingCameraFields.length > 0"
      severity="warn"
      icon="pi pi-exclamation-triangle"
    >
      {{ itemsMissingCameraFields.length }} item{{ itemsMissingCameraFields.length > 1 ? 's' : '' }}
      missing camera fields used in template
    </Message>

    <!-- Preset select dialog -->
    <PresetSelectDialog
      v-if="presetsEnabled"
      :visible="showPresetSelectDialog"
      @apply="applyPreset"
      @enter-manually="handleEnterManually"
    />
  </div>
</template>
