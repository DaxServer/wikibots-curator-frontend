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
      :rows="lazyParams.rows"
      :total-records="totalRecords"
      :loading="loading"
      @page="loadLazyData"
      :first="lazyParams.first"
      :row-class="() => ({ 'align-top': true })"
    >
      <Column
        v-for="col of columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
      >
        <template
          v-if="['created_at', 'updated_at'].includes(col.field)"
          #body="slotProps"
        >
          {{ new Date(slotProps.data[col.field]).toLocaleString() }}
        </template>
        <template
          v-else-if="col.field === 'wikitext'"
          #body="slotProps"
        >
          <pre class="text-xs">{{ slotProps.data[col.field] }}</pre>
        </template>
        <template
          v-else-if="col.field === 'error' || col.field === 'labels'"
          #body="slotProps"
        >
          <pre class="text-xs whitespace-pre-wrap">{{
            JSON.stringify(slotProps.data[col.field], null, 2)
          }}</pre>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
