<script setup lang="ts">
const sourceLinks = [
  { text: 'bots', url: 'https://github.com/DaxServer/wikibots' },
  { text: 'app backend', url: 'https://github.com/DaxServer/wikibots-curator-backend' },
  { text: 'app frontend', url: 'https://github.com/DaxServer/wikibots-curator-frontend' },
]
</script>

<template>
  <Toolbar
    class="fixed bottom-0 flex justify-between items-center border-l-0! border-r-0! border-b-0! md:px-52! w-full"
  >
    <template #start>
      <p class="text-gray-700">
        <span class="pi pi-github"></span>&nbsp;
        <template v-for="(link, index) in sourceLinks" :key="index">
          <a :href="link.url" target="_blank">{{ link.text }}</a>
          <template v-if="index < sourceLinks.length - 1">&nbsp;&bull;&nbsp;</template>
        </template>
      </p>
    </template>
  </Toolbar>
</template>
