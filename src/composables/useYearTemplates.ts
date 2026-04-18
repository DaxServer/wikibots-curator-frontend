import { ref } from 'vue'

const COMMONS_API_URL = 'https://commons.wikimedia.org/w/api.php'
const TITLES_PER_REQUEST = 50
const YEAR_IN_PATTERN = /^(.+) in (\d{4})$/

export const templateMap = ref<Record<string, string>>({})
export const queriedSubjects = new Set<string>()

const buildWikitext = (subject: string, year: string): string =>
  `{{${subject} by year|${year.slice(0, 3)}|${year[3]}}}`

const fetchExistingTemplates = async (templateTitles: string[]): Promise<Set<string>> => {
  const existing = new Set<string>()

  for (let i = 0; i < templateTitles.length; i += TITLES_PER_REQUEST) {
    const chunk = templateTitles.slice(i, i + TITLES_PER_REQUEST)

    const params = new URLSearchParams()
    params.set('action', 'query')
    params.set('titles', chunk.join('|'))
    params.set('format', 'json')
    params.set('origin', '*')
    params.set('formatversion', '2')

    const res = await fetch(COMMONS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    if (!res.ok) continue

    const data = (await res.json()) as {
      query?: { pages?: Record<string, { title: string; missing?: boolean }> }
    }

    for (const page of Object.values(data.query?.pages ?? {})) {
      if (!page.missing) existing.add(page.title)
    }
  }

  return existing
}

export const useYearTemplates = () => {
  const checkTemplates = async (titles: string[]): Promise<void> => {
    const candidates = titles
      .map((title) => {
        const normalized = title.replaceAll('_', ' ')
        const match = normalized.match(YEAR_IN_PATTERN)
        if (!match) return null
        return { originalTitle: title, subject: match[1]!, year: match[2]! }
      })
      .filter((c): c is { originalTitle: string; subject: string; year: string } => c !== null)
      .filter((c) => !queriedSubjects.has(c.subject))

    if (candidates.length === 0) return

    for (const c of candidates) queriedSubjects.add(c.subject)

    const templateTitles = candidates.map((c) => `Template:${c.subject} by year`)
    const existing = await fetchExistingTemplates(templateTitles)

    for (const candidate of candidates) {
      const templateTitle = `Template:${candidate.subject} by year`
      if (existing.has(templateTitle)) {
        templateMap.value[candidate.originalTitle] = buildWikitext(
          candidate.subject,
          candidate.year,
        )
      }
    }
  }

  return { templateMap, checkTemplates }
}
