<script setup lang="ts">
const store = useCollectionsStore()
const router = useRouter()

const { refreshBatches, unsubscribeBatchesList } = useCollections()

const isSearching = ref(false)

const columns = computed(() => {
  const cols = [
    { field: 'id', header: 'Batch ID' },
    { field: 'uploads', header: 'Uploads' },
    { field: 'created_at', header: 'Created At' },
  ]
  if (store.batchesSelectedFilter?.value === 'all') {
    cols.splice(1, 0, { field: 'username', header: 'Username' })
  }
  return cols
})

const onPage = (event: DataTablePageEvent) => {
  store.batchesParams = {
    first: event.first,
    rows: event.rows,
    page: event.page + 1,
  }
  refreshBatches()
}

const onSearch = () => {
  store.batchesParams.first = 0
  store.batchesParams.page = 1
  refreshBatches()
}

const onFilterChange = () => {
  onSearch()
}

const debouncedSearch = debounce(onSearch, 500)

watch(
  () => store.batchesFilterText,
  (text) => {
    isSearching.value = !!text
    debouncedSearch()
  },
)

const clearSearch = () => {
  store.batchesFilterText = ''
  debouncedSearch.cancel()
  onSearch()
}

onBeforeMount(() => {
  refreshBatches()
})

onUnmounted(() => {
  store.resetBatches()
  unsubscribeBatchesList()
})
</script>

<template>
  <div class="flex justify-between items-center mb-4 max-w-7xl mx-auto">
    <div class="text-2xl font-bold">Past uploads</div>
    <SelectButton
      v-model="store.batchesSelectedFilter"
      :options="store.batchesFilter"
      optionLabel="label"
      :allowEmpty="false"
      @change="onFilterChange"
    />
  </div>
  <SharedDataTable
    class="max-w-7xl mx-auto"
    :value="store.batches"
    :rows="store.batchesParams.rows"
    :totalRecords="store.batchesTotal"
    :first="store.batchesParams.first"
    :columns="columns"
    :loading="store.batchesLoading"
    lazy
    @page="onPage"
    @row-click="$event.data.id && router.push(`/batches/${$event.data.id}`)"
    :pt="{
      bodyRow: () => ({
        class: 'cursor-pointer',
      }),
    }"
  >
    <template #header>
      <FilterHeader
        v-model:filter-text="store.batchesFilterText"
        :filter-info="
          !isSearching
            ? `(${store.batchesTotal} ${store.batchesTotal === 1 ? 'result' : 'results'})`
            : undefined
        "
        search-placeholder="Search ID or User"
        search-id="search-batches"
        :loading="isSearching"
        @clear="clearSearch"
        @search="onSearch"
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
</template>
