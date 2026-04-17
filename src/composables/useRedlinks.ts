import { useSocket } from '@/composables/useSocket'
import type { FetchRedlinks, RedlinkItem, ServerMessage } from '@/types/asyncapi'
import { ref, watch } from 'vue'

const redlinks = ref<RedlinkItem[]>([])
const loading = ref(false)

export const useRedlinks = () => {
  const { data, send } = useSocket

  watch(
    data,
    (raw) => {
      if (!raw) return
      const msg = JSON.parse(raw as string) as ServerMessage
      if (msg.type === 'REDLINKS_RESPONSE') {
        redlinks.value = msg.data.items
        loading.value = false
      }
    },
    { flush: 'sync' },
  )

  const fetchRedlinks = () => {
    loading.value = true
    send(JSON.stringify({ type: 'FETCH_REDLINKS' } satisfies FetchRedlinks))
  }

  return { redlinks, loading, fetchRedlinks }
}
