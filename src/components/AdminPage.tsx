import AdminMessages from '../pages/AdminMessages';

/**
 * 🔐 管理者ページ（寄せ書きメッセージ管理）
 * - Supabase Auth による厳格なサーバー認証 (AdminAuthGuard) を適用した AdminMessages を提供します。
 * - 旧来の VITE_ADMIN_PASSWORD やフロントエンド平文パスワード比較は完全撤廃されました。
 */
export function AdminPage(_props: { onNavigateHome?: () => void }) {
  return <AdminMessages />;
}

export default AdminPage;
