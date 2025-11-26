<script setup lang="ts">
defineProps<{
  input: string
  selectedCount: number
  totalImages: number
  idLabel: string
}>()

const store = useCollectionsStore()
</script>

<template>
  <Card class="">
    <template #content>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <span class="text-sm text-gray-500">Total Images</span>
          <div class="text-xl font-medium">
            <span class="text-blue-600">{{ selectedCount }}</span>
            / {{ totalImages }}
          </div>
        </div>
        <div>
          <span class="text-sm text-gray-500">Creator</span>
          <div>
            <a
              :href="store.creator.profile_url"
              class="hover:underline"
            >
              {{ store.creator.username }}
              <i class="pi pi-external-link" />
            </a>
          </div>
        </div>
        <div>
          <span class="text-sm text-gray-500">{{ idLabel }}</span>
          <div>{{ input }}</div>
        </div>
      </div>
    </template>
  </Card>
</template>
