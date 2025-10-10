<script setup lang="ts">
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.checkAuth()
})
</script>

<template>
  <n-layout-header
    bordered
    class="flex justify-between items-center p-2 lg:px-52!"
  >
    <template #default>
      <h1>Curator</h1>
      <div
        v-if="authStore.isAuthenticated"
        class="flex items-center space-x-2"
      >
        <span>Welcome, {{ authStore.user }}!</span>
        <n-button
          type="default"
          size="small"
          @click="authStore.logout"
        >
          Logout
        </n-button>
      </div>
      <div v-else>
        <n-button
          type="default"
          size="medium"
          :loading="authStore.isLoading"
          :disabled="authStore.isLoading"
          @click="authStore.login"
        >
          Login with Wikimedia Commons
        </n-button>
      </div>
    </template>
  </n-layout-header>
</template>
