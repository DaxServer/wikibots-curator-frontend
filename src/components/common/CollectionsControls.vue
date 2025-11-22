<script setup lang="ts">
import { mdiChevronDown, mdiViewGrid, mdiViewList } from '@mdi/js'

const store = useCollectionsStore()
</script>

<template>
  <div class="d-flex justify-space-between align-center mt-4 mb-4 ga-4">
    <div class="d-flex align-center ga-4 w-auto flex-grow-0 flex-shrink-0">
      <v-alert
        type="info"
        variant="tonal"
        density="comfortable"
      >
        Click on images to select
      </v-alert>
      <v-btn-toggle
        :model-value="store.viewMode"
        mandatory
        @update:model-value="store.viewMode = $event"
      >
        <v-btn
          value="list"
          variant="outlined"
          density="comfortable"
        >
          <v-icon
            :icon="mdiViewList"
            class="mr-2"
          />
          List
        </v-btn>
        <v-btn
          value="grid"
          variant="outlined"
          density="comfortable"
        >
          <v-icon
            :icon="mdiViewGrid"
            class="mr-2"
          />
          Grid
        </v-btn>
      </v-btn-toggle>
    </div>
    <div class="d-flex align-center ga-4">
      <v-menu>
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="outlined"
          >
            Select
            <v-icon
              :icon="mdiChevronDown"
              end
            />
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="store.selectAll">
            <v-list-item-title>All images</v-list-item-title>
          </v-list-item>
          <v-list-item @click="store.selectPage">
            <v-list-item-title>Current page</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item
            @click="store.deselectAll"
            :disabled="store.selectedCount === 0"
          >
            <v-list-item-title class="text-error">Deselect all</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <span class="text-body-1">
        <span class="text-success font-weight-medium">{{ store.selectedCount }}</span>
        selected
      </span>
      <v-btn
        color="primary"
        variant="elevated"
        :disabled="store.selectedCount === 0"
        @click="store.stepper = 3"
      >
        Start editing
      </v-btn>
    </div>
  </div>
</template>
