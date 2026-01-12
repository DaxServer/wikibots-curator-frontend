<script setup lang="ts">
const batchId = useRouteParams<number>('id')

const authStore = useAuthStore()
const store = useCollectionsStore()

const {
  loadBatchUploads,
  retryUploads,
  cancelBatch,
  adminRetrySelectedUploads,
  sendSubscribeBatch,
  sendUnsubscribeBatch,
} = useCollections()
const { isDuplicateStatus, getStatusLabel, getStatusColor, getStatusSeverity, getStatusStyle } =
  useUploadStatus()

const columns = [
  { field: 'id', header: 'ID' },
  { field: 'key', header: 'Mapillary Image ID' },
  { field: 'status', header: 'Status' },
  { field: 'error', header: 'Error' },
  { field: 'filename', header: 'Filename' },
  { field: 'wikitext', header: 'Wikitext' },
]

const selectionColumns = computed(() => {
  if (isBatchUploadSelectionMode.value) {
    return [{ field: '_selected', header: 'Select' }, ...columns]
  }
  return columns
})

const computedStats = computed((): BatchStats => {
  const uploads = store.batchUploads

  return {
    cancelled: uploads.filter((u) => u.status === UPLOAD_STATUS.Cancelled).length,
    total: uploads.length,
    completed: uploads.filter((u) => u.status === UPLOAD_STATUS.Completed).length,
    failed: uploads.filter((u) => u.status === UPLOAD_STATUS.Failed).length,
    duplicate: uploads.filter((u) => isDuplicateStatus(u.status as UploadStatus)).length,
    in_progress: uploads.filter((u) => u.status === UPLOAD_STATUS.InProgress).length,
    queued: uploads.filter((u) => u.status === UPLOAD_STATUS.Queued).length,
  }
})

const statCards = computed((): BatchStatsCard[] => [
  {
    label: 'Total',
    count: computedStats.value.total,
    color: getStatusColor('all'),
    value: 'all',
    alwaysActive: store.batch !== undefined,
  },
  {
    label: 'Uploaded',
    count: computedStats.value.completed,
    color: getStatusColor(UPLOAD_STATUS.Completed),
    value: UPLOAD_STATUS.Completed,
  },
  {
    label: 'Failed',
    count: computedStats.value.failed,
    color: getStatusColor(UPLOAD_STATUS.Failed),
    value: UPLOAD_STATUS.Failed,
  },
  {
    label: 'Duplicates',
    count: computedStats.value.duplicate,
    color: getStatusColor(UPLOAD_STATUS.Duplicate),
    value: UPLOAD_STATUS.Duplicate,
  },
  {
    label: 'Processing',
    count: computedStats.value.in_progress,
    color: getStatusColor(UPLOAD_STATUS.InProgress),
    value: UPLOAD_STATUS.InProgress,
  },
  {
    label: 'Queued',
    count: computedStats.value.queued,
    color: getStatusColor(UPLOAD_STATUS.Queued),
    value: UPLOAD_STATUS.Queued,
  },
  {
    label: 'Cancelled',
    count: computedStats.value.cancelled,
    color: getStatusColor(UPLOAD_STATUS.Cancelled),
    value: UPLOAD_STATUS.Cancelled,
  },
])

const searchText = ref('')
const selectValues = ref<'all' | UploadStatus>('all')

