export const useMapillaryStore = defineStore('mapillary', () => {
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const items = ref<MapillaryItem[]>([])
  const sequenceId = ref<string>('tulzukst7vufhdo1e4z60f')
  const creatorUsername = ref<string>('')
  const creatorId = ref<string>('')

  const layout = ref<Layout>('grid')
  const layoutOptions = ref<{ name: string; value: Layout }[]>([
    { name: 'Select', value: 'grid' },
    { name: 'Edit', value: 'list' },
  ])

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
    const meta = items.value.find((img) => img.image.id === id)!.meta as Record<
      MetadataKey,
      MetadataValue
    >
    meta[key] = value
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
    items.value = []
    error.value = null
    creatorUsername.value = ''
    creatorId.value = ''
    isLoading.value = false
    layout.value = 'grid'
    showSelectedOnly.value = true
    globalDescription.value = ''
    globalLanguage.value = 'en'
    globalCategories.value = ''
  }

  // Getters
  const getItem = (id: string) => items.value.find((img) => img.image.id === id)!
  const totalImages = computed(() => items.value.length)
  const hasSequence = computed(() => totalImages.value > 0)
  const selectedItems = computed(() => items.value.filter((i) => i.meta.selected))
  const selectedCount = computed(() => selectedItems.value.length)
  const displayedItems = computed(() => {
    if (layout.value === 'grid') {
      return items.value
    }

    return selectedCount.value > 0 && showSelectedOnly.value ? selectedItems.value : items.value
  })
  const displayRows = computed(() => (layout.value === 'list' ? 5 : 50))

  return {
    // State
    isLoading,
    error,
    items,
    sequenceId,
    creatorUsername,
    creatorId,
    globalDescription,
    globalLanguage,
    globalCategories,
    layout,
    layoutOptions,
    showSelectedOnly,
    displayedItems,
    displayRows,

    // Getters
    getItem,
    totalImages,
    hasSequence,
    selectedCount,
    selectedItems,

    // Actions
    setLoading,
    setGlobalDescription,
    setGlobalLanguage,
    setGlobalCategories,
    updateItem,
    $reset,
  }
})
