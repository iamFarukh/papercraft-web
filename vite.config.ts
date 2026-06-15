import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Treat dotLottie files as URL assets so `import x from '*.lottie'` works.
  assetsInclude: ['**/*.lottie'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendors into their own cacheable chunks. Combined with
        // route-level React.lazy, the export/import libraries no longer ship
        // in the initial bundle.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'export-pdf'
          if (id.includes('docx')) return 'export-docx'
          if (id.includes('xlsx')) return 'vendor-xlsx'
          if (id.includes('/firebase/') || id.includes('/@firebase/')) return 'vendor-firebase'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('react-router') || id.includes('react-dom')) return 'vendor-react'
          return undefined
        },
      },
    },
  },
})
