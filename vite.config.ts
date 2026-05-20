import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 巨大な外部ライブラリがあるため、ビルド時のサイズ警告基準値を 2000kB まで引き上げて警告を完全に非表示にします
    chunkSizeWarningLimit: 2000,
  }
})
