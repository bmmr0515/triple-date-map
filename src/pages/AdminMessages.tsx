import React, { useState, useEffect } from 'react';
import { db, StadiumMessage } from '../db';
import { supabase } from '../auth';
import { LogOut, Trash2, ArrowLeft, ShieldAlert, KeyRound } from 'lucide-react';

const MEMBER_MAP: { [key: string]: string } = {
  '#e9d5ff': '大谷 映美里 (薄紫)',
  '#f97316': '大場 花菜 (オレンジ)',
  '#38bdf8': '音嶋 莉沙 (水色)',
  '#fbcfe8': '齋藤 樹愛羅 (薄ピンク)',
  '#ffffff': '佐々木 舞香 (白)',
  '#ef4444': '髙松 瞳 (赤)',
  '#facc15': '瀧脇 笙古 (黄色)',
  '#a855f7': '野口 衣織 (紫)',
  '#84cc16': '諸橋 沙夏 (黄緑)',
  '#3b82f6': '山本 杏奈 (青)'
};

// 背景色から適した文字色を返す（白または黒）
const getContrastTextColor = (hexColor: string): string => {
  const hex = hexColor.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16);
    g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
    b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return '#1e293b';
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? '#1e293b' : '#ffffff';
};

export default function AdminMessages() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [messages, setMessages] = useState<StadiumMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  // パスワード定数定義 (.env から取得、なければフォールバック)
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || import.meta.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'triple-date-admin-2026';

  // 初回読み込み時にセッション確認
  useEffect(() => {
    const isAuth = sessionStorage.getItem('tdm_admin_authenticated');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
      fetchMessages();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('tdm_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setErrorMsg('');
      fetchMessages();
    } else {
      setErrorMsg('パスワードが正しくありません。');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tdm_admin_authenticated');
    setIsAuthenticated(false);
    setPassword('');
    setMessages([]);
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const msgs = await db.getStadiumMessages();
      setMessages(msgs);
    } catch (err) {
      console.error('メッセージ取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (msgId: string) => {
    if (!window.confirm('このメッセージを完全に削除しますか？\n(Supabaseおよびローカルストレージから完全に削除されます)')) {
      return;
    }

    setDeleteLoadingId(msgId);
    try {
      // 1. Supabase から削除 (有効な場合)
      if (supabase) {
        const { error } = await supabase
          .from('national_stadium_messages')
          .delete()
          .eq('id', msgId);
        if (error) throw error;
      }

      // 2. ローカルストレージから削除 (フォールバック & キャッシュ同期)
      const local = localStorage.getItem('tdm_stadium_messages');
      if (local) {
        const localMessages = JSON.parse(local) as StadiumMessage[];
        const filtered = localMessages.filter(m => m.id !== msgId);
        localStorage.setItem('tdm_stadium_messages', JSON.stringify(filtered));
      }

      // 3. 画面上のステートを更新
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err: any) {
      alert(`削除に失敗しました: ${err.message || err}`);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleBackToMap = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('pushstate'));
  };

  // 1. 未認証時のログイン画面
  if (!isAuthenticated) {
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
          maxWidth: '420px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          padding: '40px 30px',
          textAlign: 'center',
          animation: 'fade-in 0.3s ease-out'
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
            <ShieldAlert size={28} color="#ffffff" />
          </div>

          <h1 style={{
            fontSize: '22px',
            fontWeight: '900',
            color: '#ffffff',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em'
          }}>
            管理者ダッシュボード
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#94a3b8',
            margin: '0 0 30px 0',
            lineHeight: '1.5'
          }}>
            寄せ書きメッセージの管理を行うための専用ページです。アクセスにはパスワードが必要です。
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#db2777'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                autoFocus
              />
            </div>

            {errorMsg && (
              <div style={{
                fontSize: '12.5px',
                fontWeight: 'bold',
                color: '#f87171',
                textAlign: 'left',
                padding: '4px 8px'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #db2777 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                padding: '14px',
                fontSize: '14px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(219,39,119,0.25)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              認証する
            </button>
          </form>

          <button
            onClick={handleBackToMap}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '13px',
              fontWeight: '700',
              marginTop: '24px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <ArrowLeft size={14} />
            地図に戻る
          </button>
        </div>
      </div>
    );
  }

  // 2. 認証済みの管理画面
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1e293b'
    }}>
      {/* ナビゲーションバー */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #db2777 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={20} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>
                寄せ書き管理ダッシュボード
              </h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                不適切な投稿メッセージの確認・削除が行えます
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => {
                window.history.pushState({}, '', '/messages/gallery');
                window.dispatchEvent(new Event('pushstate'));
              }}
              className="pop-button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '800',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🎨 ギャラリーを確認
            </button>

            <button
              onClick={handleBackToMap}
              className="pop-button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '800',
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <ArrowLeft size={16} />
              地図へ
            </button>

            <button
              onClick={handleLogout}
              className="pop-button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fee2e2',
                border: '1.5px solid #fecaca',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '800',
                color: '#ef4444',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <LogOut size={16} />
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main style={{
        maxWidth: '1200px',
        margin: '32px auto',
        padding: '0 24px',
        boxSizing: 'border-box'
      }}>
        {/* ステータスカード */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px 0', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              現在の投稿件数
            </h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', lineHeight: 1 }}>
                {messages.length}
              </span>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '700' }}>件</span>
            </div>
          </div>

          <button
            onClick={fetchMessages}
            disabled={loading}
            className="pop-button"
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading ? '再読み込み中...' : '🔄 データを更新'}
          </button>
        </div>

        {/* テーブルコンテナ */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
        }}>
          {loading && messages.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '14px', fontWeight: '800' }}>データを取得しています...</div>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748b' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>📭</span>
              <div style={{ fontSize: '14px', fontWeight: '800' }}>まだメッセージの投稿がありません。</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '13px'
              }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 20px', fontWeight: '800', color: '#475569', width: '120px' }}>宛先メンバー</th>
                    <th style={{ padding: '16px 20px', fontWeight: '800', color: '#475569', width: '120px' }}>ニックネーム</th>
                    <th style={{ padding: '16px 20px', fontWeight: '800', color: '#475569' }}>メッセージ</th>
                    <th style={{ padding: '16px 20px', fontWeight: '800', color: '#475569', width: '140px' }}>投稿日時</th>
                    <th style={{ padding: '16px 20px', fontWeight: '800', color: '#475569', width: '150px' }}>デバイスID (照合用)</th>
                    <th style={{ padding: '16px 20px', fontWeight: '800', color: '#475569', width: '80px', textAlign: 'center' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr
                      key={msg.id}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* 宛先メンバー */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          backgroundColor: msg.color,
                          color: getContrastTextColor(msg.color),
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '800',
                          border: '1px solid rgba(0,0,0,0.06)',
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}>
                          {MEMBER_MAP[msg.color] || `未定義 (${msg.color})`}
                        </span>
                      </td>

                      {/* ニックネーム */}
                      <td style={{ padding: '16px 20px', fontWeight: '700', color: '#0f172a' }}>
                        {msg.name || '匿名オタク'}
                      </td>

                      {/* メッセージ */}
                      <td style={{
                        padding: '16px 20px',
                        lineHeight: '1.6',
                        color: '#334155',
                        fontWeight: '600',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all'
                      }}>
                        {msg.message}
                      </td>

                      {/* 投稿日時 */}
                      <td style={{ padding: '16px 20px', color: '#64748b', fontWeight: '500', whiteSpace: 'nowrap' }}>
                        {new Date(msg.created_at).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* デバイスID */}
                      <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: '#64748b', fontSize: '11px' }}>
                        {msg.device_id ? msg.device_id.substring(0, 16) + '...' : 'N/A'}
                      </td>

                      {/* 削除ボタン */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          disabled={deleteLoadingId === msg.id}
                          className="pop-button"
                          title="削除"
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: '10px',
                            width: '32px',
                            height: '32px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#ef4444',
                            transition: 'all 0.2s',
                            opacity: deleteLoadingId === msg.id ? 0.5 : 1
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
