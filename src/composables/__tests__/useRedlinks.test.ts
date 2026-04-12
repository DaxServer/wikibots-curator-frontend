import type { RedlinkItem } from '@/types/asyncapi'
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

import { useRedlinks } from '../useRedlinks'

describe('useRedlinks', () => {
  beforeEach(() => {
    mockSocketData.value = null
    ;(mockSend as Mock<typeof mockSend>).mockClear()
    const { redlinks, loading } = useRedlinks()
    redlinks.value = []
    loading.value = false
  })

  it('sends FETCH_REDLINKS message when fetchRedlinks is called', () => {
    const { fetchRedlinks } = useRedlinks()

    fetchRedlinks()

    expect(mockSend).toHaveBeenCalledWith(JSON.stringify({ type: 'FETCH_REDLINKS' }))
  })

  it('sets loading to true when fetchRedlinks is called', () => {
    const { loading, fetchRedlinks } = useRedlinks()

    fetchRedlinks()

    expect(loading.value).toBe(true)
  })

  it('updates redlinks and clears loading when REDLINKS_RESPONSE is received', () => {
    const { redlinks, loading, fetchRedlinks } = useRedlinks()
    fetchRedlinks()

    const items: RedlinkItem[] = [
      { title: 'Foo_in_Germany', linked_from: 'Category:Foo_in_France' },
      { title: 'Bar_in_Germany', linked_from: 'Category:Bar_in_France' },
    ]
    mockSocketData.value = JSON.stringify({
      type: 'REDLINKS_RESPONSE',
      data: { items },
      nonce: 'x',
    })

    expect(redlinks.value).toEqual(items)
    expect(loading.value).toBe(false)
  })

  it('ignores unrelated server messages', () => {
    const { redlinks } = useRedlinks()

    mockSocketData.value = JSON.stringify({ type: 'BATCHES_LIST', data: {}, nonce: 'x' })

    expect(redlinks.value).toEqual([])
  })
})
