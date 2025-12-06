<script setup lang="ts">
const props = defineProps<{
  batch: Batch
}>()

defineEmits<{
  back: []
}>()

const store = useCollectionsStore()
const { loadBatchUploads } = useCollections()

const columns = [
  { field: 'id', header: 'ID' },
  { field: 'key', header: 'Mapillary image ID' },
  { field: 'status', header: 'Status' },
  { field: 'error', header: 'Error' },
  { field: 'success', header: 'Success' },
  { field: 'filename', header: 'File name' },
  { field: 'wikitext', header: 'Wikitext' },
]

const params = ref({
  first: 0,
  rows: 100,
  page: 1,
})

const loadData = (event: { page: number; first: number; rows: number }) => {
  params.value = event
  const columnsStr = columns.map((col) => col.field).join(',')
  loadBatchUploads(props.batch.id, params.value.first, params.value.rows, columnsStr)
}

const statusTagSeverity = (status: UploadStatus) => {
  switch (status) {
    case UPLOAD_STATUS.InProgress:
      return 'info'
    case UPLOAD_STATUS.Queued:
      return 'secondary'
    case UPLOAD_STATUS.Failed:
      return 'danger'
    case UPLOAD_STATUS.Completed:
      return 'success'
    default:
      return 'secondary'
  }
}

onMounted(() => {
  loadData(params.value)
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
        <template #content>
          <div class="text-xl font-medium">Batch: {{ batch.id }}</div>
          <div class="text-sm text-gray-500">
            Uploaded by: {{ batch.username }} | Created at:
            {{ new Date(batch.created_at).toLocaleString() }}
          </div>
        </template>
      </Card>
    </div>

    <DataTable
      :value="store.batchUploads"
      paginator
      :rows="params.rows"
      :totalRecords="store.totalBatchUploads"
      @page="loadData"
      :first="params.first"
      :row-class="() => ({ 'align-top': true })"
    >
      <Column
        v-for="col of columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
      >
        <template #body="slotProps">
          <template v-if="col.field === 'key'">
            <a
              :href="`https://www.mapillary.com/app/?pKey=${slotProps.data.key}&focus=photo`"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:underline"
            >
              {{ slotProps.data.key }}&nbsp;
              <i class="pi pi-external-link text-sm!"></i>
            </a>
          </template>
          <template v-else-if="col.field === 'status'">
            <Tag :severity="statusTagSeverity(slotProps.data.status)">
              {{ slotProps.data.status }}
            </Tag>
          </template>
          <template v-else-if="col.field === 'error'">
            <ErrorDisplay
              v-if="slotProps.data.error"
              :error="slotProps.data.error"
            />
          </template>
          <template v-else-if="col.field === 'success'">
            <span
              v-if="slotProps.data.success"
              class="text-green-500"
            >
              <ExternalLink
                :href="decodeURIComponent(slotProps.data.success)"
                show-icon
              >
                View file on Commons
              </ExternalLink>
            </span>
          </template>
          <!-- <template v-else-if="col.field === 'filename'">
            <a
              v-if="statusTagSeverity(slotProps.data.status) === 'danger'"
              :href="decodeURIComponent(slotProps.data.filename)"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:underline"
            >
              {{ slotProps.data.filename }}&nbsp;<i class="pi pi-external-link text-sm!"></i>
            </a>
            <template v-else>
              {{ slotProps.data[col.field] }}
            </template>
          </template> -->
          <template v-else-if="col.field === 'wikitext'">
            <pre class="text-xs">{{ slotProps.data[col.field] }}</pre>
          </template>
          <template v-else>
            {{ slotProps.data[col.field] }}
          </template>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
