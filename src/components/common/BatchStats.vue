<script setup lang="ts">
const props = defineProps<{
  batch: Batch
}>()

const successfulCount = computed(() => {
  return props.batch.uploads.filter((u: UploadRequest) => u.success).length
})

const failedCount = computed(() => {
  return props.batch.uploads.filter((u: UploadRequest) => u.error).length
})

const inProgressCount = computed(() => {
  return props.batch.uploads.filter((u: UploadRequest) => u.status === UPLOAD_STATUS.InProgress)
    .length
})

const queuedCount = computed(() => {
  return props.batch.uploads.filter((u: UploadRequest) => u.status === UPLOAD_STATUS.Queued).length
})
</script>

<template>
  <div class="flex items-center gap-1">
    <Tag
      v-if="successfulCount > 0"
      severity="success"
      :value="`${successfulCount} successful`"
    />
    <Tag
      v-if="failedCount > 0"
      severity="danger"
      :value="`${failedCount} failed`"
    />
    <Tag
      v-if="inProgressCount > 0"
      severity="info"
      :value="`${inProgressCount} in progress`"
    />
    <Tag
      v-if="queuedCount > 0"
      severity="secondary"
      :value="`${queuedCount} queued`"
    />
  </div>
</template>
