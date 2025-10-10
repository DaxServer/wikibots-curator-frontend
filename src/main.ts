import '@/assets/main.css' // Tailwind CSS

import App from '@/App.vue'

// Create app
const app = createApp(App)

// Create Pinia
const pinia = createPinia()

// Register plugins
app.use(pinia)

// Mount the app
app.mount('#app')
