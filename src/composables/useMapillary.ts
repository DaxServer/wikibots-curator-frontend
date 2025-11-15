export const useMapillary = () => {
  const store = useMapillaryStore()
  let poller: number | null = null

  const API_BASE = '/api/mapillary'
  const PATH_UPLOAD_REQUEST = `${API_BASE}/upload`
  const PATH_UPLOADS = `${API_BASE}/uploads`
  const PATH_SEQUENCES = `${API_BASE}/sequences`
  const PATH_SDC = 'sdc'
  const DEFAULT_LANGUAGE = 'en'
  const DEFAULT_DESCRIPTION_TEXT = 'Photo from Mapillary'
  const SEQUENCE_ID_REGEX = /^[a-zA-Z0-9_-]+$/
  const ERR_SEQ_REQUIRED = 'Please enter a sequence ID'
  const ERR_SEQ_INVALID = 'Sequence ID can only contain letters, numbers, underscores, and hyphens'

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
      const resp = await fetch(`${PATH_UPLOADS}/${batchId}`)
      if (!resp || !resp.ok) {
        store.isStatusChecking = false
        return
      }

      const updates = (await resp.json()) as UploadStatusUpdate[]
      for (const update of updates) {
        store.updateItem(update.image_id, 'status', update.status)

        if (update.status === UPLOAD_STATUS.Failed) {
          store.updateItem(update.image_id, 'statusReason', update.error.message)
          store.updateItem(update.image_id, 'errorInfo', update.error)
        }

        if (update.status === UPLOAD_STATUS.Completed) {
          store.updateItem(update.image_id, 'successUrl', update.success)
        }
      }

      const done = store.selectedItems.every(
        (i) => i.meta.status === UPLOAD_STATUS.Completed || i.meta.status === UPLOAD_STATUS.Failed,
      )
      store.isStatusChecking = false

      if (done) stopPolling()
    }

    poller = setInterval(statusCheck, 5000) as unknown as number
    void statusCheck()
  }

  const validateSequenceId = (sequenceId: string): boolean => {
    // Clear previous error
    store.error = null

    const trimmed = sequenceId.trim()
    if (!trimmed) {
      store.error = ERR_SEQ_REQUIRED
      return false
    }

    const pattern = SEQUENCE_ID_REGEX
    if (!pattern.test(trimmed)) {
      store.error = ERR_SEQ_INVALID
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
      const response = await fetch(`${PATH_SEQUENCES}/${sequenceId}`)
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
            description: { language: DEFAULT_LANGUAGE, text: DEFAULT_DESCRIPTION_TEXT },
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
        `${PATH_SEQUENCES}/${store.sequenceId}/${PATH_SDC}?${params.toString()}`,
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
        description = { language: DEFAULT_LANGUAGE, text: DEFAULT_DESCRIPTION_TEXT }
      } else {
        description = { language: store.globalLanguage, text: store.globalDescription }
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

      const res = await fetch(PATH_UPLOAD_REQUEST, {
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

      const body = (await res.json()) as UploadIngestResponseItem[]
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
    loadSequence,
    loadSDC,
    validateSequenceId,
    wikitext,
    stopPolling,
    submitUpload,
  }
}
