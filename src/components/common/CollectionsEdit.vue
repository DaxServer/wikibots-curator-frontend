<script setup lang="ts">
defineProps<{ altPrefix: string }>()

const store = useCollectionsStore()
const { checkFileTitleAvailability } = useCommons()

const disablePreview = computed(() => {
  if (store.selectedCount === 0) return true
  for (const item of store.selectedItems) {
    if (item.meta.selected && item.meta.titleAvailable === false) return true
  }
  return false
})

const updateTitle = (id: string, title: string) => {
  store.updateItem(id, 'title', title)
  store.updateItem(id, 'titleChecking', true)
  getDebouncedCheckTitle(id)(title)
}

const debouncedCheckTitleMap = new Map<string, ReturnType<typeof debounce>>()

const getDebouncedCheckTitle = (id: string) => {
  if (!debouncedCheckTitleMap.has(id)) {
    const debounced = debounce(async (title: string) => {
      const availability = await checkFileTitleAvailability([title])
      store.updateItem(id, 'titleAvailable', availability[title])
      store.updateItem(id, 'titleChecking', false)
    }, 100)
    debouncedCheckTitleMap.set(id, debounced)
  }
  return debouncedCheckTitleMap.get(id)!
}

onMounted(async () => {
  const titles = store.selectedItems.map((item) => item.meta.title)
  for (const item of store.selectedItems) {
    store.updateItem(item.id, 'titleChecking', true)
  }
  const availability = await checkFileTitleAvailability(titles)
  for (const item of store.selectedItems) {
    store.updateItem(item.id, 'titleAvailable', availability[item.meta.title])
    store.updateItem(item.id, 'titleChecking', false)
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="bg-gray-100">
      <template #content>
        <ItemInputs
          :language="store.globalLanguage"
          :description="store.globalDescription"
          :categories="store.globalCategories"
          @update:language="(v: string) => (store.globalLanguage = v)"
          @update:description="(v: string) => (store.globalDescription = v)"
          @update:categories="(v: string) => (store.globalCategories = v)"
        >
          <template #description-help>
            <div class="inline-flex flex-none">
              <Message
                severity="info"
                icon="pi pi-info-circle"
              >
                Will be applied to all selected images
                <span class="underline">only as a fallback</span>
                .
              </Message>
            </div>
          </template>
        </ItemInputs>
      </template>
    </Card>

    <div class="flex justify-between items-center">
      <Message
        severity="info"
        icon="pi pi-info-circle"
      >
        Displaying {{ store.showSelectedOnly ? 'only selected' : 'all' }} items
      </Message>
      <div class="flex items-center gap-2">
        <Message
          v-if="store.itemsWithErrors > 0"
          severity="error"
          icon="pi pi-exclamation-triangle"
        >
          {{ store.itemsWithErrors }} item{{ store.itemsWithErrors > 1 ? 's' : '' }} with errors
        </Message>
        <Button
          icon="pi pi-eye"
          icon-pos="left"
          label="Preview edits"
          severity="primary"
          :disabled="disablePreview"
          @click="store.stepper = '4'"
        />
      </div>
    </div>

    <div>
      <div
        v-for="item in store.selectedItems"
        :key="item.id"
        class="flex flex-col p-4 py-8 border-l-4"
        :class="{
          'border-green-600': item.meta.titleAvailable === true,
          'border-red-500': item.meta.titleAvailable === false,
          'border-gray-200': item.meta.titleAvailable === undefined,
          'border-yellow-500': item.image.existing.length > 0 && item.meta.titleAvailable === true,
        }"
      >
        <div class="flex items-start gap-4">
          <span class="text-4xl font-medium">{{ item.index }}</span>
          <Checkbox
            binary
            :modelValue="item.meta.selected"
            size="large"
            class="mt-2"
            @update:modelValue="(v: boolean) => store.updateItem(item.id, 'selected', v)"
          />
          <div class="flex-1 flex flex-col gap-1">
            <IconField>
              <InputText
                :modelValue="item.meta.title ?? ''"
                :invalid="item.meta.titleAvailable === false"
                @update:modelValue="(v) => updateTitle(item.id, v ?? '')"
                fluid
              />
              <InputIcon
                class="pi"
                :class="{
                  'text-inherit! pi-spin pi-spinner': item.meta.titleChecking,
                  'text-green-600! pi-check-circle': item.meta.titleAvailable === true,
                  'text-red-500! pi-times-circle': item.meta.titleAvailable === false,
                }"
              />
            </IconField>
            <Message
              :severity="item.meta.titleAvailable === false ? 'error' : 'success'"
              variant="simple"
              size="small"
            >
              <template v-if="item.meta.titleAvailable === true">Title is available.</template>
              <template v-if="item.meta.titleAvailable === false">
                Title is not possible.
                <a
                  :href="`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(item.meta.title ?? '')}`"
                  class="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Check existing file
                  <i class="pi pi-external-link text-xs!"></i>
                </a>
              </template>
            </Message>
          </div>
        </div>

        <div class="flex gap-4 py-4">
          <Image
            :src="item.image.preview_url"
            :alt="`${altPrefix} ${item.id}`"
            class="max-w-3xl"
          />
          <div>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div>
                  <span class="text-gray-500">Taken</span>
                  <div>
                    {{
                      item.image.dates.taken
                        ? new Date(item.image.dates.taken).toLocaleString()
                        : '—'
                    }}
                  </div>
                </div>
              </div>
              <div v-if="item.image.dates.published">
                <div>
                  <span class="text-gray-500">Published</span>
                  <div>{{ new Date(item.image.dates.published).toLocaleString() }}</div>
                </div>
              </div>
              <div>
                <div>
                  <span class="text-gray-500">Coordinates</span>
                  <div>
                    Lat: {{ item.image.location?.latitude ?? '—' }}
                    <br />
                    Lng: {{ item.image.location?.longitude ?? '—' }}
                  </div>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div>
                  <span class="text-gray-500">Compass Angle</span>
                  <div>{{ item.image.location?.compass_angle ?? '—' }}°</div>
                </div>
              </div>
              <div>
                <div>
                  <span class="text-gray-500">Size</span>
                  <div>{{ item.image.width }}×{{ item.image.height }}</div>
                </div>
              </div>
            </div>
            <div class="mb-4">
              <div class="flex flex-col gap-2 text-sm items-start">
                <ExternalLink
                  as="button"
                  :href="item.image.url_original"
                  show-icon
                  variant="text"
                  color="primary"
                  size="small"
                  class="self-start pl-0 text-none"
                >
                  View image
                </ExternalLink>
                <ExternalLink
                  as="button"
                  :href="item.image.url"
                  show-icon
                  variant="text"
                  color="primary"
                  size="small"
                  class="self-start pl-0 text-none"
                >
                  View on {{ store.handler.charAt(0).toUpperCase() + store.handler.slice(1) }}
                </ExternalLink>
                <Chip
                  v-if="item.image.is_pano"
                  severity="info"
                  class="self-start"
                >
                  Panorama
                </Chip>
              </div>
            </div>
            <div
              v-if="item.image.existing.length"
              class="mb-4"
            >
              <div class="p-1 bg-orange-100">
                <strong>Existing files:</strong>
                <div
                  v-for="page in item.image.existing"
                  :key="page.url"
                >
                  *
                  <ExternalLink
                    :href="page.url"
                    class="text-info"
                    show-icon
                  >
                    {{ page.url }}
                  </ExternalLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ItemInputs
          :language="item.meta.description.language"
          :description="item.meta.description.value"
          :categories="item.meta.categories"
          show-fallback-messages
          @update:language="
            (language: string) =>
              store.updateItem(item.id, 'description', {
                ...item.meta.description,
                language,
              })
          "
          @update:description="
            (value: string) =>
              store.updateItem(item.id, 'description', {
                ...item.meta.description,
                value,
              })
          "
          @update:categories="
            (categories: string) => store.updateItem(item.id, 'categories', categories)
          "
        />
      </div>
    </div>
  </div>
</template>
