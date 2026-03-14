<script setup lang="ts">
const store = useCollectionsStore()
const { itemsMissingCameraFields } = useTitleTemplate()
const {
  isEditing,
  isCreatingPreset,
  selectPreset,
  clearPreset,
  handleEditPreset,
  handleCancelEdit,
  handlePresetSave,
} = usePresetManager()

// We're viewing a preset (not editing) when one is selected and not in edit/create mode
const isViewingPreset = computed(
  () => store.currentPresetId && !isEditing.value && !isCreatingPreset.value,
)

// Show save form when not viewing preset and accordion is closed
const showPresetSaveForm = computed(
  () => !isViewingPreset.value && !store.isAccordionOpen,
)

const handleCreatePreset = () => {
  // Clear any selected preset to enter manual/new preset mode
  clearPreset()
  isCreatingPreset.value = true
  // Set accordion open to keep images list hidden
  store.setAccordionOpen(true)
}

const handleRemovePreset = () => {
  // Clear preset to enter manual mode (show fields + images list)
  clearPreset()
  // Close accordion to show both fields and images
  store.setAccordionOpen(false)
}

const handleCancelEditWrapper = () => {
  handleCancelEdit()
  store.setAccordionOpen(false)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card>
      <!-- Preset selector row -->
      <template #title>
        <PresetSelector
          :is-editing="isEditing"
          @select="selectPreset"
          @edit="handleEditPreset"
          @discard="handleCancelEditWrapper"
          @create="handleCreatePreset"
          @remove="handleRemovePreset"
        />
      </template>

      <template #content>
        <!-- Preset mode (not editing): subtle read-only field summary -->
        <div
          v-if="store.currentPresetId && !isEditing && !store.isAccordionOpen"
          class="mt-1"
        >
          <PresetPreview :preset="store.currentPreset" />
        </div>

        <!-- Manual or editing mode: editable forms -->
        <div
          v-else-if="!store.isAccordionOpen"
          class="flex flex-col gap-6 mt-2"
        >
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
                </template>
              </ItemInputs>
              <DateCategorySetting class="mt-4" />
            </template>
          </Card>
        </div>
      </template>

      <!-- Save form: only when editing, creating new, or manual mode -->
      <template
        v-if="showPresetSaveForm"
        #footer
      >
        <PresetSaveForm
          :is-editing="isEditing"
          :preset-title="store.currentPreset?.title"
          @save="handlePresetSave"
          @cancel="handleCancelEditWrapper"
        />
      </template>
    </Card>

    <template v-if="!isEditing && !store.isAccordionOpen">
      <SdcWarningMessage v-if="store.itemsWithExistingTitlesCount > 0" />

      <Message
        v-if="itemsMissingCameraFields.length > 0"
        severity="warn"
        icon="pi pi-exclamation-triangle"
      >
        {{ itemsMissingCameraFields.length }} item{{
          itemsMissingCameraFields.length > 1 ? 's' : ''
        }}
        missing camera fields used in template
      </Message>
    </template>
  </div>
</template>
