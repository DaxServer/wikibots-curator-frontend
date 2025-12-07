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
  </DataTable>
</template>
