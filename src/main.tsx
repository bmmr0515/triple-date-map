import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import AdminMessages from './pages/AdminMessages.tsx'
import MessageGallery from './pages/MessageGallery.tsx'
import './index.css'
import { Analytics } from '@vercel/analytics/react';

// 🔐 本番環境（Vercel等）でのデバッグログの無効化（セキュリティと軽量化）
if (import.meta.env.PROD) {
  console.log = () => {};
  console.debug = () => {};
  console.warn = () => {};
}

function Router() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    const handlePushState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('pushstate', handlePushState);
    window.addEventListener('replacestate', handlePushState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pushstate', handlePushState);
      window.removeEventListener('replacestate', handlePushState);
    };
  }, []);

  if (path === '/admin/messages') {
    return <AdminMessages />;
  }
  if (path === '/messages/gallery') {
    return <MessageGallery />;
  }
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router />
    <Analytics />
  </React.StrictMode>,
)
