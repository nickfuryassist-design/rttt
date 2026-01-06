import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    allowedHosts: ['.trycloudflare.com'], 
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8000',
    //     changeOrigin: true,
    //     // Remove this line ONLY if Django expects /api prefix
    //     rewrite: (path) => path.replace(/^\/api/, ''),
    //   },
    // },
  },
  plugins: [react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
})
