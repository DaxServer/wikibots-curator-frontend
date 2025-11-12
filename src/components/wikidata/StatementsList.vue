<script setup lang="ts">
defineProps<{ statements: Statement[] }>()
</script>

<template>
  <VDataTable
    :items="statements"
    :headers="[
      { title: 'Property', key: 'property', align: 'start' },
      { title: 'Value', key: 'value' },
    ]"
    :item-key="'id'"
    :items-per-page="0"
    density="compact"
    class="elevation-1"
  >
    <template #[`item.property`]="{ item }">
      <div class="align-baseline text-start">
        <PropertyLabel :property="item.mainsnak.property" />
      </div>
    </template>
    <template #[`item.value`]="{ item }">
      <div class="align-top">
        <StatementItem
          :snak="item.mainsnak"
          :qualifiers="item.qualifiers || {}"
        />
      </div>
    </template>
    <template #bottom></template>
  </VDataTable>
</template>
