import MapillaryCollections from '@/components/mapillary/MapillaryCollections.vue'
import AdminView from '@/components/views/AdminView.vue'
import BatchesView from '@/components/views/BatchesView.vue'
import BatchUploadsView from '@/components/views/BatchUploadsView.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/mapillary',
  },
  {
    path: '/mapillary',
    name: 'mapillary',
    component: MapillaryCollections,
  },
  {
    path: '/batches',
    name: 'batches',
    component: BatchesView,
  },
  {
    path: '/batches/:id',
    name: 'batch-details',
    component: BatchUploadsView,
    props: true,
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
