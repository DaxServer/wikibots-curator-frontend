<script setup lang="ts">
defineProps<{ property: string }>()
const { getPropertyLabel } = useWikidata()
</script>

<template>
  <a
    :href="`https://www.wikidata.org/wiki/Property:${property}`"
    target="_blank"
    rel="noopener noreferrer"
    class="text-sm text-blue-500 hover:underline"
  >
    {{ getPropertyLabel(property) }} ({{ property }})
  </a>
</template>
