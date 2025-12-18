<script setup lang="ts">
const batchId = useRouteParams<number>('id')

const authStore = useAuthStore()
const store = useCollectionsStore()

const { loadBatchUploads, retryUploads, sendSubscribeBatch, sendUnsubscribeBatch } =
  useCollections()

const columns = [
  { field: 'id', header: 'ID' },
  { field: 'key', header: 'Mapillary Image ID' },
  { field: 'status', header: 'Status' },
  { field: 'error', header: 'Error' },
  { field: 'filename', header: 'Filename' },
  { field: 'wikitext', header: 'Wikitext' },
]

const computedStats = computed((): BatchStats => {
  const uploads = store.batchUploads

  return {
    total: uploads.length,
    completed: uploads.filter((u) => u.status === UPLOAD_STATUS.Completed).length,
    failed: uploads.filter((u) => u.status === UPLOAD_STATUS.Failed).length,
    duplicate: uploads.filter((u) => u.status === UPLOAD_STATUS.Duplicate).length,
    in_progress: uploads.filter((u) => u.status === UPLOAD_STATUS.InProgress).length,
    queued: uploads.filter((u) => u.status === UPLOAD_STATUS.Queued).length,
  }
})

const statCards = computed((): BatchStatsCard[] => [
  {
    label: 'Total',
    count: computedStats.value.total,
    color: 'gray' as const,
    value: 'all',
    alwaysActive: store.batch !== undefined,
  },
  {
    label: 'Uploaded',
    count: computedStats.value.completed,
    color: 'green' as const,
    value: UPLOAD_STATUS.Completed,
  },
  {
    label: 'Failed',
    count: computedStats.value.failed,
    color: 'red' as const,
    value: UPLOAD_STATUS.Failed,
  },
  {
    label: 'Duplicates',
    count: computedStats.value.duplicate,
    color: 'fuchsia' as const,
    value: UPLOAD_STATUS.Duplicate,
  },
  {
    label: 'Processing',
    count: computedStats.value.in_progress,
    color: 'blue' as const,
    value: UPLOAD_STATUS.InProgress,
  },
  {
    label: 'Queued',
    count: computedStats.value.queued,
    color: 'gray' as const,
    value: UPLOAD_STATUS.Queued,
  },
])

const searchText = ref('')
const selectValues = ref<'all' | UploadStatus>('all')

const filteredUploads = computed((): BatchUploadItem[] => {
  let uploads = [...store.batchUploads]

  if (selectValues.value !== 'all') {
    uploads = uploads.filter((upload) => upload.status === selectValues.value)
  }

  if (searchText.value) {
    const lower = searchText.value.toLowerCase()
    uploads = uploads.filter(
      (u) =>
        u.filename?.toLowerCase().includes(lower) ||
        u.key?.toLowerCase().includes(lower) ||
        String(u.id).includes(lower) ||
        u.wikitext?.toLowerCase().includes(lower) ||
        u.status.toLowerCase().includes(lower) ||
        u.error?.message.toLowerCase().includes(lower),
    )
  }

  return uploads
})

const statusTagSeverity = (status: UploadStatus) => {
  switch (status) {
    case UPLOAD_STATUS.InProgress:
      return 'info'
    case UPLOAD_STATUS.Queued:
      return 'secondary'
    case UPLOAD_STATUS.Failed:
      return 'danger'
    case UPLOAD_STATUS.Duplicate:
      return 'contrast'
    case UPLOAD_STATUS.Completed:
      return 'success'
    default:
      return 'secondary'
  }
}

const hasPendingJobs = computed(() => {
  return computedStats.value.queued > 0 || computedStats.value.in_progress > 0
})

const isSubscribed = ref(false)

const load = (id: number) => {
  store.batch = undefined
  store.batchUploads = []
  loadBatchUploads(id)
}

onBeforeMount(() => {
  load(batchId.value)
})

watch(batchId, (newId) => {
  if (isSubscribed.value) {
    sendUnsubscribeBatch(batchId.value)
    isSubscribed.value = false
  }
  load(newId)
})

