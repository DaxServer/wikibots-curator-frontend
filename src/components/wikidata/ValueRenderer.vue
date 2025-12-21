<script setup lang="ts">
defineProps<{ value: DataValue }>()

const { getEntityLabel } = useWikidata()
</script>

<template>
  <template v-if="value.type === DataValueType.WikibaseEntityId">
    <a
      :href="`https://www.wikidata.org/wiki/Q${value.value['numeric-id']}`"
      class="hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ getEntityLabel(`Q${value.value['numeric-id']}`) }} (Q{{ value.value['numeric-id'] }})
    </a>
  </template>
  <!-- <template v-else-if="value.type === 'monolingualtext'">
    <span>{{ value.value.language }}: {{ value.value.text }}</span>
  </template> -->
  <template v-else-if="value.type === DataValueType.Quantity">
    <span>{{ value.value.amount }} {{ getEntityLabel(value.value.unit.split('/').at(-1)!) }}</span>
  </template>
  <template v-else-if="value.type === DataValueType.Time">
    <span>{{ value.value.time.replace(/^\+0+/, '').split('T')[0] }}</span>
  </template>
  <template v-else-if="value.type === DataValueType.GlobeCoordinate">
    <span>
      {{ decimalToDMS(value.value.latitude, 'lat') }},
      {{ decimalToDMS(value.value.longitude, 'lon') }}
    </span>
  </template>
  <!-- <template v-else-if="value.type === 'url'">
    <ExternalLink
      :href="value.value"
      class="text-blue text-decoration-none"
    >
      {{ value.value }}
    </ExternalLink>
  </template> -->
  <template v-else-if="value.type === DataValueType.String">
    <span>{{ value.value }}</span>
  </template>
  <template v-else>
    <Chip class="text-xs">Unsupported value</Chip>
  </template>
</template>
