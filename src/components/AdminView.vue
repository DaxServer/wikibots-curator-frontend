<script setup lang="ts">
const selectedTable = ref<'batches' | 'users' | 'upload_requests'>('batches')
const tableOptions = [
  { label: 'Batches', value: 'batches' },
  { label: 'Users', value: 'users' },
  { label: 'Upload Requests', value: 'upload_requests' },
]

const items = ref<(Batch | User | UploadRequest)[]>([])
const loading = ref(false)
const totalRecords = ref(0)
const lazyParams = ref({
  first: 0,
  rows: 100,
  page: 1,
})

const columns = computed(() => {
  if (items.value.length === 0) return []

  const firstItem = items.value[0]
  if (!firstItem) return []

  return Object.keys(firstItem).map((key) => ({
    field: key,
    header: key,
  }))
})

const loadLazyData = async (event?: { page: number; first: number; rows: number }) => {
  loading.value = true
  if (event) {
    lazyParams.value = event
  }

  const params = lazyParams.value
  const page = Math.floor(params.first / params.rows) + 1

  try {
    const url = `/api/admin/${selectedTable.value}?page=${page}&limit=${params.rows}`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch data')
    const data: PaginatedResponse<Batch | User | UploadRequest> = await response.json()
    items.value = data.items
    totalRecords.value = data.total
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const onTableChange = () => {
  lazyParams.value.first = 0
  lazyParams.value.page = 1
  loadLazyData()
}

const onCellEditComplete = async (event: DataTableCellEditCompleteEvent) => {
  if (event.newValue === event.value) return

  try {
    const url = `/api/admin/${selectedTable.value}/${event.data.id}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [event.field]: event.newValue }),
    })
    if (!response.ok) throw new Error('Failed to update data')
  } catch (e) {
    alert('Failed to update data')
  } finally {
    loadLazyData()
  }
}

onMounted(() => {
  loadLazyData()
})
</script>

<template>
  <div>
    <div class="max-w-7xl mx-auto flex items-center mb-4 gap-4">
      <h1 class="text-2xl font-bold">Admin Dashboard</h1>
      <SelectButton
        v-model="selectedTable"
        :options="tableOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        @change="onTableChange"
      />
    </div>

    <DataTable
      :value="items"
      lazy
      paginator
      paginator-position="both"
      paginator-template="Rows RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport JumpToPageDropdown"
      current-page-report-template="Page {currentPage} of {totalPages}"
      :alwaysShowPaginator="false"
      :rows-per-page-options="[10, 25, 50, 100, 200]"
      :edit-mode="selectedTable === 'upload_requests' ? 'cell' : undefined"
      :first="lazyParams.first"
      :rows="lazyParams.rows"
      :total-records="totalRecords"
      @page="loadLazyData"
      @cell-edit-complete="onCellEditComplete"
      :row-class="() => ({ 'align-top': true })"
    >
      <Column
        v-for="col of columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
      >
        <template #editor="{ data, field }">
          <Textarea
            v-model="data[field]"
            autofocus
            fluid
            auto-resize
          />
        </template>
        <template #body="{ data, field }">
          <Skeleton v-if="loading" />
          <template v-else-if="['created_at', 'updated_at'].includes(col.field)">
            {{ new Date(data[field as string]).toLocaleString() }}
          </template>
          <template v-else-if="col.field === 'wikitext'">
            <pre class="text-xs">{{ data[field as string] }}</pre>
          </template>
          <template v-else-if="col.field === 'error' || col.field === 'labels'">
            <pre class="text-xs whitespace-pre-wrap">{{
              JSON.stringify(data[field as string], null, 2)
            }}</pre>
          </template>
          <template v-else>
            {{ data[field as string] }}
          </template>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
