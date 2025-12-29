import { ref } from 'vue'

interface MediaWikiRevisionSlot {
  content: string
}

interface MediaWikiRevision {
  slots?: {
    main?: MediaWikiRevisionSlot
  }
  content?: string
}

interface MediaWikiPage {
  title: string
  revisions?: MediaWikiRevision[]
}

export interface MediaWikiApiResponse {
  query?: {
    pages?: MediaWikiPage[]
  }
}

export const api = {
  async fetchBlacklistsJson(): Promise<MediaWikiApiResponse> {
    const params = new URLSearchParams({
      action: 'query',
      prop: 'revisions',
      rvprop: 'content',
      rvslots: '*',
      titles: 'MediaWiki:Filename-prefix-blacklist|MediaWiki:Titleblacklist',
      format: 'json',
      formatversion: '2',
      origin: '*',
    })

    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch blacklists: ${response.statusText}`)
    }

    return await response.json()
  },
}

const prefixBlacklist = ref<string[]>([])
const regexBlacklist = ref<RegExp[]>([])
const error = ref<string | null>(null)

export const useTitleBlacklist = () => {
  const processBlacklistsData = (data: MediaWikiApiResponse): void => {
    const pages = data.query?.pages || []

    for (const page of pages) {
      const content = page.revisions?.[0]?.slots?.main?.content
      if (!content) continue

      if (page.title === 'MediaWiki:Filename-prefix-blacklist') {
        parsePrefixBlacklist(content)
      } else if (page.title === 'MediaWiki:Titleblacklist') {
        parseRegexBlacklist(content)
      }
    }
  }

  const fetchBlacklists = async (): Promise<void> => {
    error.value = null

    try {
      const data = await api.fetchBlacklistsJson()
      processBlacklistsData(data)
    } catch (e) {
      console.error('Error fetching title blacklists:', e)
      error.value = e instanceof Error ? e.message : 'Unknown error'
    }
  }

  const parsePrefixBlacklist = (content: string) => {
    const lines = content.split('\n')
    const prefixes = lines
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      // Remove any trailing comments if they exist (though usually whole line is comment)
      // Some lists might be "Prefix  # Comment"
      .map((line) => line.split('#')[0]?.trim() ?? '')
      .filter((line) => line.length > 0)

    prefixBlacklist.value = prefixes
  }

  const parseRegexBlacklist = (content: string) => {
    const lines = content.split('\n')
    const regexes: RegExp[] = []

    for (const line of lines) {
      let cleaned = line.trim()
      if (!cleaned || cleaned.startsWith('#')) continue

      // MediaWiki TitleBlacklist format: "regex <options>"
      // Options are enclosed in angle brackets like <errmsg>, <casesensitive>, etc.
      // We need to strip everything after the first '<' that's not part of the regex itself
      // For simplicity, we'll remove anything that looks like " <something>"

      // Strip trailing options (space followed by <...>)
      cleaned = cleaned.replace(/\s+<[^>]+>.*$/, '')

      // Strip comments (e.g. "regex # comment")
      const commentIndex = cleaned.indexOf(' #')
      if (commentIndex !== -1) {
        cleaned = cleaned.substring(0, commentIndex).trim()
      }

      // Sanitize MediaWiki regex features to JS RegExp

      // 0. Handle \x{...} -> \u{...}
      // \x{00A0} -> \u{00A0}
      cleaned = cleaned.replace(/\\x\{([0-9A-Fa-f]+)\}/g, '\\u{$1}')

      // 1. Handle POSIX classes
      const posixMap: Record<string, string> = {
        '[:alpha:]': 'a-zA-Z',
        '[:alnum:]': 'a-zA-Z0-9',
        '[:digit:]': '\\d',
        '[:space:]': '\\s',
        '[:xdigit:]': '0-9a-fA-F',
        '[:upper:]': 'A-Z',
        '[:lower:]': 'a-z',
        '[:word:]': '\\w',
      }

      for (const [posix, replacement] of Object.entries(posixMap)) {
        cleaned = cleaned.split(posix).join(replacement)
      }

      // 2. Handle inline modifiers
      // (?i:...) -> (?:...) since we use 'i' flag globally
      cleaned = cleaned.replace(/\(\?i:/g, '(?:')
      // (?i) -> empty, assumed global
      cleaned = cleaned.replace(/\(\?i\)/g, '')

      // Skip patterns for other namespaces - we only care about files
      if (cleaned.match(/^(Template|User|Category|Commons):/)) {
        continue
      }

      // Add proper anchoring based on pattern type
      let finalPattern = cleaned

      // For patterns that start with "File:"
      if (cleaned.startsWith('File:')) {
        // If pattern already has ^ at start, just ensure it has $ at end
        if (cleaned.startsWith('^')) {
          if (!cleaned.endsWith('$')) {
            finalPattern = `${cleaned}$`
          }
        } else {
          // Add both ^ and $ anchors for complete matching
          finalPattern = `^${cleaned}$`
        }
      } else {
        // For generic patterns (no namespace), add ^ and $ if they don't have them
        // and if they're not already designed to match anywhere (like .* patterns)
        if (
          !cleaned.startsWith('^') &&
          !cleaned.endsWith('$') &&
          !cleaned.startsWith('.*') &&
          !cleaned.startsWith('.+')
        ) {
          finalPattern = `^${cleaned}$`
        }
      }

      // 3. Handle Unicode properties and extended unicode escapes
      // If regex contains \p{...}, \P{...}, or \u{...}, we need 'u' flag
      const flags = /(\\[pP]\{|\\u\{)/.test(cleaned) ? 'iu' : 'i'

      // Compile as case-insensitive by default (MediaWiki default behavior)
      regexes.push(new RegExp(finalPattern, flags))
    }

    regexBlacklist.value = regexes
  }

  const isBlacklisted = (filename: string): boolean => {
    // Check prefixes

    for (const prefix of prefixBlacklist.value) {
      if (filename.toLowerCase().startsWith(prefix.toLowerCase())) {
        return true
      }
    }

    // Check regexes against both the filename and the full title with "File:" prefix
    // Some regex patterns in the title blacklist include the "File:" prefix
    const fullTitle = `File:${filename}`

    for (const regex of regexBlacklist.value) {
      if (regex.test(filename) || regex.test(fullTitle)) {
        return true
      }
    }

    return false
  }

  const reset = (): void => {
    prefixBlacklist.value = []
    regexBlacklist.value = []
    error.value = null
  }

  return {
    fetchBlacklists,
    processBlacklistsData,
    isBlacklisted,
    prefixBlacklist,
    regexBlacklist,
    error,
    reset,
  }
}
