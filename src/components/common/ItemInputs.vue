<script lang="ts" setup>
import { mdiOpenInNew } from '@mdi/js'

const props = defineProps<{
  language: string
  description: string
  categories: string
}>()

defineEmits<{
  'update:language': [string]
  'update:description': [string]
  'update:categories': [string]
}>()

const store = useCollectionsStore()

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Deutsch', value: 'de' },
]

const isFallbackLanguage = computed(
  () => store.globalLanguage.trim() !== '' && props.language.trim() === '',
)

const isFallbackDescription = computed(
  () => store.globalDescription.trim() !== '' && props.description.trim() === '',
)

const isFallbackCategories = computed(
  () => store.globalCategories.trim() !== '' && props.categories.trim() === '',
)
</script>

<template>
  <div class="d-flex ga-3 mt-4">
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
        @update:model-value="$emit('update:language', $event)"
      >
        <template v-if="isFallbackLanguage" #details>
          <span class="text-info">Using fallback language: {{ store.globalLanguage }}</span>
        </template>
      </v-select>
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
        @update:model-value="$emit('update:description', $event)"
      >
        <template v-if="isFallbackDescription" #details>
          <span class="text-info">Using fallback description: {{ store.globalDescription }}</span>
        </template>
      </v-textarea>
    </div>
  </div>

  <v-textarea
    :model-value="categories"
    label="Categories"
    variant="outlined"
    density="compact"
    rows="3"
    auto-grow
    :hide-details="'auto'"
    class="mt-2"
    @update:model-value="$emit('update:categories', $event)"
  >
    <template #details>
      <div class="d-flex flex-column text-info text-right">
        <span>
          <a class="text-decoration-none d-inline-flex align-center ga-1" href="https://commons.wikimedia.org/wiki/Category:Images_from_Mapillary_uploaded_with_Curator" target="_blank" rel="noopener noreferrer">[[Category:Images from Mapillary uploaded with Curator]]<v-icon :icon="mdiOpenInNew" size="12" /></a> will be added.
        </span>
        <span v-if="isFallbackCategories">Using fallback categories.</span>
      </div>
    </template>
  </v-textarea>
</template>
