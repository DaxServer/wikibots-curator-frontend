<script setup lang="ts">
const authStore = useAuthStore()

const handleLogin = () => authStore.login()
const handleLogout = () => authStore.logout()

onMounted(() => {
  authStore.checkAuth()
})
</script>

<template>
  <Toolbar class="flex justify-between items-center border-l-0! border-r-0! border-t-0! md:px-52!">
    <template #start>
      <h1>CuratorBot - Toolforge Jobs</h1>
    </template>
    <template #end>
      <div v-if="authStore.isAuthenticated" class="flex items-center space-x-2">
        <span>Welcome, {{ authStore.user }}!</span>
        <Button label="Logout" severity="secondary" size="small" @click="handleLogout" />
      </div>
      <div v-else>
        <Button
          label="Login with Wikimedia Commons"
          severity="secondary"
          size="small"
          @click="handleLogin"
          :loading="authStore.isLoading"
          :disabled="authStore.isLoading"
        />
      </div>
    </template>
  </Toolbar>
</template>
