<script lang="ts" setup>
const store = useMapillaryStore()

const headers = [
  { title: '#', key: 'index' },
  { title: 'Image', key: 'image' },
  { title: 'Metadata', key: 'metadata' },
]

const rowProps = ({ item }: { item: MapillaryItem }) => {
  if (item.meta.selected) {
    return { class: 'bg-green-lighten-5' }
  }
}
</script>

<template>
  <div class="mt-4 mb-20">
    <MapillarySequenceInfo />

    <MapillarySelectedMessagePanel />

    <template v-if="store.viewMode === 'list'">
      <v-data-table
        :headers="headers"
        :items="store.displayedItems"
        v-model:items-per-page="store.itemsPerPage"
        v-model:page="store.page"
        :item-value="(item) => item.id"
        :row-props="rowProps"
      >
        <template #item.index="{ item }">
          <span class="text-h6 font-weight-medium">{{ item.index }}</span>
        </template>

        <template #item.image="{ item }">
          <div
            class="cursor-pointer"
            @click="store.updateItem(item.id, 'selected', !item.meta.selected)"
          >
            <v-img
              :src="item.image.thumb_256_url"
              :alt="`Mapillary image ${item.id}`"
            />
          </div>
        </template>

        <template #item.metadata="{ item }">
          <MapillaryMetadata :item="item" />
        </template>

        <template #bottom>
          <MapillaryPagination
            :page="store.page"
            :items-per-page="store.itemsPerPage"
            :total-items="store.displayedItems.length"
            @update:page="store.setPage"
            @update:items-per-page="store.setItemsPerPage"
          />
        </template>
      </v-data-table>
    </template>

    <template v-else>
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
                  :src="item.raw.image.thumb_256_url"
                  :alt="`Mapillary image ${item.raw.id}`"
                  class="cursor-pointer"
                  @click="store.updateItem(item.raw.id, 'selected', !item.raw.meta.selected)"
                />
                <v-card-text>
                  <div class="text-caption text-medium-emphasis mb-2"># {{ item.raw.index }}</div>
                  <MapillaryMetadata :item="item.raw" />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-data-iterator>

      <MapillaryPagination
        :page="store.page"
        :items-per-page="store.itemsPerPage"
        :total-items="store.displayedItems.length"
        :per-page-options="[24, 48, 72]"
        @update:page="store.setPage"
        @update:items-per-page="store.setItemsPerPage"
      />
    </template>
  </div>
</template>
