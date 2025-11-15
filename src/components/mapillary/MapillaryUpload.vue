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
  if (status === UPLOAD_STATUS.Completed) return { class: 'bg-green-lighten-5' }
  if (status === UPLOAD_STATUS.Failed) return { class: 'bg-red-lighten-5' }
  if (status === UPLOAD_STATUS.InProgress) return { class: 'bg-blue-lighten-5' }
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
      <span v-if="item.meta.status === UPLOAD_STATUS.Failed">
        failed: {{ item.meta.errorInfo?.message ?? item.meta.statusReason ?? '' }}
        <span v-if="item.meta.errorInfo?.type === MAPILLARY_ERROR_TYPE.Duplicate && item.meta.errorInfo?.links?.length">
          —
          <span>duplicates: </span>
          <span>
            <template v-for="(l, idx) in item.meta.errorInfo!.links">
              <a
                :href="decodeURIComponent(l.url)"
                target="_blank"
                rel="noopener noreferrer"
              >{{ l.title }}</a>{{ idx < item.meta.errorInfo!.links!.length - 1 ? ', ' : '' }}
            </template>
          </span>
        </span>
      </span>
      <span v-else-if="item.meta.status === UPLOAD_STATUS.Completed">
        completed
        <span v-if="item.meta.successUrl">
          — <a :href="item.meta.successUrl" target="_blank" rel="noopener noreferrer">Open</a>
        </span>
      </span>
      <span v-else>{{ item.meta.status ?? UPLOAD_STATUS.Queued }}</span>
    </template>
  </v-data-table>
</template>
