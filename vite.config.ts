import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: '/spellnami/',
  plugins: [
    svgr({
      svgrOptions: {
        // Specify SVGR options here if needed
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'public/**/*',
          dest: './'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: true,
    assetsInlineLimit: 0, // Ensure SVGs are not inlined
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
