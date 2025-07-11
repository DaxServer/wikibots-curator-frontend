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
  <div v-if="authStore.isAuthorized" class="flex gap-2">
    <Button
      v-if="bot.status.action.type === 'start'"
      :severity="bot.status.severity"
      :label="bot.status.action.label"
      icon="pi pi-play"
      size="small"
      :loading="jobsStore.starting[bot.type]"
      :disabled="isLoading"
      @click="onStart(bot.type)"
    />
    <Button
      v-else-if="bot.status.action.type === 'terminate' || bot.status.action.type === 'stop'"
      :severity="bot.status.severity"
      size="small"
      icon="pi pi-stop"
      :label="bot.status.action.label"
      :loading="jobsStore.deleting[bot.type]"
      :disabled="isLoading"
      @click="onStop(bot.type)"
    />
    <Tag
      v-else-if="bot.status.action.type === 'pending'"
      :severity="bot.status.severity"
      size="small"
      icon="pi pi-spin pi-spinner"
      :value="bot.status.action.label"
    />
    <Tag v-else severity="danger" size="small" icon="pi pi-question" value="Unknown" />
  </div>
  <div v-else-if="authStore.isAuthenticated && !authStore.isAuthorized">
    <Tag severity="danger" size="small" icon="pi pi-lock" value="Not authorized" />
  </div>
</template>
