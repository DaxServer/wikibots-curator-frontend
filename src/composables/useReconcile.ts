import type { WantedCategoryItem } from '@/types/asyncapi'
import { ref } from 'vue'

const RECONCILE_API = 'https://wikidata-reconciliation.wmcloud.org/en/api'
const QUERY_LIMIT = 3

export type ReconCandidate = {
  id: string
  name: string
  description: string
  score: number
  match: boolean
}

type ReconApiResponse = Record<string, { result: ReconCandidate[] }>

const reconcileResults = ref<Record<string, ReconCandidate[]>>({})
const selectedQids = ref<Record<string, string>>({})
const isReconciling = ref(false)

export function useReconcile() {
  async function reconcile(categories: WantedCategoryItem[]): Promise<void> {
    isReconciling.value = true
    try {
      const queries = Object.fromEntries(
        categories.map(({ title }, i) => [
          `q${i}`,
          { query: title.replaceAll('_', ' '), limit: QUERY_LIMIT },
        ]),
      )
      const url = `${RECONCILE_API}?queries=${encodeURIComponent(JSON.stringify(queries))}`
      const response = await fetch(url)
      const data = (await response.json()) as ReconApiResponse
      categories.forEach(({ title }, i) => {
        const candidates = data[`q${i}`]?.result ?? []
        reconcileResults.value[title] = candidates
        const first = candidates[0]
        if (candidates.length === 1 && first) {
          selectedQids.value[title] = first.id
        }
      })
    } finally {
      isReconciling.value = false
    }
  }

  function toggleSelect(title: string, qid: string): void {
    if (selectedQids.value[title] === qid) {
      delete selectedQids.value[title]
    } else {
      selectedQids.value[title] = qid
    }
  }

  function clearReconcile(): void {
    reconcileResults.value = {}
    selectedQids.value = {}
    isReconciling.value = false
  }

  return { reconcile, toggleSelect, clearReconcile, reconcileResults, selectedQids, isReconciling }
}
