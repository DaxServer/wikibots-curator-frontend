<script setup lang="ts">
defineProps<{ language: string; description: string; categories: string }>()
const emit = defineEmits<{
  (e: 'update:language', value: string): void
  (e: 'update:description', value: string): void
  (e: 'update:categories', value: string): void
}>()

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Deutsch', value: 'de' },
]
</script>

<template>
  <div class="d-flex flex-column ga-3">
    <slot name="description-help" />
    <div class="d-flex ga-3">
      <div class="flex-grow-0">
        <v-select
          :model-value="language"
          :items="languageOptions"
          item-title="label"
          item-value="value"
          label="Language"
          variant="outlined"
          density="compact"
          :hide-details="'auto'"
          @update:model-value="(v) => emit('update:language', v)"
        />
      </div>
      <div class="flex-grow-1">
        <v-textarea
          :model-value="description"
          label="Description"
          variant="outlined"
          density="compact"
          rows="1"
          auto-grow
          :hide-details="'auto'"
          @update:model-value="(v) => emit('update:description', v)"
        />
      </div>
    </div>

    <div>
      <v-textarea
        :model-value="categories"
        label="Categories"
        variant="outlined"
        density="compact"
        rows="3"
        auto-grow
        :hide-details="'auto'"
        @update:model-value="(v) => emit('update:categories', v)"
      />
    </div>
  </div>
</template>