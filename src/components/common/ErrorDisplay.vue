<script setup lang="ts">
defineProps<{ error: StructuredError }>()
</script>

<template>
  <div class="text-sm">
    <template v-if="error.type === 'duplicate'">
      <div v-if="error.links.length > 0">
        <span class="font-semibold text-fuchsia-800">Duplicates:</span>
        <ul class="list-disc list-inside">
          <li
            v-for="(link, idx) in error.links"
            :key="idx"
          >
            <a
              :href="decodeURIComponent(link.url)"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary hover:underline"
            >
              {{ link.title }}
              <i class="pi pi-external-link text-xs!"></i>
            </a>
          </li>
        </ul>
      </div>
    </template>

    <div
      v-else
      class="text-red-500"
    >
      {{ error.message }}
    </div>
  </div>
</template>
