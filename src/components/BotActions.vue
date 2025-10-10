<script setup lang="ts">
const props = defineProps<{
  bot: Bot
  onStart: (jobType: string) => void
  onStop: (jobType: string) => void
}>()

const jobsStore = useJobsStore()
const authStore = useAuthStore()

const isLoading = computed(
  () => jobsStore.starting[props.bot.type] || jobsStore.deleting[props.bot.type],
)
</script>

<template>
  <div
    v-if="authStore.isAuthorized"
    class="flex gap-2"
  >
    <n-button
      v-if="bot.status.action.type === 'start'"
      :type="bot.status.action.severity === 'danger' ? 'error' : 'default'"
      size="small"
      :loading="jobsStore.starting[bot.type]"
      :disabled="isLoading"
      @click="onStart(bot.type)"
    >
      <template #icon>
        <i class="pi pi-play"></i>
      </template>
      {{ bot.status.action.label }}
    </n-button>
    <n-button
      v-else-if="bot.status.action.type === 'terminate' || bot.status.action.type === 'stop'"
      :type="bot.status.action.severity === 'danger' ? 'error' : 'default'"
      size="small"
      :loading="jobsStore.deleting[bot.type]"
      :disabled="isLoading"
      @click="onStop(bot.type)"
    >
      <template #icon>
        <i class="pi pi-stop"></i>
      </template>
      {{ bot.status.action.label }}
    </n-button>
    <n-tag
      v-else-if="bot.status.action.type === 'pending'"
      :type="bot.status.action.severity === 'danger' ? 'error' : 'default'"
      size="small"
    >
      <template #icon>
        <i class="pi pi-spin pi-spinner"></i>
      </template>
      {{ bot.status.action.label }}
    </n-tag>
    <n-tag
      v-else
      type="error"
      size="small"
    >
      <template #icon>
        <i class="pi pi-question"></i>
      </template>
      Unknown
    </n-tag>
  </div>
  <div v-else-if="authStore.isAuthenticated && !authStore.isAuthorized">
    <n-tag
      type="error"
      size="small"
    >
      <template #icon>
        <i class="pi pi-lock"></i>
      </template>
      Not authorized
    </n-tag>
  </div>
</template>
