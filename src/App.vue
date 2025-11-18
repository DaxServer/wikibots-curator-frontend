<script setup lang="ts">
const tab = ref<Handler>('mapillary')
</script>

<template>
  <v-app>
    <Header :tab="tab" @update:tab="tab = $event" />
    <v-main>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="mapillary" class="pa-4">
          <MapillaryCollections />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-main>
    <Footer />
  </v-app>
</template>
