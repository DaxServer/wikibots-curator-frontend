<script setup lang="ts">
import { debounce } from 'ts-debounce'

const authStore = useAuthStore()
const store = useCollectionsStore()

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
}

const doSearch = async () => {
  params.value.first = 0
  params.value.page = 1
  isSearching.value = true
  await loadData()
  isSearching.value = false
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
</script>

<template>
  <div
    v-if="!selectedBatchId"
    class="flex justify-between items-center mb-4 max-w-7xl mx-auto"
  >
    <div class="text-2xl font-bold">Past uploads</div>
    <div class="flex items-center gap-4">
      <FloatLabel variant="on">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            id="search-batches"
            v-model="filterText"
            class="min-w-2xs"
            @keydown.enter="onEnter"
          />
          <InputIcon
            v-if="isSearching"
            class="pi pi-spinner pi-spin"
          />
          <InputIcon
            v-else-if="filterText"
            class="pi pi-times cursor-pointer"
            @click="clearSearch"
          />
        </IconField>
        <label for="search-batches">Search ID or User</label>
      </FloatLabel>
      <SelectButton
        v-model="selectedFilter"
        :options="filterOptions"
        optionLabel="label"
        :allowEmpty="false"
        @change="loadData()"
      />
    </div>
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
      <div
        v-if="filterText"
        class="text-sm text-gray-600"
      >
        Filtering by:
        <span class="font-semibold">"{{ filterText }}"</span>
        <span class="ml-2">
          ({{ store.batchesTotal }} {{ store.batchesTotal === 1 ? 'result' : 'results' }})
        </span>
      </div>
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
