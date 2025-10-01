<script setup lang="ts">
const store = useMapillaryStore()
</script>

<template>
  <div
    v-if="store.hasSequence && !store.isLoading"
    class="mb-4"
  >
    <Card>
      <template #content>
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
            <a
              :href="`https://www.mapillary.com/profile/${store.creatorUsername}`"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-blue-500 hover:underline"
            >
              {{ store.creatorUsername }}
            </a>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Sequence ID</label>
            <p class="text-sm">{{ store.sequenceId }}</p>
          </div>
          <div>
            <SelectButton
              :model-value="store.layout"
              :options="store.layoutOptions"
              option-label="name"
              option-value="value"
              @update:model-value="(v) => (store.layout = v as Layout)"
            />
          </div>
        </div>
      </template>
    </Card>
    <Divider />
  </div>
</template>
