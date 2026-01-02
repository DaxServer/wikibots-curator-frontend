<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    language: string
    description: string
    categories: string
    license?: string
    showFallbackMessages?: boolean
  }>(),
  {
    showFallbackMessages: false,
    license: '',
  },
)

defineEmits<{
  'update:language': [string]
  'update:description': [string]
  'update:categories': [string]
  'update:license': [string]
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

const isFallbackLicense = computed(
  () => store.globalLicense.trim() !== '' && props.license.trim() === '',
)

const licenseTemplate = `{{cc-by-sa-4.0}}`
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
        <SimpleMessage
          v-if="showFallbackMessages && isFallbackDescription"
          :severity="isFallbackDescription ? 'warn' : 'secondary'"
          class="pl-3"
        >
          Using fallback description: {{ store.globalDescription }}
        </SimpleMessage>
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
      <SimpleMessage
        :severity="isFallbackCategories ? 'warn' : 'secondary'"
        class="-mt-3 pl-3"
      >
        <ExternalLink
          href="https://commons.wikimedia.org/wiki/Category:Images_from_Mapillary_uploaded_with_Curator"
          class="hover:text-primary"
        >
          [[Category:Images from Mapillary uploaded with Curator]]
        </ExternalLink>
        will be added
        <span
          v-if="isFallbackCategories"
          class="block mt-1"
        >
          Using fallback categories
        </span>
      </SimpleMessage>
    </slot>

    <div>
      <FloatLabel variant="on">
        <Textarea
          :model-value="license"
          id="license_input"
          rows="2"
          auto-resize
          @update:model-value="$emit('update:license', $event)"
          fluid
        />
        <label for="license_input">License template override</label>
      </FloatLabel>
      <SimpleMessage
        severity="secondary"
        icon="pi pi-exclamation-triangle"
        class="pl-3"
      >
        SDC copyright license and copyright status will not be generated. Example:
        {{ licenseTemplate }}
      </SimpleMessage>
      <SimpleMessage
        v-if="showFallbackMessages && isFallbackLicense"
        :severity="isFallbackLicense ? 'warn' : 'secondary'"
        class="mt-1 pl-3"
      >
        Using fallback license template
      </SimpleMessage>
    </div>
  </div>
</template>
