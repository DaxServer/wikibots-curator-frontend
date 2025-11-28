<script setup lang="ts">
defineProps<{
  tab: Handler
}>()

const emit = defineEmits<{
  'update:tab': [Handler]
  'open-history': []
  'open-admin': []
}>()

const auth = useAuthStore()

const handleTabChange = (event: { value: string }) => {
  if (event.value === 'mapillary') {
    emit('update:tab', 'mapillary')
  }
}

onMounted(async () => {
  await auth.checkAuth()
})
</script>

<template>
  <div class="max-w-7xl mx-auto flex justify-between">
    <div class="flex items-end">
      <span class="text-2xl mr-5">Curator</span>
      <Button
        label="Mapillary"
        @click="handleTabChange({ value: 'mapillary' })"
      />
    </div>

    <div class="flex items-center gap-2">
      <Button
        v-if="!auth.isAuthenticated"
        label="Login"
        :loading="auth.isLoading"
        :disabled="auth.isLoading"
        @click="auth.login"
      />
      <template v-else>
        <span class="text-gray-600">Hello, {{ auth.user }}!</span>
        <Button
          v-if="auth.user === 'DaxServer'"
          label="Admin"
          severity="info"
          class="mr-2"
          @click="$emit('open-admin')"
        />
        <Button
          label="Past uploads"
          severity="secondary"
          @click="$emit('open-history')"
        />
        <Button
          label="Logout"
          outlined
          severity="danger"
          @click="auth.logout"
        />
      </template>
    </div>
  </div>
  <Divider />
</template>
