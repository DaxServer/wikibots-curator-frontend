<script setup lang="ts">
const store = useCollectionsStore()

const tab = ref<Handler>('mapillary')
const pendingTab = ref<Handler | null>(null)
const currentView = ref<'ingest' | 'batches'>('ingest')
const confirmOpen = ref<boolean>(false)

const switchProvider = (next: Handler) => {
  store.$reset()
  store.input = ''
  store.setHandler(next)
  tab.value = next
}

const onTabUpdate = (next: Handler) => {
  if (currentView.value !== 'ingest') {
    currentView.value = 'ingest'
  }

  if (next === tab.value) return
  if (store.stepper !== 1 && store.stepper !== 5) {
    pendingTab.value = next
    confirmOpen.value = true
    return
  }
  switchProvider(next)
}

const confirmSwitch = () => {
  if (pendingTab.value) {
    switchProvider(pendingTab.value)
  }
  confirmOpen.value = false
  pendingTab.value = null
}

const cancelSwitch = () => {
  confirmOpen.value = false
  pendingTab.value = null
}
</script>

<template>
  <v-app>
    <Header
      :tab="tab"
      @update:tab="onTabUpdate"
      @open-history="currentView = 'batches'"
    />
    <v-main>
      <div class="pa-4">
        <template v-if="currentView === 'ingest'">
          <MapillaryCollections v-if="tab === 'mapillary'" />
        </template>
        <BatchesView v-else />
      </div>
    </v-main>
    <Footer />

    <v-dialog
      v-model="confirmOpen"
      max-width="400"
    >
      <v-card>
        <v-card-title>Switch provider?</v-card-title>
        <v-card-text>Switching provider will clear current progress.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="cancelSwitch"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmSwitch"
          >
            Switch
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>
