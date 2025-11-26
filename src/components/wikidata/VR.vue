<script lang="ts" setup>
defineProps<{ snak: Snak }>()
</script>

<template>
  <div>
    <template v-if="snak.snaktype === 'value' && snak.datavalue">
      <ValueRenderer :value="snak.datavalue" />
    </template>
    <template v-else-if="snak.snaktype === 'novalue'">
      <Chip
        severity="warn"
        class="text-xs"
      >
        no value
      </Chip>
    </template>
    <template v-else-if="snak.snaktype === 'somevalue'">
      <Chip
        severity="info"
        class="text-xs"
      >
        some value
      </Chip>
    </template>
  </div>
</template>
