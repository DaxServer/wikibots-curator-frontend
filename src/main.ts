import '@/assets/tailwind.css'

// PrimeVue
import 'primeicons/primeicons.css'
import { FocusTrap, Tooltip } from 'primevue'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'

import App from '@/App.vue'
import router from '@/router'

// Create app
const app = createApp(App)

// Create Pinia
const pinia = createPinia()

// Register plugins
app.use(pinia)
app.use(router)
app.use(ConfirmationService)

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
app.directive('tooltip', Tooltip)

// Mount the app
app.mount('#app')
