<script setup lang="ts">
import type { BotStatus } from '@/types/bots';

const props = defineProps<{
  status: BotStatus;
}>();

const durationDisplayParts = computed(() => {
  if (props.status.isRunning && props.status.startedAt) {
    return formatDuration(props.status.startedAt);
  }
  return null;
});
</script>

<template>
  <Tag :severity="status.severity">
    <template #default>
      <span>{{ status.text }}</span>
      <template v-if="durationDisplayParts">
        <span class="ml-1">
          for {{ durationDisplayParts.hours }}:{{ durationDisplayParts.minutes }}<span class="text-xs">:{{ durationDisplayParts.seconds }}</span>
        </span>
      </template>
    </template>
  </Tag>
</template>
