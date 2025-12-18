<script setup lang="ts">
const store = useCollectionsStore()
const auth = useAuthStore()
const { open } = useSocket

initCollectionsListeners()

const confirmOpen = ref<boolean>(false)
const pendingRoute = ref<string | null>(null)

onMounted(() => {
  open()
})

const router = useRouter()

// We might want to keep some form of navigation confirmation if there's unsaved state
// For now, let's just use router-view
</script>

<template>
  <main>
    <Header />

    <template v-if="auth.isAuthenticated">
      <div
        v-if="store.error"
        class="max-w-7xl mx-auto mb-4"
      >
        <Message
          severity="error"
          icon="pi pi-exclamation-triangle"
        >
          {{ store.error }}
        </Message>
      </div>
      <router-view />
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
  </main>
</template>
