<script setup lang="ts">
import { mdiCheckCircle, mdiCloseCircle, mdiEyeOutline, mdiOpenInNew } from '@mdi/js'

defineProps<{ altPrefix: string }>()

const store = useCollectionsStore()
const { checkFileTitleAvailability } = useCommons()

const disablePreview = computed(() => {
  if (store.selectedCount === 0) return true
  for (const item of store.displayedItems) {
    if (item.meta.selected && item.meta.titleAvailable === false) return true
  }
  return false
})

let titleDebounce: Record<string, number | null> = {}
const updateTitle = (id: string, title: string) => {
  store.updateItem(id, 'title', title)
  store.updateItem(id, 'titleChecking', true)
  const existing = titleDebounce[id]
  if (existing !== null && existing !== undefined) {
    clearTimeout(existing)
  }
  titleDebounce[id] = setTimeout(() => {
    void (async () => {
      const available = await checkFileTitleAvailability(title)
      store.updateItem(id, 'titleAvailable', available)
      store.updateItem(id, 'titleChecking', false)
    })()
  }, 500) as unknown as number
}

onMounted(async () => {
  for (const item of store.displayedItems) {
    store.updateItem(item.id, 'titleChecking', true)
    const available = await checkFileTitleAvailability(item.meta.title)
    store.updateItem(item.id, 'titleAvailable', available)
    store.updateItem(item.id, 'titleChecking', false)
  }
})

onUnmounted(() => {
  for (const key in titleDebounce) {
    const t = titleDebounce[key]
    if (t !== null && t !== undefined) clearTimeout(t)
  }
  titleDebounce = {}
})
</script>

<template>
  <v-card class="mb-4 bg-grey-lighten-5 pa-4">
    <IngestBatchInputs
      :language="store.globalLanguage"
      :description="store.globalDescription"
      :categories="store.globalCategories"
      @update:language="(v) => (store.globalLanguage = v)"
      @update:description="(v) => (store.globalDescription = v)"
      @update:categories="(v) => (store.globalCategories = v)"
    >
      <template #description-help>
        <div class="d-inline-flex w-auto flex-grow-0 flex-shrink-0 mb-4">
          <v-alert type="info" variant="tonal" density="comfortable">
            Will be applied to all selected images
            <span class="text-decoration-underline">only as a fallback</span>
          </v-alert>
        </div>
      </template>
    </IngestBatchInputs>
  </v-card>

  <div class="d-flex justify-space-between align-center mt-4 mb-4 ga-4">
    <div class="d-inline-flex w-auto flex-grow-0 flex-shrink-0">
      <v-alert type="info" variant="tonal" density="comfortable">Displaying {{ store.showSelectedOnly ? 'only selected' : 'all' }} items</v-alert>
    </div>
    <v-btn :prepend-icon="mdiEyeOutline" color="primary" :disabled="disablePreview" @click="store.stepper = '4'">Preview edits</v-btn>
  </div>

  <div v-for="item in store.displayedItems" :key="item.id" class="mb-4">
    <div
      class="d-flex flex-column pa-4"
      :class="{
        'border-s-lg': item.meta.selected || item.meta.titleAvailable === false,
        'border-error border-opacity-100': item.meta.titleAvailable === false,
        'border-primary': item.meta.titleAvailable !== false && item.meta.selected,
      }"
    >
      <div class="d-flex align-start ga-4">
        <span class="text-h4 font-weight-medium">{{ item.index }}</span>
        <v-checkbox-btn
          density="comfortable"
          :model-value="item.meta.selected"
          class="flex-grow-0"
          @update:model-value="(v) => store.updateItem(item.id, 'selected', v)"
        />
        <v-text-field
          :model-value="item.meta.title"
          label="Title"
          variant="outlined"
          density="compact"
          :hide-details="'auto'"
          :error="item.meta.titleAvailable === false"
          class="flex-grow-1 align-center"
          @update:model-value="(v) => updateTitle(item.id, v)"
        >
          <template #append-inner>
            <v-progress-circular
              v-if="item.meta.titleChecking"
              indeterminate
              size="20"
              color="primary"
            />
            <v-icon v-else-if="item.meta.titleAvailable === true" :icon="mdiCheckCircle" color="success" />
            <v-icon v-else-if="item.meta.titleAvailable === false" :icon="mdiCloseCircle" color="error" />
          </template>

          <template #details>
            <div v-if="item.meta.titleAvailable === false" class="d-flex align-center ga-2">
              <span class="text-error">Title is not possible.</span>
              <a
                :href="`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(item.meta.title ?? '')}`"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary d-inline-flex align-center ga-1"
              >
                Check existing file
                <v-icon :icon="mdiOpenInNew" size="18" />
              </a>
            </div>
          </template>
        </v-text-field>
      </div>

      <v-container>
        <v-row>
          <v-col>
            <v-img :src="item.image.thumbnail_url" :alt="`${altPrefix} ${item.id}`" max-width="400" />
          </v-col>
          <v-col>
            <v-row>
              <v-col>
                <div>
                  <span class="text-medium-emphasis">Taken</span>
                  <div>{{ item.image.dates.taken ? new Date(item.image.dates.taken).toLocaleString() : '—' }}</div>
                </div>
              </v-col>
              <v-col v-if="item.image.dates.published">
                <div>
                  <span class="text-medium-emphasis">Published</span>
                  <div>{{ new Date(item.image.dates.published).toLocaleString() }}</div>
                </div>
              </v-col>
              <v-col>
                <div>
                  <span class="text-medium-emphasis">Coordinates</span>
                  <div>
                    Lat: {{ item.image.location?.latitude ?? '—' }}<br />
                    Lng: {{ item.image.location?.longitude ?? '—' }}
                  </div>
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <div>
                  <span class="text-medium-emphasis">Compass Angle</span>
                  <div>{{ item.image.location?.compass_angle ?? '—' }}°</div>
                </div>
              </v-col>
              <v-col>
                <div>
                  <span class="text-medium-emphasis">Size</span>
                  <div>{{ item.image.width }}×{{ item.image.height }}</div>
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <div class="d-flex flex-column ga-2 text-body-2 align-start">
                  <v-btn
                    :href="item.image.url_original"
                    :append-icon="mdiOpenInNew"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="text"
                    color="primary"
                    size="small"
                    class="align-self-start pl-0 text-none"
                  >
                    View image
                  </v-btn>
                  <v-btn
                    :href="item.image.url"
                    :append-icon="mdiOpenInNew"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="text"
                    color="primary"
                    size="small"
                    class="align-self-start pl-0 text-none"
                  >
                    View on {{ store.handler.charAt(0).toUpperCase() + store.handler.slice(1) }}
                  </v-btn>
                  <v-chip v-if="item.image.is_pano" color="info" size="small" class="align-self-start">Panorama</v-chip>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>

      <ItemInputs
        :language="item.meta.description.language"
        :description="item.meta.description.value"
        :categories="item.meta.categories"
        @update:language="
        (language) =>
          store.updateItem(item.id, 'description', {
            ...item.meta.description,
            language,
          })
      "
      @update:description="
        (value) =>
          store.updateItem(item.id, 'description', {
            ...item.meta.description,
            value,
          })
      "
      @update:categories="(categories) => store.updateItem(item.id, 'categories', categories)"
      />

    </div>
  </div>
</template>
