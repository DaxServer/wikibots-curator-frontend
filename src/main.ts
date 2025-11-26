import '@/assets/tailwind.css'

// PrimeVue
import 'primeicons/primeicons.css'
import { FocusTrap } from 'primevue'
import PrimeVue from 'primevue/config'

import App from '@/App.vue'

// Create app
const app = createApp(App)

// Create Pinia
const pinia = createPinia()

// Register plugins
app.use(pinia)

// Register PrimeVue
app.use(PrimeVue, {
  theme: {
    preset: Noir,
    options: {
      darkModeSelector: false,
    },
  },
})

app.directive('focustrap', FocusTrap)

// Mount the app
app.mount('#app')
