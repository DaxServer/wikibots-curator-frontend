<script setup lang="ts">
const sourceLinks = [
  { text: 'bots', url: 'https://github.com/DaxServer/wikibots' },
  { text: 'app backend', url: 'https://github.com/DaxServer/wikibots-curator-backend' },
  { text: 'app frontend', url: 'https://github.com/DaxServer/wikibots-curator-frontend' },
]
</script>

<template>
  <div class="flex items-center gap-1 max-w-7xl mx-auto">
    <i class="pi pi-github"></i>
    &nbsp;
    <template
      v-for="(link, index) in sourceLinks"
      :key="index"
    >
      <a
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ link.text }}
      </a>
      <template v-if="index < sourceLinks.length - 1">&nbsp;&bull;&nbsp;</template>
    </template>
  </div>
</template>
