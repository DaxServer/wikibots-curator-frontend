<script setup lang="ts">
const activeTab = ref('mapillary')
</script>

<template>
  <div>
    <Header />
    <div class="w-full xl:w-7xl mx-auto">
      <Tabs
        :value="activeTab"
        class="mt-4"
      >
        <TabList>
          <Tab value="bots">CuratoBot jobs</Tab>
          <Tab value="mapillary">Mapillary Sequence Viewer</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="bots">
            <BotsTable />
          </TabPanel>
          <TabPanel value="mapillary">
            <MapillaryTable />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
    <Footer />
  </div>
</template>
