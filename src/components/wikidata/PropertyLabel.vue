<script setup lang="ts">
defineProps<{ property: string }>()
const { getPropertyLabel } = useWikidata()
</script>

<template>
  <ExternalLink
    :href="`https://www.wikidata.org/wiki/Property:${property}`"
    class="text-body-2 text-blue hover:underline"
  >
    {{ getPropertyLabel(property) }} ({{ property }})
  </ExternalLink>
</template>
