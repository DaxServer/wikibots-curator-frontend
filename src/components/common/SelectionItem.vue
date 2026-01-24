<script setup lang="ts">
defineProps<{
  item: Item
  altPrefix: string
  layout: Layout
}>()

const store = useCollectionsStore()

const onToggleSelect = () => {
  store.updateItem(item.id, 'selected', !item.meta.selected)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Checkbox + Index header at top -->
    <div class="flex items-start gap-4 mb-4">
      <span class="text-4xl font-medium">{{ item.index }}</span>
      <Checkbox
        binary
        :modelValue="item.meta.selected"
        size="large"
        class="mt-2"
        @update:modelValue="(v: boolean) => store.updateItem(item.id, 'selected', v)"
      />
    </div>
    <!-- Metadata slot for remaining content -->
    <slot
      name="metadata"
      :item="item"
    />
  </div>
</template>
