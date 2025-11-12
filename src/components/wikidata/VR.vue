<script lang="ts" setup>
defineProps<{ snak: Snak }>()
</script>

<template>
  <div>
    <template v-if="snak.snaktype === 'value' && snak.datavalue">
      <ValueRenderer :value="snak.datavalue" />
    </template>
    <template v-else-if="snak.snaktype === 'novalue'">
      <v-chip
        color="warning"
        size="small"
        class="text-xs"
      >
        no value
      </v-chip>
    </template>
    <template v-else-if="snak.snaktype === 'somevalue'">
      <v-chip
        color="info"
        size="small"
        class="text-xs"
      >
        some value
      </v-chip>
    </template>
  </div>
</template>
