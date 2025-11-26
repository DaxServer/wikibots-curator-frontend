<script setup lang="ts">
defineProps<{ statements: Statement[] }>()
</script>

<template>
  <DataTable
    :value="statements"
    data-key="id"
    size="small"
    striped-rows
  >
    <Column
      field="property"
      header="Property"
    >
      <template #body="{ data }">
        <div class="items-baseline text-start">
          <PropertyLabel :property="data.mainsnak.property" />
        </div>
      </template>
    </Column>
    <Column
      field="value"
      header="Value"
    >
      <template #body="{ data }">
        <StatementItem
          :snak="data.mainsnak"
          :qualifiers="data.qualifiers || {}"
        />
      </template>
    </Column>
  </DataTable>
</template>
