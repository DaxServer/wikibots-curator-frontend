<script setup lang="ts">
const ui = useUiStore()
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.checkAuth()
})
</script>

<template>
  <div class="d-flex justify-space-between align-center border-b border-gray-200 px-4 py-2">
    <div class="d-flex align-center ga-6">
      <span class="text-h6 font-weight-bold text-grey-darken-3">Curator</span>
      <v-tabs
        :model-value="ui.activeTab"
        density="compact"
        class="text-none"
        @update:model-value="ui.setActiveTab"
      >
        <v-tab
          value="mapillary"
          class="text-none"
        >
          Mapillary
        </v-tab>
      </v-tabs>
    </div>

    <div class="d-flex align-center ga-4">
      <v-btn
        v-if="!authStore.isAuthenticated"
        color="primary"
        @click="authStore.login"
      >
        Login
      </v-btn>
      <template v-else>
        <span class="text-grey-darken-1">{{ authStore.user }}</span>
        <v-btn
          variant="outlined"
          @click="authStore.logout"
        >
          Logout
        </v-btn>
      </template>
    </div>
  </div>
</template>
