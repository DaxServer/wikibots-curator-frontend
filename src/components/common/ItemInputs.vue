<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    language: string
    description: string
    categories: string
    showFallbackMessages?: boolean
  }>(),
  {
    showFallbackMessages: false,
  },
)

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
  <div class="flex flex-col gap-4">
    <!-- Optional slot for help text above inputs -->
    <slot name="description-help" />

    <div class="flex gap-3">
      <div>
        <Select
          :model-value="language"
          :options="languageOptions"
          option-label="label"
          option-value="value"
          @update:model-value="$emit('update:language', $event)"
        />
        <small
          v-if="showFallbackMessages && isFallbackLanguage"
          class="text-blue-600"
        >
          Using fallback language: {{ store.globalLanguage }}
        </small>
      </div>

      <div class="flex-1">
        <FloatLabel variant="on">
          <Textarea
            :model-value="description"
            id="description_input"
            rows="1"
            auto-resize
            @update:model-value="$emit('update:description', $event)"
            fluid
          />
          <label for="description_input">Description</label>
        </FloatLabel>
        <Message
          v-if="showFallbackMessages && isFallbackDescription"
          :severity="isFallbackDescription ? 'warn' : 'secondary'"
          variant="simple"
          size="small"
          :pt="{
            transition: {
              name: 'none',
              enterActiveClass: 'none',
              leaveActiveClass: 'none',
            },
          }"
        >
          Using fallback description: {{ store.globalDescription }}
        </Message>
      </div>
    </div>

    <FloatLabel variant="on">
      <Textarea
        :model-value="categories"
        id="categories_input"
        rows="3"
        auto-resize
        @update:model-value="$emit('update:categories', $event)"
        fluid
      />
      <label for="categories_input">Categories</label>
    </FloatLabel>

    <!-- Category info message with slot for custom styling -->
    <slot name="category-message">
      <Message
        :severity="isFallbackCategories ? 'warn' : 'secondary'"
        variant="simple"
        size="small"
        class="-mt-3"
        :pt="{
          transition: {
            name: 'none',
            enterActiveClass: 'none',
            leaveActiveClass: 'none',
          },
        }"
      >
        <a
          href="https://commons.wikimedia.org/wiki/Category:Images_from_Mapillary_uploaded_with_Curator"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:underline hover:text-primary"
        >
          [[Category:Images from Mapillary uploaded with Curator]]
          <i class="pi pi-external-link text-xs!"></i>
        </a>
        will be added
        <span
          v-if="isFallbackCategories"
          class="block mt-1"
        >
          Using fallback categories
        </span>
      </Message>
    </slot>
  </div>
</template>
