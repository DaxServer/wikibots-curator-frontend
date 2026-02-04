import type { AdminBatch, AdminUploadRequest, AdminUser } from '@/types/admin'
import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  const adminTable = ref<'batches' | 'users' | 'upload_requests'>('batches')
  const adminBatches = shallowRef<AdminBatch[]>([])
  const adminUsers = shallowRef<AdminUser[]>([])
  const adminUploadRequests = shallowRef<AdminUploadRequest[]>([])
  const adminTotal = ref(0)
  const adminLoading = ref(false)
  const adminParams = ref({
    first: 0,
    rows: 100,
    page: 1,
  })

  const data = computed(() => {
    switch (adminTable.value) {
      case 'batches':
        return {
          table: adminTable.value,
          columns: [
            { field: 'id', header: 'ID' },
            { field: 'userid', header: 'User ID' },
            { field: 'created_at', header: 'Created At' },
            { field: 'updated_at', header: 'Updated At' },
          ],
          data: adminBatches.value,
        }
      case 'users':
        return {
          table: adminTable.value,
          columns: [
            { field: 'userid', header: 'User ID' },
            { field: 'username', header: 'Username' },
            { field: 'created_at', header: 'Created At' },
            { field: 'updated_at', header: 'Updated At' },
          ],
          data: adminUsers.value,
        }
      case 'upload_requests':
        return {
          table: adminTable.value,
          columns: [
            { field: 'id', header: 'ID' },
            { field: 'batchid', header: 'Batch ID' },
            { field: 'userid', header: 'User ID' },
            { field: 'status', header: 'Status' },
            { field: 'filename', header: 'Filename' },
            { field: 'wikitext', header: 'Wikitext' },
            { field: 'created_at', header: 'Created At' },
            { field: 'updated_at', header: 'Updated At' },
          ],
          data: adminUploadRequests.value,
        }
    }
  })

  return {
    adminTable,
    adminBatches,
    adminUsers,
    adminUploadRequests,
    adminTotal,
    adminLoading,
    adminParams,
    data,
  }
})
