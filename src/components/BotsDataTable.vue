<script setup lang="ts">
interface Props {
  handleStartJob: (jobType: string) => void
  handleDeleteJob: (jobType: string) => void
}

const props = defineProps<Props>()
const botsStore = useBotsStore()
const authStore = useAuthStore()

const formatDuration = (startedAt: Date | undefined): string => {
  if (!startedAt) return ''

  // Calculate duration based on current time at the moment of rendering
  const diffMs = new Date().getTime() - startedAt.getTime()
  if (diffMs < 0) return '' // Should not happen if clock is synced

  const totalSeconds = Math.floor(diffMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (num: number) => num.toString().padStart(2, '0')

  return `for ${pad(hours)}:${pad(minutes)}<span class="text-xs">:${pad(seconds)}</span>`
}
</script>

<template>
  <DataTable
    :value="botsStore.bots"
    :loading="botsStore.loading"
    stripedRows
    size="small"
    class="p-datatable-sm"
  >
    <Column field="type" header="Type">
      <template #body="{ data }">
        <span v-if="data?.type" class="font-bold">{{ data.type }}</span>
        <span v-else class="text-gray-400 italic">Unknown</span>
      </template>
    </Column>

    <Column header="Status">
      <template #body="{ data }">
        <Tag :severity="data.status.severity">
          <template #default>
            <div class="flex items-center">
              <span>{{ data.status.text }}</span>
              <span
                v-if="data.status.isRunning && data.status.startedAt"
                class="ml-1"
                v-html="formatDuration(data.status.startedAt)"
              >
              </span>
            </div>
          </template>
        </Tag>
      </template>
    </Column>

    <Column field="jobName" header="Job">
      <template #body="{ data }">
        <span v-if="data?.jobName" class="font-mono text-sm">{{ data.jobName }}</span>
      </template>
    </Column>

    <Column header="Command">
      <template #body="{ data }">
        <code class="text-sm"
          >{{ data.command }}{{ data.args ? ' ' + data.args.join(' ') : '' }}</code
        >
      </template>
    </Column>

    <Column v-if="authStore.isAuthorized" header="Actions">
      <template #body="{ data }">
        <BotActions :bot="data" :on-start="props.handleStartJob" :on-stop="props.handleDeleteJob" />
      </template>
    </Column>
  </DataTable>
</template>
