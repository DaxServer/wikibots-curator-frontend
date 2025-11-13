export const useMapillary = () => {
  const store = useMapillaryStore()
  let poller: number | null = null

  const stopPolling = () => {
    if (poller !== null) {
      clearInterval(poller)
      poller = null
    }
    store.isStatusChecking = false
  }
  const startPolling = (batchId: string) => {
    const statusCheck = async () => {
      store.isStatusChecking = true
      const resp = await fetch(`/api/mapillary/uploads/${batchId}`).catch(() => null)
      if (!resp || !resp.ok) {
        store.isStatusChecking = false
        return
      }
      const updates = (await resp.json()) as {
        image_id: string
        status: UploadStatus
        error?: string
      }[]
      for (const u of updates) {
        store.updateItem(u.image_id, 'status', u.status)
        if (u.status === 'failed') {
          store.updateItem(u.image_id, 'statusReason', u.error ?? '')
        }
      }
      const done = store.selectedItems.every(
        (i) => i.meta.status === 'completed' || i.meta.status === 'failed',
      )
      store.isStatusChecking = false
      if (done) stopPolling()
    }
    poller = setInterval(statusCheck, 5000) as unknown as number
    void statusCheck()
  }

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
      const response = await fetch(`/api/mapillary/sequences/${sequenceId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const mapillaryResponse = (await response.json()) as MapillaryApiResponse

      // Set creator username and id
      store.creatorUsername = mapillaryResponse.creator.username
      store.creatorId = mapillaryResponse.creator.id

      const allItems: Record<string, MapillaryItem> = {}
      Object.entries(mapillaryResponse.images).forEach(([id, image], index) => {
        const date = new Date(image.captured_at).toISOString().split('T')[0]!
        allItems[id] = {
          id,
          index: index + 1,
          image: {
            ...image,
          },
          sdc: [],
          meta: {
            title: `Photo from Mapillary ${date} (${id}).jpg`,
            description: {
              language: 'en',
              text: 'Photo from Mapillary',
            },
            categories: '',
            selected: false,
          },
        }
      })
      store.items = allItems

      store.stepper = '2'
    } catch (err) {
      store.error = err instanceof Error ? err.message : 'An unknown error occurred'
    } finally {
      store.isLoading = false
    }
  }

  const loadSDC = async (): Promise<void> => {
    store.isLoading = true
    store.error = null
    try {
      const params = new URLSearchParams()
      for (const item of store.selectedItems) {
        params.append('images', item.id)
      }
      const response = await fetch(
        `/api/mapillary/sequences/${store.sequenceId}/sdc?${params.toString()}`,
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const mapillaryResponse = (await response.json()) as Record<string, Statement[]>
      Object.entries(mapillaryResponse).forEach(([id, sdc]) => {
        store.items[id]!.sdc = sdc
      })
    } catch (err) {
      store.error = err instanceof Error ? err.message : 'An unknown error occurred'
    } finally {
      store.isLoading = false
    }
  }

  const wikitext = (item: MapillaryItem): string => {
    const { id, meta } = item
    let { title, description, categories } = meta

    if (title.trim() === '') {
      title = `Photo from Mapillary ${new Date(item.image.captured_at).toISOString().split('T')[0]} (${id}).jpg`
    }

    if (description.text.trim() === '') {
      if (store.globalDescription.trim() === '') {
        description = {
          language: 'en',
          text: 'Photo from Mapillary',
        }
      } else {
        description = {
          language: store.globalLanguage,
          text: store.globalDescription,
        }
      }
    }

    if (categories.trim() === '') {
      categories = store.globalCategories
    }

    return `== {{int:filedesc}} ==
{{Information
 | description = {{${description.language}|1=${description.text}}}
 | date        = {{Taken on|${new Date(item.image.captured_at).toISOString().split('T')[0]}}}
 | source      = {{Mapillary-source|key=${id}}} Sequence ID: ${store.sequenceId}
 | author      = [http://www.mapillary.com/app/user/${store.creatorUsername} ${store.creatorUsername}]
}}
{{Location|${item.image.geometry.coordinates[1].toFixed(6)}|${item.image.geometry.coordinates[0].toFixed(6)}|heading:${item.image.compass_angle.toFixed(2)}}}
${item.image.is_pano ? '{{Pano}}' : ''}
== {{int:license-header}} ==
{{cc-by-sa-4.0}}

${categories}
`
  }

  const submitUpload = async () => {
    store.error = null

    if (store.selectedCount === 0) {
      store.error = 'Please select at least one image to upload'
      return
    }

    store.stepper = '5'
    store.isLoading = true
    try {
      const payload = store.selectedItems.map((item) => ({
        id: item.id,
        sequence_id: store.sequenceId,
        title: item.meta.title,
        wikitext: wikitext(item),
      }))

      const res = await fetch('/api/mapillary/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text()
        store.error = `Upload failed: ${res.status} ${text}`
        return
      }
      const body = (await res.json()) as {
        id: number
        status: UploadStatus
        image_id: string
        sequence_id: string
        batch_id: string
      }[]
      if (body.length > 0) {
        store.batchId = body[0]!.batch_id
        for (const r of body) {
          store.updateItem(r.image_id, 'status', r.status)
        }
        stopPolling()
        startPolling(store.batchId)
      }
    } catch (err) {
      store.error = err instanceof Error ? err.message : 'Failed to submit upload request'
    } finally {
      store.isLoading = false
    }
  }

  return {
    validationRules,
    loadSequence,
    loadSDC,
    validateSequenceId,
    wikitext,
    submitUpload,
  }
}
