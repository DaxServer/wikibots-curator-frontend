export const useBotsStore = defineStore('bots', () => {
  // State
  const isLoading = ref(false)
  const error = ref('')
  const bots = ref<Bot[]>([])
  const lastRefreshed = ref<Date | null>(null)
  const hasPendingJobs = ref(false)

  // Actions
  const setError = (errorMessage: string) => {
    error.value = errorMessage
  }

  const setBots = (newBots: Bot[]) => {
    bots.value = newBots
  }

  const setLastRefreshed = () => {
    lastRefreshed.value = new Date()
  }

  const setLoading = (_isLoading: boolean) => {
    isLoading.value = _isLoading
  }

  const updateHasPendingJobs = () => {
    hasPendingJobs.value = bots.value.some((bot) => bot.status.isPending)
  }

  // Watchers
  watch(bots, updateHasPendingJobs, { immediate: true })

  return {
    // State
    hasPendingJobs,
    error,
    isLoading,

    // Getters
    bots,
    lastRefreshed,

    // Actions
    setError,
    setBots,
    setLastRefreshed,
    setLoading,
  }
})

export default useBotsStore
