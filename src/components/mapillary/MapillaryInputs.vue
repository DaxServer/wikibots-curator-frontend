<script setup lang="ts">
const props = defineProps<{
  language: string
  description: string
  categories: string
}>()

const emit = defineEmits<{
  (e: 'update:language', value: string): void
  (e: 'update:description', value: string): void
  (e: 'update:categories', value: string): void
}>()

const store = useMapillaryStore()

const isFallbackLanguage = computed(() => {
  return store.globalLanguage.trim() !== '' && props.language.trim() === ''
})
const isFallbackDescription = computed(() => {
  return store.globalDescription.trim() !== '' && props.description.trim() === ''
})
const isFallbackCategories = computed(() => {
  return store.globalCategories.trim() !== '' && props.categories.trim() === ''
})
</script>

<template>
  <div class="d-flex flex-column ga-3">
    <slot name="description-help" />
    <div class="d-flex ga-3">
      <div class="flex-grow-0">
        <v-select
          :model-value="props.language"
          :items="languageOptions"
          item-title="label"
          item-value="value"
          label="Language"
          variant="outlined"
          density="compact"
          :hide-details="'auto'"
          @update:model-value="(v) => emit('update:language', v)"
        >
          <template
            v-if="isFallbackLanguage"
            #details
          >
            <span class="text-info">Using fallback language: {{ store.globalLanguage }}</span>
          </template>
        </v-select>
      </div>
      <div class="flex-grow-1">
        <v-textarea
          :model-value="props.description"
          label="Description"
          variant="outlined"
          density="compact"
          rows="1"
          auto-grow
          :hide-details="'auto'"
          @update:model-value="(v) => emit('update:description', v)"
        >
          <template
            v-if="isFallbackDescription"
            #details
          >
            <span class="text-info">Using fallback description</span>
          </template>
        </v-textarea>
      </div>
    </div>

    <div>
      <v-textarea
        :model-value="props.categories"
        label="Categories"
        variant="outlined"
        density="compact"
        rows="3"
        auto-grow
        :hide-details="'auto'"
        @update:model-value="(v) => emit('update:categories', v)"
      >
        <template
          v-if="isFallbackCategories"
          #details
        >
          <span class="text-info">Using fallback categories</span>
        </template>
      </v-textarea>
    </div>
  </div>
</template>
