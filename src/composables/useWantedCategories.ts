import { useSocket } from '@/composables/useSocket'
import type { ServerMessage, WantedCategoryItem } from '@/types/asyncapi'
import { ref, watch } from 'vue'

const wantedCategories = ref<WantedCategoryItem[]>([])
const loading = ref(false)

export const useWantedCategories = () => {
  const { data, send } = useSocket

  watch(
    data,
    (raw) => {
      if (!raw) return
      const msg = JSON.parse(raw as string) as ServerMessage
      if (msg.type === 'WANTED_CATEGORIES_RESPONSE') {
        wantedCategories.value = msg.data.items
        loading.value = false
      }
    },
    { flush: 'sync' },
  )

  const fetchWantedCategories = () => {
    loading.value = true
    send(JSON.stringify({ type: 'FETCH_WANTED_CATEGORIES' }))
  }

  return { wantedCategories, loading, fetchWantedCategories }
}
