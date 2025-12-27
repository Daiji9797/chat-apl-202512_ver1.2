import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/chatapp/public/',
  server: {
    port: 5173,
    proxy: {
      '/chatapp/src/api': {
        target: 'http://localhost',
        changeOrigin: true,
      },
    },
  },
})
