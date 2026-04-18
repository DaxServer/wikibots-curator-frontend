import { useSocket } from '@/composables/useSocket'
import type { ServerMessage, WantedCategoryItem } from '@/types/asyncapi'
import { ref, watch } from 'vue'

const wantedCategories = ref<WantedCategoryItem[]>([])
const loading = ref(false)
const total = ref(0)

export const useWantedCategories = () => {
  const { data, send } = useSocket

  watch(
    data,
    (raw) => {
      if (!raw) return
      const msg = JSON.parse(raw as string) as ServerMessage
      if (msg.type === 'WANTED_CATEGORIES_RESPONSE') {
        wantedCategories.value = msg.data.items
        total.value = msg.data.total
        loading.value = false
      }
    },
    { flush: 'sync' },
  )

  const fetchWantedCategories = (offset = 0, filter?: string) => {
    loading.value = true
    send(JSON.stringify({ type: 'FETCH_WANTED_CATEGORIES', data: { offset, filter } }))
  }

  return { wantedCategories, loading, total, fetchWantedCategories }
}
