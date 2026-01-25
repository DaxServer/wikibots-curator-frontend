<script setup lang="ts">
defineEmits<{
  showErrorsOnly: [boolean]
}>()

const store = useCollectionsStore()
const { cancelTitleVerification } = useCommons()

const disablePreview = computed(() => {
  if (store.selectedCount === 0) return true
  return store.selectedItems.some(
    (i) =>
      i.meta.selected && i.meta.titleStatus && TITLE_ERROR_STATUSES.includes(i.meta.titleStatus),
  )
})

const onPreviewEdits = () => {
  cancelTitleVerification()
  store.stepper = '4'
}
</script>

<template>
  <div class="flex justify-between items-center">
    <Message
      severity="info"
      icon="pi pi-info-circle"
    >
      Displaying {{ store.showSelectedOnly ? 'only selected' : 'all' }} items
    </Message>
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-2 mr-2">
        <Checkbox
          @update:modelValue="$emit('showErrorsOnly', $event as boolean)"
          binary
          inputId="showErrors"
        />
        <label
          for="showErrors"
          class="cursor-pointer"
        >
          Show items with errors
        </label>
      </div>
      <Message
        v-if="store.itemsWithErrorsCount > 0"
        severity="error"
        icon="pi pi-exclamation-triangle"
      >
        {{ store.itemsWithErrorsCount }} item{{ store.itemsWithErrorsCount > 1 ? 's' : '' }}
        with errors
      </Message>
      <Button
        icon="pi pi-eye"
        icon-pos="left"
        label="Preview edits"
        :severity="disablePreview ? 'secondary' : 'primary'"
        :disabled="disablePreview"
        @click="onPreviewEdits"
      />
    </div>
  </div>
</template>
