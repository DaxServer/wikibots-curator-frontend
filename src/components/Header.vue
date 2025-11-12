<script setup lang="ts">
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.checkAuth()
})
</script>

<template>
  <v-app-bar
    color="white"
    elevation="1"
    class="border-b border-gray-200"
  >
    <v-app-bar-title class="text-h6 font-weight-bold text-grey-darken-3">
      Curator App
    </v-app-bar-title>

    <v-spacer />

    <div class="d-flex align-center ga-4">
      <div v-if="!authStore.isAuthenticated">
        <v-btn
          color="primary"
          @click="authStore.login"
        >
          Login
        </v-btn>
      </div>
      <div
        v-else
        class="d-flex align-center ga-4"
      >
        <span class="text-grey-darken-1">{{ authStore.user }}</span>
        <v-btn
          variant="outlined"
          @click="authStore.logout"
        >
          Logout
        </v-btn>
      </div>
    </div>
  </v-app-bar>
</template>
