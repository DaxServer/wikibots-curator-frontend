<script setup lang="ts">
const props = defineProps<{ altPrefix: string }>()

const store = useCollectionsStore()
const { submitUpload, retryUploads, sendUnsubscribeBatch, startUploadProcess } = useCollections()
const { cancelTitleVerification } = useCommons()
const { itemsMissingCameraFields } = useTitleTemplate()
const { isDuplicateStatus } = useUploadStatus()

// --- Step 2 & 3 State & Logic ---
const showErrorsOnly = ref(false)
const dataViewPage = ref<DataViewPageEvent | null>(null)

const getRowsPerPage = computed(() => {
  if (store.stepper === '2') {
    return store.viewMode === 'grid' ? 24 : 10
  }
  return 10
})

const rowsPerPageOptions = computed(() => {
  if (store.stepper === '2') {
    return store.viewMode === 'grid' ? [24, 48, 72, 96] : [10, 25, 50, 100]
  }
  if (store.stepper === '3') {
    return [10, 20, 50]
  }
  if (store.stepper === '4') {
    const total = store.selectedItems.length
    const options = [10, 25, 50, 100]
    if (total > 0 && !options.includes(total)) {
      options.push(total)
    }
    return options.sort((a, b) => a - b)
  }
  return [10, 25, 50, 100]
})

const onSelectCurrentPage = () => {
  if (dataViewPage.value) {
    store.selectPage(dataViewPage.value.first, dataViewPage.value.rows)
  } else {
    store.selectPage(0, getRowsPerPage.value)
  }
}

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

// --- Step 5 State & Logic ---
const showSkeleton = ref(true)
const total = computed(() => Math.max(1, store.selectedItems.length))

const creationProgress = computed<MeterItem[]>(() => {
  const uploadRequested = store.selectedItems.filter(
    (item) => item.meta.status !== undefined,
  ).length

  return [
    {
      label: 'Queued',
      value: (uploadRequested * 100) / total.value,
      color: 'var(--p-surface-500)',
    },
  ]
})

const uploadProgress = computed<MeterItem[]>(() => {
  const successful = store.selectedItems.filter(
    (item) => item.meta.status === UPLOAD_STATUS.Completed,
  ).length
  const inProgress = store.selectedItems.filter(
    (item) => item.meta.status === UPLOAD_STATUS.InProgress,
  ).length
  const failed = store.selectedItems.filter(
    (item) => item.meta.status === UPLOAD_STATUS.Failed,
  ).length
  const duplicate = store.selectedItems.filter(
    (item) => item.meta.status && isDuplicateStatus(item.meta.status),
  ).length
  const queued = store.selectedItems.filter(
    (item) => item.meta.status === UPLOAD_STATUS.Queued,
  ).length

  return [
    { label: 'Successful', value: (successful * 100) / total.value, color: 'var(--p-green-500)' },
    { label: 'Duplicate', value: (duplicate * 100) / total.value, color: 'var(--p-fuchsia-800)' },
    { label: 'Failed', value: (failed * 100) / total.value, color: 'var(--p-red-500)' },
    { label: 'Processing', value: (inProgress * 100) / total.value, color: 'var(--p-blue-500)' },
    { label: 'Queued', value: (queued * 100) / total.value, color: 'var(--p-gray-300)' },
  ]
})

const canRetry = computed(() => {
  const hasFailed = store.selectedItems.some((item) => item.meta.status === UPLOAD_STATUS.Failed)
  const isCompleted = !store.selectedItems.some(
    (item) =>
      item.meta.status === UPLOAD_STATUS.InProgress || item.meta.status === UPLOAD_STATUS.Queued,
  )
  return hasFailed && !!store.batchId && isCompleted
})

const onRetry = () => {
  if (store.batchId) {
    retryUploads(store.batchId)
  }
}

const skeletonRows = computed<Item[]>(() =>
  Array.from(
    { length: 10 },
    (_, i) =>
      ({
        id: `skeleton-${i + 1}`,
        index: i + 1,
        isSkeleton: true,
        meta: {
          selected: false,
          description: { language: '', value: '' },
          categories: '',
        },
      }) as unknown as Item,
  ),
)

// --- Shared Computing ---
const currentItems = computed(() => {
  switch (store.stepper) {
    case '2':
      return store.itemsArray
    case '3':
      if (showErrorsOnly.value) {
        return store.selectedItems.filter(
          (i) => i.meta.titleStatus && TITLE_ERROR_STATUSES.includes(i.meta.titleStatus),
        )
      }
      return store.selectedItems
    case '4':
      return store.selectedItems
    case '5':
      return showSkeleton.value ? skeletonRows.value : store.selectedItems
    default:
      return []
  }
})

const currentLayout = computed(() => {
  if (store.stepper === '2') return store.viewMode
  return 'list'
})

// --- Lifecycle ---
watch(
  () => store.stepper,
  (newStep, oldStep) => {
    if (newStep === '5') {
      window.scroll({ top: 0, behavior: 'smooth' })
      showSkeleton.value = true
      setTimeout(() => {
        showSkeleton.value = false
        startUploadProcess()
      }, 100)
    }

    if (oldStep === '5') {
      sendUnsubscribeBatch()
    }

    if (newStep === '4') {
      window.scroll({ top: 0, behavior: 'smooth' })
    }
  },
)

