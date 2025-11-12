<script lang="ts" setup>
const store = useMapillaryStore()
</script>

<template>
  <div class="d-flex justify-space-between align-center mt-4 mb-4 ga-4">
    <v-alert
      type="info"
      variant="tonal"
      class="flex-shrink-0"
    >
      Click on images to select
    </v-alert>
    <div class="d-flex align-center ga-4">
      <span class="text-body-1">
        <span class="text-success font-weight-medium">{{ store.selectedCount }}</span>
        selected
      </span>
      <v-btn
        color="primary"
        variant="elevated"
        :disabled="store.selectedCount === 0"
        @click="store.stepper = '3'"
      >
        Start editing
      </v-btn>
    </div>
  </div>
</template>
