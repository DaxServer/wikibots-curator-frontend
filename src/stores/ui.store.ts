export const useUiStore = defineStore('ui', () => {
  const activeTab = ref<string>('mapillary')

  const setActiveTab = (v: string | number) => {
    activeTab.value = typeof v === 'number' ? String(v) : v
  }

  return {
    activeTab,
    setActiveTab,
  }
})
