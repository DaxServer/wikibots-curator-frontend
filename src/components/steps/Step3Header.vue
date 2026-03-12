<script setup lang="ts">
const store = useCollectionsStore()
const { itemsMissingCameraFields } = useTitleTemplate()
const { presetsEnabled } = useFeatureFlags()

const {
  isEditing,
  selectPreset,
  clearPreset,
  handleEditPreset,
  handleCancelEdit,
  handlePresetSave,
} = usePresetManager()

const LANGUAGE_LABELS: Record<string, string> = { en: 'English', de: 'Deutsch' }
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card>
      <!-- Preset selector row -->
      <template
        v-if="presetsEnabled"
        #title
      >
        <PresetSelector
          :is-editing="isEditing"
          @select="(id) => (id !== null ? selectPreset(id) : clearPreset())"
          @edit="handleEditPreset"
          @discard="handleCancelEdit"
        />
      </template>

      <template #content>
        <!-- Preset mode (not editing): subtle read-only field summary -->
        <div
          v-if="store.currentPresetId && !isEditing"
          class="flex flex-col gap-2 text-sm text-surface-500 mt-1"
        >
          <div>
            <span class="font-medium text-surface-600">Template:</span>
            <span class="font-mono ml-2">{{ store.globalTitleTemplate || '—' }}</span>
          </div>
          <div class="flex flex-wrap gap-x-6 gap-y-1">
            <span>
              <span class="font-medium text-surface-600">Language:</span>
              {{ LANGUAGE_LABELS[store.globalLanguage] ?? store.globalLanguage }}
            </span>
            <span v-if="store.globalDescription">
              <span class="font-medium text-surface-600">Description:</span>
              {{ store.globalDescription }}
            </span>
          </div>
          <div v-if="store.globalCategories">
            <span class="font-medium text-surface-600">Categories:</span>
            <span class="ml-2 whitespace-pre-wrap">{{ store.globalCategories }}</span>
          </div>
        </div>

        <!-- Manual or editing mode: editable forms -->
        <div
          v-else
          class="flex flex-col gap-6"
          :class="{ 'mt-2': presetsEnabled }"
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

      <!-- Save form: only when editing or manual mode -->
      <template
        v-if="presetsEnabled && (!store.currentPresetId || isEditing)"
        #footer
      >
        <PresetSaveForm
          :is-editing="isEditing"
          :preset-title="store.currentPreset?.title"
          @save="handlePresetSave"
          @cancel="handleCancelEdit"
        />
      </template>
    </Card>

    <template v-if="!isEditing">
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
