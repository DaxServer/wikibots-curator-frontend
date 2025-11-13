<script lang="ts" setup>
import { CloudUploadOutline, EyeOutline } from '@vicons/ionicons5'
import { onMounted } from 'vue'

const store = useMapillaryStore()
const { submitUpload } = useMapillary()
const { checkFileTitleAvailability } = useCommons()

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

    <!-- Toggle between showing only selected items vs all items -->
    <div class="d-flex justify-space-between align-center mt-4 mb-4 ga-4">
      <!-- <div class="flex-shrink-0"> -->
      <v-alert
        type="info"
        variant="tonal"
      >
        Displaying {{ store.showSelectedOnly ? 'only selected' : 'all' }} items
      </v-alert>
      <!-- </div> -->
      <!-- <div class="flex gap-4"> -->
      <!-- <v-btn
          :disabled="store.selectedCount === 0"
          color="info"
          @click="store.showSelectedOnly = !store.showSelectedOnly"
        >
          <template #prepend>
            <v-icon>
              <FilterCircleOutline />
            </v-icon>
          </template>
{{
store.showSelectedOnly && store.selectedCount > 0
? 'Show all items'
: 'Show only selected'
}}
</v-btn> -->
      <v-btn
        :disabled="store.selectedCount === 0"
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
      <v-btn
        :disabled="store.selectedCount === 0"
        @click="submitUpload"
      >
        <template #prepend>
          <v-icon>
            <CloudUploadOutline />
          </v-icon>
        </template>
        Upload
      </v-btn>
      <!-- </div> -->
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
