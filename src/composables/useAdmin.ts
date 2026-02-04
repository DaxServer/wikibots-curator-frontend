import { useAdminStore } from '@/stores/admin.store'
import type { AdminBatch, AdminUploadRequest, AdminUser, PaginatedResponse } from '@/types/admin'

export const useAdmin = () => {
  const store = useAdminStore()

  const getAdminBatches = async (
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<AdminBatch>> => {
    const response = await fetch(`/api/admin/batches?page=${page}&limit=${limit}`)
    if (!response.ok) {
      throw new Error('Failed to fetch batches')
    }
    return response.json()
  }

  const getAdminUsers = async (
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<AdminUser>> => {
    const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}`)
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    return response.json()
  }

  const getAdminUploadRequests = async (
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<AdminUploadRequest>> => {
    const response = await fetch(`/api/admin/upload_requests?page=${page}&limit=${limit}`)
    if (!response.ok) {
      throw new Error('Failed to fetch upload requests')
    }
    return response.json()
  }

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
          const data = await getAdminBatches(page, adminParams.rows)
          store.adminBatches = data.items
          store.adminTotal = data.total
          break
        }
        case 'users': {
          const data = await getAdminUsers(page, adminParams.rows)
          store.adminUsers = data.items
          store.adminTotal = data.total
          break
        }
        case 'upload_requests': {
          const data = await getAdminUploadRequests(page, adminParams.rows)
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
    getAdminBatches,
    getAdminUsers,
    getAdminUploadRequests,
    updateAdminUploadRequest,
    refreshAdminData,
  }
}
