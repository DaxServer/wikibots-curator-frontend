<script lang="ts" setup>
import { EyeOutline } from '@vicons/ionicons5'

const store = useMapillaryStore()
const { checkFileTitleAvailability } = useCommons()

const disablePreview = computed(() => {
  if (store.selectedCount === 0) return true
  for (const item of store.displayedItems) {
    if (item.meta.selected && item.meta.titleAvailable === false) return true
  }
  return false
})

onMounted(async () => {
  for (const item of store.displayedItems) {
    const available = await checkFileTitleAvailability(item.meta.title)
    store.updateItem(item.id, 'titleAvailable', available)
  }
})
</script>

<template>
  <div class="mt-4 mb-20">
    <MapillarySequenceInfo />

    <MapillaryBatchPanel />

    <div class="d-flex justify-space-between align-center mt-4 mb-4 ga-4">
      <div class="d-inline-flex w-auto flex-grow-0 flex-shrink-0">
        <v-alert
          type="info"
          variant="tonal"
          density="comfortable"
        >
          Displaying {{ store.showSelectedOnly ? 'only selected' : 'all' }} items
        </v-alert>
      </div>
      <v-btn
        :disabled="disablePreview"
        color="primary"
        @click="store.stepper = '4'"
      >
        <template #prepend>
          <v-icon>
            <EyeOutline />
          </v-icon>
        </template>
        Preview edits
      </v-btn>
    </div>

    <div
      v-for="item in store.displayedItems"
      :key="item.image.id"
      class="mb-4"
    >
      <MapillaryListView :items="[item]" />
    </div>
  </div>
</template>
