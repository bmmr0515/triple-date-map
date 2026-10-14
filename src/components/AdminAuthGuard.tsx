import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, ShieldCheck, KeyRound, Mail, LogOut, ArrowLeft, Loader2 } from 'lucide-react';
import { adminAuthService } from '../auth';

interface AdminAuthGuardProps {
  children: React.ReactNode;
  title?: string;
  onNavigateHome?: () => void;
}

/**
 * 🛡️ 管理者認証ガードコンポーネント (Supabase Auth 連携)
 * - フロントエンドの平文パスワード比較や sessionStorage の脆弱性を完全排除。
 * - Supabase Auth によるサーバー側認証を行い、管理者ロール・メールアドレスを厳格に検証します。
 * - 未認証時や権限不足時は専用の認証画面を表示し、保護されたコンポーネントの表示を遮断します。
 */
export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({
  children,
  title = '管理者ダッシュボード',
  onNavigateHome
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // フォーム用ステート
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // セッション状態の確認
  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      const session = await adminAuthService.getAdminSession();
      setIsAuthenticated(session.isAuthenticated);
      setIsAdmin(session.isAdmin);
      setAdminEmail(session.email);
    } catch (e) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setAdminEmail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('メールアドレスとパスワードを入力してください。');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await adminAuthService.signIn(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'ログインに失敗しました。');
      } else if (!res.isAdmin) {
        setIsAuthenticated(true);
        setIsAdmin(false);
        setErrorMsg(res.error || 'このアカウントには管理者権限がありません。');
      } else {
        await checkSession();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'ログイン処理中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await adminAuthService.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAdminEmail(null);
    setEmail('');
    setPassword('');
    setErrorMsg('');
  };

  const handleGoHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('pushstate'));
    }
  };

  // 1. 初期セッション確認中
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#94a3b8',
        gap: '16px'
      }}>
        <Loader2 size={36} className="animate-spin" color="#ff6897" />
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>管理者認証セッションを確認中...</span>
      </div>
    );
  }

  // 2. ログイン済みだが管理者権限がない場合
  if (isAuthenticated && !isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top left, #1e1b4b 0%, #0f172a 100%)',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          padding: '40px 30px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
          }}>
            <ShieldAlert size={32} color="#ffffff" />
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: '0 0 10px 0' }}>
            アクセス権限がありません
          </h1>
          <p style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.6', margin: '0 0 16px 0' }}>
            現在のアカウント（<strong>{adminEmail || '未設定'}</strong>）には管理者権限が付与されていません。
          </p>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 28px 0', lineHeight: '1.5' }}>
            Supabaseの管理権限（SQL Editor等）にて、該当アカウントの <code>app_metadata</code> に <code>role: 'admin'</code> を安全に付与してください。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #db2777 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '13.5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={16} /> 別のアカウントでログイン
            </button>
            <button
              onClick={handleGoHome}
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={16} /> マップへ戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. 未認証時（Supabase Auth ログインフォーム）
  if (!isAuthenticated || !isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top left, #1e1b4b 0%, #0f172a 100%)',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          padding: '40px 30px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #db2777 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 8px 20px rgba(219,39,119,0.3)'
          }}>
            <ShieldCheck size={28} color="#ffffff" />
          </div>

          <h1 style={{
            fontSize: '22px',
            fontWeight: '900',
            color: '#ffffff',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em'
          }}>
            {title}
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#94a3b8',
            margin: '0 0 28px 0',
            lineHeight: '1.5'
          }}>
            管理者専用エリアです。Supabase Authに登録された管理者アカウントでサインインしてください。
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* メールアドレス入力 */}
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="管理者メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#db2777'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                autoFocus
              />
            </div>

            {/* パスワード入力 */}
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center'
              }}>
                <KeyRound size={18} />
              </span>
              <input
                type="password"
                placeholder="管理者パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#db2777'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {errorMsg && (
              <div style={{
                fontSize: '12.5px',
                fontWeight: 'bold',
                color: '#f87171',
                textAlign: 'left',
                padding: '6px 10px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #db2777 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                padding: '14px',
                fontSize: '14px',
                fontWeight: '900',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 20px rgba(219,39,119,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  認証中...
                </>
              ) : (
                '管理者としてサインイン'
              )}
            </button>

            <button
              type="button"
              onClick={handleGoHome}
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: 'none',
                padding: '8px',
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '4px'
              }}
            >
              <ArrowLeft size={14} /> マップへ戻る
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 4. 管理者認証成功時: 管理者トップバーとコンテンツを表示
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 🔐 管理者グローバルヘッダー */}
      <header style={{
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        color: '#ffffff',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleGoHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#1e293b',
              color: '#cbd5e1',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} /> マップへ戻る
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '900', color: '#f8fafc' }}>{title}</span>
            <span style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              ● 認証済み (Admin)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {adminEmail && (
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              👤 {adminEmail}
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} /> ログアウト
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
};
