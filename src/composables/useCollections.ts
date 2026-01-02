import type { BatchUploadItem, SubscribeBatch } from '@/types/asyncapi'
import type { Image } from '@/types/image'
import { type Item, type Metadata, UPLOAD_STATUS, type UploadStatus } from '@/types/image'
import { watch } from 'vue'

const createItem = (image: Image, id: string, index: number, descriptionText: string): Item => ({
  id,
  index,
  image,
  sdc: [],
  meta: {
    title: undefined,
    description: { language: 'en', value: descriptionText },
    categories: '',
    license: '',
    selected: false,
  },
})

const createSkeletonItem = (id: string, index: number): Item => ({
  id,
  index,
  image: {
    id,
    creator: { id: '', username: '', profile_url: '' },
    dates: { taken: new Date() },
    existing: [],
    height: 0,
    width: 0,
    preview_url: '',
    thumbnail_url: '',
    title: '',
    url: '',
    url_original: '',
    location: { latitude: 0, longitude: 0, compass_angle: 0 },
    description: '',
  },
  sdc: [],
  meta: {
    description: { language: 'en', value: '' },
    categories: '',
    license: '',
    selected: false,
  },
  isSkeleton: true,
})

export const initCollectionsListeners = () => {
  const store = useCollectionsStore()
  const commons = useCommons()
  const { data, send } = useSocket

  const sendSubscribeBatch = (batchId: number) => {
    if (store.isStatusChecking) return
    store.isStatusChecking = true
    send(JSON.stringify({ type: 'SUBSCRIBE_BATCH', data: batchId } as SubscribeBatch))
  }

  watch(data, (raw) => {
    if (!raw) return
    const msg = JSON.parse(raw as string) as ServerMessage

    switch (msg.type) {
      case 'UPLOADS_UPDATE': {
        const newBatchUploads = [...store.batchUploads]
        let batchUploadsChanged = false

        for (const update of msg.data) {
          // Only process updates for the batch we are currently viewing or just uploaded
          const batchId = Number(update.batchid)
          if (batchId !== Number(store.currentBatchId) && batchId !== Number(store.batchId))
            continue

          // Update current session items if they exist
          if (store.items[update.key]) {
            store.updateItem(update.key, 'status', update.status)
            if (update.status === UPLOAD_STATUS.Failed) {
              store.updateItem(update.key, 'statusReason', update.error?.message)
              store.updateItem(update.key, 'errorInfo', update.error)
            }
            if (update.status === UPLOAD_STATUS.Completed) {
              store.updateItem(update.key, 'successUrl', update.success)
            }
          }

          // Update batch uploads list if present
          const index = newBatchUploads.findIndex((u) => u.key === update.key)
          if (index !== -1) {
            batchUploadsChanged = true
            const upload = { ...newBatchUploads[index] } as BatchUploadItem
            upload.status = update.status
            if (update.status === UPLOAD_STATUS.Failed) {
              upload.error = update.error
            }
            if (update.status === UPLOAD_STATUS.Completed) {
              upload.success = update.success
            }
            newBatchUploads[index] = upload
          }
        }

        if (batchUploadsChanged) {
          store.batchUploads = newBatchUploads
        }

        const allDone = store.selectedItems.every(
          (i) =>
            i.meta.status === UPLOAD_STATUS.Completed ||
            i.meta.status === UPLOAD_STATUS.Failed ||
            i.meta.status === UPLOAD_STATUS.Duplicate,
        )
        if (allDone && store.selectedItems.length > 0) store.isStatusChecking = false
        break
      }
      case 'UPLOADS_COMPLETE': {
        const batchId = Number(msg.data)
        if (batchId === Number(store.currentBatchId) || batchId === Number(store.batchId)) {
          store.isStatusChecking = false
        }
        break
      }
      case 'COLLECTION_IMAGES': {
        store.creator = msg.data.creator
        const allItems: Record<string, Item> = {}
        let index = 0
        for (const [id, image] of Object.entries(msg.data.images)) {
          const img: Image = {
            ...image,
            description: image.description ?? '',
            dates: {
              taken: new Date(image.dates.taken),
            },
          }
          index += 1
          const descriptionText = commons.buildDescription()
          allItems[id] = createItem(img, id, index, descriptionText)
        }
        store.items = allItems
        store.stepper = '2'
        store.isLoading = false
        break
      }
      case 'ERROR':
        store.error = msg.data || 'Failed'
        store.isLoading = false
        break
      case 'UPLOAD_CREATED': {
        const items = msg.data
        if (items.length > 0) {
          store.batchId = items[0]!.batchid
          for (const r of items) {
            store.updateItem(r.image_id, 'status', r.status as UploadStatus)
          }
          if (store.batchId) sendSubscribeBatch(store.batchId)
        }
        store.isLoading = false
        break
      }
      case 'BATCHES_LIST':
        if (msg.partial) {
          // Partial update: update existing items instead of full replace
          const existingBatches = [...store.batches]
          const updatedBatchIds = new Set(msg.data.items.map((item) => item.id))

          // Remove existing items that are being updated
          const filteredBatches = existingBatches.filter((batch) => !updatedBatchIds.has(batch.id))

          // Add updated items
          const newBatches = [...filteredBatches, ...msg.data.items]

          // Sort by id to maintain consistent order
          store.batches = newBatches.sort((a, b) => b.id - a.id)
        } else {
          // Full replace
          store.batches = msg.data.items
        }
        store.batchesTotal = msg.data.total
        store.batchesLoading = false
        break
      case 'BATCH_UPLOADS_LIST':
        if (Number(msg.data.batch.id) === Number(store.currentBatchId)) {
          store.batch = msg.data.batch
          store.batchUploads = msg.data.uploads
          store.batchUploadsLoading = false
        }
        break
      case 'TRY_BATCH_RETRIEVAL':
        store.isBatchLoading = true
        store.batchLoadingStatus = msg.data
        break
      case 'COLLECTION_IMAGE_IDS': {
        const ids = msg.data
        store.totalImageIds = ids
        store.stepper = '2'
        store.isLoading = false

        const skeletonItems: Record<string, Item> = {}
        ids.forEach((id, index) => {
          skeletonItems[id] = createSkeletonItem(id, index + 1)
        })
        store.items = skeletonItems
        break
      }
      case 'PARTIAL_COLLECTION_IMAGES': {
        const images = msg.data.images
        const newItems = { ...store.items }

        images.forEach((image) => {
          const img: Image = {
            ...image,
            description: image.description ?? '',
            dates: {
              taken: new Date(image.dates.taken),
            },
          }

          const skeletonItem = newItems[image.id]
          if (!skeletonItem) {
            store.error = `Received partial image data for an unknown ID: ${image.id}`
            return
          }

          const index = skeletonItem.index
          const descriptionText = commons.buildDescription()
          newItems[image.id] = createItem(img, image.id, index, descriptionText)
        })

        // Fill in creator from first item if not already set
        if (!store.creator.id && images.length > 0) {
          store.creator = images[0]!.creator
        }

        store.items = newItems
        const loadedCount = Object.values(newItems).filter((i) => !i.isSkeleton).length
        if (loadedCount >= store.totalImageIds.length) {
          store.isBatchLoading = false
          store.batchLoadingStatus = null
        }
        break
      }
    }
  })
}

