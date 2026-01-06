import { useCommons } from '@/composables/useCommons'
import { useSocket } from '@/composables/useSocket'
import { useAuthStore } from '@/stores/auth.store'
import { useCollectionsStore } from '@/stores/collections.store'
import type {
  BatchUploadItem,
  CreateBatch,
  FetchBatches,
  FetchBatchUploads,
  FetchImages,
  MediaImage,
  RetryUploads,
  ServerMessage,
  SubscribeBatch,
  SubscribeBatchesList,
  UnsubscribeBatch,
  UnsubscribeBatchesList,
  UploadCreatedItem,
  UploadSlice,
  UploadUpdateItem,
} from '@/types/asyncapi'
import type { Image } from '@/types/image'
import { type Item, UPLOAD_STATUS, type UploadStatus } from '@/types/image'
import { markRaw, watch } from 'vue'

const createItem = (image: Image, id: string, index: number, descriptionText: string): Item => ({
  id,
  index,
  image: markRaw(image),
  meta: {
    title: undefined,
    description: { language: 'en', value: descriptionText },
    categories: '',
    license: '',
    selected: false,
  },
  isSkeleton: false,
})

const createSkeletonItem = (id: string, index: number): Item => ({
  id,
  index,
  image: markRaw({
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
  }),
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
  const { buildDescription, getEffectiveTitle, wikitext } = useCommons()
  const { data, send } = useSocket

  const sendSubscribeBatch = (batchId: number) => {
    if (store.isStatusChecking) return
    store.isStatusChecking = true
    send(JSON.stringify({ type: 'SUBSCRIBE_BATCH', data: batchId } as SubscribeBatch))
  }

  const onUploadsUpdate = (data: UploadUpdateItem[]) => {
    const newBatchUploads = [...store.batchUploads]
    let batchUploadsChanged = false

    for (const update of data) {
      // Only process updates for the batch we are currently viewing or just uploaded
      const batchId = Number(update.batchid)
      if (batchId !== Number(store.currentBatchId) && batchId !== Number(store.batchId)) continue

      // Update current session items if they exist
      if (store.items[update.key]) {
        store.updateItem(update.key, 'status', update.status as UploadStatus)
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
  }

  const onUploadsComplete = (batchId: number) => {
    batchId = Number(batchId)
    if (batchId === Number(store.currentBatchId) || batchId === Number(store.batchId)) {
      store.isStatusChecking = false
    }
  }

  const onCollectionImages = (creator: Creator, images: Record<string, MediaImage>) => {
    store.creator = creator
    const allItems: Record<string, Item> = {}
    let index = 0
    for (const [id, image] of Object.entries(images)) {
      const img: Image = {
        ...image,
        description: image.description ?? '',
        dates: {
          taken: new Date(image.dates.taken),
        },
      }
      index += 1
      const descriptionText = buildDescription()
      allItems[id] = createItem(img, id, index, descriptionText)
    }
    store.replaceItems(allItems)
    store.stepper = '2'
    store.isLoading = false
  }

  const onError = (error: string) => {
    store.error = error || 'Failed'
    store.isLoading = false
  }

  const onUploadCreated = (items: UploadCreatedItem[]) => {
    if (items.length > 0) {
      store.batchId = items[0]!.batchid
      for (const r of items) {
        store.updateItem(r.image_id, 'status', r.status as UploadStatus)
      }
      if (store.batchId) sendSubscribeBatch(store.batchId)
    }
    store.isLoading = false
  }

  const onBatchesList = (partial: boolean, data: BatchesListData) => {
    if (partial) {
      // Partial update: update existing items instead of full replace
      const existingBatches = [...store.batches]
      const updatedBatchIds = new Set(data.items.map((item) => item.id))

      // Remove existing items that are being updated
      const filteredBatches = existingBatches.filter((batch) => !updatedBatchIds.has(batch.id))

      // Add updated items
      const newBatches = [...filteredBatches, ...data.items]

      // Sort by id to maintain consistent order
      store.batches = newBatches.sort((a, b) => b.id - a.id)
    } else {
      // Full replace
      store.batches = data.items
    }
    store.batchesTotal = data.total
    store.batchesLoading = false
  }

  const onBatchUploadsList = (data: BatchUploadsListData) => {
    if (Number(data.batch.id) === Number(store.currentBatchId)) {
      store.batch = data.batch
      store.batchUploads = data.uploads
      store.batchUploadsLoading = false
    }
  }

  const onTryBatchRetrieval = (batchLoadingStatus: string) => {
    store.isBatchLoading = true
    store.batchLoadingStatus = batchLoadingStatus
  }

  const onCollectionImageIds = (ids: string[]) => {
    store.totalImageIds = ids
    store.stepper = '2'
    store.isLoading = false

    const skeletonItems: Record<string, Item> = {}
    ids.forEach((id, index) => {
      skeletonItems[id] = createSkeletonItem(id, index + 1)
    })
    store.replaceItems(skeletonItems)
  }

  const onPartialCollectionImages = (images: MediaImage[]) => {
    for (const image of images) {
      const img: Image = {
        ...image,
        description: image.description ?? '',
        dates: {
          taken: new Date(image.dates.taken),
        },
      }

      const skeletonItem = store.items[image.id]
      if (!skeletonItem) {
        store.error = `Received partial image data for an unknown ID: ${image.id}`
        continue
      }

      const index = skeletonItem.index
      const descriptionText = buildDescription()
      store.items[image.id] = createItem(img, image.id, index, descriptionText)
    }

    // Fill in creator from first item if not already set
    if (!store.creator.id && images.length > 0) {
      store.creator = images[0]!.creator
    }

    if (store.loadedCount >= store.totalImageIds.length) {
      store.isBatchLoading = false
      store.batchLoadingStatus = null
    }
  }

  const onBatchCreated = (batchId: number) => {
    store.batchId = batchId
    store.uploadSliceIndex = 0
    sendNextSlice()
  }

  const onUploadSliceAck = (sliceId: number) => {
    if (sliceId === store.uploadSliceIndex) {
      store.uploadSliceIndex += 1
      sendNextSlice()
    }
  }

  watch(data, (raw) => {
    if (!raw) return
    const msg = JSON.parse(raw as string) as ServerMessage

    switch (msg.type) {
      case 'UPLOADS_UPDATE':
        onUploadsUpdate(msg.data)
        break
      case 'UPLOADS_COMPLETE':
        onUploadsComplete(msg.data)
        break
      case 'COLLECTION_IMAGES':
        onCollectionImages(msg.data.creator, msg.data.images)
        break
      case 'ERROR':
        onError(msg.data)
        break
      case 'UPLOAD_CREATED':
        onUploadCreated(msg.data)
        break
      case 'BATCHES_LIST':
        onBatchesList(msg.partial, msg.data)
        break
      case 'BATCH_UPLOADS_LIST':
        onBatchUploadsList(msg.data)
        break
      case 'TRY_BATCH_RETRIEVAL':
        onTryBatchRetrieval(msg.data)
        break
      case 'COLLECTION_IMAGE_IDS':
        onCollectionImageIds(msg.data)
        break
      case 'PARTIAL_COLLECTION_IMAGES':
        onPartialCollectionImages(msg.data.images)
        break
      case 'BATCH_CREATED':
        onBatchCreated(msg.data)
        break
      case 'UPLOAD_SLICE_ACK':
        onUploadSliceAck(msg.data)
        break
    }
  })

  const sendNextSlice = () => {
    if (!store.batchId) return

    const totalItems = store.selectedItems.length
    const start = store.uploadSliceIndex * 10

    if (start >= totalItems) {
      store.isLoading = false
      sendSubscribeBatch(store.batchId)
      return
    }

    const end = Math.min(start + 10, totalItems)
    const sliceItems = store.selectedItems.slice(start, end).map((item) => ({
      id: item.id,
      input: store.input,
      title: getEffectiveTitle(item),
      wikitext: wikitext(item),
      labels: item.meta.description,
      copyright_override: (item.meta.license?.trim() || store.globalLicense.trim()) !== '',
    }))

    send(
      JSON.stringify({
        type: 'UPLOAD_SLICE',
        data: {
          batchid: store.batchId,
          sliceid: store.uploadSliceIndex,
          handler: store.handler,
          items: sliceItems,
        },
      } as UploadSlice),
    )
  }

  return {
    onUploadsUpdate,
    onUploadsComplete,
    onCollectionImages,
    onError,
    onUploadCreated,
    onBatchesList,
    onBatchUploadsList,
    onTryBatchRetrieval,
    onCollectionImageIds,
    onPartialCollectionImages,
    onBatchCreated,
    onUploadSliceAck,
  }
}

export const useCollections = () => {
  const store = useCollectionsStore()
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

  const loadCollection = () => {
    store.$reset()
    store.isLoading = true
    send(JSON.stringify({ type: 'FETCH_IMAGES', data: store.input } as FetchImages))
  }

  const loadBatches = (page: number, rows: number, userid?: string, filter?: string) => {
    store.batchesLoading = true
    store.batches = []
    store.batchesTotal = 0
    send(
      JSON.stringify({
        type: 'FETCH_BATCHES',
        data: {
          page: page / rows + 1,
          limit: rows,
          userid,
          filter,
        },
      } as FetchBatches),
    )
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

  const adminRetryBatch = async (batchId: number) => {
    try {
      const response = await fetch(`/api/admin/batches/${batchId}/retry`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to retry batch')
      }
      // Reload batch uploads
      loadBatchUploads(batchId)
    } catch (e) {
      store.error = (e as Error).message
    } finally {
      sendSubscribeBatch(batchId)
    }
  }

  const startUploadProcess = () => {
    store.isLoading = true
    send(JSON.stringify({ type: 'CREATE_BATCH' } as CreateBatch))
  }

  const submitUpload = () => {
    store.error = null
    if (store.selectedCount === 0) {
      store.error = 'Please select at least one image to upload'
      return
    }
    store.stepper = '5'
  }

  return {
    loadCollection,
    submitUpload,
    startUploadProcess,
    loadBatches,
    refreshBatches,
    loadBatchUploads,
    retryUploads,
    adminRetryBatch,
    sendSubscribeBatch,
    sendUnsubscribeBatch,
    subscribeBatchesList,
    unsubscribeBatchesList,
  }
}
