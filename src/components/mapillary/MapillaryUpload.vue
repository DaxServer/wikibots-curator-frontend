<script setup lang="ts">
const store = useMapillaryStore()

const headers = [
  { title: '#', key: 'index' },
  { title: 'Title', key: 'title' },
]
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="store.displayedItems"
    class="mt-4 mb-20"
  >
    <template #item.title="{ item }">File:{{ item.meta.title }}</template>
  </v-data-table>
</template>
