import { fileURLToPath, URL } from 'node:url'
import type { PluginOption } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig((): import('vite').UserConfig => {
  return {
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
      AutoImport({
        imports: [
          'vue',
          'pinia',
          {
            from: 'naive-ui',
            imports: ['GlobalThemeOverrides', 'DataTableColumns', 'DataTableRowKey', 'RowData', 'SelectOption'],
            type: true,
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
        resolvers: [NaiveUiResolver()],
        dts: true,
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
        }
      },
    },
  }
})
