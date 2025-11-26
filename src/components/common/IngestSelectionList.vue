<script setup lang="ts">
defineProps<{
  altPrefix: string
}>()

const store = useCollectionsStore()

const page = ref<DataViewPageEvent | null>(null)

const getRowClass = computed(() => (data: Item) => {
  return data.meta.selected ? 'bg-green-100!' : ''
})

const getRowsPerPage = computed(() => {
  return store.viewMode === 'grid' ? 24 : 10
})

const rowsPerPageOptions = computed(() =>
  store.viewMode === 'grid' ? [24, 48, 72, 96] : [10, 25, 50, 100],
)

const onToggleSelect = (item: Item) => {
  store.updateItem(item.id, 'selected', !item.meta.selected)
}

const onSelectCurrentPage = () => {
  if (page.value) {
    store.selectPage(page.value.first, page.value.rows)
  } else {
    store.selectPage(0, getRowsPerPage.value)
  }
}
</script>

<template>
  <DataView
    :value="store.displayedItems"
    data-key="id"
    :layout="store.viewMode"
    paginator
    :rows="getRowsPerPage"
    paginator-position="both"
    :alwaysShowPaginator="false"
    :rows-per-page-options="rowsPerPageOptions"
    paginator-template="Rows RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport JumpToPageDropdown"
    current-page-report-template="Page {currentPage} of {totalPages}"
    @page="page = $event"
  >
    <template #header>
      <CollectionsControls @select:current-page="onSelectCurrentPage" />
    </template>

    <template #grid="slotProps">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          v-for="item in slotProps.items"
          :key="item.id"
          :class="getRowClass(item)"
        >
          <template #content>
            <Image
              :src="item.image.thumbnail_url"
              :alt="`${altPrefix} ${item.id}`"
              class="cursor-pointer w-full"
              @click.stop="onToggleSelect(item)"
            />
            <slot
              name="metadata"
              :item="item"
            />
          </template>
        </Card>
      </div>
    </template>

    <template #list="slotProps">
      <div class="flex flex-col">
        <div
          v-for="item in slotProps.items"
          :key="item.id"
          class="flex justify-between p-4"
          :class="getRowClass(item)"
        >
          <slot
            name="metadata"
            :item="item"
          />
          <Image
            :src="item.image.preview_url"
            :alt="`${altPrefix} ${item.id}`"
            class="cursor-pointer max-w-3xl"
            @click.stop="onToggleSelect(item)"
          />
        </div>
      </div>
    </template>
  </DataView>
</template>
