<script setup lang="ts">
const store = useMapillaryStore()
</script>

<template>
  <n-card class="mt-4 mb-4">
    <div class="flex justify-between gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-600">Total Images</label>
        <p class="text-lg font-semibold">
          <span class="text-blue-600">{{ store.selectedCount }}</span>
          / {{ store.totalImages }}
        </p>
      </div>
      <div v-if="store.creatorUsername">
        <label class="block text-sm font-medium text-gray-600">Creator</label>
        <n-button
          text
          tag="a"
          :href="`https://www.mapillary.com/profile/${store.creatorUsername}`"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ store.creatorUsername }}
        </n-button>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600">Sequence ID</label>
        <p class="text-sm">{{ store.sequenceId }}</p>
      </div>
    </div>
  </n-card>
</template>
