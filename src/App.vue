<script setup lang="ts">
const store = useCollectionsStore()
const auth = useAuthStore()

const tab = ref<Handler>('mapillary')
const pendingTab = ref<Handler | null>(null)
const currentView = ref<'ingest' | 'batches' | 'admin'>('ingest')
const confirmOpen = ref<boolean>(false)

watch(currentView, () => {
  store.error = ''
})

const switchProvider = (next: Handler) => {
  store.$reset()
  store.input = ''
  store.setHandler(next)
  tab.value = next
}

const onTabUpdate = (next: Handler) => {
  store.error = ''
  if (currentView.value !== 'ingest') {
    currentView.value = 'ingest'
  }

  if (next === tab.value) return
  if (store.stepper !== '1' && store.stepper !== '5') {
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
  <main>
    <Header
      :tab="tab"
      @update:tab="onTabUpdate"
      @open-history="currentView = 'batches'"
      @open-admin="currentView = 'admin'"
    />

    <template v-if="auth.isAuthenticated">
      <div
        v-if="store.error"
        class="inline-flex flex-none mb-4"
      >
        <Message severity="error">
          {{ store.error }}
        </Message>
      </div>
      <template v-if="currentView === 'ingest'">
        <MapillaryCollections v-if="tab === 'mapillary'" />
      </template>
      <BatchesView v-else-if="currentView === 'batches'" />
      <AdminView v-else-if="currentView === 'admin'" />
    </template>

    <div
      v-else
      class="py-48 flex justify-center items-center"
    >
      <Button
        color="primary"
        :loading="auth.isLoading"
        :disabled="auth.isLoading"
        label="Login with Wikimedia Commons"
        @click="auth.login"
      />
    </div>

    <Footer />

    <Dialog
      v-model:visible="confirmOpen"
      modal
      header="Switch provider?"
    >
      <Card>
        <template #content>Switching provider will clear current progress.</template>
        <template #footer>
          <div class="flex justify-content-end gap-2">
            <Button
              type="button"
              label="Cancel"
              severity="secondary"
              @click="cancelSwitch"
            />
            <Button
              type="button"
              label="Switch"
              @click="confirmSwitch"
            />
          </div>
        </template>
      </Card>
    </Dialog>
  </main>
</template>
