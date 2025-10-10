<script setup lang="ts">
const store = useMapillaryStore()
</script>

<template>
  <n-card class="mb-4 bg-gray-400">
    <MapillaryInputs
      :language="store.globalLanguage"
      :description="store.globalDescription"
      :categories="store.globalCategories"
      @update:language="(v) => (store.globalLanguage = v)"
      @update:description="(v) => (store.globalDescription = v)"
      @update:categories="(v) => (store.globalCategories = v)"
    >
      <template #description-help>
        <n-alert
          type="info"
          class="w-fit font-normal"
        >
          Will be applied to all selected images
          <span class="underline">only as a fallback</span>
        </n-alert>
      </template>
    </MapillaryInputs>
  </n-card>
</template>
