<script setup lang="ts">
const ui = useUiStore()
</script>

<template>
  <v-app>
    <Header />
    <v-main>
      <v-tabs-window v-model="ui.activeTab">
        <v-tabs-window-item value="mapillary" class="pa-4">
          <MapillaryCollections />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-main>
    <Footer />
  </v-app>
</template>
