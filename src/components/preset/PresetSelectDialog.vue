<script setup lang="ts">
const store = useCollectionsStore()
const { fetchPresets } = useCollections()

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [boolean]
  apply: [number]
  enterManually: []
}>()

const handleApplyPreset = (presetId: number) => {
  emit('apply', presetId)
  emit('update:visible', false)
}

const handleEnterManually = () => {
  emit('enterManually')
  emit('update:visible', false)
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      fetchPresets()
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
          <i class="pi pi-chevron-right text-surface-400" />
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
