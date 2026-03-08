<script setup lang="ts">
const store = useCollectionsStore()
const { itemsMissingCameraFields } = useTitleTemplate()
const { presetsEnabled } = useFeatureFlags()

const {
  showPresetSelectDialog,
  showPresetDetails,
  applyPreset,
  handlePresetSave,
  handleEditPreset,
  handleCancelEdit,
  handleEnterManually,
} = usePresetManager()
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Preset toolbar -->
    <PresetToolbar
      v-if="presetsEnabled"
      :show-preset-details="showPresetDetails"
      @select-preset="showPresetSelectDialog = true"
      @toggle-details="showPresetDetails = !showPresetDetails"
      @edit-preset="handleEditPreset"
      @cancel-edit="handleCancelEdit"
    />

    <!-- Preset Mode: Show preset details when toggled -->
    <PresetDisplay
      v-if="presetsEnabled && store.currentPreset && showPresetDetails"
      @edit-manually="handleEditPreset"
    />

    <!-- Manual Mode: Show editable forms -->
    <template v-if="!store.currentPreset">
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
      @update:visible="(value) => (showPresetSelectDialog = value)"
      @apply="applyPreset"
      @enter-manually="handleEnterManually"
    />
  </div>
</template>
