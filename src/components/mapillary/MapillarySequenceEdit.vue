<script lang="ts" setup>
import { CloudUploadOutline, EyeOutline } from '@vicons/ionicons5'

const store = useMapillaryStore()
const { submitUpload } = useMapillary()
</script>

<template>
  <div class="mt-4 mb-20">
    <MapillarySequenceInfo />

    <MapillaryBatchPanel />

    <!-- Toggle between showing only selected items vs all items -->
    <div class="flex justify-between mb-4">
      <n-alert
        type="info"
      >
        Displaying {{ store.showSelectedOnly ? 'only selected' : 'all' }} items
      </n-alert>
      <div class="flex gap-4">
        <!-- <n-button
          :disabled="store.selectedCount === 0"
          type="info"
          @click="store.showSelectedOnly = !store.showSelectedOnly"
        >
          <template #icon>
            <n-icon>
              <FilterCircleOutline />
            </n-icon>
          </template>
          {{
            store.showSelectedOnly && store.selectedCount > 0
              ? 'Show all items'
              : 'Show only selected'
          }}
        </n-button> -->
        <n-button
          :disabled="store.selectedCount === 0"
          type="primary"
          @click="store.stepper = '4'"
        >
          <template #icon>
            <n-icon>
              <EyeOutline />
            </n-icon>
          </template>
          Preview edits
        </n-button>
        <n-button
          :disabled="store.selectedCount === 0"
          @click="submitUpload"
        >
          <template #icon>
            <n-icon>
              <CloudUploadOutline />
            </n-icon>
          </template>
          Upload
        </n-button>
      </div>
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
