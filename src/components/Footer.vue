<script setup lang="ts">
const sourceLinks = [
  { text: 'bots', url: 'https://github.com/DaxServer/wikibots' },
  { text: 'app backend', url: 'https://github.com/DaxServer/wikibots-curator-backend' },
  { text: 'app frontend', url: 'https://github.com/DaxServer/wikibots-curator-frontend' },
]
</script>

<template>
  <div class="flex items-center gap-1 max-w-7xl mx-auto mt-10">
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
        class="hover:underline"
      >
        {{ link.text }}
      </a>
      &nbsp;&bull;&nbsp;
    </template>
    <i class="pi pi-share-alt text-sm!"></i>
    &nbsp;
    <a
      href="https://opensource.org/license/mit"
      target="_blank"
      rel="noopener noreferrer"
      class="hover:underline"
    >
      MIT license
    </a>
  </div>
</template>
