<script setup lang="ts">
const props = defineProps<{
  presetIdToUpdate?: number | null
}>()

const emit = defineEmits<{
  save: [data: { title: string; setAsDefault: boolean }]
  cancel: []
}>()

const presetTitle = ref('')
const setAsDefault = ref(false)

// Pre-fill preset title and checkbox when updating
watch(
  () => props.presetIdToUpdate,
  (presetId) => {
    const store = useCollectionsStore()
    if (presetId) {
      const preset = store.presets.find((p) => p.id === presetId)
      if (preset) {
        presetTitle.value = preset.title
        setAsDefault.value = preset.is_default
      }
    } else {
      presetTitle.value = ''
      setAsDefault.value = false
    }
  },
  { immediate: true },
)

const handleSave = () => {
  const trimmedTitle = presetTitle.value.trim()
  if (!trimmedTitle) return

  emit('save', { title: trimmedTitle, setAsDefault: setAsDefault.value })
}
</script>

<template>
  <div class="flex flex-col gap-3 mt-4 p-4 bg-surface-50 border border-surface-200 rounded">
    <div>
      <FloatLabel variant="on">
        <InputText
          v-model="presetTitle"
          id="preset_title"
          fluid
        />
        <label for="preset_title">Preset name</label>
      </FloatLabel>
    </div>

    <div class="flex items-center gap-3">
      <Button
        :label="presetIdToUpdate ? 'Update preset' : 'Save preset'"
        :icon="presetIdToUpdate ? 'pi pi-pencil' : 'pi pi-bookmark'"
        :disabled="!presetTitle.trim()"
        size="small"
        @click="handleSave"
      />

      <Button
        v-if="presetIdToUpdate"
        label="Cancel"
        severity="secondary"
        outlined
        size="small"
        @click="$emit('cancel')"
      />

      <div class="flex items-center gap-2">
        <Checkbox
          v-model="setAsDefault"
          binary
          input-id="set_default"
        />
        <label for="set_default">Set as default</label>
      </div>
    </div>
  </div>
</template>
