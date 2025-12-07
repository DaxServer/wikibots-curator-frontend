<script setup lang="ts" generic="T">
defineProps<{
  value: T[]
  totalRecords: number
  columns: { field: string; header: string }[]
  rows: number
  first: number
}>()

defineEmits<{
  page: [DataTablePageEvent]
}>()
</script>

<template>
  <DataTable
    v-bind="$attrs"
    :value="value"
    paginator
    :rows="rows"
    :totalRecords="totalRecords"
    :first="first"
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
  </DataTable>
</template>
