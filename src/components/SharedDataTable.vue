<script setup lang="ts" generic="T">
withDefaults(
  defineProps<{
    value: T[]
    columns: { field: string; header: string }[]
    totalRecords?: number
    rows?: number
    first?: number
    lazy?: boolean
  }>(),
  {
    rows: 100,
    lazy: false,
  },
)

defineEmits<{
  page: [DataTablePageEvent]
}>()
</script>

<template>
  <DataTable
    v-bind="$attrs"
    :value="value"
    paginator
    paginatorPosition="both"
    paginator-template="Rows RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport JumpToPageDropdown"
    current-page-report-template="Page {currentPage} of {totalPages}"
    :alwaysShowPaginator="false"
    :rows="rows"
    :totalRecords="totalRecords"
    :first="first"
    :lazy="lazy"
    @page="$emit('page', $event)"
  >
    <Column
      v-for="col of columns"
      :key="col.field"
      :field="col.field"
      :header="col.header"
    >
      <template #body="slotProps">
        <slot
          name="body-cell"
          :col="col"
          :data="slotProps.data"
        >
          {{ slotProps.data[col.field] }}
        </slot>
      </template>
    </Column>
    <template #header>
      <slot name="header"></slot>
    </template>
    <template #empty>
      <div class="text-center py-4">No data available</div>
    </template>
  </DataTable>
</template>
