import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import type { PluginOption } from 'vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig((): import('vite').UserConfig => {
  return {
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
      vuetify({ autoImport: true }),
      AutoImport({
        imports: ['vue', 'pinia'],
        dirs: ['src/**'],
        dts: true,
        vueTemplate: true,
        include: [/\.ts$/, /\.vue$/],
        biomelintrc: {
          enabled: true,
          filepath: './.biomelintrc-auto-import.json',
        },
      }),
      Components({
        dirs: ['src/**'],
        extensions: ['vue'],
        deep: true,
        dts: true,
        resolvers: [IconsResolver(), VuetifyResolver()],
      }),
    ] as PluginOption[],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/auth': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/api/mapillary': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: 'https://curator.toolforge.org',
          changeOrigin: true,
        },
        '/callback/wikimedia': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/callback\/wikimedia/, '/auth/callback'),
        },
      },
    },
  }
})
