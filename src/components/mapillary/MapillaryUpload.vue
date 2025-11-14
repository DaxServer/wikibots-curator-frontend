<script setup lang="ts">
const store = useMapillaryStore()
const { stopPolling } = useMapillary()

const headers = [
  { title: '#', key: 'index' },
  { title: 'Title', key: 'title' },
  { title: 'Status', key: 'status' },
]
const rowProps = ({ item }: { item: MapillaryItem }) => {
  const status = item.meta.status
  if (status === 'completed') return { class: 'bg-green-lighten-5' }
  if (status === 'failed') return { class: 'bg-red-lighten-5' }
  if (status === 'in_progress') return { class: 'bg-blue-lighten-5' }
  return {}
}

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="store.displayedItems"
    :loading="store.isStatusChecking"
    :row-props="rowProps"
    class="mt-4 mb-20"
  >
    <template #item.title="{ item }">File:{{ item.meta.title }}</template>
    <template #item.status="{ item }">
      {{
        item.meta.status === 'failed'
          ? `${item.meta.status}: ${item.meta.statusReason ?? ''}`
          : (item.meta.status ?? 'queued')
      }}
    </template>
  </v-data-table>
</template>
