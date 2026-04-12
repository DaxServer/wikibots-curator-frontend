<script setup lang="ts">
const { redlinks, loading, fetchRedlinks } = useRedlinks()

const filters = ref({
  title: { value: null, matchMode: FilterMatchMode.CONTAINS },
  linked_from: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const displayRows = computed(() => (loading.value ? Array(10).fill({}) : redlinks.value))

onMounted(() => {
  fetchRedlinks()
})
</script>

<template>
  <div class="flex justify-between items-center mb-4 max-w-7xl mx-auto">
    <h1 class="text-2xl font-bold">Category Redlinks</h1>
    <div class="flex gap-2 items-center">
      <Tag>{{ redlinks.length }} results</Tag>
      <Button
        label="Refresh"
        :loading="loading"
        @click="fetchRedlinks"
      />
    </div>
  </div>

  <DataTable
    :value="displayRows"
    v-model:filters="filters"
    filter-display="row"
    paginator
    :rows="50"
    :rows-per-page-options="[25, 50, 100]"
    paginator-template="Rows RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
    current-page-report-template="Page {currentPage} of {totalPages}"
  >
    <template #empty>No redlinks found.</template>

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

    <Column
      field="linked_from"
      header="Linked From"
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
          :href="`https://commons.wikimedia.org/wiki/${encodeURIComponent(data.linked_from)}`"
          :show-icon="false"
          class="hover:underline"
        >
          {{ data.linked_from }}
        </ExternalLink>
      </template>
    </Column>
  </DataTable>
</template>
