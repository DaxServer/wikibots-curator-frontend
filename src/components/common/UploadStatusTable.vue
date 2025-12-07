<script setup lang="ts">
const store = useCollectionsStore()

const total = Math.max(1, store.selectedItems.length) // To avoid division by zero

const meters = computed<MeterItem[]>(() => {
  const successful = store.selectedItems.filter(
    (item) => item.meta.status === UPLOAD_STATUS.Completed,
  ).length
  const inProgress = store.selectedItems.filter(
    (item) => item.meta.status === UPLOAD_STATUS.InProgress,
  ).length
  const failed = store.selectedItems.filter(
    (item) => item.meta.status === UPLOAD_STATUS.Failed,
  ).length
  const queued = store.selectedItems.filter(
    (item) => item.meta.status === UPLOAD_STATUS.Queued,
  ).length

  return [
    { label: 'Successful', value: (successful * 100) / total, color: 'var(--p-green-500)' },
    { label: 'Failed', value: (failed * 100) / total, color: 'var(--p-red-500)' },
    { label: 'Processing', value: (inProgress * 100) / total, color: 'var(--p-blue-500)' },
    { label: 'Queued', value: (queued * 100) / total },
  ]
})

const getRowClass = (data: Item) => {
  const status = data.meta.status
  if (status === UPLOAD_STATUS.Completed) return 'bg-green-100'
  if (status === UPLOAD_STATUS.Failed) return 'bg-red-100'
  if (status === UPLOAD_STATUS.InProgress) return 'bg-blue-100'
  return ''
}

onMounted(() => {
  window.scroll({
    top: 0,
    behavior: 'smooth',
  })
})
</script>

<template>
  <DataTable
    :value="store.selectedItems"
    :row-class="getRowClass"
    class="mt-4 mb-20"
  >
    <template #header>
      <div class="flex flex-col gap-3">
        Uploading
        <MeterGroup :value="meters" />
      </div>
    </template>

    <Column
      field="index"
      header="#"
    />

    <Column
      field="title"
      header="Title"
    >
      <template #body="{ data }">File:{{ data.meta.title }}</template>
    </Column>

    <Column
      field="status"
      header="Status"
    >
      <template #body="{ data }">
        <span v-if="data.meta.status === UPLOAD_STATUS.Failed">
          <ErrorDisplay
            v-if="data.meta.errorInfo"
            :error="data.meta.errorInfo"
          />
          <span v-else>failed: {{ data.meta.statusReason }}</span>
        </span>
        <span v-else-if="data.meta.status === UPLOAD_STATUS.Completed">
          completed
          <span v-if="data.meta.successUrl">
            —
            <a
              :href="data.meta.successUrl"
              class="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open
              <i class="pi pi-external-link text-xs!"></i>
            </a>
          </span>
        </span>
        <span v-else>{{ data.meta.status ?? UPLOAD_STATUS.Queued }}</span>
      </template>
    </Column>
  </DataTable>
</template>
