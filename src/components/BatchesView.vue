<script setup lang="ts">
const store = useCollectionsStore()
const authStore = useAuthStore()
const { loadBatches } = useCollections()

const selectedBatchId = ref<number | null>(null)

const selectedBatch = computed(() => {
  return store.batches.find((b) => b.id === selectedBatchId.value)
})

const filterOptions = ref([
  { label: 'My uploads', value: 'my' },
  { label: 'All uploads', value: 'all' },
])
const selectedFilter = ref(filterOptions.value[0])

const columns = computed(() => {
  const cols = [
    { field: 'id', header: 'Batch ID' },
    { field: 'uploads', header: 'Uploads' },
    { field: 'created_at', header: 'Created At' },
  ]
  if (selectedFilter.value?.value === 'all') {
    cols.splice(1, 0, { field: 'username', header: 'Username' })
  }
  return cols
})

const params = ref({
  first: 0,
  rows: 100,
  page: 1,
})

const loadData = async (event?: DataTablePageEvent) => {
  params.value = event || params.value
  const userid =
    selectedFilter.value?.value === 'my' && authStore.userid ? authStore.userid : undefined
  loadBatches(params.value.first, params.value.rows, userid)
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div
    v-if="!selectedBatchId"
    class="flex justify-between items-center mb-4 max-w-7xl mx-auto"
  >
    <div class="text-2xl font-bold">Past uploads</div>
    <SelectButton
      v-model="selectedFilter"
      :options="filterOptions"
      optionLabel="label"
      :allowEmpty="false"
      @change="loadData()"
    />
  </div>
  <SharedDataTable
    v-if="!selectedBatchId"
    :value="store.batches"
    :rows="params.rows"
    :totalRecords="store.batchesTotal"
    :first="params.first"
    :columns="columns"
    lazy
    @page="loadData"
    @row-click="selectedBatchId = $event.data.id"
    :pt="{
      bodyRow: () => ({
        class: 'cursor-pointer',
      }),
    }"
  >
    <template #body-cell="{ col, data }">
      <template v-if="col.field === 'created_at'">
        {{ new Date(data.created_at).toLocaleString() }}
      </template>
      <template v-else-if="col.field === 'uploads'">
        <BatchStats
          v-if="data.stats"
          :stats="data.stats"
        />
        <div v-else>No uploads</div>
      </template>
      <template v-else>
        {{ data[col.field] }}
      </template>
    </template>
  </SharedDataTable>
  <BatchUploadsView
    v-else-if="selectedBatch"
    :batch="selectedBatch"
    @back="selectedBatchId = null"
  />
</template>
