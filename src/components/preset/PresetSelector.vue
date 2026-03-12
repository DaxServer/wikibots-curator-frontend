<script setup lang="ts">
defineProps<{ isEditing: boolean }>()

const emit = defineEmits<{
  edit: []
  discard: []
  select: [id: number | null]
}>()

const store = useCollectionsStore()

const options = computed(() => [{ id: null, title: 'None (manual)' }, ...store.presets])

const onPresetChange = (id: number | null) => {
  emit('select', id)
}
</script>

<template>
  <div class="flex justify-between items-center w-full">
    <div class="flex items-center gap-3">
      <span class="text-md font-medium text-surface-700">Preset</span>
      <Select
        :model-value="store.currentPresetId"
        :options="options"
        option-label="title"
        option-value="id"
        placeholder="None (manual)"
        @update:model-value="onPresetChange"
      />
      <Tag
        v-if="store.currentPreset?.is_default"
        value="Default"
        severity="success"
        size="small"
      />
    </div>

    <Button
      v-if="store.currentPresetId && !isEditing"
      label="Edit"
      icon="pi pi-pencil"
      size="small"
      outlined
      @click="$emit('edit')"
    />
    <Button
      v-if="store.currentPresetId && isEditing"
      label="Cancel"
      icon="pi pi-times"
      size="small"
      severity="danger"
      outlined
      @click="$emit('discard')"
    />
  </div>
</template>
