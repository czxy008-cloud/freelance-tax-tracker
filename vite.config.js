import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

const useElectron = process.env.WEB_ONLY !== '1'

const plugins = [vue()]
if (useElectron) {
  plugins.push(electron([
    {
      entry: 'electron/main.js',
      onstart(options) {
        options.startup()
      },
      vite: {
        build: {
          outDir: 'dist-electron',
          rollupOptions: {
            external: []
          }
        }
      }
    },
    {
      entry: 'electron/preload.js',
      onstart(options) {
        options.reload()
      },
      vite: {
        build: {
          outDir: 'dist-electron'
        }
      }
    }
  ]))
  plugins.push(renderer())
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
