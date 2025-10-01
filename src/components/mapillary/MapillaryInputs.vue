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
  <div class="flex flex-col gap-3">
    <slot name="description-help" />
    <div class="flex gap-3 text-sm">
      <div class="space-y-2 grow-none">
        <label class="block font-medium text-gray-600">Language</label>
        <Select
          :disabled="!enableLanguage"
          :model-value="language"
          :options="languageOptions"
          option-label="label"
          option-value="value"
          placeholder="Language"
          class="w-full"
          @update:model-value="(v) => emit('update:language', v as string)"
        />
      </div>
      <div class="space-y-2 grow">
        <label class="block font-medium text-gray-600">Description</label>
        <Textarea
          :disabled="!enableDescription"
          :model-value="description"
          rows="1"
          auto-resize
          class="w-full"
          @update:model-value="(v) => emit('update:description', v as string)"
        />
      </div>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-600">Categories</label>
      <Textarea
        :disabled="!enableCategories"
        :model-value="categories"
        rows="3"
        auto-resize
        class="w-full"
        @update:model-value="(v) => emit('update:categories', v as string)"
      />
    </div>
  </div>
</template>
