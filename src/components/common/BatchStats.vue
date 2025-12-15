<script setup lang="ts">
defineProps<{
  stats: Batch['stats']
}>()
</script>

<template>
  <div class="flex items-center gap-1">
    <Tag
      v-if="stats.completed > 0"
      severity="success"
      :value="`${stats.completed} successful`"
    />
    <Tag
      v-if="stats.duplicate > 0"
      severity="contrast"
      :value="`${stats.duplicate} duplicate${stats.duplicate > 1 ? 's' : ''}`"
      :style="{ backgroundColor: 'var(--p-fuchsia-50)', color: 'var(--p-fuchsia-800)' }"
    />
    <Tag
      v-if="stats.failed > 0"
      severity="danger"
      :value="`${stats.failed} failed`"
    />
    <Tag
      v-if="stats.in_progress > 0"
      severity="info"
      :value="`${stats.in_progress} in progress`"
    />
    <Tag
      v-if="stats.queued > 0"
      severity="secondary"
      :value="`${stats.queued} queued`"
    />
  </div>
</template>
