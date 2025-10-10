<script lang="ts" setup>
const store = useMapillaryStore()

const columns: DataTableColumns<MapillaryItem> = [
  {
    type: 'selection',
    options: [
      'all',
      'none',
    ],
  },
  {
    title: '#',
    key: 'index',
    className: 'item-selected',
    render: (row: MapillaryItem) => h('span', { class: 'text-lg font-medium' }, row.index),
  },
  {
    title: 'Image',
    key: 'image',
    className: 'item-selected',
    render: (row: MapillaryItem) => h('img', {
      src: row.image.thumb_256_url,
      alt: `Mapillary image ${row.id}`,
      class: 'hover:cursor-pointer',
      onClick: () => store.updateItem(row.id, 'selected', !row.meta.selected),
    }),
  },
  {
    title: 'Metadata',
    key: 'metadata',
    render: (row: MapillaryItem) => h('div', { class: 'flex flex-col justify-start' }, [
      h('div', `Taken: ${new Date(row.image.captured_at).toLocaleString()}`),
      h('div', `Photo ID: ${row.image.id}`),
      h('div', [
        h('a', {
          href: row.image.thumb_original_url,
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-md text-blue-500 hover:underline',
        }, [
          'View image',
          h('i', { class: 'pi pi-external-link ml-1' }),
        ]),
      ]),
      h('div', [
        h('a', {
          href: `https://www.mapillary.com/app/?pKey=${row.id}&focus=photo`,
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-md text-blue-500 hover:underline',
        }, [
          'View on Mapillary',
          h('i', { class: 'pi pi-external-link ml-1' }),
        ]),
      ]),
    ]),
  },
]
</script>

<template>
  <div class="mt-4 mb-20">
    <MapillarySequenceInfo />

    <MapillarySelectedMessagePanel />
    <n-data-table
      :columns="columns"
      :checked-row-keys="store.selectedItemsKeys"
      :data="store.displayedItems"
      :row-key="(row: MapillaryItem) => row.id"
      :row-class-name="(row: MapillaryItem) => row.meta.selected ? 'row-selected-global' : ''"
      :pagination="{
        pageSize: 10,
        showSizePicker: true,
        pageSizes: [10, 25, 50]
      }"
      striped
      @update:checked-row-keys="store.updateSelected"
    />
  </div>
</template>
