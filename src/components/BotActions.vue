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
    class="d-flex ga-2"
  >
    <v-btn
      v-if="bot.status.action.type === 'start'"
      :color="bot.status.action.severity === 'danger' ? 'error' : 'default'"
      size="small"
      :loading="jobsStore.starting[bot.type]"
      :disabled="isLoading"
      @click="onStart(bot.type)"
    >
      <v-icon start>mdi-play</v-icon>
      {{ bot.status.action.label }}
    </v-btn>
    <v-btn
      v-else-if="bot.status.action.type === 'terminate' || bot.status.action.type === 'stop'"
      :color="bot.status.action.severity === 'danger' ? 'error' : 'default'"
      size="small"
      :loading="jobsStore.deleting[bot.type]"
      :disabled="isLoading"
      @click="onStop(bot.type)"
    >
      <v-icon start>mdi-stop</v-icon>
      {{ bot.status.action.label }}
    </v-btn>
    <v-chip
      v-else-if="bot.status.action.type === 'pending'"
      :color="bot.status.action.severity === 'danger' ? 'error' : 'info'"
      size="small"
    >
      <v-icon start>mdi-loading mdi-spin</v-icon>
      {{ bot.status.action.label }}
    </v-chip>
    <v-chip
      v-else
      color="error"
      size="small"
    >
      <v-icon start>mdi-help</v-icon>
      Unknown
    </v-chip>
  </div>
  <div v-else-if="authStore.isAuthenticated && !authStore.isAuthorized">
    <v-chip
      color="error"
      size="small"
    >
      <v-icon start>mdi-lock</v-icon>
      Not authorized
    </v-chip>
  </div>
</template>
