<script setup lang="ts">
defineProps<{ property: string }>()
const { getPropertyLabel } = useWikidata()
</script>

<template>
  <a
    :href="`https://www.wikidata.org/wiki/Property:${property}`"
    target="_blank"
    rel="noopener noreferrer"
    class="text-body-2 text-blue hover:underline"
  >
    {{ getPropertyLabel(property) }} ({{ property }})
  </a>
</template>
