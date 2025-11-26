<script setup lang="ts">
defineProps<{ property: string }>()

const { getPropertyLabel } = useWikidata()
</script>

<template>
  <a
    :href="`https://www.wikidata.org/wiki/Property:${property}`"
    class="hover:underline"
    target="_blank"
    rel="noopener noreferrer"
  >
    {{ getPropertyLabel(property) }} ({{ property }})
  </a>
</template>
