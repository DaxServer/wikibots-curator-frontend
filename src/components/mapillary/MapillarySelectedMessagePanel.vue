<script lang="ts" setup>
const store = useMapillaryStore()
</script>

<template>
  <div
    class="flex items-center w-full border-1 border-blue-200 text-blue-600 bg-blue-50 rounded-md gap-2 mt-4"
  >
    <span class="pi pi-info-circle ml-3 text-2xl"></span>
    <span class="text-md font-medium grow">Selected items will be uploaded</span>
    <span class="grow-none">
      <span class="text-green-600">{{ store.selectedCount }}</span>
      selected
    </span>
    <Button
      severity="primary"
      class="grow-none rounded-md!"
      :disabled="store.selectedCount === 0"
      @click="store.layout = 'list'"
    >
      Start editing
    </Button>
  </div>
</template>
