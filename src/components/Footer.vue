<script setup lang="ts">
const sourceLinks = [
  { text: 'bots', url: 'https://github.com/DaxServer/wikibots' },
  { text: 'app backend', url: 'https://github.com/DaxServer/wikibots-curator-backend' },
  { text: 'app frontend', url: 'https://github.com/DaxServer/wikibots-curator-frontend' },
]
</script>

<template>
  <div class="flex flex-col gap-4 max-w-7xl mx-auto mt-10">
    <div class="flex items-center gap-1">
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
        MIT licensed
      </a>
    </div>
    <div class="flex items-center gap-1">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Favicon-Phabricator-WM.svg"
        alt="Phabricator logo"
        class="w-4 h-4"
      />
      &nbsp;
      <a
        href="https://phabricator.wikimedia.org/project/profile/8377/"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:underline"
      >
        phabricator
      </a>
    </div>
    <div class="flex items-center gap-1">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/3/3b/Grafana_icon.svg"
        alt="Grafana logo"
        class="w-4 h-4"
      />
      &nbsp;
      <a
        href="https://grafana.wmcloud.org/d/TJuKfnt4z/tool-dashboard?orgId=1&var-namespace=tool-curator&var-cluster=P8433460076D33992&from=now-1h&to=now&timezone=utc"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:underline"
      >
        grafana
      </a>
    </div>
  </div>
</template>
