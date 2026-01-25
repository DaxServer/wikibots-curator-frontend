<script setup lang="ts">
defineProps<{
  filterText: string
  filterInfo?: string
  searchPlaceholder: string
  searchId: string
  loading?: boolean
}>()

defineEmits<{
  'update:filterText': [value: string]
  clear: []
  search: []
}>()
</script>

<template>
  <div
    class="flex items-center"
    :class="{
      'justify-between': filterText,
      'justify-end': !filterText,
    }"
  >
    <div
      v-if="filterText"
      class="text-sm text-gray-600"
    >
      Filtering by:
      <span class="font-semibold">"{{ filterText }}"</span>
      <span
        v-if="filterInfo"
        class="ml-2"
      >
        {{ filterInfo }}
      </span>
    </div>
    <SearchInput
      :model-value="filterText"
      :placeholder="searchPlaceholder"
      :id="searchId"
      :loading="loading"
      @update:model-value="$emit('update:filterText', $event)"
      @clear="$emit('clear')"
      @enter="$emit('search')"
    />
  </div>
</template>
