export const useHarborStore = defineStore('harbor', () => {
  // State
  const loading = ref(false)
  const error = ref('')
  const processes = ref<Process[]>([])

  // Getters
  const hasProcesses = computed(() => processes.value.length > 0)

  // Actions
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (errorMessage: string) => {
    error.value = errorMessage
  }

  const setProcesses = (newProcesses: Process[]) => {
    processes.value = newProcesses
  }

  return {
    // State
    loading,
    error,
    processes,

    // Getters
    hasProcesses,

    // Actions
    setLoading,
    setError,
    setProcesses,
  }
})

export default useHarborStore
