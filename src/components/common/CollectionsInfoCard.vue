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
      <div class="flex flex-col gap-4">
        <div
          v-if="store.isBatchLoading"
          class="flex flex-col gap-1"
        >
          <div class="flex justify-between items-center text-gray-500 mb-1">
            <span>Retrieving collection data...</span>
            <span class="font-medium">
              {{ store.loadedCount }} / {{ store.totalImageIds.length }} images
            </span>
          </div>
          <ProgressBar :value="store.batchProgress">
            {{ store.loadedCount }} / {{ store.totalImageIds.length }}
          </ProgressBar>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
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
              <template v-if="store.creator.id">
                <a
                  :href="store.creator.profile_url"
                  class="hover:underline"
                >
                  {{ store.creator.username }}
                  <i class="pi pi-external-link text-xs" />
                </a>
              </template>
              <template v-else>
                <Skeleton
                  width="100px"
                  height="1.5rem"
                />
              </template>
            </div>
          </div>
          <div>
            <span class="text-sm text-gray-500">{{ idLabel }}</span>
            <div class="truncate">{{ input }}</div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
