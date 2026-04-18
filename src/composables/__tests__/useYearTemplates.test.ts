import { beforeEach, describe, expect, it, mock } from 'bun:test'
import type * as YearTemplatesModule from '../useYearTemplates'

type QueryPage = { title: string; missing?: boolean }

const buildMockFetch = (pages: QueryPage[]) =>
  mock(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          query: { pages },
        }),
    }),
  )

describe('useYearTemplates', () => {
  let useYearTemplates: typeof import('../useYearTemplates').useYearTemplates

  beforeEach(async () => {
    const mod = (await import('../useYearTemplates')) as typeof YearTemplatesModule
    useYearTemplates = mod.useYearTemplates
    mod.templateMap.value = {}
    mod.queriedSubjects.clear()
  })

  it('leaves templateMap empty when no titles match "X in YYYY" pattern', async () => {
    const { templateMap, checkTemplates } = useYearTemplates()
    await checkTemplates(['Photos of Dogs', 'Uploaded via Campaign:foo'])
    expect(templateMap.value).toEqual({})
  })

  it('does not call fetch when no titles match "X in YYYY"', async () => {
    const fetchMock = mock(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))
    global.fetch = fetchMock as unknown as typeof fetch

    const { checkTemplates } = useYearTemplates()
    await checkTemplates(['Photos of Dogs'])

    expect(fetchMock.mock.calls).toHaveLength(0)
  })

  it('adds entry to templateMap when template exists for "X in YYYY" category', async () => {
    global.fetch = buildMockFetch([
      { title: 'Template:Politicians of Australia by year' },
    ]) as unknown as typeof fetch

    const { templateMap, checkTemplates } = useYearTemplates()
    await checkTemplates(['Politicians of Australia in 1966'])

    expect(templateMap.value['Politicians of Australia in 1966']).toBe(
      '{{Politicians of Australia by year|196|6}}',
    )
  })

  it('does not add entry when template is missing on Commons', async () => {
    global.fetch = buildMockFetch([
      { title: 'Template:Politicians of Australia by year', missing: true },
    ]) as unknown as typeof fetch

    const { templateMap, checkTemplates } = useYearTemplates()
    await checkTemplates(['Politicians of Australia in 1966'])

    expect(templateMap.value).toEqual({})
  })

  it('splits 4-digit year correctly: first 3 digits and last digit', async () => {
    global.fetch = buildMockFetch([
      { title: 'Template:Bridges built by year' },
    ]) as unknown as typeof fetch

    const { templateMap, checkTemplates } = useYearTemplates()
    await checkTemplates(['Bridges built in 2000'])

    expect(templateMap.value['Bridges built in 2000']).toBe('{{Bridges built by year|200|0}}')
  })

  it('handles multiple matching categories in one call', async () => {
    global.fetch = buildMockFetch([
      { title: 'Template:Bridges built by year' },
      { title: 'Template:Politicians of Australia by year', missing: true },
    ]) as unknown as typeof fetch

    const { templateMap, checkTemplates } = useYearTemplates()
    await checkTemplates(['Bridges built in 2000', 'Politicians of Australia in 1966'])

    expect(Object.keys(templateMap.value)).toHaveLength(1)
    expect(templateMap.value['Bridges built in 2000']).toBe('{{Bridges built by year|200|0}}')
  })

  it('skips titles that do not end in a 4-digit year', async () => {
    const fetchMock = mock(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))
    global.fetch = fetchMock as unknown as typeof fetch

    const { templateMap, checkTemplates } = useYearTemplates()
    await checkTemplates(['Photos in 66', 'Photos in 20000'])

    expect(fetchMock.mock.calls).toHaveLength(0)
    expect(templateMap.value).toEqual({})
  })

  it('handles categories with underscores in title', async () => {
    global.fetch = buildMockFetch([
      { title: 'Template:Politicians of Australia by year' },
    ]) as unknown as typeof fetch

    const { templateMap, checkTemplates } = useYearTemplates()
    await checkTemplates(['Politicians_of_Australia_in_1966'])

    expect(templateMap.value.Politicians_of_Australia_in_1966).toBe(
      '{{Politicians of Australia by year|196|6}}',
    )
  })

  it('sends template titles to Commons API with correct format', async () => {
    const fetchMock = buildMockFetch([{ title: 'Template:Cars by year', missing: true }])
    global.fetch = fetchMock as unknown as typeof fetch

    const { checkTemplates } = useYearTemplates()
    await checkTemplates(['Cars in 1985'])

    const rawBody =
      ((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]?.body as string) ?? ''
    const params = new URLSearchParams(rawBody)
    expect(params.get('titles')).toContain('Template:Cars by year')
  })

  it('sends titles in batches of 50 when there are more than 50 matching categories', async () => {
    const titles = Array.from({ length: 51 }, (_, i) => `Subject ${i} in 2000`)
    const pages = titles.map((_, i) => ({ title: `Template:Subject ${i} by year`, missing: true }))

    let callCount = 0
    global.fetch = mock(() => {
      const chunk = callCount === 0 ? pages.slice(0, 50) : pages.slice(50)
      callCount++
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            query: { pages: chunk },
          }),
      })
    }) as unknown as typeof fetch

    const { checkTemplates } = useYearTemplates()
    await checkTemplates(titles)

    expect(callCount).toBe(2)
  })

  it('does not re-query already-checked templates on second call', async () => {
    const fetchMock = buildMockFetch([{ title: 'Template:Cars by year', missing: true }])
    global.fetch = fetchMock as unknown as typeof fetch

    const { checkTemplates } = useYearTemplates()
    await checkTemplates(['Cars in 1985'])
    await checkTemplates(['Cars in 1985'])

    expect(fetchMock.mock.calls).toHaveLength(1)
  })

  it('only queries new titles on second call, skipping already-checked ones', async () => {
    const firstFetch = buildMockFetch([{ title: 'Template:Cars by year', missing: true }])
    global.fetch = firstFetch as unknown as typeof fetch
    const { checkTemplates } = useYearTemplates()
    await checkTemplates(['Cars in 1985'])

    const secondFetch = buildMockFetch([{ title: 'Template:Boats by year' }])
    global.fetch = secondFetch as unknown as typeof fetch
    await checkTemplates(['Cars in 1985', 'Boats in 2001'])

    expect(secondFetch.mock.calls).toHaveLength(1)
    const rawBody =
      ((secondFetch.mock.calls[0] as unknown as [string, RequestInit])[1]?.body as string) ?? ''
    const params = new URLSearchParams(rawBody)
    expect(params.get('titles')).not.toContain('Template:Cars by year')
    expect(params.get('titles')).toContain('Template:Boats by year')
  })
})
