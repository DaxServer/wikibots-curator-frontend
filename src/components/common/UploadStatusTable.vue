<script setup lang="ts">
const store = useCollectionsStore()

const { getEffectiveTitle } = useCommons()
const { retryUploads, sendUnsubscribeBatch, startUploadProcess } = useCollections()

type SkeletonRow = {
  id: string
  index: number
}

const showSkeleton = ref(true)
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
  const duplicate = store.selectedItems.filter(
    (item) => item.meta.status === UPLOAD_STATUS.Duplicate,
  ).length
  const queued = store.selectedItems.filter(
    (item) => item.meta.status === UPLOAD_STATUS.Queued,
  ).length

  return [
    { label: 'Successful', value: (successful * 100) / total, color: 'var(--p-green-500)' },
    { label: 'Duplicate', value: (duplicate * 100) / total, color: 'var(--p-fuchsia-800)' },
    { label: 'Failed', value: (failed * 100) / total, color: 'var(--p-red-500)' },
    { label: 'Processing', value: (inProgress * 100) / total, color: 'var(--p-blue-500)' },
    { label: 'Queued', value: (queued * 100) / total, color: 'var(--p-gray-300)' },
  ]
})

const getRowClass = (data: SkeletonRow | Item) => {
  if (showSkeleton.value) return ''
  const status = (data as Item)?.meta?.status
  if (status === UPLOAD_STATUS.Completed) return 'bg-green-100'
  if (status === UPLOAD_STATUS.Failed) return 'bg-red-100'
  if (status === UPLOAD_STATUS.Duplicate) return 'bg-fuchsia-50'
  if (status === UPLOAD_STATUS.InProgress) return 'bg-blue-100'
  return ''
}

const skeletonRows = computed<SkeletonRow[]>(() =>
  Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1), index: i + 1 })),
)

const tableRows = computed<(SkeletonRow | Item)[]>(() =>
  showSkeleton.value ? skeletonRows.value : store.selectedItems,
)

const canRetry = computed(() => {
  const hasFailed = store.selectedItems.some((item) => item.meta.status === UPLOAD_STATUS.Failed)
  const isCompleted = !store.selectedItems.some(
    (item) =>
      item.meta.status === UPLOAD_STATUS.InProgress || item.meta.status === UPLOAD_STATUS.Queued,
  )
  return hasFailed && !!store.batchId && isCompleted
})

const onRetry = () => {
  if (store.batchId) {
    retryUploads(store.batchId)
  }
}

onMounted(() => {
  window.scroll({
    top: 0,
    behavior: 'smooth',
  })

  setTimeout(() => {
    showSkeleton.value = false
    startUploadProcess()
  }, 100)
})

onUnmounted(() => {
  if (store.batchId) {
    sendUnsubscribeBatch()
  }
})
</script>

<template>
  <DataTable
    :value="tableRows"
    :row-class="getRowClass"
    class="mt-4 mb-20"
    data-key="id"
  >
    <template #header>
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-xl font-bold">Uploading...</span>
          <Button
            v-if="canRetry"
            icon="pi pi-refresh"
            severity="danger"
            label="Retry Failed"
            @click="onRetry"
            size="small"
          />
        </div>
        <MeterGroup :value="meters" />
      </div>
    </template>

    <Column
      field="index"
      header="#"
    >
      <template #body="{ data }">
        <Skeleton v-if="showSkeleton" />
        <template v-else>{{ data.index }}</template>
      </template>
    </Column>

    <Column
      field="title"
      header="Title"
    >
      <template #body="{ data }">
        <Skeleton v-if="showSkeleton" />
        <template v-else>File:{{ getEffectiveTitle(data) }}</template>
      </template>
    </Column>

    <Column
      field="status"
      header="Status"
    >
      <template #body="{ data }">
        <Skeleton v-if="showSkeleton" />
        <span v-else-if="data.meta.status === UPLOAD_STATUS.Failed">
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
            <ExternalLink
              :href="data.meta.successUrl"
              class="text-primary"
            >
              Open
            </ExternalLink>
          </span>
        </span>
        <span v-else>{{ data.meta.status ?? UPLOAD_STATUS.Creating }}</span>
      </template>
    </Column>
  </DataTable>
</template>
