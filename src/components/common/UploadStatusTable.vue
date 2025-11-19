<script setup lang="ts">
type LinkInfo = { title: string; url: string }
type StatusMeta = {
  title: string
  status?: (typeof UPLOAD_STATUS)[keyof typeof UPLOAD_STATUS] | undefined
  statusReason?: string
  successUrl?: string
  errorInfo?: { message: string; links?: LinkInfo[] }
}
type StatusItem = { id: string; index: number; meta: StatusMeta }

defineProps<{ items: Array<StatusItem> }>()
const rowProps = ({ item }: { item: StatusItem }) => {
  const status = item.meta.status
  if (status === UPLOAD_STATUS.Completed) return { class: 'bg-green-lighten-5' }
  if (status === UPLOAD_STATUS.Failed) return { class: 'bg-red-lighten-5' }
  if (status === UPLOAD_STATUS.InProgress) return { class: 'bg-blue-lighten-5' }
  return {}
}
</script>

<template>
  <v-data-table
    :headers="[
      { title: '#', key: 'index' },
      { title: 'Title', key: 'title' },
      { title: 'Status', key: 'status' },
    ]"
    :items="items"
    :row-props="rowProps"
    class="mt-4 mb-20"
  >
    <template #item.title="{ item }">File:{{ item.meta.title }}</template>
    <template #item.status="{ item }">
      <span v-if="item.meta.status === UPLOAD_STATUS.Failed">
        failed: {{ item.meta.errorInfo?.message ?? item.meta.statusReason ?? '' }}
        <span v-if="item.meta.errorInfo?.links?.length">
          —
          <span>duplicates:</span>
          <span>
            <template v-for="(l, idx) in item.meta.errorInfo!.links">
              <ExternalLink :href="decodeURIComponent(l.url)">{{ l.title }}</ExternalLink>
              {{ idx < item.meta.errorInfo!.links!.length - 1 ? ', ' : '' }}
            </template>
          </span>
        </span>
      </span>
      <span v-else-if="item.meta.status === UPLOAD_STATUS.Completed">
        completed
        <span v-if="item.meta.successUrl">
          —
          <ExternalLink :href="item.meta.successUrl">Open</ExternalLink>
        </span>
      </span>
      <span v-else>{{ item.meta.status ?? UPLOAD_STATUS.Queued }}</span>
    </template>
  </v-data-table>
</template>
