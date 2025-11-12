<script setup lang="ts">
defineProps<{ value: DataValue }>()
const { getEntityLabel } = useWikidata()
</script>

<template>
  <template v-if="value.type === 'wikibase-entityid'">
    <a
      :href="`https://www.wikidata.org/wiki/Q${value.value['numeric-id']}`"
      class="text-blue hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ getEntityLabel(`Q${value.value['numeric-id']}`) }} (Q{{ value.value['numeric-id'] }})
    </a>
  </template>
  <template v-else-if="value.type === 'monolingualtext'">
    <span>{{ value.value.language }}: {{ value.value.text }}</span>
  </template>
  <template v-else-if="value.type === 'quantity'">
    <span>{{ value.value.amount }} {{ value.value.unit }}</span>
  </template>
  <template v-else-if="value.type === 'time'">
    <span>{{ new Date(value.value.time.replace(/^\+0+/, '')).toISOString().split('T')[0] }}</span>
  </template>
  <template v-else-if="value.type === 'globecoordinate'">
    <span>{{ value.value.latitude }}, {{ value.value.longitude }}</span>
  </template>
  <template v-else-if="value.type === 'url'">
    <a
      :href="value.value"
      class="text-blue hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ value.value }}
    </a>
  </template>
  <template v-else-if="value.type === 'string'">
    <span>{{ value.value }}</span>
  </template>
  <template v-else>
    <v-chip
      size="small"
      class="text-xs"
    >
      Unsupported value
    </v-chip>
  </template>
</template>
