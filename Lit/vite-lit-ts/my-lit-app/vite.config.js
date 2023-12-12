import { defineConfig, resolveBaseUrl, splitVendorChunkPlugin } from 'vite'
import image from '@rollup/plugin-image'
import legacy from '@vitejs/plugin-legacy'
import Inspect from 'vite-plugin-inspect'
export default defineConfig({
    base: '/',
    esbuild: {
        
    },
    build: {
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: 'Vue'
                }
            }
        },
       
    },
    plugins: [
        {
            ...image(),
            enforce: 'pre'
        },
        legacy({
            targets: ['defaults', 'not IE 11']
        }),
        splitVendorChunkPlugin(),
        Inspect(),
    ],
    define: {
        'process.env.NODE_ENV': '"production"',
    }
    
})