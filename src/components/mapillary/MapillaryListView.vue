<script setup lang="ts">
defineProps<{ items: MapillaryItem[] }>()
</script>

<template>
  <div class="d-flex flex-column">
    <div
      v-for="(item, index) in items"
      :key="item.image.id"
      :class="{ 'border-t border-surface-200 dark:border-surface-700': index !== 0 }"
    >
      <MapillaryImageItem
        :index="item.index"
        :image="item.image"
        :meta="item.meta"
      />
    </div>
  </div>
</template>