onUnmounted(() => {
  if (store.stepper === '5') {
    sendUnsubscribeBatch()
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Step 3 specific top cards -->
    <template v-if="store.stepper === '3'">
      <TitleTemplateEditor />

      <Card class="bg-surface-100 border-l-4 border-blue-500">
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
          <DateCategorySetting class="mt-4" />
        </template>
      </Card>

      <SdcWarningMessage v-if="store.itemsWithExistingTitlesCount > 0" />

      <Message
        v-if="itemsMissingCameraFields.length > 0"
        severity="warn"
        icon="pi pi-exclamation-triangle"
      >
        {{ itemsMissingCameraFields.length }} item{{
          itemsMissingCameraFields.length > 1 ? 's' : ''
        }}
        missing camera fields used in template
      </Message>
    </template>

    <!-- Step 4 specific top info -->
    <template v-if="store.stepper === '4'">
      <Card class="bg-surface-100">
        <template #content>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <div class="text-xl font-bold">Preview</div>
              <span class="text-sm text-gray-500">
                displaying {{ store.selectedCount }} items to upload
              </span>
            </div>
            <Button
              severity="primary"
              :disabled="store.selectedCount === 0"
              @click="submitUpload"
            >
              <i class="pi pi-cloud-upload mr-2"></i>
              Upload
            </Button>
          </div>
        </template>
      </Card>

      <SdcWarningMessage v-if="store.itemsWithExistingTitlesCount > 0" />

      <SimpleMessage
        severity="info"
        icon="pi pi-info-circle"
      >
        The
        <span
          v-pre
          class="text-primary"
        >
          {{ Information }}
        </span>
        template will be populated from SDC
      </SimpleMessage>
    </template>

    <!-- Selection/Error info for Steps 2 & 3 -->
    <div
      v-if="['2', '3'].includes(store.stepper)"
      class="flex justify-between items-center"
    >
      <Message
        severity="info"
        icon="pi pi-info-circle"
      >
        Displaying {{ store.showSelectedOnly ? 'only selected' : 'all' }} items
      </Message>
      <div class="flex items-center gap-2">
        <template v-if="store.stepper === '3'">
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
        </template>
      </div>
    </div>

    <DataView
      :value="currentItems"
      data-key="id"
      :layout="currentLayout"
      :paginator="store.stepper !== '5'"
      :rows="getRowsPerPage"
      paginator-position="both"
      :always-show-paginator="false"
      :rows-per-page-options="rowsPerPageOptions"
      paginator-template="Rows RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport JumpToPageDropdown"
      current-page-report-template="Page {currentPage} of {totalPages}"
      @page="dataViewPage = $event"
      :pt="{
        pcPaginator: {
          root: {
            class: 'justify-end!',
          },
        },
      }"
    >
      <template #header>
        <div v-if="store.stepper === '2'">
          <CollectionsControls @select:current-page="onSelectCurrentPage" />
        </div>
        <div
          v-if="store.stepper === '5'"
          class="flex flex-col gap-3"
        >
          <div class="flex items-center justify-between">
            <span class="text-xl font-bold">
              {{ store.isBatchCreated ? 'Upload status' : 'Queueing uploads...' }}
            </span>
            <Button
              v-if="canRetry"
              icon="pi pi-refresh"
              severity="danger"
              label="Retry Failed"
              @click="onRetry"
              size="small"
            />
          </div>
          <MeterGroup :value="store.isBatchCreated ? uploadProgress : creationProgress" />
        </div>
      </template>

      <template #empty>
        <Message
          severity="info"
          icon="pi pi-info-circle"
        >
          No items to display
        </Message>
      </template>

      <template #grid="slotProps">
        <div
          v-if="store.stepper === '2'"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <SelectionItem
            v-for="item in slotProps.items"
            :key="item.id"
            :item="item"
            :alt-prefix="altPrefix"
            layout="grid"
          >
            <template #metadata="itemProps">
              <slot
                name="metadata"
                :item="itemProps.item"
              />
            </template>
          </SelectionItem>
        </div>
      </template>

      <template #list="slotProps">
        <div class="flex flex-col">
          <template
            v-for="item in slotProps.items"
            :key="item.id"
          >
            <CollectionItem
              :item="item"
              :alt-prefix="altPrefix"
            >
              <!-- Step 2: Metadata slot -->
              <template #metadata="slotPropsInner">
                <slot
                  name="metadata"
                  :item="slotPropsInner.item"
                />
              </template>

              <!-- Step 3: Edit content slots -->
              <template #edit-content-top="slotPropsInner">
                <EditContentTop
                  :item="slotPropsInner.item"
                  :altPrefix="altPrefix"
                />
              </template>
              <template #edit-content-right="slotPropsInner">
                <EditContentRight
                  :item="slotPropsInner.item"
                  :altPrefix="altPrefix"
                />
              </template>
              <template #edit-content-bottom="slotPropsInner">
                <EditContentBottom
                  :item="slotPropsInner.item"
                  :altPrefix="altPrefix"
                />
              </template>

              <!-- Step 4: Preview content -->
              <template #preview-content="slotPropsInner">
                <PreviewContent
                  :item="slotPropsInner.item"
                  :altPrefix="altPrefix"
                />
              </template>

              <!-- Step 5: Status content -->
              <template #status-content="slotPropsInner">
                <StatusContent
                  :item="slotPropsInner.item"
                  :showSkeleton="showSkeleton"
                />
              </template>
            </CollectionItem>
          </template>
        </div>
      </template>
    </DataView>
  </div>
</template>
