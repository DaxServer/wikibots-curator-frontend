import { useMapillary } from '@/composables/useMapillary'
import type { MapillaryImage, MapillaryItem } from '@/types/mapillary'
import type { Statement } from '@/types/wikidata'
import { describe, expect, it } from 'bun:test'

describe('useMapillary.loadSDC', () => {
  it('builds repeated images params and assigns SDC per item', async () => {
    const store: any = {}
    store.sequenceId = 'seq123'

    const baseImage: MapillaryImage = {
      id: 'img1',
      captured_at: Date.now(),
      geometry: { type: 'Point', coordinates: [0, 0] },
      height: 100,
      width: 100,
      thumb_256_url: 't256',
      thumb_1024_url: 't1024',
      thumb_original_url: 'torig',
      compass_angle: 0,
      is_pano: false,
    }

    const item1: MapillaryItem = {
      id: 'img1',
      index: 1,
      image: baseImage,
      sdc: [],
      meta: {
        title: 't1',
        description: { language: 'en', text: '' },
        categories: '',
        selected: true,
      },
    }

    const item2: MapillaryItem = {
      id: 'img2',
      index: 2,
      image: { ...baseImage, id: 'img2' },
      sdc: [],
      meta: {
        title: 't2',
        description: { language: 'en', text: '' },
        categories: '',
        selected: true,
      },
    }

    store.items = { img1: item1, img2: item2 }
    store.selectedItems = [item1, item2]
    store.isLoading = false
    store.error = null

    // @ts-expect-error provide global symbol used by composable
    globalThis.useMapillaryStore = () => store

    const sampleStatement: Statement = {
      mainsnak: { snaktype: 'value', property: 'P1', datavalue: { type: 'string', value: 'v' } },
      rank: 'normal',
    }

    const calls: string[] = []
    // @ts-expect-error simplify Response typing for test
    globalThis.fetch = async (input: string) => {
      calls.push(input)
      return {
        ok: true,
        json: async () => ({ img1: [sampleStatement], img2: [] }),
      }
    }

    const { loadSDC } = useMapillary()
    await loadSDC()

    expect(calls.length).toBe(1)
    expect(calls[0]).toContain('/api/mapillary/sequences/seq123/sdc?')
    expect(calls[0]).toContain('images=img1')
    expect(calls[0]).toContain('images=img2')
    expect(store.items.img1!.sdc.length).toBe(1)
    expect(store.items.img2!.sdc.length).toBe(0)
  })
})
