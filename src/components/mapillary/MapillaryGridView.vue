<script setup lang="ts">
defineProps<{ items: MapillaryItem[] }>()

const store = useMapillaryStore()
</script>

<template>
  <div class="grid grid-cols-3 lg:grid-cols-4 gap-4 my-5">
    <div
      v-for="item in items"
      :key="item.image.id"
      class="relative border-2 border-transparent"
      :class="{ 'border-green-500!': item.meta.selected }"
    >
      <div
        class="cursor-pointer"
        @click="store.updateItem(item.image.id, 'selected', !item.meta.selected)"
      >
        <!-- Corner check overlay when selected for upload -->
        <div
          v-if="item.meta.selected"
          class="pointer-events-none absolute top-0 left-0 z-10"
        >
          <div
            class="w-0 h-0 border-t-[66px] border-r-[66px] border-t-green-500 border-r-transparent opacity-80"
          ></div>
          <i class="pi pi-check text-white absolute top-2 left-2 text-xl!"></i>
        </div>
        <n-image
          :src="item.image.thumb_256_url"
          :alt="`Mapillary image ${item.image.id}`"
        />
      </div>
      <div
        class="flex flex-row justify-between items-center"
        :class="{ 'bg-green-100': item.meta.selected }"
      >
        <div class="grow-none mx-3">
          <span class="text-lg">{{ item.index }}</span>
        </div>
        <div class="flex flex-col grow">
          <span class="text-sm">Time: {{ new Date(item.image.captured_at).toLocaleString() }}</span>
          <span class="text-xs">Image ID: {{ item.image.id }}</span>
        </div>
        <div class="grow-none">
          <a
            :href="`https://www.mapillary.com/app/?pKey=${item.image.id}&focus=photo`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-md text-blue-500 hover:underline"
          >
            Open
            <i class="pi pi-external-link ml-1"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