export const useCollections = () => {
  const store = useCollectionsStore()
  const commons = useCommons()
  const { send } = useSocket

  const sendSubscribeBatch = (batchId: number) => {
    if (store.isStatusChecking) return
    store.isStatusChecking = true
    send(JSON.stringify({ type: 'SUBSCRIBE_BATCH', data: batchId } as SubscribeBatch))
  }

  const sendUnsubscribeBatch = () => {
    store.isStatusChecking = false
    send(JSON.stringify({ type: 'UNSUBSCRIBE_BATCH' } as UnsubscribeBatch))
  }

  const subscribeBatchesList = (userid?: string, filter?: string) => {
    send(
      JSON.stringify({
        type: 'SUBSCRIBE_BATCHES_LIST',
        data: { userid, filter },
      } as SubscribeBatchesList),
    )
  }

  const unsubscribeBatchesList = () => {
    send(JSON.stringify({ type: 'UNSUBSCRIBE_BATCHES_LIST' } as UnsubscribeBatchesList))
  }

  const wikitext = (item: Item) => {
    const meta = commons.applyMetaDefaults(item.meta, commons.buildTitle(item.image))
    return commons.buildWikitext({ ...item, meta: meta as Metadata })
  }

  const loadCollection = () => {
    store.$reset()
    store.isLoading = true
    send(JSON.stringify({ type: 'FETCH_IMAGES', data: store.input } as FetchImages))
  }

  const loadBatches = (page: number, rows: number, userid?: string, filter?: string) => {
    store.batchesLoading = true
    store.batches = []
    store.batchesTotal = 0
    const payload: FetchBatches['data'] = {
      page: page / rows + 1,
      limit: rows,
      userid,
      filter,
    }
    send(JSON.stringify({ type: 'FETCH_BATCHES', data: payload } as FetchBatches))
  }

  const refreshBatches = () => {
    const authStore = useAuthStore()
    const userid =
      store.batchesSelectedFilter?.value === 'my' && authStore.userid ? authStore.userid : undefined
    loadBatches(
      store.batchesParams.first,
      store.batchesParams.rows,
      userid,
      store.batchesFilterText,
    )
  }

  const loadBatchUploads = (batchId: number) => {
    store.batchUploadsLoading = true
    store.batch = undefined
    store.batchUploads = []
    store.currentBatchId = batchId
    send(
      JSON.stringify({
        type: 'FETCH_BATCH_UPLOADS',
        data: batchId,
      } as FetchBatchUploads),
    )
  }

  const retryUploads = (batchId: number) => {
    send(
      JSON.stringify({
        type: 'RETRY_UPLOADS',
        data: batchId,
      } as RetryUploads),
    )
  }

  const loadSDC = () => {
    for (const item of store.selectedItems) {
      store.items[item.id]!.sdc = commons.buildSDC(item)
    }
  }

  const submitUpload = () => {
    store.error = null
    if (store.selectedCount === 0) {
      store.error = 'Please select at least one image to upload'
      return
    }
    store.stepper = '5'
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
    send(JSON.stringify({ type: 'UPLOAD', data: payload } as Upload))
  }

  return {
    loadCollection,
    loadSDC,
    wikitext,
    submitUpload,
    loadBatches,
    refreshBatches,
    loadBatchUploads,
    retryUploads,
    sendSubscribeBatch,
    sendUnsubscribeBatch,
    subscribeBatchesList,
    unsubscribeBatchesList,
  }
}
