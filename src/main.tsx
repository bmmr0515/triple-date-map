import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import AdminMessages from './pages/AdminMessages.tsx'
import MessageGallery from './pages/MessageGallery.tsx'
import MaintenancePage from './components/MaintenancePage.tsx'
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
  const [bypass, setBypass] = useState(() => {
    return localStorage.getItem('bypass_maintenance') === 'true';
  });

  useEffect(() => {
    // 開発者検証用のバイパスパラメータ検出
    const params = new URLSearchParams(window.location.search);
    if (params.get('bypass') === 'true') {
      localStorage.setItem('bypass_maintenance', 'true');
      setBypass(true);
    }
  }, []);

  const checkRedirect = (currentPath: string): string => {
    // 🔐 管理者・ギャラリーページの認証状態に応じた強力なフォールバックルーティング
    // 直接アクセス時に App (地図) にフォールバックする
    if (currentPath === '/messages/gallery' || currentPath === '/admin/gallery') {
      window.history.replaceState({}, '', '/');
      return '/';
    }
    return currentPath;
  };

  useEffect(() => {
    // ⚡ アプリケーション初期化完了（ハイドレーション・初回描画完了）
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('app-loading');
      document.documentElement.classList.add('app-ready');
    });

    const initialPath = checkRedirect(window.location.pathname);
    if (initialPath !== path) {
      setPath(initialPath);
    }

    const handlePopState = () => {
      const activePath = checkRedirect(window.location.pathname);
      setPath(activePath);
    };
    window.addEventListener('popstate', handlePopState);

    const handlePushState = () => {
      const activePath = checkRedirect(window.location.pathname);
      setPath(activePath);
    };
    window.addEventListener('pushstate', handlePushState);
    window.addEventListener('replacestate', handlePushState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pushstate', handlePushState);
      window.removeEventListener('replacestate', handlePushState);
    };
  }, []);

  // 1. 環境変数からのメンテナンス状態取得（Hooks宣言の後に評価）
  const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  // 2. メンテナンス中の場合はメンテナンス画面を表示（バイパスキー所持者は除外）
  if (isMaintenance && !bypass) {
    return <MaintenancePage />;
  }

  // 3. 通常ルーティング
  if (path === '/admin/messages') {
    return <AdminMessages />;
  }
  if (path === '/gallery') {
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
