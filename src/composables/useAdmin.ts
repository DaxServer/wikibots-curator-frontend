import { useAdminStore } from '@/stores/admin.store'
import type { AdminBatch, AdminUploadRequest, AdminUser, PaginatedResponse } from '@/types/admin'

const fetchData = async <T>(
  endpoint: string,
  page: number,
  limit: number,
): Promise<PaginatedResponse<T>> => {
  const response = await fetch(`/api/admin/${endpoint}?page=${page}&limit=${limit}`)
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
    const { adminTable, adminParams } = store
    const page = Math.floor(adminParams.first / adminParams.rows) + 1

    store.adminLoading = true

    try {
      switch (adminTable) {
        case 'batches': {
          const data = await fetchData<AdminBatch>('batches', page, adminParams.rows)
          store.adminBatches = data.items
          store.adminTotal = data.total
          break
        }
        case 'users': {
          const data = await fetchData<AdminUser>('users', page, adminParams.rows)
          store.adminUsers = data.items
          store.adminTotal = data.total
          break
        }
        case 'upload_requests': {
          const data = await fetchData<AdminUploadRequest>(
            'upload_requests',
            page,
            adminParams.rows,
          )
          store.adminUploadRequests = data.items
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
