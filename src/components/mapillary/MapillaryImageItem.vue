<script setup lang="ts">
defineProps<{ image: MapillaryImage; meta: Metadata; index: number }>()

const store = useMapillaryStore()
</script>

<template>
  <!-- Grid layout with two columns [auto,1fr] and two rows; row 2 left column empty for alignment -->
  <div
    class="grid grid-cols-[auto_1fr] gap-4 p-4 border-l-10 border-transparent"
    :class="{ 'border-l-blue-500': meta.selected }"
  >
    <!-- Row 1, Col 1: index + checkbox stacked -->
    <div class="flex flex-row items-center gap-2">
      <span class="text-3xl font-medium">{{ index }}</span>
      <n-checkbox
        :checked="meta.selected"
        @update:checked="(v) => store.updateItem(image.id, 'selected', v)"
      />
    </div>
    <!-- Row 1, Col 2: title input -->
    <div>
      <n-input
        :value="meta.title"
        placeholder="Title"
        class="w-full"
        @update:value="(v) => store.updateItem(image.id, 'title', v as string)"
      />
    </div>

    <!-- Row 2, Col 1: intentionally empty to ensure first-column height uniformity -->
    <div></div>

    <!-- Row 2, Col 2: remaining content -->
    <div class="grid grid-cols-1 gap-3">
      <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-4">
        <!-- Image column (auto width, fills available) -->
        <div class="max-w-full">
          <a
            :href="image.thumb_original_url"
            target="_blank"
            rel="noopener noreferrer"
            class="block"
          >
            <n-image
              :src="image.thumb_1024_url"
              :alt="`Mapillary image ${image.id}`"
              class="rounded w-full object-cover"
              lazy
            />
          </a>
        </div>

        <!-- Metadata column -->
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-gray-500">Captured</span>
            <div>{{ new Date(image.captured_at).toLocaleString() }}</div>
          </div>
          <div>
            <span class="text-gray-500">Coordinates</span>
            <div>
              Lat: {{ image.geometry.coordinates[1].toFixed(6) }}, Lng:
              {{ image.geometry.coordinates[0].toFixed(6) }}
            </div>
          </div>
          <div>
            <span class="text-gray-500">Compass Angle</span>
            <div>{{ image.compass_angle.toFixed(1) }}°</div>
          </div>
          <div>
            <span class="text-gray-500">Size</span>
            <div>{{ image.width }}×{{ image.height }}</div>
          </div>
          <div class="flex flex-col gap-1">
            <a
              :href="image.thumb_original_url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-500 hover:underline"
            >
              View image
              <i class="pi pi-external-link"></i>
            </a>
            <a
              :href="`https://www.mapillary.com/app/?pKey=${image.id}&focus=photo`"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-500 hover:underline"
            >
              View on Mapillary
              <i class="pi pi-external-link ml-1"></i>
            </a>
            <n-tag
              v-if="image.is_pano"
              type="info"
              size="small"
              class="text-xs w-fit"
            >
              Panorama
            </n-tag>
          </div>
        </div>
      </div>

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
  </div>
</template>
