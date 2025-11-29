<script setup lang="ts">
type StatusMeta = {
  title: string
  status?: (typeof UPLOAD_STATUS)[keyof typeof UPLOAD_STATUS] | undefined
  statusReason?: string
  successUrl?: string
  errorInfo?: StructuredError
}
type StatusItem = { id: string; index: number; meta: StatusMeta }

defineProps<{ items: Array<StatusItem> }>()

const getRowClass = (data: StatusItem) => {
  const status = data.meta.status
  if (status === UPLOAD_STATUS.Completed) return 'bg-green-100'
  if (status === UPLOAD_STATUS.Failed) return 'bg-red-100'
  if (status === UPLOAD_STATUS.InProgress) return 'bg-blue-100'
  return ''
}
</script>

<template>
  <DataTable
    :value="items"
    :row-class="getRowClass"
    class="mt-4 mb-20"
  >
    <Column
      field="index"
      header="#"
    />

    <Column
      field="title"
      header="Title"
    >
      <template #body="{ data }">File:{{ data.meta.title }}</template>
    </Column>

    <Column
      field="status"
      header="Status"
    >
      <template #body="{ data }">
        <span v-if="data.meta.status === UPLOAD_STATUS.Failed">
          <ErrorDisplay
            v-if="data.meta.errorInfo"
            :error="data.meta.errorInfo"
          />
          <span v-else>failed: {{ data.meta.statusReason }}</span>
        </span>
        <span v-else-if="data.meta.status === UPLOAD_STATUS.Completed">
          completed
          <span v-if="data.meta.successUrl">
            —
            <a
              :href="data.meta.successUrl"
              class="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open
              <i class="pi pi-external-link text-xs!"></i>
            </a>
          </span>
        </span>
        <span v-else>{{ data.meta.status ?? UPLOAD_STATUS.Queued }}</span>
      </template>
    </Column>
  </DataTable>
</template>
