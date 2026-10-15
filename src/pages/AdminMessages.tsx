import { useState, useEffect } from 'react';
import { db, StadiumMessage } from '../db';
import { supabase, adminAuthService } from '../auth';
import { LogOut, Trash2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { AdminAuthGuard } from '../components/AdminAuthGuard';

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
  const handleBackToMap = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('pushstate'));
  };

  return (
    <AdminAuthGuard title="寄せ書き管理ダッシュボード" onNavigateHome={handleBackToMap}>
      <AdminMessagesDashboard onNavigateHome={handleBackToMap} />
    </AdminAuthGuard>
  );
}

function AdminMessagesDashboard({ onNavigateHome }: { onNavigateHome: () => void }) {
  const [messages, setMessages] = useState<StadiumMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  // 絞り込み用ステート
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleLogout = async () => {
    await adminAuthService.signOut();
    onNavigateHome();
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
      // 1. Supabase から削除 (有効な場合 - 認証済みJWTが送信される)
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

  // 絞り込みフィルタリング
  const filteredMessages = messages.filter(msg => {
    // メンバーカラーフィルター
    if (selectedColor !== 'all' && msg.color !== selectedColor) {
      return false;
    }
    // 検索語句フィルター (名前 or メッセージ本文)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchName = msg.name.toLowerCase().includes(query);
      const matchMsg = msg.message.toLowerCase().includes(query);
      return matchName || matchMsg;
    }
    return true;
  });

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
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
              onClick={onNavigateHome}
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
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* 統計バー & フィルター */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {/* 上段: 総件数 & 検索バー */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#64748b' }}>
                総メッセージ数:
              </span>
              <span style={{
                fontSize: '20px',
                fontWeight: '900',
                color: '#db2777',
                background: '#fdf2f8',
                padding: '4px 12px',
                borderRadius: '10px'
              }}>
                {messages.length} 件
              </span>
              {selectedColor !== 'all' || searchQuery ? (
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  (絞り込み: {filteredMessages.length} 件)
                </span>
              ) : null}
            </div>

            <div style={{ flex: 1, maxWidth: '360px' }}>
              <input
                type="text"
                placeholder="名前や本文で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* 下段: メンバーカラーフィルターボタン */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              onClick={() => setSelectedColor('all')}
              style={{
                background: selectedColor === 'all' ? '#1e293b' : '#f1f5f9',
                color: selectedColor === 'all' ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              全員表示
            </button>
            {Object.entries(MEMBER_MAP).map(([color, label]) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{
                  background: selectedColor === color ? color : '#f1f5f9',
                  color: selectedColor === color ? getContrastTextColor(color) : '#475569',
                  border: selectedColor === color ? '1.5px solid #cbd5e1' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: color,
                  border: '1px solid rgba(0,0,0,0.1)'
                }} />
                {label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* メッセージ一覧テーブル */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              データを読み込み中...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              条件に一致するメッセージはありません。
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '14px 16px', width: '130px' }}>宛先メンバー</th>
                    <th style={{ padding: '14px 16px', width: '140px' }}>投稿者名</th>
                    <th style={{ padding: '14px 16px' }}>メッセージ</th>
                    <th style={{ padding: '14px 16px', width: '150px' }}>投稿日時</th>
                    <th style={{ padding: '14px 16px', width: '80px', textAlign: 'center' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((msg, index) => (
                    <tr
                      key={msg.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: index % 2 === 0 ? '#ffffff' : '#fafafa'
                      }}
                    >
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: msg.color,
                          color: getContrastTextColor(msg.color),
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          border: '1px solid rgba(0,0,0,0.08)'
                        }}>
                          {MEMBER_MAP[msg.color]?.split(' ')[0] || '全体'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', fontWeight: 'bold' }}>
                        {msg.name}
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', lineHeight: '1.5', color: '#334155' }}>
                        {msg.message}
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', color: '#64748b', fontSize: '11.5px' }}>
                        {new Date(msg.created_at).toLocaleString('ja-JP')}
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          disabled={deleteLoadingId === msg.id}
                          style={{
                            background: '#fee2e2',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px',
                            cursor: deleteLoadingId === msg.id ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
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
