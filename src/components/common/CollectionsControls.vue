<script setup lang="ts">
import { mdiViewGrid, mdiViewList } from '@mdi/js'

defineProps<{
  viewMode: Layout
  selectedCount: number
}>()

const emit = defineEmits<{
  'update:viewMode': [Layout]
  editSelected: []
}>()
</script>

<template>
  <div class="d-flex justify-space-between align-center mt-4 mb-4 ga-4">
    <div class="d-flex align-center ga-4 w-auto flex-grow-0 flex-shrink-0">
      <v-alert type="info" variant="tonal" density="comfortable">Click on images to select</v-alert>
      <v-btn-toggle :model-value="viewMode" mandatory @update:model-value="(v) => emit('update:viewMode', v as Layout)">
        <v-btn value="list" variant="outlined" density="comfortable">
          <v-icon :icon="mdiViewList" class="mr-2" />
          List
        </v-btn>
        <v-btn value="grid" variant="outlined" density="comfortable">
          <v-icon :icon="mdiViewGrid" class="mr-2" />
          Grid
        </v-btn>
      </v-btn-toggle>
    </div>
    <div class="d-flex align-center ga-4">
      <span class="text-body-1"><span class="text-success font-weight-medium">{{ selectedCount }}</span> selected</span>
      <v-btn color="primary" variant="elevated" :disabled="selectedCount === 0" @click="emit('editSelected')">Start editing</v-btn>
    </div>
  </div>
</template>
