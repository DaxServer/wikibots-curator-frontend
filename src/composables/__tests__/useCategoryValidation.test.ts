import { useCollectionsStore } from '@/stores/collections.store'
import type { PresetItem } from '@/types/asyncapi'
import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import type { QueryNormalized, QueryPage } from '../useCategoryValidation'

const makePreset = (categories: string, is_default = false): PresetItem => ({
  id: 1,
  title: 'Test Preset',
  title_template: '',
  categories,
  exclude_from_date_category: false,
  handler: 'mapillary',
  is_default,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
})

// mock.module must appear before any import of the module under test.
// The composable is imported dynamically in beforeEach so mock.restore()
// lets each test get a fresh module load with the controlled debounce.
let pendingDebounceExecutors: (() => Promise<void> | void)[] = []
mock.module('ts-debounce', () => ({
  debounce: (fn: (...args: unknown[]) => Promise<void> | void) => {
    let cancelled = false
    let callId = 0
    const debounced = (...args: unknown[]) => {
      callId += 1
      const currentCallId = callId
      pendingDebounceExecutors.push(() => {
        if (cancelled) return
        if (currentCallId !== callId) return
        return fn(...args)
      })
    }
    debounced.cancel = () => {
      cancelled = true
    }
    return debounced
  },
}))

