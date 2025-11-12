<script setup lang="ts">
const activeTab = ref('mapillary')
</script>

<template>
  <v-app>
    <Header />
    <v-main>
      <div class="w-full text-md p-2 xl:w-7xl mx-auto">
        <v-tabs
          v-model="activeTab"
          class="mt-4"
        >
          <v-tab value="bots">CuratoBot jobs</v-tab>
          <v-tab value="mapillary">Mapillary Sequence Viewer</v-tab>
        </v-tabs>

        <v-tabs-window v-model="activeTab">
          <v-tabs-window-item value="bots">
            <div class="pa-4">
              Placeholder
              <!-- <BotsTable /> -->
            </div>
          </v-tabs-window-item>
          <v-tabs-window-item value="mapillary">
            <div class="pa-4">
              <MapillaryTable />
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </div>
    </v-main>
    <Footer />
  </v-app>
</template>
