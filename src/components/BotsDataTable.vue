<script setup lang="ts">
interface Props {
  handleStartJob: (jobType: string) => void
  handleDeleteJob: (jobType: string) => void
}

interface BotRow {
  type?: string;
  status: string;
  jobName?: string;
  command: string;
  args?: string[];
}

const props = defineProps<Props>()
const botsStore = useBotsStore()
const authStore = useAuthStore()

const { isLoading } = useBotStatus()

const columns = [
  {
    title: 'Type',
    key: 'type',
    render: (row: unknown) => {
      const typedRow = row as BotRow
      if (typedRow?.type) {
        return h('span', { class: 'font-bold' }, typedRow.type)
      }
      return h('span', { class: 'text-gray-400 italic' }, 'Unknown')
    },
  },
  {
    title: 'Status',
    key: 'status',
    render: (row: unknown) => {
      const typedRow = row as BotRow
      return h(JobStatusTag, { status: typedRow.status })
    },
  },
  {
    title: 'Job',
    key: 'jobName',
    render: (row: unknown) => {
      const typedRow = row as BotRow
      if (typedRow?.jobName) {
        return h('span', { class: 'font-mono text-sm' }, typedRow.jobName)
      }
      return null
    },
  },
  {
    title: 'Command',
    key: 'command',
    render: (row: unknown) => {
      const typedRow = row as BotRow
      return h('code', { class: 'text-sm' },
        typedRow.command + (typedRow.args ? ' ' + typedRow.args.join(' ') : ''),
      )
    },
  },
]

if (authStore.isAuthorized) {
  columns.push({
    title: 'Actions',
    key: 'actions',
    render: (row: unknown) => {
      const typedRow = row as BotRow
      return h(BotActions, {
        bot: typedRow,
        onStart: props.handleStartJob,
        onStop: props.handleDeleteJob,
      })
    },
  })
}
</script>

<template>
  <n-data-table
    :data="botsStore.bots"
    :columns="columns"
    :loading="isLoading"
    striped
    size="small"
  />
</template>
