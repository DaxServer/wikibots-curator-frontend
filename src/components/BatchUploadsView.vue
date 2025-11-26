<script setup lang="ts">
const props = defineProps<{
  batchId: string
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
      `/api/ingest/uploads/${props.batchId}?page=${page}&limit=${event.rows}`,
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

onMounted(() => {
  loadLazyData(lazyParams.value)
})
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center">
        <Button
          icon="pi pi-arrow-left"
          text
          @click="$emit('back')"
          class="mr-2"
        />
        Batch: {{ batchId }}
      </div>
    </template>
    <template #content>
      <DataTable
        :value="items"
        lazy
        paginator
        :rows="lazyParams.rows"
        :totalRecords="totalRecords"
        :loading="loading"
        @page="loadLazyData"
        :first="lazyParams.first"
        tableStyle="min-width: 50rem"
      >
        <Column
          v-for="col of columns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
        >
          <template
            v-if="col.field === 'error'"
            #body="slotProps"
          >
            <span
              v-if="slotProps.data.error"
              class="text-red-500"
            >
              {{ slotProps.data.error }}
            </span>
          </template>
          <template
            v-if="col.field === 'success'"
            #body="slotProps"
          >
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
        </Column>
      </DataTable>
    </template>
  </Card>
</template>
