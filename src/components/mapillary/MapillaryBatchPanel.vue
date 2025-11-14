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
        <div class="d-inline-flex w-auto flex-grow-0 flex-shrink-0 mb-4">
          <v-alert
            type="info"
            variant="tonal"
            density="comfortable"
          >
            Will be applied to all selected images
            <span class="text-decoration-underline">only as a fallback</span>
          </v-alert>
        </div>
      </template>
    </MapillaryInputs>
  </v-card>
</template>
