import { useSocket } from '@/composables/useSocket'
import type {
  CheckCategoriesDeleted,
  CreateCategory,
  RecategorizeFiles,
  ServerMessage,
} from '@/types/asyncapi'
import { ref, watch } from 'vue'

export type CategoryStatus =
  | { type: 'idle' }
  | { type: 'deleted' }
  | { type: 'creating' }
  | { type: 'created'; createdTitle: string }
  | { type: 'recategorizing' }
  | { type: 'recategorized'; count: number }
  | { type: 'error'; message: string }

const ZERO_DECIMAL_FOCAL_LENGTH = /^Lens focal length (\d+)[.,](0+) mm$/

export const getFocalLengthRedirect = (title: string): string | null => {
  const normalized = title.replaceAll('_', ' ')
  const match = normalized.match(ZERO_DECIMAL_FOCAL_LENGTH)
  if (!match) return null
  return `Lens focal length ${parseInt(match[1]!, 10)} mm`
}

const MONTH_NUMBER: Record<string, string> = {
  January: '01',
  February: '02',
  March: '03',
  April: '04',
  May: '05',
  June: '06',
  July: '07',
  August: '08',
  September: '09',
  October: '10',
  November: '11',
  December: '12',
}

const CATEGORY_TEXT_MAP = {
  campaign: {
    pattern: /^Uploaded via Campaign:(.*)$/,
    getText: (m: RegExpMatchArray) => `{{Hidden cat}}\n[[Category:Uploaded via Campaign|${m[1]}]]`,
  },
  photographerNews: {
    pattern: /^Photos by (.+) for (Mehr|Tasnim|Moj|Fars) News Agency$/,
    getText: (m: RegExpMatchArray) => `{{${m[2]} photographer category|${m[1]}}}`,
  },
  bostonByMonth: {
    pattern: /^(\w+) (\d{4}) in Boston$/,
    getText: (m: RegExpMatchArray) => {
      const month = MONTH_NUMBER[m[1]!] ?? '01'
      return `{{MonthbyyearBoston|${m[2]!.slice(0, 3)}|${m[2]!.slice(3)}|${month}}}`
    },
  },
  wolsztynByMonth: {
    pattern: /^(\w+) (\d{4}) in Wolsztyn$/,
    getText: (m: RegExpMatchArray) => {
      const month = MONTH_NUMBER[m[1]!] ?? '01'
      return `{{POLmonthbyyear-Wolsztyn|${m[2]!.slice(0, 3)}|${m[2]!.slice(3)}|${month}}}`
    },
  },
  lensFocalLength: {
    pattern: /^Lens focal length (\d+) mm$/,
    getText: (m: RegExpMatchArray) => {
      const padded = String(parseInt(m[1]!, 10)).padStart(5, '0')
      return `{{ImageTOC}}\n{{Hiddencat}}\n\n[[Category:Photographs by lens focal length| ${padded}]]`
    },
  },
  lensFocalLengthDecimal: {
    pattern: /^Lens focal length (\d+)\.(\d+) mm$/,
    getText: (m: RegExpMatchArray) => {
      const integer = parseInt(m[1]!, 10)
      const decimal = m[2]!
      return `{{Hiddencat}}\n{{ImageTOC}}\n[[Category:Lens focal length ${integer} mm| ${integer}.${decimal}]]`
    },
  },
  lensFocalLengthGermanComma: {
    pattern: /^Lens focal length (\d+),(\d+) mm$/,
    getText: (m: RegExpMatchArray) => {
      const integer = parseInt(m[1]!, 10)
      const decimal = m[2]!
      if (parseInt(decimal, 10) === 0) {
        return `[[Category:Lens focal length ${integer} mm]]`
      }
      return `{{Hiddencat}}\n{{ImageTOC}}\n[[Category:Lens focal length ${integer} mm| ${integer}.${decimal}]]`
    },
  },
} satisfies Record<string, { pattern: RegExp; getText: (m: RegExpMatchArray) => string }>

export type CategoryTextKey = keyof typeof CATEGORY_TEXT_MAP

export const getCategoryText = (title: string): string => {
  const normalized = title.replaceAll('_', ' ')
  for (const { pattern, getText } of Object.values(CATEGORY_TEXT_MAP)) {
    const match = normalized.match(pattern)
    if (match) return getText(match)
  }
  return '{{subst:unc}}'
}

const statuses = ref<Record<string, CategoryStatus>>({})

export const useCreateCategory = () => {
  const { data, send } = useSocket

  watch(
    data,
    (raw) => {
      if (!raw) return
      const msg = JSON.parse(raw as string) as ServerMessage
      if (msg.type === 'CATEGORIES_DELETED_RESPONSE') {
        for (const title of msg.data.deleted) {
          statuses.value[title] = { type: 'deleted' }
        }
      }
      if (msg.type === 'CATEGORY_CREATED_RESPONSE') {
        const title = msg.data.title.replace(/^Category:/, '')
        statuses.value[title] = { type: 'created', createdTitle: msg.data.title }
      }
      if (msg.type === 'RECATEGORIZE_FILES_RESPONSE') {
        statuses.value[msg.data.source] = { type: 'recategorized', count: msg.data.count }
      }
      if (msg.type === 'ERROR') {
        for (const [title, status] of Object.entries(statuses.value)) {
          if (status.type === 'creating' || status.type === 'recategorizing') {
            statuses.value[title] = { type: 'error', message: msg.data }
          }
        }
      }
    },
    { flush: 'sync' },
  )

  const getStatus = (title: string): CategoryStatus => statuses.value[title] ?? { type: 'idle' }

  const checkIfDeleted = (titles: string[]): void => {
    send(
      JSON.stringify({
        type: 'CHECK_CATEGORIES_DELETED',
        data: { titles },
      } satisfies CheckCategoriesDeleted),
    )
  }

  const createCategory = (title: string, text: string, wikidataQid?: string): void => {
    statuses.value[title] = { type: 'creating' }
    send(
      JSON.stringify({
        type: 'CREATE_CATEGORY',
        data: { title, text, wikidata_qid: wikidataQid },
      } satisfies CreateCategory),
    )
  }

  const recategorizeFiles = (source: string, target: string): void => {
    statuses.value[source] = { type: 'recategorizing' }
    send(
      JSON.stringify({
        type: 'RECATEGORIZE_FILES',
        data: { source, target },
      } satisfies RecategorizeFiles),
    )
  }

  return { getStatus, checkIfDeleted, createCategory, recategorizeFiles, getCategoryText }
}
