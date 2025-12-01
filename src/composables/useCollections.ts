export const useCollections = () => {
  const store = useCollectionsStore()
  const API_COLLECTIONS = '/api/collections'
  const API_INGEST = '/api/ingest'
  const PATH_UPLOAD_REQUEST = `${API_INGEST}/upload`
  const PATH_UPLOADS = `${API_INGEST}/uploads`

  let poller: number | null = null

  const commons = useCommons()

  const createItem = (image: Image, id: string, index: number, descriptionText: string): Item => ({
    id,
    index,
    image,
    sdc: [],
    meta: {
      title: undefined,
      description: { language: 'en', value: descriptionText },
      categories: '',
      selected: false,
    },
  })

  const wikitext = (item: Item): string => {
    const meta = commons.applyMetaDefaults(item.meta, commons.buildTitle(item.image))
    return commons.buildWikitext({ ...item, meta: meta as Metadata })
  }

  const stopPolling = (): void => {
    if (poller !== null) {
      clearInterval(poller)
      poller = null
    }
    store.isStatusChecking = false
  }

  const startPolling = (batchId: number): void => {
    const statusCheck = async (): Promise<void> => {
      store.isStatusChecking = true
      const resp = await fetch(`${PATH_UPLOADS}/${batchId}`)
      if (!resp || !resp.ok) {
        store.isStatusChecking = false
        store.error = (await resp.json()).detail
        return
      }

      const { items: updates } = (await resp.json()) as { items: UploadStatusUpdate[] }
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

      if (
        store.selectedItems.every(
          (i) =>
            i.meta.status === UPLOAD_STATUS.Completed || i.meta.status === UPLOAD_STATUS.Failed,
        )
      ) {
        stopPolling()
      }
    }

    poller = setInterval(statusCheck, 2000) as unknown as number
    void statusCheck()
  }

  const loadCollection = async (): Promise<void> => {
    store.$reset()
    store.isLoading = true
    try {
      const response = await fetch(`${API_COLLECTIONS}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handler: store.handler, input: store.input }),
      })
      if (response.status === 404) throw new Error('Collection not found')
      if (!response.ok) throw new Error((await response.json()).detail)

      const apiResponse = (await response.json()) as CollectionsApiResponse
      store.creator = apiResponse.creator
      const allItems: Record<string, Item> = {}
      let index = 0
      for (const [id, image] of Object.entries(apiResponse.images as Record<string, Image>)) {
        image.dates.taken = new Date(image.dates.taken)

        index += 1
        const descriptionText = commons.buildDescription()
        allItems[id] = createItem(image, id, index, descriptionText)
      }
      store.items = allItems
      store.stepper = '2'
    } catch (err) {
      store.error = err instanceof Error ? err.message : 'An unknown error occurred'
    } finally {
      store.isLoading = false
    }
  }

  const loadSDC = (): void => {
    for (const item of store.selectedItems) {
      store.items[item.id]!.sdc = commons.buildSDC(item.image)
    }
  }

  const submitUpload = async (): Promise<void> => {
    store.error = null
    if (store.selectedCount === 0) {
      store.error = 'Please select at least one image to upload'
      return
    }
    store.stepper = '5'
    store.isLoading = true
    try {
      const payload = {
        handler: store.handler,
        items: store.selectedItems.map((item) => ({
          id: item.id,
          input: store.input,
          title: item.meta.title,
          wikitext: wikitext(item),
          labels: item.meta.description,
          sdc: item.sdc,
        })),
      }
      const res = await fetch(PATH_UPLOAD_REQUEST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const detail = (await res.json()).detail
        store.error = `Upload failed: ${res.status} ${detail}`
        return
      }
      const body = (await res.json()) as Array<{
        batch_id: number
        image_id: string
        status: string
      }>
      if (body.length > 0) {
        store.batchId = body[0]!.batch_id
        for (const r of body) {
          store.updateItem(r.image_id, 'status', r.status as UploadStatus)
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

  return { loadCollection, loadSDC, wikitext, stopPolling, submitUpload }
}
