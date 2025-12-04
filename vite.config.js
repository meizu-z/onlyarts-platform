import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    open: true
  },

  // Build optimizations
  build: {
    // Target modern browsers for smaller bundle sizes
    target: 'esnext',

    // Generate source maps for production debugging (optional, remove if not needed)
    sourcemap: false,

    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,

    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.logs in production
        drop_debugger: true, // Remove debugger statements
      },
    },

    // Manual chunk splitting for optimal caching
    rollupOptions: {
      output: {
        // Separate chunks for better caching
        manualChunks: (id) => {
          // Vendor chunk: Core React libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }

            // UI libraries chunk
            if (id.includes('lucide-react') || id.includes('@headlessui')) {
              return 'vendor-ui';
            }

            // Socket/Real-time chunk
            if (id.includes('socket.io') || id.includes('webrtc')) {
              return 'vendor-realtime';
            }

            // All other vendor libraries
            return 'vendor-other';
          }

          // Admin pages chunk (lazy loaded)
          if (id.includes('/pages/admin/')) {
            return 'admin';
          }

          // Large pages chunk
          if (id.includes('/pages/Dashboard') ||
              id.includes('/pages/ExplorePage') ||
              id.includes('/pages/ProfilePage')) {
            return 'pages-main';
          }
        },

        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];

          // Organize assets by type
          if (/\.(png|jpe?g|svg|gif|webp|ico)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|ttf|otf|eot)$/.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },

        // JS chunk naming
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },

    // Asset inlining limit (4kb)
    assetsInlineLimit: 4096,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})