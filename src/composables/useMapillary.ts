export const useMapillary = () => {
  const store = useMapillaryStore()

  // Validation rules (stateless)
  const validationRules = {
    sequenceId: [
      { required: true, message: 'Please enter a sequence ID' },
      {
        pattern: /^[a-zA-Z0-9_-]+$/,
        message: 'Sequence ID can only contain letters, numbers, underscores, and hyphens',
      },
    ],
  }

  const validateSequenceId = (sequenceId: string): boolean => {
    // Clear previous error
    store.error = null

    const trimmed = sequenceId.trim()
    if (!trimmed) {
      store.error = 'Please enter a sequence ID'
      return false
    }
    const pattern = /^[a-zA-Z0-9_-]+$/
    if (!pattern.test(trimmed)) {
      store.error = 'Sequence ID can only contain letters, numbers, underscores, and hyphens'
      return false
    }
    return true
  }

  const loadSequence = async (): Promise<void> => {
    store.$reset()
    const sequenceId = store.sequenceId
    if (!validateSequenceId(sequenceId)) return

    store.isLoading = true
    store.error = null
    try {
      const response = await fetch(`/api/mapillary/sequence/${sequenceId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const mapillaryResponse = (await response.json()) as MapillaryApiResponse
      const items = mapillaryResponse.data.sort((a, b) => a.captured_at - b.captured_at)

      items.forEach((image, index) => {
        const date = new Date(image.captured_at).toISOString().split('T')[0]
        store.items.push({
          id: image.id,
          index: index + 1,
          image,
          meta: {
            title: `Photo from Mapillary ${date} (${image.id}).jpg`,
            description: {
              language: 'en',
              text: '',
            },
            categories: '',
            selected: false,
          },
        })
      })

      // Set creator username and id
      if (items[0]?.creator?.username) {
        store.creatorUsername = items[0].creator.username
        store.creatorId = items[0].creator.id
      }
    } catch (err) {
      store.error = err instanceof Error ? err.message : 'An unknown error occurred'
    } finally {
      store.isLoading = false
    }
  }

  return {
    loadSequence,
    validateSequenceId,
    validationRules,
  }
}
