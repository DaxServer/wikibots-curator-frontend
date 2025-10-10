<script setup lang="ts">
const store = useMapillaryStore()

const columns = [
  { title: '#', key: 'index' },
  { 
    title: 'Title', 
    key: 'title',
    render: (row: any) => `File:${row.meta.title}`,
  },
]
</script>

<template>
  <n-data-table
    :columns="columns"
    :data="store.displayedItems"
    class="mt-4 mb-20"
  />
</template>
