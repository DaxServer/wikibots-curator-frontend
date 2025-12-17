<script setup lang="ts">
import { debounce } from 'ts-debounce'

const authStore = useAuthStore()
const store = useCollectionsStore()

const { loadBatches, subscribeBatchesList, unsubscribeBatchesList } = useCollections()

const selectedBatchId = ref<number | null>(null)

const selectedBatch = computed(() => {
  return store.batches.find((b) => b.id === selectedBatchId.value)
})

const filterOptions = ref([
  { label: 'My uploads', value: 'my' },
  { label: 'All uploads', value: 'all' },
])
const selectedFilter = ref(filterOptions.value[0])
const filterText = ref('')
const isSearching = ref(false)

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
  loadBatches(params.value.first, params.value.rows, userid, filterText.value)

  if (params.value.first === 0) {
    subscribeBatchesList(userid, filterText.value)
  } else {
    unsubscribeBatchesList()
  }
}

const doSearch = async () => {
  params.value.first = 0
  params.value.page = 1
  isSearching.value = true
  await loadData()
  isSearching.value = false
}

const onFilterChange = () => {
  params.value.first = 0
  params.value.page = 1
  unsubscribeBatchesList()
  loadData()
}

const debouncedSearch = debounce(() => {
  doSearch()
}, 500)

watch(filterText, () => {
  if (filterText.value) {
    isSearching.value = true
  }
  debouncedSearch()
})

watch(selectedBatchId, (newId) => {
  if (newId) {
    unsubscribeBatchesList()
  } else if (params.value.first === 0) {
    const userid =
      selectedFilter.value?.value === 'my' && authStore.userid ? authStore.userid : undefined
    subscribeBatchesList(userid, filterText.value)
  }
})

const onEnter = () => {
  // Cancel pending debounce if any
  debouncedSearch.cancel()
  doSearch()
}

const clearSearch = () => {
  filterText.value = ''
  // Clearing should trigger watch -> debouncedSearch.
  // But UX usually expects immediate clear.
  debouncedSearch.cancel()
  doSearch()
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  unsubscribeBatchesList()
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
      @change="onFilterChange"
    />
  </div>
  <SharedDataTable
    v-if="!selectedBatchId"
    class="max-w-7xl mx-auto"
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
    <template #header>
      <FilterHeader
        v-model:filter-text="filterText"
        :filter-info="
          !isSearching
            ? `(${store.batchesTotal} ${store.batchesTotal === 1 ? 'result' : 'results'})`
            : undefined
        "
        search-placeholder="Search ID or User"
        search-id="search-batches"
        :loading="isSearching"
        @clear="clearSearch"
        @search="onEnter"
      />
    </template>
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
