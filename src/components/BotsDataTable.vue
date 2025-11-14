<script setup lang="ts">
interface Props {
  handleStartJob: (jobType: string) => void
  handleStopJob: (jobType: string) => void
}

interface BotRow {
  type: string
  status: BotStatus
  jobName: string
  command: string
  args: string[]
}

const props = defineProps<Props>()
const botsStore = useBotsStore()
const authStore = useAuthStore()

const { isLoading } = useBotStatus()

const headers = computed(() => {
  const baseHeaders = [
    { title: 'Type', key: 'type', sortable: true },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Job', key: 'jobName', sortable: true },
    { title: 'Command', key: 'command', sortable: false },
  ]

  if (authStore.isAuthorized) {
    baseHeaders.push({ title: 'Actions', key: 'actions', sortable: false })
  }

  return baseHeaders
})

const getTypeDisplay = (item: BotRow) => {
  if (item?.type) {
    return item.type
  }
  return 'Unknown'
}

const getJobDisplay = (item: BotRow) => {
  return item?.jobName || ''
}

const getCommandDisplay = (item: BotRow) => {
  return item.command + (item.args ? ` ${item.args.join(' ')}` : '')
}
</script>

<template>
  <v-data-table
    :items="botsStore.bots"
    :headers="headers"
    :loading="isLoading"
    density="compact"
    class="elevation-1"
  >
    <template #[`item.type`]="{ item }">
      {{ getTypeDisplay(item) }}
    </template>

    <template #[`item.status`]="{ item }">
      <JobStatusTag :status="item.status" />
    </template>

    <template #[`item.jobName`]="{ item }">
      {{ getJobDisplay(item) }}
    </template>

    <template #[`item.command`]="{ item }">
      {{ getCommandDisplay(item) }}
    </template>

    <template
      v-if="authStore.isAuthorized"
      #[`item.actions`]="{ item }"
    >
      <BotActions
        :bot="item"
        :on-start="props.handleStartJob"
        :on-stop="props.handleStopJob"
      />
    </template>
  </v-data-table>
</template>
