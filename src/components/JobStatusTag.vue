<script setup lang="ts">
const props = defineProps<{
  status: BotStatus
}>()

const durationDisplayParts = computed(() => {
  if (props.status.isRunning && props.status.startedAt) {
    return formatDuration(props.status.startedAt)
  }

  return null
})
</script>

<template>
  <Tag :severity="status.severity">
    <template #default>
      <div>
        <span v-if="status.state !== 'error'">{{ status.text }}</span>
        <template v-if="durationDisplayParts">
          <span class="ml-1">
            for {{ durationDisplayParts.hours }}:{{ durationDisplayParts.minutes
            }}<span class="text-xs">:{{ durationDisplayParts.seconds }}</span>
          </span>
        </template>
      </div>
      <div v-if="status.state === 'error'" class="mt-1 text-xs">
        {{ status.statusLong }}
      </div>
    </template>
  </Tag>
</template>
