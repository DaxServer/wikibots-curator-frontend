<script setup lang="ts">
defineProps<{ items: MapillaryItem[] }>()

const store = useMapillaryStore()
</script>

<template>
  <v-row class="my-5">
    <v-col
      v-for="item in items"
      :key="item.image.id"
      cols="4"
      lg="3"
      class="pa-2"
    >
      <v-card
        :color="item.meta.selected ? 'success' : undefined"
        :variant="item.meta.selected ? 'outlined' : 'flat'"
        class="position-relative"
        @click="store.updateItem(item.image.id, 'selected', !item.meta.selected)"
      >
        <!-- Corner check overlay when selected for upload -->
        <IMdiCheckCircle
          v-if="item.meta.selected"
          class="position-absolute text-success"
        />

        <v-img
          :src="item.image.thumb_256_url"
          :alt="`Mapillary image ${item.image.id}`"
          cover
          class="cursor-pointer"
        />

        <v-card-text
          class="d-flex justify-space-between align-center pa-2"
          :class="{ 'bg-success-lighten-4': item.meta.selected }"
        >
          <div class="flex-shrink-0">
            <span class="text-body-1 font-weight-medium">{{ item.index }}</span>
          </div>
          <div class="d-flex flex-column flex-grow-1 mx-2">
            <span class="text-caption">
              Time: {{ new Date(item.image.captured_at).toLocaleString() }}
            </span>
            <span class="text-caption text-medium-emphasis">Image ID: {{ item.image.id }}</span>
          </div>
          <div class="flex-shrink-0">
            <v-btn
              :href="`https://www.mapillary.com/app/?pKey=${item.image.id}&focus=photo`"
              target="_blank"
              variant="text"
              color="primary"
              size="small"
              @click.stop
            >
              Open
              <IMdiOpenInNew class="ml-2" />
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
