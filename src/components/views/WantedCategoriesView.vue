<script setup lang="ts">
const { wantedCategories, loading, fetchWantedCategories } = useWantedCategories()

const filters = ref({
  title: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const displayRows = computed(() =>
  loading.value && wantedCategories.value.length === 0
    ? Array(10).fill({})
    : wantedCategories.value,
)

onMounted(() => {
  fetchWantedCategories()
})
</script>

<template>
  <div class="flex justify-between items-center mb-4 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold">Wanted Categories</h1>
    <div class="flex gap-2 items-center">
      <Tag>{{ wantedCategories.length }} results</Tag>
      <Button
        label="Refresh"
        :loading="loading"
        @click="fetchWantedCategories"
      />
    </div>
  </div>

  <DataTable
    :value="displayRows"
    v-model:filters="filters"
    filter-display="row"
    paginator
    always-show-paginator
    paginator-position="both"
    :rows="50"
    :rows-per-page-options="[25, 50, 100]"
    paginator-template="Rows RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
    current-page-report-template="Page {currentPage} of {totalPages}"
  >
    <template #empty>No wanted categories found.</template>

    <Column
      field="title"
      header="Missing Category"
      sortable
      :show-filter-menu="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          placeholder="Filter..."
          class="w-full"
          @input="filterCallback()"
        />
      </template>
      <template #body="{ data }">
        <Skeleton v-if="loading" />
        <ExternalLink
          v-else
          :href="`https://commons.wikimedia.org/wiki/Category:${encodeURIComponent(data.title)}`"
          :show-icon="false"
          class="hover:underline"
        >
          {{ data.title }}
        </ExternalLink>
      </template>
    </Column>

    <Column field="subcats" header="Categories" sortable :show-filter-menu="false">
      <template #body="{ data }">
        <Skeleton v-if="loading" />
        <span v-else>{{ data.subcats }}</span>
      </template>
    </Column>

    <Column field="files" header="Files" sortable :show-filter-menu="false">
      <template #body="{ data }">
        <Skeleton v-if="loading" />
        <span v-else>{{ data.files }}</span>
      </template>
    </Column>

    <Column field="pages" header="Pages" sortable :show-filter-menu="false">
      <template #body="{ data }">
        <Skeleton v-if="loading" />
        <span v-else>{{ data.pages }}</span>
      </template>
    </Column>

    <Column field="total" header="Total" sortable :show-filter-menu="false">
      <template #body="{ data }">
        <Skeleton v-if="loading" />
        <span v-else>{{ data.total }}</span>
      </template>
    </Column>
  </DataTable>
</template>
