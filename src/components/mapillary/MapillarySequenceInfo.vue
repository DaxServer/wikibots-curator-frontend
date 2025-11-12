<script setup lang="ts">
const store = useMapillaryStore()
</script>

<template>
  <v-card class="mt-4 mb-4 pa-4">
    <v-container>
      <v-row>
        <v-col>
          <span class="text-body-2 text-medium-emphasis">Total Images</span>
          <div class="text-h6 font-weight-medium">
            <span class="text-primary">{{ store.selectedCount }}</span>
            / {{ store.totalImages }}
          </div>
        </v-col>
        <v-col v-if="store.creatorUsername">
          <span class="text-body-2 text-medium-emphasis">Creator</span>
          <div>
            <v-btn
              variant="text"
              :href="`https://www.mapillary.com/profile/${store.creatorUsername}`"
              target="_blank"
              rel="noopener noreferrer"
              class="pa-0 text-none"
              color="primary"
            >
              {{ store.creatorUsername }}
            </v-btn>
          </div>
        </v-col>
        <v-col>
          <span class="text-body-2 text-medium-emphasis">Sequence ID</span>
          <div class="text-body-2">{{ store.sequenceId }}</div>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>
