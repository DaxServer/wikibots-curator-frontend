<script setup lang="ts">
defineProps<{
  items: Item[]
  viewMode: Layout
  itemsPerPage: number
  page: number
  imageUrl: (item: Item) => string
  onToggleSelect: (id: string, next: boolean) => void
  altPrefix: string
}>()

const emit = defineEmits<{
  'update:page': [number]
  'update:itemsPerPage': [number]
}>()

const headers = [
  { title: '#', key: 'index' },
  { title: 'Image', key: 'image' },
  { title: 'Metadata', key: 'metadata' },
]

const rowProps = ({ item }: { item: Item }) => {
  if (item.meta.selected) return { class: 'bg-green-lighten-5' }
  return {}
}
</script>

<template>
  <template v-if="viewMode === 'list'">
    <div class="mt-4">
      <v-data-table
        :headers="headers"
        :items="items"
        :item-value="(item) => item.id"
        :row-props="rowProps"
        :items-per-page="itemsPerPage"
        :page="page"
      >
        <template #item.index="{ item }">
          <span class="text-h6 font-weight-medium">{{ item.index }}</span>
        </template>

      <template #item.image="{ item }">
        <div class="cursor-pointer" @click="onToggleSelect(item.id, !item.meta.selected)">
          <v-img :src="imageUrl(item)" :alt="`${altPrefix} ${item.id}`" />
        </div>
      </template>

        <template #item.metadata="{ item }">
          <slot name="metadata" :item="item" />
        </template>

        <template #bottom>
          <IngestPagination
            :page="page"
            :items-per-page="itemsPerPage"
            :total-items="items.length"
            :per-page-options="[10, 25, 50]"
            @update:page="emit('update:page', $event)"
            @update:items-per-page="emit('update:itemsPerPage', $event)"
          />
        </template>
      </v-data-table>
    </div>
  </template>

  <template v-else>
    <div class="mt-4">
      <v-data-iterator :items="items" :items-per-page="itemsPerPage" :page="page" :item-value="(item) => item.id">
        <template #default="{ items }">
          <v-row>
            <v-col v-for="item in items" :key="item.raw.id" cols="12" sm="6" md="3">
              <v-card :class="item.raw.meta.selected ? 'bg-green-lighten-5' : ''">
              <v-img :src="imageUrl(item.raw)" :alt="`${altPrefix} ${item.raw.id}`" class="cursor-pointer" @click="onToggleSelect(item.raw.id, !item.raw.meta.selected)" />
                <v-card-text>
                  <div class="text-caption text-medium-emphasis mb-2"># {{ item.raw.index }}</div>
                  <slot name="metadata" :item="item.raw" />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-data-iterator>
    </div>

    <IngestPagination
      :page="page"
      :items-per-page="itemsPerPage"
      :total-items="items.length"
      :per-page-options="[24, 48, 72]"
      @update:page="emit('update:page', $event)"
      @update:items-per-page="emit('update:itemsPerPage', $event)"
    />
  </template>
</template>
