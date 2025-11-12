<script setup lang="ts">
const store = useMapillaryStore()
</script>

<template>
  <v-card class="mb-4 bg-grey-lighten-5 pa-4">
    <MapillaryInputs
      :language="store.globalLanguage"
      :description="store.globalDescription"
      :categories="store.globalCategories"
      @update:language="(v) => (store.globalLanguage = v)"
      @update:description="(v) => (store.globalDescription = v)"
      @update:categories="(v) => (store.globalCategories = v)"
    >
      <template #description-help>
        <v-alert
          type="info"
          variant="tonal"
          class="w-fit font-normal"
        >
          Will be applied to all selected images
          <span class="underline">only as a fallback</span>
        </v-alert>
      </template>
    </MapillaryInputs>
  </v-card>
</template>
