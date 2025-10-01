<script setup lang="ts">
const store = useMapillaryStore()
</script>

<template>
  <Card class="mb-4">
    <template #content>
      <MapillaryInputs
        :language="store.globalLanguage"
        :description="store.globalDescription"
        :categories="store.globalCategories"
        @update:language="(v) => (store.globalLanguage = v as string)"
        @update:description="(v) => (store.globalDescription = v as string)"
        @update:categories="(v) => (store.globalCategories = v as string)"
      >
        <template #description-help>
          <small class="text-gray-500">Will apply to selected images</small>
        </template>
      </MapillaryInputs>
    </template>
  </Card>
</template>
