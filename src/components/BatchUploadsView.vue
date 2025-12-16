<script setup lang="ts">
const props = defineProps<{
  batch: Batch
}>()

defineEmits<{
  back: []
}>()

const store = useCollectionsStore()
const { loadBatchUploads, retryUploads } = useCollections()
const authStore = useAuthStore()

const columns = [
  { field: 'id', header: 'ID' },
  { field: 'key', header: 'Mapillary Image ID' },
  { field: 'status', header: 'Status' },
  { field: 'error', header: 'Error' },
  { field: 'filename', header: 'Filename' },
  { field: 'wikitext', header: 'Wikitext' },
]

const selectValues = ref('all')
const selectOptions = ref([
  { label: 'All', value: 'all' },
  { label: 'Uploaded', value: UPLOAD_STATUS.Completed },
  { label: 'Duplicates', value: UPLOAD_STATUS.Duplicate },
  { label: 'Failed', value: UPLOAD_STATUS.Failed },
  { label: 'In progress', value: UPLOAD_STATUS.InProgress },
  { label: 'Queued', value: UPLOAD_STATUS.Queued },
])

const filteredUploads = computed(() => {
  if (selectValues.value === 'all') {
    return store.batchUploads
  }
  return store.batchUploads.filter((upload) => upload.status === selectValues.value)
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

const statCards = computed(() => [
  {
    label: 'Total',
    count: props.batch.stats.total,
    color: 'gray' as const,
    value: 'all',
    alwaysActive: true,
  },
  {
    label: 'Uploaded',
    count: props.batch.stats.completed,
    color: 'green' as const,
    value: UPLOAD_STATUS.Completed,
  },
  {
    label: 'Failed',
    count: props.batch.stats.failed,
    color: 'red' as const,
    value: UPLOAD_STATUS.Failed,
  },
  {
    label: 'Duplicates',
    count: props.batch.stats.duplicate,
    color: 'fuchsia' as const,
    value: UPLOAD_STATUS.Duplicate,
  },
  {
    label: 'Processing',
    count: props.batch.stats.in_progress,
    color: 'blue' as const,
    value: UPLOAD_STATUS.InProgress,
  },
  {
    label: 'Queued',
    count: props.batch.stats.queued,
    color: 'gray' as const,
    value: UPLOAD_STATUS.Queued,
  },
])

onMounted(() => {
  loadBatchUploads(props.batch.id)
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col items-start gap-4">
      <Button
        icon="pi pi-arrow-left"
        text
        @click="$emit('back')"
        class="mr-2"
        label="Back to batches"
      />
      <Card>
        <template #title>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span>Batch #{{ batch.id }}</span>
              <span class="text-sm font-normal text-gray-500">
                {{ new Date(batch.created_at).toLocaleString() }}
              </span>
            </div>
            <Button
              v-if="batch.stats.failed > 0 && authStore.userid === batch.userid"
              icon="pi pi-refresh"
              severity="danger"
              label="Retry Failed"
              size="small"
              @click="retryUploads(batch.id)"
            />
          </div>
        </template>
        <template #subtitle>
          <div class="flex items-center gap-2 mt-1">
            <i class="pi pi-user text-sm"></i>
            <span>{{ batch.username }}</span>
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-2">
            <BatchStatCard
              v-for="stat in statCards"
              :key="stat.label"
              :label="stat.label"
              :count="stat.count"
              :color="stat.color"
              :always-active="stat.alwaysActive"
              :selected="selectValues === stat.value"
              @click="selectValues = stat.value"
            />
          </div>
        </template>
      </Card>

      <div class="flex items-center gap-2">
        <span class="font-bold">Showing</span>
        <SelectButton
          v-model="selectValues"
          :options="selectOptions"
          option-value="value"
          option-label="label"
        />
      </div>
    </div>

    <SharedDataTable
      :value="filteredUploads"
      :columns="columns"
      :row-class="() => ({ 'align-top': true })"
      :rows-per-page-options="[10, 20, 50, 100]"
    >
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
