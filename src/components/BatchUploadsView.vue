<script setup lang="ts">
const props = defineProps<{
  batch: Batch
}>()

defineEmits<{
  back: []
}>()

const store = useCollectionsStore()

const columns = [
  { field: 'id', header: 'ID' },
  { field: 'image_id', header: 'Image ID' },
  { field: 'status', header: 'Status' },
  { field: 'result', header: 'Result' },
  { field: 'error', header: 'Error' },
  { field: 'success', header: 'Success' },
]

const items = ref<UploadRequest[]>([])
const loading = ref(false)
const totalRecords = ref(0)
const lazyParams = ref({
  first: 0,
  rows: 100,
  page: 1,
})

const loadLazyData = async (event: { page: number; first: number; rows: number }) => {
  loading.value = true
  lazyParams.value = event
  try {
    const page = event.first / event.rows + 1
    const response = await fetch(
      `/api/ingest/uploads/${props.batch.id}?page=${page}&limit=${event.rows}`,
    )
    if (!response.ok) throw new Error('Failed to fetch uploads')
    const data: PaginatedResponse<UploadRequest> = await response.json()
    items.value = data.items
    totalRecords.value = data.total
  } catch (e) {
    console.error(e)
    store.error = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
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
  loadLazyData(lazyParams.value)
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
      :value="items"
      lazy
      paginator
      :rows="lazyParams.rows"
      :totalRecords="totalRecords"
      :loading="loading"
      @page="loadLazyData"
      :first="lazyParams.first"
    >
      <Column
        v-for="col of columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
      >
        <template #body="slotProps">
          <template v-if="col.field === 'status'">
            <Tag :severity="statusTagSeverity(slotProps.data.status)">
              {{ slotProps.data.status }}
            </Tag>
          </template>
          <template v-else-if="col.field === 'error'">
            <span
              v-if="slotProps.data.error"
              class="text-red-500"
            >
              {{ slotProps.data.error }}
            </span>
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
          <template v-else>
            {{ slotProps.data[col.field] }}
          </template>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
