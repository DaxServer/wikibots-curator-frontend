import type { WantedCategoryItem } from '@/types/asyncapi'
import { type Mock, beforeEach, describe, expect, it, mock } from 'bun:test'
import { resolve } from 'node:path'
import { ref } from 'vue'

export const mockSocketData = ref<string | null>(null)
export const mockSend = mock(() => {})

const mockSocketImpl = () => ({
  useSocket: {
    data: mockSocketData,
    send: mockSend,
  },
})

mock.module('@/composables/useSocket', mockSocketImpl)
mock.module('../useSocket', mockSocketImpl)
mock.module(resolve(__dirname, '../useSocket.ts'), mockSocketImpl)

import { useWantedCategories } from '../useWantedCategories'

describe('useWantedCategories', () => {
  beforeEach(() => {
    mockSocketData.value = null
    ;(mockSend as Mock<typeof mockSend>).mockClear()
    const { wantedCategories, loading, total } = useWantedCategories()
    wantedCategories.value = []
    loading.value = false
    total.value = 0
  })

  it('sends FETCH_WANTED_CATEGORIES with offset 0 by default', () => {
    const { fetchWantedCategories } = useWantedCategories()

    fetchWantedCategories()

    expect(mockSend).toHaveBeenCalledWith(
      JSON.stringify({ type: 'FETCH_WANTED_CATEGORIES', data: { offset: 0 } }),
    )
  })

  it('sends FETCH_WANTED_CATEGORIES with provided offset', () => {
    const { fetchWantedCategories } = useWantedCategories()

    fetchWantedCategories(100)

    expect(mockSend).toHaveBeenCalledWith(
      JSON.stringify({ type: 'FETCH_WANTED_CATEGORIES', data: { offset: 100 } }),
    )
  })

  it('sends FETCH_WANTED_CATEGORIES with filter text when provided', () => {
    const { fetchWantedCategories } = useWantedCategories()

    fetchWantedCategories(0, 'Germany')

    expect(mockSend).toHaveBeenCalledWith(
      JSON.stringify({ type: 'FETCH_WANTED_CATEGORIES', data: { offset: 0, filter: 'Germany' } }),
    )
  })

  it('sets loading to true when fetchWantedCategories is called', () => {
    const { loading, fetchWantedCategories } = useWantedCategories()

    fetchWantedCategories()

    expect(loading.value).toBe(true)
  })

  it('updates wantedCategories, total, and clears loading when WANTED_CATEGORIES_RESPONSE is received', () => {
    const { wantedCategories, loading, total, fetchWantedCategories } = useWantedCategories()
    fetchWantedCategories()

    const items: WantedCategoryItem[] = [
      { title: 'Foo_in_Germany', subcats: 1, files: 121, pages: 2, total: 124 },
      { title: 'Bar_in_Germany', subcats: 0, files: 5, pages: 10, total: 15 },
    ]
    mockSocketData.value = JSON.stringify({
      type: 'WANTED_CATEGORIES_RESPONSE',
      data: { items, total: 843 },
      nonce: 'x',
    })

    expect(wantedCategories.value).toEqual(items)
    expect(total.value).toBe(843)
    expect(loading.value).toBe(false)
  })

  it('ignores unrelated server messages', () => {
    const { wantedCategories } = useWantedCategories()

    mockSocketData.value = JSON.stringify({ type: 'BATCHES_LIST', data: {}, nonce: 'x' })

    expect(wantedCategories.value).toEqual([])
  })
})
