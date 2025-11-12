<script setup lang="ts">
import { mdiGithub } from '@mdi/js'

const sourceLinks = [
  { text: 'bots', url: 'https://github.com/DaxServer/wikibots' },
  { text: 'app backend', url: 'https://github.com/DaxServer/wikibots-curator-backend' },
  { text: 'app frontend', url: 'https://github.com/DaxServer/wikibots-curator-frontend' },
]
</script>

<template>
  <v-footer class="align-end">
    <v-icon :icon="mdiGithub"></v-icon>
    &nbsp;
    <template
      v-for="(link, index) in sourceLinks"
      :key="index"
    >
      <v-btn
        :href="link.url"
        rel="noopener noreferrer"
        min-width="0"
        variant="text"
        density="compact"
        target="_blank"
        class="text-decoration-none text-lowercase text-grey pa-0"
      >
        {{ link.text }}
      </v-btn>
      <template v-if="index < sourceLinks.length - 1">&nbsp;&bull;&nbsp;</template>
    </template>
  </v-footer>
</template>
