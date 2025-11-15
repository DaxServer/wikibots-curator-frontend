<script lang="ts" setup>
withDefaults(
  defineProps<{
    page: number
    itemsPerPage: number
    totalItems: number
    perPageOptions?: number[]
  }>(),
  {
    perPageOptions: () => [10, 25, 50],
  },
)
const emit = defineEmits<{
  'update:page': [number]
  'update:itemsPerPage': [number]
}>()
</script>

<template>
  <div class="d-flex align-center justify-space-between mt-4">
    <v-select
      :model-value="itemsPerPage"
      :items="perPageOptions"
      @update:model-value="$emit('update:itemsPerPage', $event)"
      label="Items per page"
      hide-details="auto"
      variant="outlined"
      density="comfortable"
    />
    <v-pagination
      :model-value="page"
      :length="Math.max(1, Math.ceil(totalItems / itemsPerPage))"
      @update:model-value="$emit('update:page', $event)"
      density="comfortable"
      rounded
      size="small"
    />
  </div>
</template>
