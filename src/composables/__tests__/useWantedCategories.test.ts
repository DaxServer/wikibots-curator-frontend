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
    const { wantedCategories, loading } = useWantedCategories()
    wantedCategories.value = []
    loading.value = false
  })

  it('sends FETCH_WANTED_CATEGORIES message when fetchWantedCategories is called', () => {
    const { fetchWantedCategories } = useWantedCategories()

    fetchWantedCategories()

    expect(mockSend).toHaveBeenCalledWith(JSON.stringify({ type: 'FETCH_WANTED_CATEGORIES' }))
  })

  it('sets loading to true when fetchWantedCategories is called', () => {
    const { loading, fetchWantedCategories } = useWantedCategories()

    fetchWantedCategories()

    expect(loading.value).toBe(true)
  })

  it('updates wantedCategories and clears loading when WANTED_CATEGORIES_RESPONSE is received', () => {
    const { wantedCategories, loading, fetchWantedCategories } = useWantedCategories()
    fetchWantedCategories()

    const items: WantedCategoryItem[] = [
      { title: 'Foo_in_Germany', subcats: 1, files: 121, pages: 2, total: 124 },
      { title: 'Bar_in_Germany', subcats: 0, files: 5, pages: 10, total: 15 },
    ]
    mockSocketData.value = JSON.stringify({
      type: 'WANTED_CATEGORIES_RESPONSE',
      data: { items },
      nonce: 'x',
    })

    expect(wantedCategories.value).toEqual(items)
    expect(loading.value).toBe(false)
  })

  it('ignores unrelated server messages', () => {
    const { wantedCategories } = useWantedCategories()

    mockSocketData.value = JSON.stringify({ type: 'BATCHES_LIST', data: {}, nonce: 'x' })

    expect(wantedCategories.value).toEqual([])
  })
})
