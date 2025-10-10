<script setup lang="ts">
const themeOverrides: GlobalThemeOverrides = {
  common: {
    // primaryColor: '#0E47CB',
  },
}

const activeTab = ref('mapillary')
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <Header />
    <div class="w-full text-md p-2 xl:w-7xl mx-auto">
      <n-tabs
        v-model:value="activeTab"
        class="mt-4"
      >
        <n-tab-pane name="bots" tab="CuratoBot jobs">
          Placeholder
          <!-- <BotsTable /> -->
        </n-tab-pane>
        <n-tab-pane name="mapillary" tab="Mapillary Sequence Viewer">
          <MapillaryTable />
        </n-tab-pane>
      </n-tabs>
    </div>
    <Footer />
  </n-config-provider>
</template>
