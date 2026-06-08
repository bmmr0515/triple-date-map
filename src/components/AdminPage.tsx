import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../auth';

// メンバーカラー定義（App.tsxと同期）
const MEMBER_COLORS: { color: string; label: string }[] = [
  { color: '#e9d5ff', label: '大谷 映美里（薄紫）' },
  { color: '#f97316', label: '大場 花菜（オレンジ）' },
  { color: '#38bdf8', label: '音嶋 莉沙（水色）' },
  { color: '#fbcfe8', label: '齋藤 樹愛羅（薄ピンク）' },
  { color: '#ffffff', label: '佐々木 舞香（白）' },
  { color: '#ef4444', label: '髙松 瞳（赤）' },
  { color: '#facc15', label: '瀧脇 笙古（黄色）' },
  { color: '#a855f7', label: '野口 衣織（紫）' },
  { color: '#84cc16', label: '諸橋 沙夏（黄緑）' },
  { color: '#3b82f6', label: '山本 杏奈（青）' },
];

interface AdminMessage {
  id: string;
  name: string;
  message: string;
  color: string;
  device_id: string;
  created_at: string;
}

type SortKey = 'newest' | 'oldest';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';

export function AdminPage({ onNavigateHome }: { onNavigateHome: () => void }) {
  // 認証状態
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [inputPassword, setInputPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // データ
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>('');

  // フィルター・ソート
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [filterColor, setFilterColor] = useState<string>('すべて');

  // 削除中の行ID管理
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string>('');

  const fetchMessages = useCallback(async () => {
    if (!supabase) {
      setFetchError('Supabase接続が設定されていません。');
      return;
    }
    setIsLoading(true);
    setFetchError('');
    try {
      const { data, error } = await supabase
        .from('national_stadium_messages')
        .select('*')
        .order('created_at', { ascending: sortKey === 'oldest' });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      setFetchError(`データの取得に失敗しました: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [sortKey]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated, fetchMessages]);

  const handleLogin = () => {
    if (!ADMIN_PASSWORD) {
      setAuthError('管理者パスワードが設定されていません。環境変数 VITE_ADMIN_PASSWORD を設定してください。');
      return;
    }
    if (inputPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('パスワードが違います。');
    }
  };

  const handleDelete = async (msg: AdminMessage) => {
    const confirmed = window.confirm(
      `以下のメッセージを本当に削除しますか？\n\n投稿者: ${msg.name || '匿名'}\nメッセージ: ${msg.message}\n\nこの操作は取り消せません。`
    );
    if (!confirmed) return;
    if (!supabase) return;

    setDeletingId(msg.id);
    try {
      const { error } = await supabase
        .from('national_stadium_messages')
        .delete()
        .eq('id', msg.id);

      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== msg.id));
      setDeleteSuccess(`「${msg.name || '匿名'}」のメッセージを削除しました。`);
      setTimeout(() => setDeleteSuccess(''), 3000);
    } catch (err: any) {
      alert(`削除に失敗しました: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getMemberLabel = (color: string): string => {
    const found = MEMBER_COLORS.find(m => m.color === color);
    return found ? found.label : color;
  };

  const getContrastTextColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.65 ? '#1e293b' : '#ffffff';
  };

  // フィルター適用
  const filteredMessages = messages.filter(msg => {
    if (filterColor === 'すべて') return true;
    return msg.color === filterColor;
  });

  // ─────────────────────────────────────────────
  // ログインフォーム
  // ─────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: "'Outfit', 'Noto Sans JP', sans-serif",
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '28px',
          padding: '40px 32px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🔐</span>
            <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', margin: '0 0 6px 0' }}>
              管理者専用ページ
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              寄せ書き管理ダッシュボード
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
                管理者パスワード
              </label>
              <input
                type="password"
                value={inputPassword}
                onChange={e => setInputPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
                placeholder="パスワードを入力..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.08)',
                  border: authError ? '1.5px solid #f87171' : '1.5px solid rgba(255,255,255,0.15)',
                  borderRadius: '14px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
              {authError && (
                <p style={{ fontSize: '11px', color: '#f87171', margin: '6px 0 0 0', fontWeight: '700' }}>
                  ⚠️ {authError}
                </p>
              )}
            </div>

            <button
              onClick={handleLogin}
              style={{
                background: 'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                padding: '14px',
                fontSize: '14px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(219, 39, 119, 0.4)',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              🔓 ログイン
            </button>

            <button
              onClick={onNavigateHome}
              style={{
                background: 'transparent',
                color: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '14px',
                padding: '10px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              ← トップページに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // 管理ダッシュボード
  // ─────────────────────────────────────────────
  return (
    <div style={{
      height: '100vh',
      overflowY: 'auto',
      background: '#0f172a',
      fontFamily: "'Outfit', 'Noto Sans JP', sans-serif",
      color: '#e2e8f0',
    }}>
      {/* ヘッダー */}
      <header style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🛡️</span>
          <div>
            <h1 style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff', margin: 0 }}>
              寄せ書き管理ダッシュボード
            </h1>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              管理者専用 / Admin Only
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#a5b4fc',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
          }}>
            {filteredMessages.length} 件
          </span>
          <button
            onClick={fetchMessages}
            disabled={isLoading}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? '更新中...' : '🔄 更新'}
          </button>
          <button
            onClick={onNavigateHome}
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            ← 戻る
          </button>
        </div>
      </header>

      {/* コントロールバー */}
      <div style={{
        background: '#1e293b',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        {/* ソート */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.5)' }}>並び順:</span>
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            style={{
              background: '#0f172a',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
          </select>
        </div>

        {/* フィルター */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.5)' }}>メンバー絞り込み:</span>
          <select
            value={filterColor}
            onChange={e => setFilterColor(e.target.value)}
            style={{
              background: '#0f172a',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              outline: 'none',
              maxWidth: '200px',
            }}
          >
            <option value="すべて">すべて</option>
            {MEMBER_COLORS.map(m => (
              <option key={m.color} value={m.color}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* 合計件数 */}
        <div style={{
          marginLeft: 'auto',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.4)',
          fontWeight: '700',
        }}>
          全{messages.length}件中 {filteredMessages.length}件表示
        </div>
      </div>

      {/* 削除成功トースト */}
      {deleteSuccess && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #059669, #34d399)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '14px',
          fontSize: '13px',
          fontWeight: '800',
          zIndex: 9999,
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.4)',
          animation: 'fadeIn 0.3s ease',
        }}>
          ✅ {deleteSuccess}
        </div>
      )}

      {/* メインコンテンツ */}
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {fetchError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1.5px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '20px',
            color: '#f87171',
            fontSize: '13px',
            fontWeight: '700',
          }}>
            ⚠️ {fetchError}
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: '700' }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '8px' }}>⚙️</span>
            読み込み中...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '14px',
            fontWeight: '700',
          }}>
            📭 該当するメッセージがありません
          </div>
        ) : (
          /* テーブル */
          <div style={{
            background: '#1e293b',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.06)',
            overflowX: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            <div style={{ minWidth: '1000px' }}>
            {/* テーブルヘッダー */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '150px 110px 180px 1fr 180px 80px',
              gap: '0',
              background: 'rgba(255,255,255,0.04)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '0',
            }}>
              {['投稿日時', 'ニックネーム', 'メンバーカラー', 'メッセージ本文', 'デバイスID', '操作'].map((header, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    fontSize: '10px',
                    fontWeight: '900',
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    borderRight: i < 5 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  {header}
                </div>
              ))}
            </div>

            {/* テーブルボディ */}
            {filteredMessages.map((msg, index) => {
              const colorLabel = getMemberLabel(msg.color);
              const textColor = getContrastTextColor(msg.color);
              const isDeleting = deletingId === msg.id;
              const postedAt = new Date(msg.created_at);
              const dateStr = `${postedAt.getFullYear()}/${String(postedAt.getMonth() + 1).padStart(2, '0')}/${String(postedAt.getDate()).padStart(2, '0')} ${String(postedAt.getHours()).padStart(2, '0')}:${String(postedAt.getMinutes()).padStart(2, '0')}`;

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '150px 110px 180px 1fr 180px 80px',
                    borderBottom: index < filteredMessages.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    opacity: isDeleting ? 0.4 : 1,
                    transition: 'opacity 0.2s, background 0.2s',
                    background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  }}
                  onMouseEnter={e => !isDeleting && (e.currentTarget.style.background = 'rgba(167, 139, 250, 0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)')}
                >
                  {/* 投稿日時 */}
                  <div style={{
                    padding: '12px 14px',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.6)',
                    fontWeight: '700',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: 'Outfit, monospace',
                  }}>
                    {dateStr}
                  </div>

                  {/* ニックネーム */}
                  <div style={{
                    padding: '12px 14px',
                    fontSize: '12px',
                    color: '#e2e8f0',
                    fontWeight: '800',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                  }}>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                    }}>
                      {msg.name || '匿名'}
                    </span>
                  </div>

                  {/* メンバーカラー */}
                  <div style={{
                    padding: '12px 14px',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: msg.color,
                      border: '2px solid rgba(255,255,255,0.2)',
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      color: 'rgba(255,255,255,0.7)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {colorLabel}
                    </span>
                  </div>

                  {/* メッセージ本文 */}
                  <div style={{
                    padding: '12px 14px',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}>
                    <div style={{
                      background: msg.color,
                      color: textColor,
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '800',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      maxWidth: '100%',
                    }}>
                      {msg.message}
                    </div>
                  </div>

                  {/* デバイスID */}
                  <div style={{
                    padding: '12px 14px',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontSize: '9px',
                      color: 'rgba(255,255,255,0.35)',
                      fontFamily: 'Outfit, monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                      maxWidth: '100%',
                    }}
                    title={msg.device_id}
                    >
                      {msg.device_id}
                    </span>
                  </div>

                  {/* 削除ボタン */}
                  <div style={{
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <button
                      onClick={() => handleDelete(msg)}
                      disabled={isDeleting}
                      style={{
                        background: isDeleting
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '11px',
                        fontWeight: '900',
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => {
                        if (!isDeleting) {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.35)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                      }}
                    >
                      {isDeleting ? '削除中...' : '🗑️ 削除'}
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}

        {/* フッター情報 */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.2)',
          fontWeight: '700',
        }}>
          🛡️ このページは管理者のみがアクセスできます / 不正アクセスはログに記録されます
        </div>
      </div>
    </div>
  );
}
