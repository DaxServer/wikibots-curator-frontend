import type { Image } from '@/types/image'
import { type Item, type Metadata, UPLOAD_STATUS, type UploadStatus } from '@/types/image'
import type {
  FetchBatchUploadsMessage,
  FetchBatchesMessage,
  RetryUploadsMessage,
  ServerMessage,
} from '@/types/messages'
import { watch } from 'vue'

export const useCollections = () => {
  const store = useCollectionsStore()
  const commons = useCommons()
  const { data, send } = useSocket

  const sendSubscribeBatch = (batchId: number): void => {
    store.isStatusChecking = true
    send(JSON.stringify({ type: 'SUBSCRIBE_BATCH', data: batchId }))
  }

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

  const wikitext = (item: Item): string => {
    const meta = commons.applyMetaDefaults(item.meta, commons.buildTitle(item.image))
    return commons.buildWikitext({ ...item, meta: meta as Metadata })
  }

  const loadCollection = (): void => {
    store.$reset()
    store.isLoading = true
    send(JSON.stringify({ type: 'FETCH_IMAGES', data: store.input }))
  }

  const loadBatches = (page: number, rows: number, userid?: string, filter?: string) => {
    const payload: FetchBatchesMessage['data'] = {
      page: page / rows + 1,
      limit: rows,
    }
    if (userid) {
      payload.userid = userid
    }
    if (filter) {
      payload.filter = filter
    }
    send(
      JSON.stringify({
        type: 'FETCH_BATCHES',
        data: payload,
      } as FetchBatchesMessage),
    )
  }

  const loadBatchUploads = (batchId: number) => {
    send(
      JSON.stringify({
        type: 'FETCH_BATCH_UPLOADS',
        data: {
          batch_id: batchId,
        },
      } as FetchBatchUploadsMessage),
    )
  }

  const retryUploads = (batchId: number) => {
    send(
      JSON.stringify({
        type: 'RETRY_UPLOADS',
        data: {
          batch_id: batchId,
        },
      } as RetryUploadsMessage),
    )
  }

  const loadSDC = (): void => {
    for (const item of store.selectedItems) {
      store.items[item.id]!.sdc = commons.buildSDC(item)
    }
  }

  const submitUpload = (): void => {
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
    send(JSON.stringify({ type: 'UPLOAD', data: payload }))
  }

  watch(data, (raw) => {
    if (!raw) return
    const msg = JSON.parse(raw as string) as ServerMessage

    switch (msg.type) {
      case 'UPLOADS_UPDATE': {
        for (const update of msg.data) {
          store.updateItem(update.key, 'status', update.status)
          if (update.status === UPLOAD_STATUS.Failed) {
            store.updateItem(update.key, 'statusReason', update.error.message)
            store.updateItem(update.key, 'errorInfo', update.error)
          }
          if (update.status === UPLOAD_STATUS.Completed) {
            store.updateItem(update.key, 'successUrl', update.success)
          }
        }
        const allDone = store.selectedItems.every(
          (i) =>
            i.meta.status === UPLOAD_STATUS.Completed || i.meta.status === UPLOAD_STATUS.Failed,
        )
        if (allDone) store.isStatusChecking = false
        break
      }
      case 'UPLOADS_COMPLETE':
        store.isStatusChecking = false
        break
      case 'COLLECTION_IMAGES': {
        store.creator = msg.data.creator
        const allItems: Record<string, Item> = {}
        let index = 0
        for (const [id, image] of Object.entries(msg.data.images)) {
          const img = image as Image
          img.dates.taken = new Date(img.dates.taken as unknown as string)
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
          store.batchId = items[0]!.batch_id
          for (const r of items) {
            store.updateItem(r.image_id, 'status', r.status as UploadStatus)
          }
          if (store.batchId) sendSubscribeBatch(store.batchId)
        }
        store.isLoading = false
        break
      }
      case 'BATCHES_LIST':
        store.batches = msg.data.items
        store.batchesTotal = msg.data.total
        break
      case 'BATCH_UPLOADS_LIST':
        store.batchUploads = msg.data
        break
    }
  })

  return {
    loadCollection,
    loadSDC,
    wikitext,
    submitUpload,
    loadBatches,
    loadBatchUploads,
    retryUploads,
  }
}
