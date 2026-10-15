import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'tdm_migration_notice_closed_v1';

export const MigrationBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    try {
      const isClosed = localStorage.getItem(STORAGE_KEY);
      if (!isClosed) {
        setIsVisible(true);
      }
    } catch (e) {
      // localStorageが利用できない環境でも安全にフォールバック
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      // ignore
    }
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="システム移行のお知らせ"
      style={{
        background: 'linear-gradient(90deg, #fdf4ff 0%, #fff1f2 50%, #eff6ff 100%)',
        borderBottom: '1px solid #fbcfe8',
        padding: '8px 16px',
        fontSize: '12px',
        color: '#475569',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 99,
        lineHeight: 1.4,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ec4899',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '2px 6px',
              fontSize: '10.5px',
              fontWeight: 800,
              whiteSpace: 'nowrap'
            }}
          >
            重要なお知らせ
          </span>
          <span style={{ fontSize: '11.5px', color: '#334155', fontWeight: 600 }}>
            データベース移行に伴い、過去にアカウントを作成された方は再度「新規登録」をお願いいたします。
            <span style={{ color: '#64748b', fontWeight: 500, marginLeft: '4px' }}>
              （※お使いの端末内のチェックイン履歴・称号はそのまま安全に保持されています）
            </span>
          </span>
        </div>

        <button
          onClick={handleClose}
          aria-label="お知らせを閉じる"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s, background-color 0.2s',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
};

export default MigrationBanner;
