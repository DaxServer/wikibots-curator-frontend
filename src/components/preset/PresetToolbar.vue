<script setup lang="ts">
const store = useCollectionsStore()

defineProps<{
  showPresetDetails?: boolean
}>()

defineEmits<{
  'select-preset': []
  'toggle-details': []
  'edit-preset': []
  'cancel-edit': []
}>()
</script>

<template>
  <!-- Preset Mode -->
  <div
    v-if="store.currentPreset"
    class="flex justify-between items-center px-4 py-3 bg-surface-50 border border-surface-200 rounded"
  >
    <div class="flex items-center gap-3">
      <i class="pi pi-bookmark-fill text-green-600 text-lg" />
      <div class="flex flex-col">
        <span class="font-medium text-surface-900">Preset: "{{ store.currentPreset.title }}"</span>
        <span class="text-sm text-surface-600">Using saved values for this upload</span>
      </div>
      <Tag
        v-if="store.currentPreset.is_default"
        value="Default"
        severity="success"
        size="small"
      />
    </div>
    <div class="flex items-center gap-2">
      <Button
        label="Edit"
        icon="pi pi-pencil"
        size="small"
        text
        @click="$emit('edit-preset')"
      />
      <Button
        :label="showPresetDetails ? 'Hide Values' : 'View Values'"
        size="small"
        outlined
        @click="$emit('toggle-details')"
      />
      <Button
        label="Change"
        size="small"
        outlined
        @click="$emit('select-preset')"
      />
    </div>
  </div>

  <!-- Editing Preset Mode -->
  <div
    v-else-if="store.presetIdToUpdate"
    class="flex justify-between items-center px-4 py-3 bg-surface-50 border border-surface-200 rounded"
  >
    <div class="flex items-center gap-3">
      <i class="pi pi-pencil-fill text-blue-600 text-lg" />
      <div class="flex flex-col">
        <span class="font-medium text-surface-900">Editing Preset</span>
        <span class="text-sm text-surface-600">Modify the preset values below</span>
      </div>
    </div>
    <Button
      label="Cancel"
      size="small"
      severity="secondary"
      outlined
      @click="$emit('cancel-edit')"
    />
  </div>

  <!-- Manual Mode -->
  <div
    v-else
    class="flex justify-between items-center px-4 py-3 bg-surface-50 border border-surface-200 rounded"
  >
    <div class="flex items-center gap-3">
      <i class="pi pi-pencil-fill text-surface-600 text-lg" />
      <div class="flex flex-col">
        <span class="font-medium text-surface-900">Manual Mode</span>
        <span class="text-sm text-surface-600">Enter values manually or select a preset</span>
      </div>
    </div>
    <Button
      label="Choose Preset"
      size="small"
      @click="$emit('select-preset')"
    />
  </div>
</template>
