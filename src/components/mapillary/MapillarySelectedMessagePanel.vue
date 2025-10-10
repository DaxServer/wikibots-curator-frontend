<script lang="ts" setup>
const store = useMapillaryStore()
</script>

<template>
  <div class="flex justify-between mt-4 mb-4">
    <n-alert
      type="info"
    >
      Click on images to select
    </n-alert>
    <div class="flex items-center gap-4">
      <span>
        <span class="text-green-600 font-medium">{{ store.selectedCount }}</span>
        selected
      </span>
      <n-button
        type="primary"
        class="rounded-md"
        :disabled="store.selectedCount === 0"
        @click="store.stepper = '3'"
      >
        Start editing
      </n-button>
    </div>
  </div>
</template>
