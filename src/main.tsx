import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 🔐 本番環境（Vercel等）でのデバッグログの無効化（セキュリティと軽量化）
if (import.meta.env.PROD) {
  console.log = () => {};
  console.debug = () => {};
  console.warn = () => {};
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