const filteredUploads = computed((): BatchUploadItem[] => {
  let uploads = [...store.batchUploads]

  if (selectValues.value !== 'all') {
    uploads = uploads.filter((upload) => {
      if (selectValues.value === UPLOAD_STATUS.Duplicate) {
        return isDuplicateStatus(upload.status as UploadStatus)
      }
      return upload.status === selectValues.value
    })
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

const hasPendingJobs = computed(() => {
  return computedStats.value.queued > 0 || computedStats.value.in_progress > 0
})

const lastEditedBy = computed(() => {
  const users = new Set(
    store.batchUploads.map((u) => u.last_edited_by).filter((u): u is string => !!u),
  )
  if (users.size === 0) return null
  return Array.from(users).join(', ')
})

// Selection mode state (local to this component)
const isBatchUploadSelectionMode = ref(false)
const batchUploadSelection = ref<Set<number>>(new Set())
const selectedBatchUploadsCount = computed(() => batchUploadSelection.value.size)

const startBatchUploadSelectionMode = () => {
  isBatchUploadSelectionMode.value = true
  batchUploadSelection.value.clear()
}

const exitBatchUploadSelectionMode = () => {
  isBatchUploadSelectionMode.value = false
  batchUploadSelection.value.clear()
}

const toggleBatchUploadSelection = (uploadId: number) => {
  if (batchUploadSelection.value.has(uploadId)) {
    batchUploadSelection.value.delete(uploadId)
  } else {
    batchUploadSelection.value.add(uploadId)
  }
}

const selectAllBatchUploads = (uploads: BatchUploadItem[] = filteredUploads.value) => {
  for (const upload of uploads) {
    batchUploadSelection.value.add(upload.id)
  }
}

const deselectAllBatchUploads = () => {
  batchUploadSelection.value.clear()
}

const handleAdminRetrySelectedUploads = async () => {
  await adminRetrySelectedUploads(Array.from(batchUploadSelection.value), batchId.value)
  exitBatchUploadSelectionMode()
}

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
    sendUnsubscribeBatch()
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
    sendUnsubscribeBatch()
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
          <div class="flex items-center gap-3 justify-between">
            <div class="flex items-end gap-3">
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
                v-if="computedStats.failed > 0 && authStore.userid === store.batch.userid"
                icon="pi pi-refresh"
                severity="danger"
                label="Retry Failed"
                size="small"
                @click="retryUploads(Number(batchId))"
              />
              <Button
                v-if="computedStats.queued > 0 && (authStore.userid === store.batch.userid || authStore.isAdmin)"
                icon="pi pi-times"
                severity="danger"
                label="Cancel Queued"
                size="small"
                @click="cancelBatch(Number(batchId))"
              />
              <template v-if="isBatchUploadSelectionMode">
                <Button
                  icon="pi pi-check"
                  severity="success"
                  :label="`Retry (${selectedBatchUploadsCount})`"
                  :disabled="selectedBatchUploadsCount === 0"
                  size="small"
                  class="ml-2"
                  @click="handleAdminRetrySelectedUploads()"
                />
                <Button
                  icon="pi pi-times"
                  severity="secondary"
                  label="Cancel"
                  size="small"
                  @click="exitBatchUploadSelectionMode()"
                />
              </template>
              <Button
                v-else-if="authStore.isAdmin"
                icon="pi pi-refresh"
                severity="warning"
                label="Retry Selected"
                size="small"
                class="ml-2"
                @click="startBatchUploadSelectionMode()"
              />
            </template>
          </div>
        </template>
        <template #subtitle>
          <div class="flex items-center gap-2 mt-1">
            <i class="pi pi-user text-sm"></i>
            <span v-if="store.batch">{{ store.batch.username }}</span>
            <Skeleton v-else />
            <SimpleMessage
              v-if="lastEditedBy"
              icon="pi pi-user-edit"
              severity="warn"
              v-tooltip.top="
                'The edits will be made from this user account. See history of files on Commons.'
              "
            >
              Retry triggered by: {{ lastEditedBy }}
            </SimpleMessage>
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-7 gap-4 mt-2">
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

    <!-- Selection mode toolbar -->
    <div v-if="isBatchUploadSelectionMode" class="flex gap-2">
      <Button
        label="Select All (Current Page)"
        size="small"
        severity="secondary"
        @click="selectAllBatchUploads(filteredUploads)"
      />
      <Button
        label="Deselect All"
        size="small"
        severity="secondary"
        @click="deselectAllBatchUploads()"
      />
    </div>

    <SharedDataTable
      :loading="store.batchUploadsLoading"
      :value="filteredUploads"
      :columns="selectionColumns"
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
        <template v-if="col.field === '_selected'">
          <Checkbox
            :model-value="batchUploadSelection.has(data.id)"
            binary
            @update:model-value="() => toggleBatchUploadSelection(data.id)"
          />
        </template>
        <template v-else-if="col.field === 'key'">
          <ExternalLink :href="`https://www.mapillary.com/app/?pKey=${data.key}&focus=photo`">
            {{ data.key }}&nbsp;
          </ExternalLink>
        </template>
        <template v-else-if="col.field === 'status'">
          <Tag
            :severity="getStatusSeverity(data.status)"
            :style="getStatusStyle(data.status)"
          >
            {{ getStatusLabel(data.status) }}
          </Tag>
        </template>
        <template v-else-if="col.field === 'error'">
          <ErrorDisplay
            v-if="data.error"
            :error="data.error"
          />
        </template>
        <template v-else-if="col.field === 'filename' && data.status === UPLOAD_STATUS.Completed">
          <ExternalLink
            :href="decodeURIComponent(data.success)"
            class="text-green-600"
          >
            {{ data.filename }}
          </ExternalLink>
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
