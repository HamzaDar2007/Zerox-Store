import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { compression } from 'vite-plugin-compression2';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Gzip pre-compression for production builds
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024, // Only compress files > 1KB
    }),
    // Brotli pre-compression for modern browsers
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/common/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/common/types'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@schemas': path.resolve(__dirname, './src/common/schemas'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // Remove console.log in production
        drop_debugger: true,   // Remove debugger statements
        pure_funcs: ['console.info', 'console.debug', 'console.warn'],
      },
      mangle: {
        safari10: true,
      },
    },
    cssCodeSplit: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 250, // Warn if any chunk > 250KB
    rollupOptions: {
      output: {
        manualChunks: {
          // Core framework
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // State management
          redux: ['@reduxjs/toolkit', 'react-redux'],
          // UI foundation (shared across all pages)
          ui: [
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'lucide-react',
          ],
          // Heavy third-party libs split into separate chunks
          charts: ['recharts'],
          table: ['@tanstack/react-table'],
          // Form handling
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Stripe (only loaded on payment pages)
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          // Date utilities
          dates: ['date-fns'],
          // Radix UI primitives (shared UI components)
          radix: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-label',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-switch',
            '@radix-ui/react-avatar',
            '@radix-ui/react-toast',
          ],
          // Date picker, command palette, toast notifications
          misc: ['react-day-picker', 'cmdk', 'sonner'],
          // Security utilities
          security: ['dompurify'],
        },
      },
    },
  },
});
