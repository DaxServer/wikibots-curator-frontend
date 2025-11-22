export const useCollectionsStore = defineStore('collections', () => {
  const handler = ref<Handler>('mapillary')
  const input = ref<string>('')
  const creator = ref<Creator>({ id: '', username: '', profile_url: '' })

  const isLoading = ref(false)
  const isSDCLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const items = ref<Record<string, Item>>({})
  const isStatusChecking = ref<boolean>(false)
  const batchId = ref<string>('')
  const stepper = ref(1)

  const showSelectedOnly = ref<boolean>(true)
  const viewMode = ref<Layout>('list')
  const gridPage = ref<number>(1)
  const gridItemsPerPage = ref<number>(24)
  const page = ref<number>(1)
  const itemsPerPage = ref<number>(10)

  const globalDescription = ref<string>('')
  const globalLanguage = ref<string>('en')
  const globalCategories = ref<string>('')

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

  const selectPage = () => {
    const all = displayedItems.value
    const start = (page.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    const pageItems = all.slice(start, end)
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
    batchId.value = ''
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
    stepper.value = 1
    creator.value = { id: '', username: '', profile_url: '' }
  }

  const setHandler = (h: Handler) => {
    handler.value = h
  }

  const setInput = (v: string) => {
    input.value = v
  }

  const totalImages = computed(() => Object.values(items.value).length)
  const selectedItems = computed(() => Object.values(items.value).filter((i) => i.meta.selected))
  const selectedItemsKeys = computed(() => selectedItems.value.map((i) => i.id))
  const selectedCount = computed(() => selectedItems.value.length)
  const displayedItems = computed(() => {
    if (stepper.value === 2) {
      return Object.values(items.value)
    }
    return selectedCount.value > 0 && showSelectedOnly.value
      ? selectedItems.value
      : Object.values(items.value)
  })

  return {
    handler,
    input,
    creator,

    isLoading,
    isSDCLoading,
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
    displayedItems,
    totalImages,
    selectedCount,
    selectedItems,
    selectedItemsKeys,

    setLoading,
    setGlobalDescription,
    setGlobalLanguage,
    setGlobalCategories,
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
