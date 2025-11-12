// Vuetify
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import 'vuetify/styles'

import App from '@/App.vue'

// Create app
const app = createApp(App)

// Create Pinia
const pinia = createPinia()

// Register plugins
app.use(pinia)

// Register Vuetify
app.use(
  createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      defaultTheme: 'light',
    },
  }),
)

// Mount the app
app.mount('#app')
