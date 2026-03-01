import { useAdminStore } from '@/stores/admin.store'
import type {
  AdminBatch,
  AdminPreset,
  AdminUploadRequest,
  AdminUser,
  PaginatedResponse,
} from '@/types/admin'

const fetchData = async <T>(
  endpoint: string,
  page: number,
  limit: number,
  filterText?: string,
): Promise<PaginatedResponse<T>> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (filterText) params.set('filter_text', filterText)
  const response = await fetch(`/api/admin/${endpoint}?${params}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}`)
  }
  return response.json()
}

export const useAdmin = () => {
  const store = useAdminStore()

  const updateAdminUploadRequest = async (
    id: number,
    field: string,
    value: string,
  ): Promise<void> => {
    const response = await fetch(`/api/admin/upload_requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [field]: value }),
    })
    if (!response.ok) {
      throw new Error('Failed to update upload request')
    }
  }

  const refreshAdminData = async () => {
    const { adminTable, adminParams, adminFilterText } = store
    const page = Math.floor(adminParams.first / adminParams.rows) + 1
    const filterText = adminFilterText || undefined

    store.adminLoading = true

    try {
      switch (adminTable) {
        case 'batches': {
          const data = await fetchData<AdminBatch>('batches', page, adminParams.rows, filterText)
          store.adminBatches = data.items
          store.adminTotal = data.total
          break
        }
        case 'users': {
          const data = await fetchData<AdminUser>('users', page, adminParams.rows, filterText)
          store.adminUsers = data.items
          store.adminTotal = data.total
          break
        }
        case 'upload_requests': {
          const data = await fetchData<AdminUploadRequest>(
            'upload_requests',
            page,
            adminParams.rows,
            filterText,
          )
          store.adminUploadRequests = data.items
          store.adminTotal = data.total
          break
        }
        case 'presets': {
          const data = await fetchData<AdminPreset>('presets', page, adminParams.rows, filterText)
          store.adminPresets = data.items
          store.adminTotal = data.total
          break
        }
      }
    } finally {
      store.adminLoading = false
    }
  }

  return {
    updateAdminUploadRequest,
    refreshAdminData,
  }
}
