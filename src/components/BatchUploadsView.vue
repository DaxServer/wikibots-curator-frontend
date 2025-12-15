<script setup lang="ts">
const props = defineProps<{
  batch: Batch
}>()

defineEmits<{
  back: []
}>()

const store = useCollectionsStore()
const { loadBatchUploads } = useCollections()

const columns = [
  { field: 'id', header: 'ID' },
  { field: 'key', header: 'Mapillary image ID' },
  { field: 'status', header: 'Status' },
  { field: 'error', header: 'Error' },
  { field: 'filename', header: 'File name' },
  { field: 'wikitext', header: 'Wikitext' },
]

const selectValues = ref('all')
const selectOptions = ref([
  { label: 'All', value: 'all' },
  { label: 'Uploaded', value: UPLOAD_STATUS.Completed },
  { label: 'Duplicates', value: UPLOAD_STATUS.Duplicate },
  { label: 'Failed', value: UPLOAD_STATUS.Failed },
  { label: 'In progress', value: UPLOAD_STATUS.InProgress },
  { label: 'Queued', value: UPLOAD_STATUS.Queued },
])

const filteredUploads = computed(() => {
  if (selectValues.value === 'all') {
    return store.batchUploads
  }
  return store.batchUploads.filter((upload) => upload.status === selectValues.value)
})

const statusTagSeverity = (status: UploadStatus) => {
  switch (status) {
    case UPLOAD_STATUS.InProgress:
      return 'info'
    case UPLOAD_STATUS.Queued:
      return 'secondary'
    case UPLOAD_STATUS.Failed:
      return 'danger'
    case UPLOAD_STATUS.Duplicate:
      return 'contrast'
    case UPLOAD_STATUS.Completed:
      return 'success'
    default:
      return 'secondary'
  }
}

onMounted(() => {
  loadBatchUploads(props.batch.id)
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col items-start gap-4">
      <Button
        icon="pi pi-arrow-left"
        text
        @click="$emit('back')"
        class="mr-2"
        label="Back to batches"
      />
      <Card
        :pt="{
          content: {
            class: 'flex flex-col gap-2',
          },
        }"
      >
        <template #content>
          <div class="text-xl font-medium">Batch: {{ batch.id }}</div>
          <div class="text-xl font-small">Uploads: {{ batch.stats.total }}</div>
          <div class="text-sm text-gray-500">
            Uploaded by: {{ batch.username }} | Created at:
            {{ new Date(batch.created_at).toLocaleString() }}
          </div>
          <BatchStats :stats="batch.stats" />
        </template>
      </Card>

      <div class="flex items-center gap-2">
        <span class="font-bold">Showing</span>
        <SelectButton
          v-model="selectValues"
          :options="selectOptions"
          option-value="value"
          option-label="label"
        />
      </div>
    </div>

    <SharedDataTable
      :value="filteredUploads"
      :columns="columns"
      :row-class="() => ({ 'align-top': true })"
      :rows-per-page-options="[10, 20, 50, 100]"
    >
      <template #body-cell="{ col, data }">
        <template v-if="col.field === 'key'">
          <a
            :href="`https://www.mapillary.com/app/?pKey=${data.key}&focus=photo`"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:underline"
          >
            {{ data.key }}&nbsp;
            <i class="pi pi-external-link text-sm!"></i>
          </a>
        </template>
        <template v-else-if="col.field === 'status'">
          <Tag
            :severity="statusTagSeverity(data.status)"
            :style="
              data.status === UPLOAD_STATUS.Duplicate
                ? { backgroundColor: 'var(--p-fuchsia-50)', color: 'var(--p-fuchsia-800)' }
                : {}
            "
          >
            {{ data.status }}
          </Tag>
        </template>
        <template v-else-if="col.field === 'error'">
          <ErrorDisplay
            v-if="data.error"
            :error="data.error"
          />
        </template>
        <template v-else-if="col.field === 'filename' && data.status === UPLOAD_STATUS.Completed">
            <a
              :href="decodeURIComponent(data.success)"
              target="_blank"
              rel="noopener noreferrer"
              class="text-green-600 hover:underline"
            >
              {{ data.filename }}
            </a>
        </template>
        <template v-else-if="col.field === 'wikitext'">
          <pre class="text-xs">{{ data[col.field] }}</pre>
        </template>
        <template v-else>
          {{ data[col.field] }}
        </template>
      </template>
    </SharedDataTable>
  </div>
</template>
