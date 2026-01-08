<script setup lang="ts">
const store = useCollectionsStore()

const { getEffectiveTitle } = useCommons()
const { isDuplicateStatus, getStatusLabel, getStatusSeverity, getStatusStyle } = useUploadStatus()
const { retryUploads, sendUnsubscribeBatch, startUploadProcess } = useCollections()

type SkeletonRow = {
  id: string
  index: number
}

const showSkeleton = ref(true)
const total = Math.max(1, store.selectedItems.length) // To avoid division by zero

// Creation phase detection
const isCreationPhase = computed(() => store.isCreatingBatch)

// Creation progress calculation
const creationProgress = computed(() => {
  const totalItems = store.selectedItems.length
  const itemsCreated = Math.min(store.uploadSliceIndex * 10, totalItems)
  const percentage = totalItems > 0 ? (itemsCreated / totalItems) * 100 : 0

  return {
    current: itemsCreated,
    total: totalItems,
    percentage,
  }
})

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
  const duplicate = store.selectedItems.filter((item) =>
    isDuplicateStatus(item.meta.status as UploadStatus),
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
  if (isDuplicateStatus(status as UploadStatus)) return 'bg-fuchsia-50'
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
          <span class="text-xl font-bold">
            {{ isCreationPhase ? 'Sending upload request...' : 'Uploading...' }}
          </span>
          <Button
            v-if="canRetry"
            icon="pi pi-refresh"
            severity="danger"
            label="Retry Failed"
            @click="onRetry"
            size="small"
          />
        </div>

        <div
          v-if="isCreationPhase"
          class="flex items-center gap-3"
        >
          <ProgressBar
            :value="creationProgress.percentage"
            class="flex-1"
            :show-value="false"
          />
          <span class="text-sm font-medium text-right">
            {{ creationProgress.current }} / {{ creationProgress.total }}
          </span>
        </div>

        <MeterGroup
          v-else
          :value="meters"
        />
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
        <template v-else>
          <ExternalLink
            v-if="data.meta.status === UPLOAD_STATUS.Completed && data.meta.successUrl"
            :href="data.meta.successUrl"
            class="text-green-600"
          >
            File:{{ getEffectiveTitle(data) }}
          </ExternalLink>
          <ExternalLink
            v-else-if="isDuplicateStatus(data.meta.status) && data.meta.errorInfo?.links?.length"
            :href="data.meta.errorInfo.links[0].url"
            class="text-fuchsia-600 hover:underline"
          >
            File:{{ getEffectiveTitle(data) }}
          </ExternalLink>
          <span v-else>File:{{ getEffectiveTitle(data) }}</span>
        </template>
      </template>
    </Column>

    <Column
      field="status"
      header="Status"
    >
      <template #body="{ data }">
        <Skeleton v-if="showSkeleton" />
        <span v-else-if="!data.meta.status">
          <Tag severity="secondary">Creating</Tag>
        </span>
        <span v-else-if="data.meta.status === UPLOAD_STATUS.Failed">
          <ErrorDisplay
            v-if="data.meta.errorInfo"
            :error="data.meta.errorInfo"
          />
          <Tag
            v-else
            severity="danger"
          >
            {{ getStatusLabel(data.meta.status) }}: {{ data.meta.statusReason }}
          </Tag>
        </span>
        <Tag
          v-else
          :severity="getStatusSeverity(data.meta.status)"
          :style="getStatusStyle(data.meta.status)"
        >
          {{ getStatusLabel(data.meta.status) }}
        </Tag>
      </template>
    </Column>
  </DataTable>
</template>
