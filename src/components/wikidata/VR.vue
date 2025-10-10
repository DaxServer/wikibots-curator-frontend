<script lang="ts" setup>
defineProps<{ snak: Snak }>()
</script>

<template>
  <div>
    <template v-if="snak.snaktype === 'value' && snak.datavalue">
      <ValueRenderer :value="snak.datavalue" />
    </template>
    <template v-else-if="snak.snaktype === 'novalue'">
      <n-tag
        type="warning"
        class="text-xs"
      >
        no value
      </n-tag>
    </template>
    <template v-else-if="snak.snaktype === 'somevalue'">
      <n-tag
        type="info"
        class="text-xs"
      >
        some value
      </n-tag>
    </template>
  </div>
</template>
