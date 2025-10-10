<script lang="ts" setup>
import { CloudUploadOutline } from '@vicons/ionicons5'
import StatementsList from '@/components/wikidata/StatementsList.vue'

const store = useMapillaryStore()
const { wikitext, submitUpload, loadSDC } = useMapillary()

const columns: DataTableColumns<MapillaryItem> = [
  {
    title: '#',
    key: 'index',
    className: 'align-baseline',
    render: (row: MapillaryItem) => h('span', { class: 'text-lg font-medium' }, row.index),
  },
  {
    title: 'Image',
    key: 'image',
    className: 'align-top',
    render: (row: MapillaryItem) => h('img', {
      src: row.image.thumb_256_url,
      alt: `Mapillary image ${row.id}`,
    }),
  },
  {
    title: 'Metadata',
    key: 'metadata',
    render: (row: MapillaryItem) => h('div', { class: 'flex flex-col gap-2' }, [
      h('div', { class: 'text-lg font-bold' }, `File: ${row.meta.title}`),
      h('pre', { class: 'text-xs bg-gray-50 p-2' }, wikitext(row)),
      h('div', [
        h('div', { class: 'text-lg font-bold' }, 'SDC'),
        h(StatementsList, {
          key: row.id,
          statements: row.sdc,
        }),
      ]),
    ]),
  },
]

onMounted(async () => {
  await loadSDC()
})
</script>

<template>
  <div>
    <MapillarySequenceInfo />

    <div class="my-4 bg-gray-100 p-4 rounded-md">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="text-lg font-bold">Preview</div>
          <span class="text-sm text-gray-500">
            displaying {{ store.selectedCount }} items to upload
          </span>
        </div>
        <n-button
          type="primary"
          :disabled="store.selectedCount === 0"
          @click="submitUpload"
        >
          <template #icon>
            <n-icon>
              <CloudUploadOutline />
            </n-icon>
          </template>
          Upload
        </n-button>
      </div>
    </div>

    <n-data-table
      :columns="columns"
      :data="store.displayedItems"
      :pagination="{
        pageSize: 10,
      }"
      :row-key="(item) => item.id"
    />
  </div>
</template>
