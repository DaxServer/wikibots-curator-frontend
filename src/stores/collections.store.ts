import type { BatchItem, BatchUploadItem, Creator } from '@/types/asyncapi'
import type { Handler, Layout } from '@/types/collections'
import type { Item, MetadataKey, MetadataValue } from '@/types/image'
import { applyTitleTemplate } from '@/utils/titleTemplate'
import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'

export const useCollectionsStore = defineStore('collections', () => {
  const handler = ref<Handler>('mapillary')
  const input = ref<string>('tulzukst7vufhdo1e4z60f')
  const creator = ref<Creator>({ id: '', username: '', profile_url: '' })

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const items = ref<Record<string, Item>>({})
  const isStatusChecking = ref<boolean>(false)
  const batchId = ref<number | null>(null)
  const stepper = ref('1')

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
  const batchUploads = shallowRef<BatchUploadItem[]>([])

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const updateItem = (id: string, key: MetadataKey, value: MetadataValue) => {
    items.value[id]!.meta = {
      ...items.value[id]!.meta,
      [key]: value as unknown,
    } as Item['meta']
  }

  const updateSelected = (ids: (string | number)[]) => {
    Object.values(items.value).forEach((item) => {
      item.meta.selected = ids.includes(item.id)
    })
  }

  const selectAll = () => {
    Object.values(items.value).forEach((item) => {
      item.meta.selected = true
    })
  }

  const deselectAll = () => {
    Object.values(items.value).forEach((item) => {
      item.meta.selected = false
    })
  }

  const selectPage = (start: number, rows: number) => {
    const end = start + rows
    const pageItems = Object.values(items.value).slice(start, end)
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
    items.value = {}
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
    batchUploads.value = []
  }

  const setHandler = (h: Handler) => {
    handler.value = h
  }

  const setInput = (v: string) => {
    input.value = v
  }

  const totalImages = computed(() => Object.values(items.value).length)
  const selectedItems = computed(() =>
    Object.values(items.value)
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
    () => selectedItems.value.filter((i) => i.meta.titleStatus === 'taken').length,
  )
  const itemsWithExistingTitlesCount = computed(
    () => selectedItems.value.filter((i) => i.image.existing.length > 0).length,
  )

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
    batchUploads,

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
    $reset,
  }
})
