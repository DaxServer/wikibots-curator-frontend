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
  <Tag :severity="status.info.severity">
    <template #default>
      <div>
        <span v-if="status.state !== 'error'">{{ status.info.label }}</span>
        <template v-if="durationDisplayParts">
          <span>
            for {{ durationDisplayParts.hours }}:{{ durationDisplayParts.minutes }}
            <span class="text-xs">:{{ durationDisplayParts.seconds }}</span>
          </span>
        </template>
      </div>
      <div
        v-if="status.state === 'error'"
        class="mt-1 text-xs"
      >
        {{ status.info.text }}
      </div>
    </template>
  </Tag>
</template>
