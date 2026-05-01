<script setup lang="ts">
const store = useCollectionsStore()

const emit = defineEmits(['select:currentPage'])

const nthN = ref(2)

const ordinal = (n: number): string => {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`
  const mod10 = n % 10
  if (mod10 === 1) return `${n}st`
  if (mod10 === 2) return `${n}nd`
  if (mod10 === 3) return `${n}rd`
  return `${n}th`
}

const ordinalSuffix = (n: number): string => ordinal(n).slice(-2)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between items-center gap-4">
      <div class="flex items-center gap-4 w-auto flex-grow-0 flex-shrink-0">
        <SimpleMessage
          severity="info"
          :closable="false"
          icon="pi pi-info-circle"
        >
          Click on images to select
        </SimpleMessage>

        <span
          v-tooltip.bottom="
            store.isBatchLoading ? 'Controls disabled while images are being retrieved' : ''
          "
          class="inline-block"
        >
          <SelectButton
            v-model="store.viewMode"
            :options="[
              { label: 'List', value: 'list', icon: 'pi pi-list' },
              { label: 'Grid', value: 'grid', icon: 'pi pi-th-large' },
            ]"
            :allowEmpty="false"
            :disabled="store.isBatchLoading"
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
        </span>
      </div>

      <div class="flex items-center gap-4">
        <span class="text-base">
          <span class="text-green-600 font-medium">{{ store.selectedCount }}</span>
          selected
        </span>

        <span
          class="inline-block"
          v-tooltip.bottom="
            store.isBatchLoading ? 'Controls disabled while images are being retrieved' : ''
          "
        >
          <Button
            severity="primary"
            :disabled="store.selectedCount === 0 || store.isBatchLoading"
            @click="store.stepper = '3'"
            :label="store.selectedCount === 0 ? 'Select items' : 'Start editing'"
          />
        </span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <span class="text-md text-gray-600">Select</span>
      <Button
        class="hover-primary"
        severity="secondary"
        outlined
        label="All images"
        :disabled="store.isBatchLoading"
        @click="store.selectAll()"
      />
      <Button
        class="hover-primary"
        severity="secondary"
        outlined
        label="Current page"
        :disabled="store.isBatchLoading"
        @click="emit('select:currentPage')"
      />
      <Button
        v-if="store.selectedCount > 0"
        class="hover-danger-filled"
        severity="danger"
        outlined
        label="Deselect all"
        :disabled="store.isBatchLoading"
        @click="store.deselectAll()"
      />
    </div>

    <div class="flex items-center gap-3">
      <span class="text-md text-gray-600">Select every</span>
      <InputNumber
        v-model="nthN"
        :min="2"
        :max="store.totalImages"
        :step="1"
        size="small"
        show-buttons
        button-layout="horizontal"
        increment-button-icon="pi pi-plus"
        decrement-button-icon="pi pi-minus"
        :allow-empty="false"
        :use-grouping="false"
        input-class="w-20 text-center"
        :disabled="store.isBatchLoading"
      />
      <span class="text-md text-gray-600">-{{ ordinalSuffix(nthN) }} item and</span>
      <Button
        class="hover-primary"
        severity="secondary"
        outlined
        label="add them to selection"
        :disabled="nthN < 2 || store.isBatchLoading"
        @click="store.selectEveryNth(nthN, true)"
      />
      <i
        class="pi pi-info-circle text-gray-400 cursor-help"
        v-tooltip.right="`Selects every ${ordinal(nthN)} image in the sequence and adds it to the current selection.`"
      />
    </div>
  </div>
</template>

<style scoped>
:deep(.hover-primary:not(:disabled):hover) {
  background: var(--p-button-primary-background) !important;
  border-color: var(--p-button-primary-border-color) !important;
  color: var(--p-button-primary-color) !important;
}

:deep(.hover-danger-filled:not(:disabled):hover) {
  background: var(--p-button-danger-background) !important;
  border-color: var(--p-button-danger-border-color) !important;
  color: var(--p-button-danger-color) !important;
}
</style>