describe('useCategoryValidation', () => {
  let parseCategoryNames: typeof import('../useCategoryValidation').parseCategoryNames
  let useCategoryValidation: typeof import('../useCategoryValidation').useCategoryValidation
  let store: ReturnType<typeof useCollectionsStore>

  beforeEach(async () => {
    setActivePinia(createPinia())
    store = useCollectionsStore()
    mock.restore()
    pendingDebounceExecutors = []
    const mod = await import('../useCategoryValidation')
    parseCategoryNames = mod.parseCategoryNames
    useCategoryValidation = mod.useCategoryValidation
  })

  describe('parseCategoryNames', () => {
    it.each([
      ['empty string', ''],
      ['plain text', 'some plain text'],
      ['missing closing brackets', '[[Category:Foo'],
      ['single-bracket link', '[Category:Foo]'],
      ['two opening one closing bracket', '[[Category:Foo]'],
      ['one opening two closing brackets', '[Category:Foo]]'],
      ['whitespace-only name', '[[Category:   ]]'],
    ])('returns [] for %s', (_, input) => {
      expect(parseCategoryNames(input)).toEqual([])
    })

    it.each([
      ['standard wikitext', '[[Category:Photography in Berlin]]', 'Photography in Berlin'],
      ['lowercase Category prefix', '[[category:Foo]]', 'Foo'],
      [
        'lowercase first char in name',
        '[[Category:photography in Berlin]]',
        'Photography in Berlin',
      ],
      ['leading and trailing whitespace', '[[Category:  Foo  ]]', 'Foo'],
      ['pipe alias', '[[Category:Foo|display text]]', 'Foo'],
      ['trailing space before sort key', '[[Category:Foo |sort key]]', 'Foo'],
      ['underscores replaced with spaces', '[[Category:Foo_Bar_Baz]]', 'Foo Bar Baz'],
    ])('extracts name from %s', (_, input, expected) => {
      expect(parseCategoryNames(input)).toEqual([expected])
    })

    it.each([
      ['identical names', '[[Category:Foo]]\n[[Category:Foo]]', ['Foo']],
      ['names differing only by trailing space', '[[Category:Foo ]]\n[[Category:Foo]]', ['Foo']],
      ['names differing only by underscores vs spaces', '[[Category:Foo_Bar]]\n[[Category:Foo Bar]]', ['Foo Bar']],
    ])('deduplicates %s', (_, input, expected) => {
      expect(parseCategoryNames(input)).toEqual(expected)
    })

    it('extracts multiple category names', () => {
      expect(
        parseCategoryNames('[[Category:Photography in Berlin]]\n[[Category:2024 uploads]]'),
      ).toEqual(['Photography in Berlin', '2024 uploads'])
    })
  })

  const buildMockFetch = (pages: QueryPage[], normalized: QueryNormalized[] = []) =>
    mock(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            query: {
              ...(normalized.length > 0 ? { normalized } : {}),
              pages: Object.fromEntries(pages.map((p, i) => [String(i), p])),
            },
          }),
      }),
    )

  describe('composable', () => {
    it('returns empty missingCategories when textarea is empty', async () => {
      store.globalCategories = ''
      const { missingCategories } = useCategoryValidation()

      for (const exec of pendingDebounceExecutors) await exec()
      expect(missingCategories.value).toEqual([])
    })

    it('reports missing categories returned by the API', async () => {
      global.fetch = buildMockFetch([
        { title: 'Category:Photography in Berlin', missing: true },
      ]) as unknown as typeof fetch

      store.globalCategories = '[[Category:Photography in Berlin]]'
      const { missingCategories } = useCategoryValidation()

      for (const exec of pendingDebounceExecutors) await exec()
      expect(missingCategories.value).toEqual(['Photography in Berlin'])
    })

    it.each([
      {
        label: 'category exists on Commons',
        pages: [{ title: 'Category:Photography in Berlin' }] as QueryPage[],
        normalized: [] as QueryNormalized[],
        input: '[[Category:Photography in Berlin]]',
      },
      {
        label: 'category with underscores exists on Commons',
        pages: [{ title: 'Category:Photography in Berlin' }] as QueryPage[],
        normalized: [] as QueryNormalized[],
        input: '[[Category:Photography_in_Berlin]]',
      },
    ])('does not report category as missing when $label', async ({ pages, normalized, input }) => {
      global.fetch = buildMockFetch(pages, normalized) as unknown as typeof fetch

      store.globalCategories = input
      const { missingCategories } = useCategoryValidation()

      for (const exec of pendingDebounceExecutors) await exec()
      expect(missingCategories.value).toEqual([])
    })

    it.each([
      {
        label: 'confirmed to be missing',
        pages: [{ title: 'Category:Photography in Berlin', missing: true }] as QueryPage[],
        normalized: [] as QueryNormalized[],
        input: '[[Category:Photography in Berlin]]',
        expectedMissing: ['Photography in Berlin'] as string[],
      },
      {
        label: 'confirmed to exist',
        pages: [{ title: 'Category:Photography in Berlin' }] as QueryPage[],
        normalized: [] as QueryNormalized[],
        input: '[[Category:Photography in Berlin]]',
        expectedMissing: [] as string[],
      },
    ])(
      'does not re-query category $label',
      async ({ pages, normalized, input, expectedMissing }) => {
        const mockFetch = buildMockFetch(pages, normalized)
        global.fetch = mockFetch as unknown as typeof fetch

        store.globalCategories = input
        const { missingCategories } = useCategoryValidation()

        for (const exec of [...pendingDebounceExecutors]) await exec()
        pendingDebounceExecutors = []

        store.globalCategories = `${input}\n`
        for (const exec of pendingDebounceExecutors) await exec()

        expect(mockFetch.mock.calls).toHaveLength(1)
        expect(missingCategories.value).toEqual(expectedMissing)
      },
    )

    it('sends categories in batches of 50 when there are more than 50', async () => {
      const catNames = Array.from({ length: 51 }, (_, i) => `Cat${i + 1}`)
      const allPages = catNames.map((name) => ({ title: `Category:${name}` }))

      let callCount = 0
      global.fetch = mock(() => {
        const chunk = callCount === 0 ? allPages.slice(0, 50) : allPages.slice(50)
        callCount++
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              query: {
                pages: Object.fromEntries(chunk.map((p, i) => [String(i), p])),
              },
            }),
        })
      }) as unknown as typeof fetch

      store.globalCategories = catNames.map((name) => `[[Category:${name}]]`).join('\n')
      const { missingCategories } = useCategoryValidation()

      for (const exec of pendingDebounceExecutors) await exec()

      expect((global.fetch as unknown as ReturnType<typeof mock>).mock.calls).toHaveLength(2)
      expect(missingCategories.value).toEqual([])
    })

    it.each([
      {
        label: 'missing category',
        categories: '[[Category:Missing Cat]]',
        pages: [{ title: 'Category:Missing Cat', missing: true }] as QueryPage[],
        expected: ['Missing Cat'] as string[],
      },
      {
        label: 'existing category',
        categories: '[[Category:Existing Cat]]',
        pages: [{ title: 'Category:Existing Cat' }] as QueryPage[],
        expected: [] as string[],
      },
    ])(
      'validates categories when a preset with a $label is applied',
      async ({ categories, pages, expected }) => {
        global.fetch = buildMockFetch(pages) as unknown as typeof fetch
        store.applyPreset(makePreset(categories))
        const { missingCategories } = useCategoryValidation()

        for (const exec of pendingDebounceExecutors) await exec()
        expect(missingCategories.value).toEqual(expected)
      },
    )

    it('re-validates when switching from one preset to another', async () => {
      global.fetch = buildMockFetch([{ title: 'Category:Existing Cat' }]) as unknown as typeof fetch
      store.applyPreset(makePreset('[[Category:Existing Cat]]'))
      const { missingCategories } = useCategoryValidation()

      for (const exec of [...pendingDebounceExecutors]) await exec()
      pendingDebounceExecutors = []
      expect(missingCategories.value).toEqual([])

      global.fetch = buildMockFetch([
        { title: 'Category:Missing Cat', missing: true },
      ]) as unknown as typeof fetch
      store.applyPreset(makePreset('[[Category:Missing Cat]]'))
      await nextTick()

      for (const exec of pendingDebounceExecutors) await exec()
      expect(missingCategories.value).toEqual(['Missing Cat'])
    })
  })
})
