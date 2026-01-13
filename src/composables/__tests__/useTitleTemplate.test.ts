import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { createPinia, setActivePinia } from 'pinia'
import { useCollectionsStore } from '../../stores/collections.store'
import type { Item } from '../../types/image'
import { TITLE_STATUS } from '../../types/image'
import { useTitleTemplate } from '../useTitleTemplate'

describe('useTitleTemplate', () => {
  const createMockItem = (id: string): Item => ({
    id,
    index: 1,
    image: {
      id,
      title: 'Original Title',
      description: 'Original Description',
      urls: {
        url: 'http://example.com/image.jpg',
        original: 'http://example.com/original.jpg',
        preview: 'http://example.com/preview.jpg',
        thumbnail: 'http://example.com/thumbnail.jpg',
      },
      dimensions: { width: 100, height: 100 },
      dates: { taken: new Date('2023-01-01T00:00:00Z') },
      location: { latitude: 0, longitude: 0, compass_angle: 0 },
      creator: { id: 'user', username: 'User', profile_url: '' },
      camera: { make: undefined, model: undefined, is_pano: false },
      existing: [],
    },
    meta: {
      selected: true,
      title: '',
      description: { language: 'en', value: '' },
      categories: '',
      titleStatus: TITLE_STATUS.Unknown,
    },
    isSkeleton: false,
  })

  beforeAll(() => {
    GlobalRegistrator.register()
  })

  afterAll(() => {
    GlobalRegistrator.unregister()
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    mock.restore()
  })

  describe('state management', () => {
    it('initializes template with default value', () => {
      const { template } = useTitleTemplate()
      // Default value from the composable
      expect(template.value).toBe(
        'Mapillary ({{mapillary.photo.sequence}}) ({{mapillary.user.username}}) {{captured.date}} {{captured.time}}.jpg',
      )
    })

    it('validates and updates store when template is applied', async () => {
      const store = useCollectionsStore()
      const { template, error, applyTemplate } = useTitleTemplate()

      template.value = 'Photo by {{mapillary.user.username}}.jpg'

      expect(error.value).toBeNull()

      // Mock fetch to avoid network errors
      const mockFetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify({ query: { pages: {} } }))),
      )
      global.fetch = mockFetch as unknown as typeof fetch

      await applyTemplate()

      expect(store.globalTitleTemplate).toBe('Photo by {{mapillary.user.username}}.jpg')
    })

    it('does not update store if template is invalid', async () => {
      const store = useCollectionsStore()
      store.globalTitleTemplate = 'Valid'
      const { template, error, applyTemplate } = useTitleTemplate()

      template.value = 'Invalid {{'

      await applyTemplate()

      expect(error.value).toContain('Mismatched syntax')
      expect(store.globalTitleTemplate).toBe('Valid')
    })

    it('verifies titles when template is applied', async () => {
      const store = useCollectionsStore()
      const item = createMockItem('1')
      store.replaceItems({ '1': item })
      store.input = 'seq123'
      const { template, applyTemplate } = useTitleTemplate()

      template.value = '{{mapillary.user.username}}.jpg'

      const mockFetch = mock(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ query: { pages: { '123': { missing: true, title: 'File:user' } } } }),
          ),
        ),
      )
      global.fetch = mockFetch as unknown as typeof fetch

      await applyTemplate()

      expect(store.globalTitleTemplate).toBe('{{mapillary.user.username}}.jpg')
      expect(mockFetch).toHaveBeenCalled()
      // Check if fetch was called with the correct title in the body
      const calls = mockFetch.mock.calls as unknown as [RequestInfo, RequestInit?][]
      const body = calls[0]![1]!.body!.toString()
      expect(body).toContain('titles=File%3AUser.jpg')
    })

    it('does not verify titles if item already has a title', async () => {
      const store = useCollectionsStore()
      const item = createMockItem('1')
      item.meta.title = 'Existing Title'
      store.replaceItems({ '1': item })
      const { template, applyTemplate } = useTitleTemplate()

      template.value = '{{mapillary.user.username}}.jpg'

      const mockFetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify({ query: { pages: {} } }))),
      )
      global.fetch = mockFetch as unknown as typeof fetch

      await applyTemplate()

      expect(store.globalTitleTemplate).toBe('{{mapillary.user.username}}.jpg')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('inserts variable correctly', () => {
      const { template, insertVariable } = useTitleTemplate()
      template.value = 'Photo'
      insertVariable('mapillary.user.username')
      expect(template.value).toBe('Photo {{mapillary.user.username}}')
    })
  })

  describe('highlightedTemplate', () => {
    it('highlights valid variables correctly', () => {
      const { template, highlightedTemplate } = useTitleTemplate()
      template.value = '{{mapillary.user.username}}'
      expect(highlightedTemplate.value).toContain('text-blue-600 bg-blue-50')
      expect(highlightedTemplate.value).toContain('{{mapillary.user.username}}')
    })

    it('highlights invalid variables as error', () => {
      const { template, highlightedTemplate } = useTitleTemplate()
      template.value = '{{invalid.variable}}'
      expect(highlightedTemplate.value).toContain(
        'text-red-600 bg-red-50 border-b-2 border-red-600',
      )
      expect(highlightedTemplate.value).toContain('{{invalid.variable}}')
    })

    it('highlights mismatched syntax (opening brace)', () => {
      const { template, highlightedTemplate } = useTitleTemplate()
      template.value = '{{ broken'
      // The '{{' should be highlighted as error
      expect(highlightedTemplate.value).toContain(
        '<span class="text-red-600 bg-red-50 border-b-2 border-red-600 rounded-sm">{{</span> broken',
      )
    })

    it('highlights mismatched syntax (closing brace)', () => {
      const { template, highlightedTemplate } = useTitleTemplate()
      template.value = 'broken }}'
      // The '}}' should be highlighted as error
      expect(highlightedTemplate.value).toContain(
        'broken <span class="text-red-600 bg-red-50 border-b-2 border-red-600 rounded-sm">}}</span>',
      )
    })

    it('highlights nested/malformed braces correctly', () => {
      const { template, highlightedTemplate } = useTitleTemplate()
      // {{abc} {{mapillary.user.username}}
      // Should handle {{ as error, abc} as plain, and valid tag as valid
      template.value = '{{abc} {{mapillary.user.username}}'

      expect(highlightedTemplate.value).toContain(
        '<span class="text-red-600 bg-red-50 border-b-2 border-red-600 rounded-sm">{{</span>',
      )
      expect(highlightedTemplate.value).toContain('abc}')
      expect(highlightedTemplate.value).toContain('text-blue-600 bg-blue-50')
      expect(highlightedTemplate.value).toContain('{{mapillary.user.username}}')
    })

    it('handles valid variable with whitespace', () => {
      const { template, highlightedTemplate } = useTitleTemplate()
      template.value = '{{  mapillary.user.username  }}'
      expect(highlightedTemplate.value).toContain('text-blue-600 bg-blue-50')
      expect(highlightedTemplate.value).toContain('{{  mapillary.user.username  }}')
    })

    it('escapes HTML characters', () => {
      const { template, highlightedTemplate } = useTitleTemplate()
      template.value = '<script>'
      expect(highlightedTemplate.value).toContain('&lt;script&gt;')
    })

    it('adds line break for trailing newline', () => {
      const { template, highlightedTemplate } = useTitleTemplate()
      template.value = 'line1\n'
      expect(highlightedTemplate.value).toContain('line1\n<br>')
    })
  })

  describe('previewItems', () => {
    it('returns preview items based on selected items', () => {
      const store = useCollectionsStore()
      const item1 = createMockItem('1')
      const item2 = createMockItem('2')
      item2.index = 2
      item2.meta.selected = false
      store.replaceItems({ '1': item1, '2': item2 })
      store.updateItem('1', 'selected', true)

      // The store getter selectedItems filters by selected=true
      // But since store is mocked via Pinia, we rely on how useCollectionsStore works.
      // If we need to mock selectedItems, we might need to look at how the store is implemented.
      // Assuming selectedItems is a getter that filters items.

      const { template, previewItems } = useTitleTemplate()
      template.value = '{{mapillary.photo.id}}'

      expect(previewItems.value).toHaveLength(1)
      const firstItem = previewItems.value[0]
      expect(firstItem).toBeDefined()
      expect(firstItem).toEqual({
        id: '1',
        index: 1,
        title: '1',
      })
    })

    it('limits preview items to 3', () => {
      const store = useCollectionsStore()
      const items: Record<string, Item> = {}
      for (let i = 1; i <= 5; i++) {
        const item = createMockItem(String(i))
        item.meta.selected = true
        items[String(i)] = item
      }
      store.replaceItems(items)

      const { previewItems } = useTitleTemplate()
      expect(previewItems.value).toHaveLength(3)
    })
  })

  describe('getVariableToken', () => {
    it('formats variable token correctly', () => {
      const { getVariableToken } = useTitleTemplate()
      expect(getVariableToken('test.path')).toBe('{{test.path}}')
    })
  })

  describe('onDragStart', () => {
    it('sets dataTransfer data correctly', () => {
      const { onDragStart } = useTitleTemplate()
      const setDataMock = mock()
      const setDragImageMock = mock()
      const event = {
        dataTransfer: {
          setData: setDataMock,
          effectAllowed: '',
          setDragImage: setDragImageMock,
        },
      } as unknown as DragEvent

      // Spy on document methods
      const appendChildSpy = spyOn(document.body, 'appendChild')
      const removeChildSpy = spyOn(document.body, 'removeChild')

      const originalRAF = global.requestAnimationFrame
      global.requestAnimationFrame = mock((cb) => {
        cb(0)
        return 0
      }) as unknown as typeof requestAnimationFrame

      onDragStart(event, 'test.path')

      expect(setDataMock).toHaveBeenCalledWith('text/plain', '{{test.path}}')
      expect(event.dataTransfer!.effectAllowed).toBe('copy')

      // Check if element was created and appended
      expect(appendChildSpy).toHaveBeenCalled()
      const calls = appendChildSpy.mock.calls
      const appendedEl = calls[0]![0] as HTMLElement
      expect(appendedEl.tagName).toBe('DIV')
      expect(appendedEl.textContent).toBe('{{test.path}}')
      expect(appendedEl.className).toContain('absolute')

      expect(setDragImageMock).toHaveBeenCalledWith(appendedEl, 0, -10)

      // Check removal
      expect(removeChildSpy).toHaveBeenCalledWith(appendedEl)

      // Restore mocks
      global.requestAnimationFrame = originalRAF
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('does nothing if dataTransfer is missing', () => {
      const { onDragStart } = useTitleTemplate()
      const event = {} as unknown as DragEvent

      // Just ensure it doesn't throw
      onDragStart(event, 'test.path')
    })
  })

  describe('usedCameraFields', () => {
    it('returns empty array when no camera fields are in template', () => {
      const { template, usedCameraFields } = useTitleTemplate()
      template.value = 'Photo by {{mapillary.user.username}}.jpg'
      expect(usedCameraFields.value).toEqual([])
    })

    it('returns camera.make when used in template', () => {
      const { template, usedCameraFields } = useTitleTemplate()
      template.value = 'Photo {{camera.make}}.jpg'
      expect(usedCameraFields.value).toEqual(['camera.make'])
    })

    it('returns camera.model when used in template', () => {
      const { template, usedCameraFields } = useTitleTemplate()
      template.value = 'Photo {{camera.model}}.jpg'
      expect(usedCameraFields.value).toEqual(['camera.model'])
    })

    it('returns both camera fields when both are used', () => {
      const { template, usedCameraFields } = useTitleTemplate()
      template.value = 'Photo {{camera.make}} {{camera.model}}.jpg'
      expect(usedCameraFields.value).toEqual(['camera.make', 'camera.model'])
    })
  })

  describe('itemsMissingCameraFields', () => {
    it('returns empty array when no camera fields are used', () => {
      const store = useCollectionsStore()
      const item1 = createMockItem('1')
      item1.image.camera.make = undefined as unknown as string
      store.replaceItems({ '1': item1 })
      store.updateItem('1', 'selected', true)

      const { template, itemsMissingCameraFields } = useTitleTemplate()
      template.value = 'Photo by {{mapillary.user.username}}.jpg'

      expect(itemsMissingCameraFields.value).toEqual([])
    })

    it('returns items missing camera.make when field is used', () => {
      const store = useCollectionsStore()
      const item1 = createMockItem('1')
      item1.image.camera.make = undefined as unknown as string
      item1.image.camera.model = 'Canon EOS 5D'
      const item2 = createMockItem('2')
      item2.image.camera.make = 'Nikon'
      item2.image.camera.model = 'D850'
      store.replaceItems({ '1': item1, '2': item2 })
      store.updateItem('1', 'selected', true)
      store.updateItem('2', 'selected', true)

      const { template, itemsMissingCameraFields } = useTitleTemplate()
      template.value = 'Photo {{camera.make}}.jpg'

      expect(itemsMissingCameraFields.value).toHaveLength(1)
      expect(itemsMissingCameraFields.value[0]?.id).toBe('1')
    })

    it('returns items missing camera.model when field is used', () => {
      const store = useCollectionsStore()
      const item1 = createMockItem('1')
      item1.image.camera.make = 'Canon'
      item1.image.camera.model = undefined as unknown as string
      store.replaceItems({ '1': item1 })
      store.updateItem('1', 'selected', true)

      const { template, itemsMissingCameraFields } = useTitleTemplate()
      template.value = 'Photo {{camera.model}}.jpg'

      expect(itemsMissingCameraFields.value).toHaveLength(1)
      expect(itemsMissingCameraFields.value[0]?.id).toBe('1')
    })

    it('returns empty array when all items have camera fields', () => {
      const store = useCollectionsStore()
      const item1 = createMockItem('1')
      item1.image.camera.make = 'Canon'
      item1.image.camera.model = 'EOS 5D'
      store.replaceItems({ '1': item1 })
      store.updateItem('1', 'selected', true)

      const { template, itemsMissingCameraFields } = useTitleTemplate()
      template.value = 'Photo {{camera.make}} {{camera.model}}.jpg'

      expect(itemsMissingCameraFields.value).toEqual([])
    })
  })

  describe('highlightedTemplate with camera field warnings', () => {
    it('shows yellow highlight for camera fields when items are missing them', () => {
      const store = useCollectionsStore()
      const item1 = createMockItem('1')
      item1.image.camera.make = undefined as unknown as string
      store.replaceItems({ '1': item1 })
      store.updateItem('1', 'selected', true)

      const { template, highlightedTemplate } = useTitleTemplate()
      template.value = 'Photo {{camera.make}}.jpg'

      expect(highlightedTemplate.value).toContain(
        'text-yellow-600 bg-yellow-50 border border-yellow-400',
      )
    })

    it('shows blue highlight for camera fields when no items are missing them', () => {
      const store = useCollectionsStore()
      const item1 = createMockItem('1')
      item1.image.camera.make = 'Canon'
      store.replaceItems({ '1': item1 })
      store.updateItem('1', 'selected', true)

      const { template, highlightedTemplate } = useTitleTemplate()
      template.value = 'Photo {{camera.make}}.jpg'

      expect(highlightedTemplate.value).toContain('text-blue-600 bg-blue-50')
      expect(highlightedTemplate.value).not.toContain('text-yellow-600')
    })

    it('shows blue highlight for non-camera fields', () => {
      const { template, highlightedTemplate } = useTitleTemplate()
      template.value = 'Photo by {{mapillary.user.username}}.jpg'

      expect(highlightedTemplate.value).toContain('text-blue-600 bg-blue-50')
      expect(highlightedTemplate.value).not.toContain('text-yellow-600')
    })
  })

  describe('applyTemplate with missing camera fields', () => {
    it('sets MissingFields status for items missing camera fields', async () => {
      const store = useCollectionsStore()
      const item1 = createMockItem('1')
      item1.image.camera.make = undefined as unknown as string
      item1.image.camera.model = undefined as unknown as string
      item1.meta.title = ''
      store.replaceItems({ '1': item1 })
      store.updateItem('1', 'selected', true)
      store.input = 'seq123'

      const { template, applyTemplate } = useTitleTemplate()
      template.value = 'Photo {{camera.make}}.jpg'

      await applyTemplate()

      expect(store.items['1']?.meta.titleStatus).toBe(TITLE_STATUS.MissingFields)
    })

    it('sets title even when MissingFields status is set', async () => {
      const store = useCollectionsStore()
      const item1 = createMockItem('1')
      item1.image.camera.make = undefined as unknown as string
      item1.meta.title = ''
      store.replaceItems({ '1': item1 })
      store.updateItem('1', 'selected', true)
      store.input = 'seq123'

      const { template, applyTemplate } = useTitleTemplate()
      template.value = 'Photo {{camera.make}}.jpg'

      await applyTemplate()

      // Title should still be set (with empty string for missing field)
      expect(store.items['1']?.meta.title).toBe('Photo .jpg')
    })

    it('does not set MissingFields status when camera fields are present', async () => {
      const store = useCollectionsStore()
      const item1 = createMockItem('1')
      item1.image.camera.make = 'Canon'
      item1.image.camera.model = 'EOS 5D'
      item1.meta.title = ''

      // Mock fetch to return available
      const mockFetch = mock(() =>
        Promise.resolve(
          new Response(JSON.stringify({ query: { pages: { '123': { missing: true } } } })),
        ),
      )
      global.fetch = mockFetch as unknown as typeof fetch

      store.replaceItems({ '1': item1 })
      store.updateItem('1', 'selected', true)
      store.input = 'seq123'

      const { template, applyTemplate } = useTitleTemplate()
      template.value = 'Photo {{camera.make}} {{camera.model}}.jpg'

      await applyTemplate()

      // Status should not be MissingFields (it might be Available or another status depending on fetch)
      expect(store.items['1']?.meta.titleStatus).not.toBe(TITLE_STATUS.MissingFields)
    })
  })
})
