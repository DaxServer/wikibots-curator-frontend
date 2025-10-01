<script setup lang="ts">
const store = useMapillaryStore()
</script>

<template>
  <div class="card mt-4">
    <MapillarySequenceForm />

    <!-- Error Message -->
    <Message
      v-if="store.error"
      severity="error"
      class="mb-4"
      :closable="true"
    >
      {{ store.error }}
    </Message>

    <MapillarySequenceInfo
      v-model:layout="store.layout"
      :layout-options="store.layoutOptions"
    />

    <!-- Images Grid (PrimeVue DataView) -->
    <div
      v-if="store.hasSequence && !store.isLoading"
      class="mt-4 mb-20"
    >
      <MapillaryBatchPanel />

      <!-- Toggle between showing only selected items vs all items -->
      <div
        v-if="store.layout === 'list'"
        class="flex items-center justify-end mb-3"
      >
        <Button
          :disabled="store.selectedCount === 0"
          :label="
            store.showSelectedOnly && store.selectedCount > 0
              ? 'Show all items'
              : 'Show only selected'
          "
          icon="pi pi-filter"
          class="rounded-md!"
          @click="() => (store.showSelectedOnly = !store.showSelectedOnly)"
        />
      </div>

      <DataView
        :value="store.displayedItems"
        :layout="store.layout"
        paginator
        paginator-position="both"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown CurrentPageReport"
        :rows="store.displayRows"
      >
        <template #list="slotProps">
          <MapillaryListView :items="slotProps.items" />
        </template>

        <template #grid="slotProps">
          <MapillarySelectedMessagePanel />
          <MapillaryGridView :items="slotProps.items" />
          <MapillarySelectedMessagePanel />
        </template>
      </DataView>
    </div>

    <!-- Loading State -->
    <div
      v-if="store.isLoading"
      class="flex justify-center items-center py-8"
    >
      <ProgressSpinner />
    </div>

    <!-- Empty State -->
    <div
      v-if="!store.hasSequence && !store.isLoading"
      class="text-center py-8 text-gray-500"
    >
      <i class="pi pi-images text-4xl mb-2"></i>
      <p>Enter a Mapillary sequence ID to view images</p>
    </div>
  </div>
</template>