watch(hasPendingJobs, (isActive) => {
  if (isActive && !isSubscribed.value) {
    sendSubscribeBatch(batchId.value)
    isSubscribed.value = true
  }
})

onUnmounted(() => {
  store.batch = undefined
  store.batchUploads = []
  store.currentBatchId = null
  if (isSubscribed.value) {
    sendUnsubscribeBatch(batchId.value)
  }
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col items-start gap-4">
      <Button
        as="router-link"
        to="/batches"
        icon="pi pi-arrow-left"
        text
        class="mr-2"
        label="Back to batches"
      />
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span>Batch #{{ batchId }}</span>
              <span class="text-sm font-normal text-gray-500">
                <template v-if="store.batch">
                  {{ new Date(store.batch.created_at).toLocaleString() }}
                </template>
                <Skeleton v-else />
              </span>
            </div>
            <template v-if="store.batch">
              <Tag
                v-if="hasPendingJobs"
                severity="info"
                value="Processing Updates..."
                icon="pi pi-spin pi-spinner"
              />
              <Button
                v-else-if="computedStats.failed > 0 && authStore.userid === store.batch.userid"
                icon="pi pi-refresh"
                severity="danger"
                label="Retry Failed"
                size="small"
                @click="retryUploads(Number(batchId))"
              />
            </template>
          </div>
        </template>
        <template #subtitle>
          <div class="flex items-center gap-2 mt-1">
            <i class="pi pi-user text-sm"></i>
            <span v-if="store.batch">{{ store.batch.username }}</span>
            <Skeleton v-else />
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-2">
            <BatchStatsCard
              v-for="stat in statCards"
              :key="stat.label"
              :label="stat.label"
              :count="stat.count"
              :color="stat.color"
              :skeleton="store.batch === undefined"
              :always-active="stat.alwaysActive"
              :selected="selectValues === stat.value"
              @click="selectValues = stat.value"
            />
          </div>
        </template>
      </Card>
    </div>

    <SharedDataTable
      :loading="store.batchUploadsLoading"
      :value="filteredUploads"
      :columns="columns"
      :row-class="() => ({ 'align-top': true })"
      :rows-per-page-options="[10, 20, 50, 100]"
    >
      <template #header>
        <FilterHeader
          v-model:filter-text="searchText"
          :filter-info="`(${filteredUploads.length} of ${store.batchUploads.length} uploads)`"
          search-placeholder="Search uploads..."
          search-id="search-uploads"
          @clear="searchText = ''"
        />
      </template>
      <template #body-cell="{ col, data }">
        <template v-if="col.field === 'key'">
          <a
            :href="`https://www.mapillary.com/app/?pKey=${data.key}&focus=photo`"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:underline"
          >
            {{ data.key }}&nbsp;
            <i class="pi pi-external-link text-sm!"></i>
          </a>
        </template>
        <template v-else-if="col.field === 'status'">
          <Tag
            :severity="statusTagSeverity(data.status)"
            :style="
              data.status === UPLOAD_STATUS.Duplicate
                ? { backgroundColor: 'var(--p-fuchsia-50)', color: 'var(--p-fuchsia-800)' }
                : {}
            "
          >
            {{ data.status }}
          </Tag>
        </template>
        <template v-else-if="col.field === 'error'">
          <ErrorDisplay
            v-if="data.error"
            :error="data.error"
          />
        </template>
        <template v-else-if="col.field === 'filename' && data.status === UPLOAD_STATUS.Completed">
          <a
            :href="decodeURIComponent(data.success)"
            target="_blank"
            rel="noopener noreferrer"
            class="text-green-600 hover:underline"
          >
            {{ data.filename }}
          </a>
        </template>
        <template v-else-if="col.field === 'wikitext'">
          <pre class="text-xs">{{ data[col.field] }}</pre>
        </template>
        <template v-else>
          {{ data[col.field] }}
        </template>
      </template>
    </SharedDataTable>
  </div>
</template>
