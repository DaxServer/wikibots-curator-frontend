<script setup lang="ts">
import { mdiOpenInNew } from '@mdi/js'

defineProps<{
  input: string
  selectedCount: number
  totalImages: number
  idLabel: string
}>()

const store = useCollectionsStore()
</script>

<template>
  <v-card class="mt-4 mb-4 pa-4">
    <v-container>
      <v-row>
        <v-col>
          <span class="text-body-2 text-medium-emphasis">Total Images</span>
          <div class="text-h6 font-weight-medium">
            <span class="text-primary">{{ selectedCount }}</span>
            / {{ totalImages }}
          </div>
        </v-col>
        <v-col>
          <span class="text-body-2 text-medium-emphasis">Creator</span>
          <div>
            <a
            href="store.creator.profile_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary text-body-2 d-inline-flex align-center ga-1"
            >
            {{ store.creator.username }}
            <v-icon :icon="mdiOpenInNew" size="18" />
          </a>
        </div>
        </v-col>
        <v-col>
          <span class="text-body-2 text-medium-emphasis">{{ idLabel }}</span>
          <div class="text-body-2">{{ input }}</div>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>
