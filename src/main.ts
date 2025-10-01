import '@/assets/main.css' // Tailwind CSS
import 'primeicons/primeicons.css' // Icons

import App from '@/App.vue'

// Create app
const app = createApp(App)

// Create Pinia
const pinia = createPinia()

// Register plugins
app.use(pinia)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})

// Mount the app
app.mount('#app')
