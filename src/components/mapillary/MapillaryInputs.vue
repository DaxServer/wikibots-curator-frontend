<script setup lang="ts">
withDefaults(
  defineProps<{
    language: string
    description: string
    categories: string
    enableLanguage?: boolean
    enableDescription?: boolean
    enableCategories?: boolean
  }>(),
  {
    enableLanguage: true,
    enableDescription: true,
    enableCategories: true,
  },
)

const emit = defineEmits<{
  (e: 'update:language', value: string): void
  (e: 'update:description', value: string): void
  (e: 'update:categories', value: string): void
}>()
</script>

<template>
  <div class="d-flex flex-column ga-3">
    <slot name="description-help" />
    <div class="d-flex ga-3">
      <div class="flex-grow-0">
        <v-select
          :disabled="!enableLanguage"
          :model-value="language"
          :items="languageOptions"
          item-title="label"
          item-value="value"
          label="Language"
          variant="outlined"
          density="compact"
          @update:model-value="(v) => emit('update:language', v)"
        />
      </div>
      <div class="flex-grow-1">
        <v-textarea
          :disabled="!enableDescription"
          :model-value="description"
          label="Description"
          variant="outlined"
          density="compact"
          rows="1"
          auto-grow
          @update:model-value="(v) => emit('update:description', v)"
        />
      </div>
    </div>

    <div>
      <v-textarea
        :disabled="!enableCategories"
        :model-value="categories"
        label="Categories"
        variant="outlined"
        density="compact"
        rows="3"
        auto-grow
        @update:model-value="(v) => emit('update:categories', v)"
      />
    </div>
  </div>
</template>
