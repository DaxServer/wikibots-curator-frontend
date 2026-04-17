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
      const response = await fetch(RECONCILE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ queries: JSON.stringify(queries) }),
      })
      const data = (await response.json()) as ReconApiResponse
      categories.forEach(({ title }, i) => {
        reconcileResults.value[title] = data[`q${i}`]?.result ?? []
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
