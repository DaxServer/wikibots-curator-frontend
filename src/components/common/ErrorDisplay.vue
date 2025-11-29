<script setup lang="ts">
defineProps<{ error: StructuredError }>()
</script>

<template>
  <div class="text-sm">
    <div class="text-red-500">{{ error.message }}</div>

    <template v-if="error.type === 'duplicate'">
      <div
        v-if="error.links.length > 0"
        class="mt-1"
      >
        <span class="font-semibold">Duplicates:</span>
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
  </div>
</template>
