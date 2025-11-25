<script setup lang="ts">
defineProps<{
  tab: Handler
}>()

defineEmits<{
  'update:tab': [Handler]
  'open-history': []
}>()

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
        :model-value="tab"
        density="compact"
        class="text-none"
        @update:model-value="$emit('update:tab', $event as Handler)"
      >
        <v-tab
          value="mapillary"
          class="text-none"
        >
          Mapillary
        </v-tab>
      </v-tabs>
    </div>

    <div class="d-flex align-center ga-1">
      <v-btn
        v-if="!authStore.isAuthenticated"
        color="primary"
        @click="authStore.login"
      >
        Login
      </v-btn>
      <template v-else>
        <span class="text-grey-darken-1">Hello, {{ authStore.user }}!</span>
        <v-btn
          class="text-none"
          variant="text"
          @click="$emit('open-history')"
        >
          My uploads
        </v-btn>
        <v-btn
          variant="outlined"
          class="text-none"
          @click="authStore.logout"
        >
          Logout
        </v-btn>
      </template>
    </div>
  </div>
</template>
