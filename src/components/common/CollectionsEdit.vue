<script setup lang="ts">
defineProps<{ altPrefix: string }>()

const store = useCollectionsStore()
const { cancelTitleVerification } = useCommons()

const showErrorsOnly = ref(false)

const displayedItems = computed(() => {
  if (showErrorsOnly.value) {
    return store.selectedItems.filter(
      (i) => i.meta.titleStatus && TITLE_ERROR_STATUSES.includes(i.meta.titleStatus),
    )
  }
  return store.selectedItems
})

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
  <div class="flex flex-col gap-6">
    <TitleTemplateEditor />

    <Card class="bg-gray-100 border-l-4 border-blue-500">
      <template #title>Fallbacks</template>
      <template #content>
        <ItemInputs
          class="mt-2"
          :language="store.globalLanguage"
          :description="store.globalDescription"
          :categories="store.globalCategories"
          :license="store.globalLicense"
          @update:language="(v: string) => (store.globalLanguage = v)"
          @update:description="(v: string) => (store.globalDescription = v)"
          @update:categories="(v: string) => (store.globalCategories = v)"
          @update:license="(v: string) => (store.globalLicense = v)"
        >
          <template #description-help>
            <div class="flex flex-col gap-4">
              <div class="inline-flex flex-none">
                <SimpleMessage
                  severity="info"
                  variant="simple"
                  size="small"
                  icon="pi pi-info-circle"
                >
                  Will be applied to all selected images
                  <span class="underline">only as a fallback</span>
                </SimpleMessage>
              </div>
            </div>
          </template>
        </ItemInputs>
      </template>
    </Card>

    <SdcWarningMessage v-if="store.itemsWithExistingTitlesCount > 0" />

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
            v-model="showErrorsOnly"
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
          {{ store.itemsWithErrorsCount }} item{{ store.itemsWithErrorsCount > 1 ? 's' : '' }} with
          errors
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

    <DataView
      :value="displayedItems"
      :paginator="true"
      :rows="10"
      layout="list"
      paginator-position="both"
      :always-show-paginator="false"
      :rows-per-page-options="[10, 20, 50]"
      paginator-template="Rows RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport JumpToPageDropdown"
      current-page-report-template="Page {currentPage} of {totalPages}"
      :pt="{
        pcPaginator: {
          root: {
            class: 'justify-end!',
          },
        },
      }"
    >
      <template #list="slotProps">
        <div class="flex flex-col">
          <EditItem
            v-for="item in slotProps.items"
            :key="item.id"
            class="flex flex-col p-4 py-8 border-l-4"
            :class="{
              'border-green-600': item.meta.titleStatus === TITLE_STATUS.Available,
              'border-red-500':
                item.meta.titleStatus && TITLE_ERROR_STATUSES.includes(item.meta.titleStatus),
              'border-gray-200': item.meta.titleStatus === undefined,
              'border-yellow-500':
                item.meta.titleStatus === TITLE_STATUS.Unknown ||
                (item.image.existing.length > 0 &&
                  item.meta.titleStatus === TITLE_STATUS.Available),
            }"
            :item="item"
            :altPrefix="altPrefix"
          />
        </div>
      </template>

      <template #empty>
        <Message
          severity="error"
          icon="pi pi-info-circle"
        >
          No items to display
        </Message>
      </template>
    </DataView>
  </div>
</template>
