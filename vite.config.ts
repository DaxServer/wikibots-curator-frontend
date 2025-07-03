import { fileURLToPath, URL } from 'node:url'
import type { PluginOption } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig((): import('vite').UserConfig => {
  return {
    plugins: [
      vue(),
      vueDevTools(),
      AutoImport({
        imports: [
          'vue',
          'pinia',
          {
            'primevue/config': [['default', 'PrimeVue']],
            '@primeuix/themes/Aura': [['default', 'Aura']],
          },
        ],
        dirs: ['src/**'],
        dts: true,
        vueTemplate: true,
        include: [/\.ts$/, /\.vue$/],
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true,
        },
      }),
      Components({
        dirs: ['src/**'],
        extensions: ['vue'],
        deep: true,
        resolvers: [PrimeVueResolver()],
        dts: true,
      }),
      tailwindcss(),
    ] as PluginOption[],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/auth': {
          target: 'http://localhost:8001',
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: 'https://curator.toolforge.org',
          changeOrigin: true,
        },
      },
    },
  }
})
