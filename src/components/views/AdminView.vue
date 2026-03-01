<script setup lang="ts">
const store = useAdminStore()
const { refreshAdminData, updateAdminUploadRequest } = useAdmin()
const { getStatusSeverity, getStatusStyle, getStatusLabel } = useUploadStatus()

const tableOptions = [
  { label: 'Batches', value: 'batches' },
  { label: 'Users', value: 'users' },
  { label: 'Upload Requests', value: 'upload_requests' },
  { label: 'Presets', value: 'presets' },
]

const isSearching = ref(false)

const onPage = (event: DataTablePageEvent) => {
  store.adminParams = {
    first: event.first,
    rows: event.rows,
    page: event.page + 1,
  }
  refreshAdminData()
}

const doSearch = () => {
  store.adminParams.first = 0
  store.adminParams.page = 1
  refreshAdminData()
}

const debouncedSearch = debounce(doSearch, 500)

const clearSearch = () => {
  store.adminFilterText = ''
  debouncedSearch.cancel()
}

const onTableChange = () => {
  store.adminFilterText = ''
  debouncedSearch.cancel()
  store.adminParams.first = 0
  store.adminParams.page = 1
  refreshAdminData()
}

const onCellEditComplete = async (event: DataTableCellEditCompleteEvent) => {
  if (event.newValue === event.value) return

  try {
    await updateAdminUploadRequest(event.data.id, event.field, event.newValue)
  } finally {
    refreshAdminData()
  }
}

watch(
  () => store.adminFilterText,
  (text) => {
    isSearching.value = text !== ''
    if (text === '') {
      doSearch()
    } else {
      debouncedSearch()
    }
  },
)

watch(
  () => store.adminLoading,
  (loading) => {
    if (!loading) {
      isSearching.value = false
    }
  },
)

onMounted(() => {
  refreshAdminData()
})
</script>

<template>
  <div>
    <div class="max-w-7xl mx-auto flex items-center mb-4 gap-4">
      <h1 class="text-2xl font-bold">Admin Dashboard</h1>
      <SelectButton
        v-model="store.adminTable"
        :options="tableOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        @change="onTableChange"
      />
    </div>

    <!-- Upload requests table with cell editing -->
    <DataTable
      v-if="store.data.table === 'upload_requests'"
      :value="store.data.data"
      lazy
      paginator
      paginator-position="both"
      paginator-template="Rows RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport JumpToPageDropdown"
      current-page-report-template="Page {currentPage} of {totalPages}"
      :always-show-paginator="false"
      :rows-per-page-options="[10, 25, 50, 100, 200]"
      edit-mode="cell"
      :first="store.adminParams.first"
      :rows="store.adminParams.rows"
      :total-records="store.adminTotal"
      :loading="store.adminLoading"
      @page="onPage"
      @cell-edit-complete="onCellEditComplete"
      :row-class="() => ({ 'align-top': true })"
    >
      <template #header>
        <FilterHeader
          v-model:filter-text="store.adminFilterText"
          :filter-info="
            !isSearching
              ? `(${store.adminTotal} ${store.adminTotal === 1 ? 'result' : 'results'})`
              : undefined
          "
          search-placeholder="Search ID, Batch, User, File or Status"
          search-id="search-admin-upload-requests"
          :loading="isSearching"
          @clear="clearSearch"
          @search="doSearch"
        />
      </template>
      <Column
        v-for="col of store.data.columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
      >
        <template #editor="{ data, field }">
          <Textarea
            v-model="data[field as keyof typeof data]"
            autofocus
            fluid
            auto-resize
          />
        </template>
        <template #body="{ data, field }">
          <template v-if="field === 'created_at' || field === 'updated_at'">
            {{ new Date(data[field as keyof typeof data]).toLocaleString() }}
          </template>
          <template v-else-if="field === 'status'">
            <Tag
              :severity="getStatusSeverity(data.status as UploadStatus)"
              :style="getStatusStyle(data.status as UploadStatus)"
              :value="getStatusLabel(data.status as UploadStatus)"
            />
          </template>
          <template v-else-if="field === 'wikitext'">
            <pre class="text-xs">{{ data[field as keyof typeof data] }}</pre>
          </template>
          <template v-else-if="field === 'error' || field === 'labels'">
            <pre class="text-xs whitespace-pre-wrap">{{
              JSON.stringify(data[field as keyof typeof data], null, 2)
            }}</pre>
          </template>
          <template v-else>
            {{ data[field as keyof typeof data] }}
          </template>
        </template>
      </Column>
    </DataTable>

    <!-- Read-only tables for the rest -->
    <SharedDataTable
      v-else
      :value="store.data.data as (AdminBatch | AdminUser | AdminPreset)[]"
      :columns="store.data.columns"
      :rows="store.adminParams.rows"
      :total-records="store.adminTotal"
      :first="store.adminParams.first"
      :loading="store.adminLoading"
      lazy
      :always-show-paginator="false"
      :row-class="() => ({ 'align-top': true })"
      @page="onPage"
    >
      <template #header>
        <FilterHeader
          v-model:filter-text="store.adminFilterText"
          :filter-info="
            !isSearching
              ? `(${store.adminTotal} ${store.adminTotal === 1 ? 'result' : 'results'})`
              : undefined
          "
          :search-placeholder="
            store.adminTable === 'batches'
              ? 'Search ID or User'
              : store.adminTable === 'users'
                ? 'Search ID or Username'
                : 'Search ID, User or Title'
          "
          search-id="search-admin-table"
          :loading="isSearching"
          @clear="clearSearch"
          @search="doSearch"
        />
      </template>
      <template #body-cell="{ col, data }">
        <template v-if="col.field === 'created_at' || col.field === 'updated_at'">
          {{ new Date(data[col.field as keyof typeof data]).toLocaleString() }}
        </template>
        <template v-else-if="col.field === 'labels'">
          <pre class="text-xs whitespace-pre-wrap">{{
            JSON.stringify(data[col.field as keyof typeof data], null, 2)
          }}</pre>
        </template>
        <template v-else>
          {{ data[col.field as keyof typeof data] }}
        </template>
      </template>
    </SharedDataTable>
  </div>
</template>
