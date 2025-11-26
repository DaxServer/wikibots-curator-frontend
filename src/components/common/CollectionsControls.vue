<script setup lang="ts">
const store = useCollectionsStore()

const emit = defineEmits(['select:currentPage'])

const menu = ref()
const menuItems = computed(() => [
  {
    label: 'All images',
    command: () => store.selectAll(),
  },
  {
    label: 'Current page',
    command: () => emit('select:currentPage'),
  },
  {
    separator: true,
  },
  {
    label: 'Deselect all',
    command: () => store.deselectAll(),
    disabled: store.selectedCount === 0,
    class: {
      'bg-red-100': store.selectedCount > 0,
    },
  },
])
</script>

<template>
  <div class="flex justify-between items-center mt-4 mb-4 gap-4">
    <div class="flex items-center gap-4 w-auto flex-grow-0 flex-shrink-0">
      <Message
        severity="info"
        :closable="false"
        icon="pi pi-info-circle"
      >
        Click on images to select
      </Message>

      <SelectButton
        v-model="store.viewMode"
        :options="[
          { label: 'List', value: 'list', icon: 'pi pi-list' },
          { label: 'Grid', value: 'grid', icon: 'pi pi-th-large' },
        ]"
        :allowEmpty="false"
        option-label="label"
        option-value="value"
        data-key="value"
        @update:model-value="store.viewMode = $event"
      >
        <template #option="{ option }">
          <i :class="option.icon" />
          <span>{{ option.label }}</span>
        </template>
      </SelectButton>
    </div>
    <div class="flex items-center gap-4">
      <span class="text-base">
        <span class="text-green-600 font-medium">{{ store.selectedCount }}</span>
        selected
      </span>
      <Menu
        ref="menu"
        :model="menuItems"
        :popup="true"
      ></Menu>
      <Button
        severity="secondary"
        outlined
        @click="menu.toggle($event)"
      >
        Select
        <i class="pi pi-chevron-down ml-2"></i>
      </Button>
      <Button
        severity="primary"
        :disabled="store.selectedCount === 0"
        @click="store.stepper = '3'"
        :label="store.selectedCount === 0 ? 'Select items' : 'Start editing'"
      />
    </div>
  </div>
</template>
