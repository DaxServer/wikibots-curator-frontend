import { useSocket } from '@/composables/useSocket'
import type { CheckCategoriesDeleted, CreateCategory, ServerMessage } from '@/types/asyncapi'
import { ref, watch } from 'vue'

export type CategoryStatus =
  | { type: 'idle' }
  | { type: 'deleted' }
  | { type: 'creating' }
  | { type: 'created'; createdTitle: string }
  | { type: 'error'; message: string }

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
      const month = String(new Date(`${m[1]} 1`).getMonth() + 1).padStart(2, '0')
      return `{{MonthbyyearBoston|${m[2]!.slice(0, 3)}|${m[2]!.slice(3)}|${month}}}`
    },
  },
  wolsztynByMonth: {
    pattern: /^(\w+) (\d{4}) in Wolsztyn$/,
    getText: (m: RegExpMatchArray) => {
      const month = String(new Date(`${m[1]} 1`).getMonth() + 1).padStart(2, '0')
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

export const useCreateCategory = () => {
  const { data, send } = useSocket
  const statuses = ref<Record<string, CategoryStatus>>({})

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
      if (msg.type === 'ERROR') {
        for (const [title, status] of Object.entries(statuses.value)) {
          if (status.type === 'creating') {
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

  return { getStatus, checkIfDeleted, createCategory, getCategoryText }
}
