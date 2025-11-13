<script setup lang="ts">
import { mdiCheckCircle, mdiCloseCircle, mdiOpenInNew } from '@mdi/js'

const props = defineProps<{ image: MapillaryImage; meta: Metadata; index: number }>()

const store = useMapillaryStore()
const { checkFileTitleAvailability } = useCommons()
let titleDebounce: number | null = null
const scheduleTitleCheck = (title: string) => {
  if (titleDebounce !== null) {
    clearTimeout(titleDebounce)
  }
  titleDebounce = setTimeout(() => {
    void (async () => {
      const available = await checkFileTitleAvailability(title)
      store.updateItem(props.image.id, 'titleAvailable', available)
    })()
  }, 500) as unknown as number
}
</script>

<template>
  <div
    class="d-flex flex-column pa-4"
    :class="{ 'border-s-lg border-primary': meta.selected }"
  >
    <div class="d-flex align-center ga-4 mb-4">
      <span class="text-h4 font-weight-medium">{{ index }}</span>
      <v-checkbox-btn
        density="compact"
        :model-value="meta.selected"
        class="flex-grow-0"
        @update:model-value="(v) => store.updateItem(image.id, 'selected', v ?? false)"
      />
      <v-text-field
        :model-value="meta.title"
        label="Title"
        variant="outlined"
        density="compact"
        :hide-details="true"
        class="flex-grow-1 align-center"
        @update:model-value="
          (v) => {
            store.updateItem(image.id, 'title', v as string)
            scheduleTitleCheck(v as string)
          }
        "
      >
        <template #append-inner>
          <v-icon
            v-if="meta.titleAvailable === true"
            :icon="mdiCheckCircle"
            color="success"
          />
          <v-icon
            v-else-if="meta.titleAvailable === false"
            :icon="mdiCloseCircle"
            color="error"
          />
        </template>
      </v-text-field>
    </div>

    <!-- Image and metadata-->
    <v-container>
      <v-row>
        <v-col>
          <!-- Image -->
          <v-img
            :src="image.thumb_1024_url"
            :alt="`Mapillary image ${image.id}`"
            max-width="400"
          />
        </v-col>
        <v-col>
          <!-- Metadata -->
          <v-row>
            <v-col>
              <div>
                <span class="text-medium-emphasis">Captured</span>
                <div>{{ new Date(image.captured_at).toLocaleString() }}</div>
              </div>
            </v-col>
            <v-col>
              <div>
                <span class="text-medium-emphasis">Coordinates</span>
                <div>
                  Lat: {{ image.geometry.coordinates[1].toFixed(6) }}, Lng:
                  {{ image.geometry.coordinates[0].toFixed(6) }}
                </div>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div>
                <span class="text-medium-emphasis">Compass Angle</span>
                <div>{{ image.compass_angle.toFixed(1) }}°</div>
              </div>
            </v-col>
            <v-col>
              <div>
                <span class="text-medium-emphasis">Size</span>
                <div>{{ image.width }}×{{ image.height }}</div>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="d-flex flex-column ga-2 text-body-2 align-start">
                <v-btn
                  :href="image.thumb_original_url"
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
                  :href="`https://www.mapillary.com/app/?pKey=${image.id}&focus=photo`"
                  :append-icon="mdiOpenInNew"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="text"
                  color="primary"
                  size="small"
                  class="align-self-start pl-0 text-none"
                >
                  View on Mapillary
                </v-btn>
                <v-chip
                  v-if="image.is_pano"
                  color="info"
                  size="small"
                  class="align-self-start"
                >
                  Panorama
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <MapillaryInputs
      :language="meta.description.language"
      :enable-language="store.globalDescription === ''"
      :description="meta.description.text"
      :enable-description="store.globalDescription === ''"
      :categories="meta.categories"
      :enable-categories="store.globalCategories === ''"
      @update:language="
        (v) =>
          store.updateItem(image.id, 'description', {
            ...meta.description,
            language: v as string,
          })
      "
      @update:description="
        (v) =>
          store.updateItem(image.id, 'description', {
            ...meta.description,
            text: v as string,
          })
      "
      @update:categories="(v) => store.updateItem(image.id, 'categories', v as string)"
    />
  </div>
</template>
