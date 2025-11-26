<script setup lang="ts">
defineProps<{
  tab: Handler
}>()

const emit = defineEmits<{
  'update:tab': [Handler]
  'open-history': []
}>()

const authStore = useAuthStore()

const handleTabChange = (event: { value: string }) => {
  if (event.value === 'mapillary') {
    emit('update:tab', 'mapillary')
  }
}

onMounted(async () => {
  await authStore.checkAuth()
})
</script>

<template>
  <div class="container max-w-7xl mx-auto flex justify-between">
    <div class="flex items-end">
      <span class="text-2xl mr-5">Curator</span>
      <Button
        label="Mapillary"
        @click="handleTabChange({ value: 'mapillary' })"
      />
    </div>

    <div class="flex items-center gap-2">
      <template v-if="!authStore.isAuthenticated">
        <Button
          label="Login"
          @click="authStore.login"
        />
      </template>
      <template v-else>
        <span class="text-gray-600">Hello, {{ authStore.user }}!</span>
        <Button
          label="My uploads"
          severity="secondary"
          @click="$emit('open-history')"
        />
        <Button
          label="Logout"
          outlined
          severity="danger"
          @click="authStore.logout"
        />
      </template>
    </div>
  </div>
  <Divider />
</template>
