import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { createPinia, setActivePinia } from 'pinia'
import { useCollectionsStore } from '../../stores/collections.store'
import type { Item } from '../../types/image'

// Mock ts-debounce
let pendingDebounceExecutors: ((...args: unknown[]) => void)[] = []
mock.module('ts-debounce', () => {
  return {
    debounce: (fn: (...args: unknown[]) => void) => {
      return (...args: unknown[]) => {
        pendingDebounceExecutors.push(() => fn(...args))
      }
    },
  }
})

describe('useCommons', () => {
  let useCommons: typeof import('../useCommons').useCommons

  beforeEach(async () => {
    setActivePinia(createPinia())
    mock.restore()
    pendingDebounceExecutors = []

    const module = await import('../useCommons')
    useCommons = module.useCommons
  })

  const createMockItem = (id: string, title: string = ''): Item => ({
    id,
    index: 1,
    image: {
      id,
      handler: 'mapillary',
      title: 'Original Title',
      description: 'Original Description',
      url: 'http://example.com/image.jpg',
      url_original: 'http://example.com/original.jpg',
      preview_url: 'http://example.com/preview.jpg',
      thumbnail_url: 'http://example.com/thumbnail.jpg',
      width: 100,
      height: 100,
      dates: { taken: new Date('2023-01-01T00:00:00Z') },
      location: { latitude: 0, longitude: 0, compass_angle: 0 },
      creator: { id: 'user', username: 'user', profile_url: '' },
      is_pano: false,
      existing: [],
    },
    meta: {
      selected: true,
      title,
      description: { language: 'en', value: '' },
      categories: '',
      titleStatus: 'unknown',
    },
    sdc: [],
  })

  it('immediate verifyTitles updates status to checking then available', async () => {
    const store = useCollectionsStore()
    const item = createMockItem('1', 'Test Title')
    store.items = { '1': item }

    const { verifyTitles } = useCommons()

    // Mock fetch response for available title (missing: true)
    const mockFetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            query: {
              pages: {
                '123': { missing: true, title: 'File:Test Title.jpeg' },
              },
            },
          }),
      }),
    )
    global.fetch = mockFetch as unknown as typeof fetch

    await verifyTitles([{ id: '1', title: 'Test Title.jpeg' }])

    expect(store.items['1']!.meta.titleStatus).toBe('available')
    expect(mockFetch).toHaveBeenCalled()
  })

  it('immediate verifyTitles updates status to checking then taken', async () => {
    const store = useCollectionsStore()
    const item = createMockItem('1', 'Taken Title.jpeg')
    store.items = { '1': item }

    const { verifyTitles } = useCommons()

    // Mock fetch response for taken title (revisions exist)
    const mockFetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            query: {
              pages: {
                '123': { title: 'File:Taken Title.jpeg', revisions: [{}] },
              },
            },
          }),
      }),
    )
    global.fetch = mockFetch as unknown as typeof fetch

    await verifyTitles([{ id: '1', title: 'Taken Title.jpeg' }])

    expect(store.items['1']!.meta.titleStatus).toBe('taken')
  })

  it('debounce verifyTitles waits before calling API', async () => {
    const store = useCollectionsStore()
    const item = createMockItem('1', 'Debounce Title')
    store.items = { '1': item }

    const { verifyTitles } = useCommons()

    const mockFetch = mock(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            query: {
              pages: {
                '123': { missing: true, title: 'File:Debounce Title.jpeg' },
              },
            },
          }),
      }),
    )
    global.fetch = mockFetch as unknown as typeof fetch

    // Call with debounce
    verifyTitles([{ id: '1', title: 'Debounce Title.jpeg' }], { debounce: true })

    // Status should be checking immediately
    expect(store.items['1']!.meta.titleStatus).toBe('checking')

    // Fetch should not be called immediately (it's debounced)
    expect(mockFetch).not.toHaveBeenCalled()

    // Flush debounce
    expect(pendingDebounceExecutors.length).toBe(1)
    for (const exec of pendingDebounceExecutors) {
      await exec()
    }
    pendingDebounceExecutors = []

    expect(mockFetch).toHaveBeenCalled()
    expect(store.items['1']!.meta.titleStatus).toBe('available')
  })
})
