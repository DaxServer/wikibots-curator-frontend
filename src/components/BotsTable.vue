<script setup lang="ts">
// Initialize stores and composables
const jobsStore = useJobsStore()
const harborStore = useHarborStore()
const botsStore = useBotsStore()

const { fetchBots, fetchJobs } = useBotsApi()
const { startJob, deleteJob } = useJobsApi()
const { isLoading } = useBotStatus()

// Computed properties
const error = computed(() => {
  const errors = []
  if (botsStore.error) errors.push(botsStore.error)
  if (jobsStore.error) errors.push(jobsStore.error)
  if (harborStore.error) errors.push(harborStore.error)
  return errors.join('\n')
})

/**
 * Handles executing a job action and refreshing job data.
 */
const handleJobAction = async (action: () => Promise<void>) => {
  await action()
  await fetchJobs()
}

/**
 * Refreshes bots data and starts polling if there are pending jobs.
 */
const refreshBotsData = async () => {
  await fetchBots()
}

/**
 * Handles refreshing bots data and/or performing job actions
 * @param actionOrEvent - Either an async function to execute before refreshing or a MouseEvent
 */
const refreshBots = async (actionOrEvent?: (() => Promise<void>) | MouseEvent) => {
  const action = typeof actionOrEvent === 'function' ? actionOrEvent : undefined

  try {
    botsStore.setLoading(true)

    if (action) {
      await handleJobAction(action)
    } else {
      await refreshBotsData()
    }
  } finally {
    botsStore.setLastRefreshed()
    botsStore.setLoading(false)
  }
}

// Initialize data when component is mounted
onMounted(async () => {
  await refreshBots()
})

// Wrapper functions for job actions
const handleStartJob = (jobType: string) => refreshBots(() => startJob(jobType))
const handleStopJob = (jobType: string) => refreshBots(() => deleteJob(jobType))
</script>

<template>
  <div class="card mt-4">
    <div class="d-flex justify-space-between align-center mb-4 ml-2">
      <h2>Bots</h2>
      <div class="d-flex align-center ga-2">
        <span class="text-body-2 text-grey-darken-1">
          Last updated: {{ botsStore.lastRefreshed?.toLocaleTimeString() ?? 'Never' }}
        </span>
        <v-btn
          :loading="isLoading"
          :disabled="isLoading"
          color="info"
          icon
          @click="refreshBots"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="error"
      class="d-inline-flex w-auto flex-grow-0 flex-shrink-0 mb-4"
    >
      <v-alert
        color="error"
        :closable="false"
        style="width: max-content"
      >
        {{ error }}
      </v-alert>
    </div>

    <!-- Data Table -->
    <BotsDataTable
      v-else
      :handle-start-job="handleStartJob"
      :handle-stop-job="handleStopJob"
    />
  </div>
</template>
