<script setup lang="ts">
const store = useCollectionsStore()
// currentPreset is guaranteed non-null by v-if in parent
const preset = computed(() => store.currentPreset!)

defineEmits<{
  'edit-manually': []
}>()
</script>

<template>
  <Card class="bg-surface-50 border-l-4 border-green-500">
    <template #title>
      <div class="flex items-center gap-2">
        <i class="pi pi-bookmark text-green-600" />
        <span>Preset: "{{ preset.title }}"</span>
      </div>
    </template>
    <template #subtitle>Using saved preset values for title, description, and categories</template>
    <template #content>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col">
          <label class="text-sm font-medium text-surface-600 mb-2 block">Title Template</label>
          <div
            class="font-mono text-base bg-surface-100 p-3 rounded border border-surface-300 whitespace-pre-wrap break-words"
          >
            {{ preset.title_template }}
          </div>
        </div>

        <div class="flex flex-col">
          <label class="text-sm font-medium text-surface-600 mb-2 block">Language</label>
          <div class="text-base">{{ preset.labels?.language || 'en' }}</div>
        </div>

        <div class="flex flex-col">
          <label class="text-sm font-medium text-surface-600 mb-2 block">Description</label>
          <div class="text-base bg-surface-100 p-3 rounded border border-surface-300 min-h-16">
            {{ preset.labels?.value || '(empty)' }}
          </div>
        </div>

        <div class="flex flex-col">
          <label class="text-sm font-medium text-surface-600 mb-2 block">Categories</label>
          <div class="text-base bg-surface-100 p-3 rounded border border-surface-300 min-h-16">
            {{ preset.categories || '(empty)' }}
          </div>
        </div>

        <div class="flex flex-col">
          <label class="text-sm font-medium text-surface-600 mb-2 block">Date Category</label>
          <div class="text-base">
            {{ !preset.exclude_from_date_category ? 'Enabled' : 'Disabled' }}
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <Button
            label="Customize Values"
            icon="pi pi-sliders-h"
            outlined
            severity="secondary"
            class="flex-1"
            @click="$emit('edit-manually')"
          />
        </div>
      </div>
    </template>
  </Card>
</template>
