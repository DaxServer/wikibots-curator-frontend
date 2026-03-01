<script setup lang="ts">
const store = useCollectionsStore()
const { fetchPresets, deletePreset } = useCollections()

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [boolean]
  apply: [number]
  enterManually: []
}>()

const deletingPresetId = ref<number | null>(null)

const handleApplyPreset = (presetId: number) => {
  emit('apply', presetId)
  emit('update:visible', false)
}

const handleEnterManually = () => {
  emit('enterManually')
  emit('update:visible', false)
}

const handleDeletePreset = (presetId: number) => {
  deletingPresetId.value = presetId
  deletePreset(presetId)
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      fetchPresets()
    }
  },
)

watch(
  () => store.presets,
  () => {
    if (deletingPresetId.value !== null) {
      if (store.currentPresetId === deletingPresetId.value) {
        store.setCurrentPresetId(null)
      }
      deletingPresetId.value = null
    }
  },
)
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Select a Preset"
    @update:visible="(value) => emit('update:visible', value)"
  >
    <div class="flex flex-col gap-3">
      <div
        v-for="preset in store.presets"
        :key="preset.id"
        class="p-3 border rounded-lg cursor-pointer transition-colors hover:bg-surface-100 border-surface-200"
        @click="handleApplyPreset(preset.id)"
      >
        <div class="flex justify-between items-start gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-medium">{{ preset.title }}</span>
              <Tag
                v-if="preset.is_default"
                value="Default"
                severity="success"
              />
            </div>
            <div class="text-sm text-surface-600 mt-1">
              <div class="font-mono text-xs whitespace-pre-wrap break-words">
                {{ preset.title_template }}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <Button
              :icon="deletingPresetId === preset.id ? 'pi pi-spinner pi-spin' : 'pi pi-trash'"
              :label="deletingPresetId === preset.id ? 'Deleting...' : undefined"
              severity="danger"
              :outlined="deletingPresetId !== preset.id"
              size="small"
              :disabled="deletingPresetId !== null"
              @click.stop="handleDeletePreset(preset.id)"
            />
            <i class="pi pi-chevron-right text-surface-400" />
          </div>
        </div>
      </div>

      <Button
        label="Enter values manually"
        variant="text"
        severity="secondary"
        class="w-full"
        @click="handleEnterManually"
      />
    </div>
  </Dialog>
</template>
