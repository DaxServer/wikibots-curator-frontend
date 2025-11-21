<script setup lang="ts">
defineProps<{
  altPrefix: string
}>()

const store = useCollectionsStore()

const headers = [
  { title: '#', key: 'index' },
  { title: 'Image', key: 'image' },
  { title: 'Metadata', key: 'metadata' },
]

const rowProps = ({ item }: { item: Item }) => {
  if (item.meta.selected) return { class: 'bg-green-lighten-5' }
  return {}
}

const onToggleSelect = (item: Item) => {
  store.updateItem(item.id, 'selected', !item.meta.selected)
}
</script>

<template>
  <template v-if="store.viewMode === 'list'">
    <div class="mt-4">
      <v-data-table
        :headers="headers"
        :items="store.displayedItems"
        :item-value="(item) => item.id"
        :row-props="rowProps"
        :items-per-page="store.itemsPerPage"
        :page="store.page"
      >
        <template #item.index="{ item }">
          <span class="text-h6 font-weight-medium">{{ item.index }}</span>
        </template>

        <template #item.image="{ item }">
          <v-img
            :src="item.image.thumbnail_url"
            :alt="`${altPrefix} ${item.id}`"
            class="cursor-pointer"
            @click="onToggleSelect(item)"
          />
        </template>

        <template #item.metadata="{ item }">
          <slot
            name="metadata"
            :item="item"
          />
        </template>

        <template #bottom>
          <IngestPagination
            :page="store.page"
            :items-per-page="store.itemsPerPage"
            :total-items="store.displayedItems.length"
            :per-page-options="[10, 25, 50]"
            @update:page="store.setPage"
            @update:items-per-page="store.setItemsPerPage"
          />
        </template>
      </v-data-table>
    </div>
  </template>

  <template v-else>
    <div class="mt-4">
      <v-data-iterator
        :items="store.displayedItems"
        :items-per-page="store.itemsPerPage"
        :page="store.page"
        :item-value="(item) => item.id"
      >
        <template #default="{ items }">
          <v-row>
            <v-col
              v-for="item in items"
              :key="item.raw.id"
              cols="12"
              sm="6"
              md="3"
            >
              <v-card :class="item.raw.meta.selected ? 'bg-green-lighten-5' : ''">
                <v-img
                  :src="item.raw.image.thumbnail_url"
                  :alt="`${altPrefix} ${item.raw.id}`"
                  class="cursor-pointer"
                  @click="onToggleSelect(item.raw)"
                />
                <v-card-text>
                  <div class="text-caption text-medium-emphasis mb-2"># {{ item.raw.index }}</div>
                  <slot
                    name="metadata"
                    :item="item.raw"
                  />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-data-iterator>
    </div>

    <IngestPagination
      :page="store.page"
      :items-per-page="store.itemsPerPage"
      :total-items="store.displayedItems.length"
      :per-page-options="[24, 48, 72]"
      @update:page="store.setPage"
      @update:items-per-page="store.setItemsPerPage"
    />
  </template>
</template>
