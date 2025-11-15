export const useMapillaryStore = defineStore('mapillary', () => {
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const items = ref<Record<string, MapillaryItem>>({})
  const sequenceId = ref<string>('tulzukst7vufhdo1e4z60f')
  const creatorUsername = ref<string>('')
  const creatorId = ref<string>('')
  const isStatusChecking = ref<boolean>(false)
  const batchId = ref<string>('')

  const stepper = ref('1')

  // List view preferences
  // When true, the list view will show only selected items by default
  const showSelectedOnly = ref<boolean>(true)

  // Global batch inputs (persisted in store, not copied in components)
  const globalDescription = ref<string>('')
  const globalLanguage = ref<string>('en')
  const globalCategories = ref<string>('')

  // Actions
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const updateItem = (id: string, key: MetadataKey, value: MetadataValue) => {
    const meta = items.value[id]!.meta
    items.value[id]!.meta = {
      ...meta,
      [key]: value,
    }
  }

  const updateSelected = (ids: (string | number)[]) => {
    Object.values(items.value).forEach((item) => {
      item.meta.selected = ids.includes(item.id)
    })
  }

  // Global inputs setters
  const setGlobalDescription = (value: string) => {
    globalDescription.value = value
  }

  const setGlobalLanguage = (value: string) => {
    globalLanguage.value = value
  }

  const setGlobalCategories = (value: string) => {
    globalCategories.value = value
  }

  const $reset = () => {
    items.value = {}
    error.value = null
    creatorUsername.value = ''
    creatorId.value = ''
    batchId.value = ''
    isStatusChecking.value = false
    isLoading.value = false
    showSelectedOnly.value = true
    globalDescription.value = ''
    globalLanguage.value = 'en'
    globalCategories.value = ''
  }

  // Getters
  const totalImages = computed(() => Object.values(items.value).length)
  const hasSequence = computed(() => totalImages.value > 0)
  const selectedItems = computed(() => Object.values(items.value).filter((i) => i.meta.selected))
  const selectedItemsKeys = computed(() => selectedItems.value.map((i) => i.id))
  const selectedCount = computed(() => selectedItems.value.length)
  const displayedItems = computed(() => {
    // select
    if (stepper.value === '2') {
      return Object.values(items.value)
    }

    return selectedCount.value > 0 && showSelectedOnly.value
      ? selectedItems.value
      : Object.values(items.value)
  })
  const displayRows = computed(() => (stepper.value === '2' ? 5 : 5))

  return {
    // State
    isLoading,
    error,
    items,
    sequenceId,
    creatorUsername,
    creatorId,
    batchId,
    isStatusChecking,
    globalDescription,
    globalLanguage,
    globalCategories,
    showSelectedOnly,
    displayedItems,
    displayRows,
    stepper,

    // Getters
    totalImages,
    hasSequence,
    selectedCount,
    selectedItems,
    selectedItemsKeys,

    // Actions
    setLoading,
    setGlobalDescription,
    setGlobalLanguage,
    setGlobalCategories,
    updateItem,
    updateSelected,
    $reset,
  }
})
