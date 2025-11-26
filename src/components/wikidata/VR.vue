<script lang="ts" setup>
defineProps<{ snak: Snak }>()
</script>

<template>
  <div>
    <template v-if="snak.snaktype === 'value' && snak.datavalue">
      <ValueRenderer :value="snak.datavalue" />
    </template>
    <template v-else-if="snak.snaktype === 'novalue'">
      <Tag
        severity="warn"
        class="text-xs"
      >
        no value
      </Tag>
    </template>
    <template v-else-if="snak.snaktype === 'somevalue'">
      <Tag
        severity="info"
        class="text-xs"
      >
        some value
      </Tag>
    </template>
  </div>
</template>
