<script setup lang="ts">
import PropertyLabel from '@/components/wikidata/PropertyLabel.vue'
import StatementItem from '@/components/wikidata/StatementItem.vue'

defineProps<{ statements: Statement[] }>()

const columns: DataTableColumns<Statement> = [
  {
    key: 'property',
    render: (row: Statement) => h(PropertyLabel, {
      property: row.mainsnak.property,
    }),
    className: 'align-baseline text-right!',
  },
  {
    key: 'value',
    render: (row: Statement) => h(StatementItem, {
      snak: row.mainsnak,
      qualifiers: row.qualifiers || {},
    }),
    className: 'align-top',
  },
]
</script>

<template>
  <n-data-table
    :columns="columns"
    :data="statements"
    :row-key="(item) => item.id"
    :striped="false"
  />
</template>
