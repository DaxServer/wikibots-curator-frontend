import type { BatchItem, BatchUploadItem, Creator } from '@/types/asyncapi'
import type { Handler, Layout } from '@/types/collections'
import type { Item, Metadata, MetadataKey } from '@/types/image'
import { applyTitleTemplate } from '@/utils/titleTemplate'
import { defineStore } from 'pinia'
import { computed, reactive, ref, shallowRef } from 'vue'

export const useCollectionsStore = defineStore('collections', () => {
  const handler = ref<Handler>('mapillary')
  const input = ref<string>('')
  const creator = ref<Creator>({ id: '', username: '', profile_url: '' })

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const items = reactive<Record<string, Item>>({})
  const isStatusChecking = ref<boolean>(false)
  const batchId = ref<number | null>(null)
  const stepper = ref('1')
  const isBatchLoading = ref(false)
  const batchLoadingStatus = ref<string | null>(null)
  const totalImageIds = ref<string[]>([])
  const uploadSliceIndex = ref(0)

  const showSelectedOnly = ref<boolean>(true)
  const viewMode = ref<Layout>('list')
  const gridPage = ref<number>(1)
  const gridItemsPerPage = ref<number>(24)
  const page = ref<number>(1)
  const itemsPerPage = ref<number>(10)

  const globalDescription = ref<string>('')
  const globalLanguage = ref<string>('en')
  const globalCategories = ref<string>('')
  const globalLicense = ref<string>('')
  const globalTitleTemplate = ref<string>('')

  // Batches state
  const batches = shallowRef<BatchItem[]>([])
  const batchesTotal = ref<number>(0)
  const batchesLoading = ref(false)
  const batch = ref<BatchItem>()
  const batchUploads = shallowRef<BatchUploadItem[]>([])
  const batchUploadsLoading = ref(false)
  const currentBatchId = ref<number | null>(null)
  const batchesFilter = ref([
    { label: 'My uploads', value: 'my' },
    { label: 'All uploads', value: 'all' },
  ])
  const batchesSelectedFilter = ref(batchesFilter.value[0])
  const batchesFilterText = ref('')
  const batchesParams = ref({
    first: 0,
    rows: 100,
    page: 1,
  })

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const clearItems = () => {
    for (const id in items) {
      delete items[id]
    }
  }

  const replaceItems = (nextItems: Record<string, Item>) => {
    clearItems()
    for (const id in nextItems) {
      items[id] = nextItems[id] as Item
    }
  }

  const updateItem = <K extends MetadataKey>(id: string, key: K, value: Metadata[K]) => {
    items[id]!.meta[key] = value
  }

  const updateSelected = (ids: (string | number)[]) => {
    const idsSet = new Set(ids)
    for (const id in items) {
      const item = items[id]
      if (!item) continue
      item.meta.selected = idsSet.has(item.id)
    }
  }

  const selectAll = () => {
    for (const id in items) {
      const item = items[id] as Item
      item.meta.selected = true
    }
  }

  const deselectAll = () => {
    for (const id in items) {
      const item = items[id] as Item
      item.meta.selected = false
    }
  }

  const selectPage = (start: number, rows: number) => {
    const end = start + rows
    const pageItems = Object.values(items).slice(start, end)
    pageItems.forEach((item) => {
      item.meta.selected = true
    })
  }

  const setGlobalDescription = (value: string) => {
    globalDescription.value = value
  }

  const setGlobalLanguage = (value: string) => {
    globalLanguage.value = value
  }

  const setGlobalCategories = (value: string) => {
    globalCategories.value = value
  }

  const setGlobalLicense = (value: string) => {
    globalLicense.value = value
  }

  const setGlobalTitleTemplate = (value: string) => {
    globalTitleTemplate.value = value
  }

  const setViewMode = (mode: Layout) => {
    viewMode.value = mode
  }

  const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'list' ? 'grid' : 'list'
  }

  const setGridPage = (p: number) => {
    gridPage.value = p
  }

  const setGridItemsPerPage = (n: number) => {
    gridItemsPerPage.value = n
  }

  const setPage = (p: number) => {
    page.value = p
  }

  const setItemsPerPage = (n: number) => {
    itemsPerPage.value = n
  }

  const $reset = () => {
    clearItems()
    error.value = null
    batchId.value = null
    isStatusChecking.value = false
    isLoading.value = false
    showSelectedOnly.value = true
    viewMode.value = 'list'
    gridPage.value = 1
    gridItemsPerPage.value = 12
    page.value = 1
    itemsPerPage.value = 10
    globalDescription.value = ''
    globalLanguage.value = 'en'
    globalCategories.value = ''
    globalLicense.value = ''
    stepper.value = '1'
    globalTitleTemplate.value = ''
    creator.value = { id: '', username: '', profile_url: '' }
    batches.value = []
    batchesTotal.value = 0
    batchesLoading.value = false
    batch.value = undefined
    batchUploads.value = []
    batchUploadsLoading.value = false
    currentBatchId.value = null
    isBatchLoading.value = false
    batchLoadingStatus.value = null
    totalImageIds.value = []
    uploadSliceIndex.value = 0
  }

  const resetBatches = () => {
    batches.value = []
    batchesTotal.value = 0
    batchesLoading.value = false
    batchesSelectedFilter.value = batchesFilter.value[0]
    batchesFilterText.value = ''
    batchesParams.value = {
      first: 0,
      rows: 100,
      page: 1,
    }
  }

  const setHandler = (h: Handler) => {
    handler.value = h
  }

  const setInput = (v: string) => {
    input.value = v
  }

  const totalImages = computed(() => Object.keys(items).length)
  const selectedItems = computed(() =>
    Object.values(items)
      .filter((i) => i.meta.selected)
      .map((i) => {
        if (i.meta.title) return i
        return {
          ...i,
          meta: {
            ...i.meta,
            title: applyTitleTemplate(globalTitleTemplate.value, i.image, input.value),
          },
        }
      }),
  )
  const selectedItemsKeys = computed(() => selectedItems.value.map((i) => i.id))
  const selectedCount = computed(() => selectedItems.value.length)
  const itemsWithErrorsCount = computed(
    () =>
      selectedItems.value.filter(
        (i) => i.meta.titleStatus === 'taken' || i.meta.titleStatus === 'blacklisted',
      ).length,
  )
  const itemsWithExistingTitlesCount = computed(
    () => selectedItems.value.filter((i) => i.image.existing.length > 0).length,
  )
  const loadedCount = computed(() => {
    let count = 0
    for (const id in items) {
      const item = items[id] as Item
      if (!item.isSkeleton) count += 1
    }
    return count
  })
  const batchProgress = computed(() => {
    if (totalImageIds.value.length === 0) return 0
    return Math.round((loadedCount.value / totalImageIds.value.length) * 100)
  })

  return {
    handler,
    input,
    creator,
    isLoading,
    error,
    items,
    isStatusChecking,
    batchId,
    stepper,
    showSelectedOnly,
    viewMode,
    gridPage,
    gridItemsPerPage,
    page,
    itemsPerPage,
    globalDescription,
    globalLanguage,
    globalCategories,
    globalLicense,
    globalTitleTemplate,
    totalImages,
    selectedCount,
    selectedItems,
    selectedItemsKeys,
    itemsWithErrorsCount,
    itemsWithExistingTitlesCount,
    batches,
    batchesTotal,
    batchesLoading,
    batch,
    batchUploads,
    batchUploadsLoading,
    currentBatchId,
    batchesFilter,
    batchesSelectedFilter,
    batchesFilterText,
    batchesParams,
    isBatchLoading,
    batchLoadingStatus,
    totalImageIds,
    batchProgress,
    loadedCount,
    uploadSliceIndex,

    setLoading,
    setGlobalDescription,
    setGlobalLanguage,
    setGlobalCategories,
    setGlobalLicense,
    setGlobalTitleTemplate,
    updateItem,
    updateSelected,
    selectAll,
    deselectAll,
    selectPage,
    setViewMode,
    toggleViewMode,
    setGridPage,
    setGridItemsPerPage,
    setPage,
    setItemsPerPage,
    setHandler,
    setInput,
    replaceItems,
    resetBatches,
    $reset,
  }
})
