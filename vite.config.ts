import { fileURLToPath, URL } from 'node:url'
import type { PluginOption } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from "@primevue/auto-import-resolver"
import tailwindcss from '@tailwindcss/vite'

export default defineConfig((): import('vite').UserConfig => {
    return {
        plugins: [
            vue(),
            vueDevTools(),
            Components({
                resolvers: [
                    PrimeVueResolver()
                ]
            }),
            tailwindcss(),
        ] as PluginOption[],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
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
            }
        }
    };
});
