import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'tdm_migration_notice_closed_v1';

interface MigrationBannerProps {
  onOpenNotice?: () => void;
}

export const MigrationBanner: React.FC<MigrationBannerProps> = ({ onOpenNotice }) => {
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

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      // ignore
    }
  };

  const handleBannerClick = () => {
    if (onOpenNotice) {
      onOpenNotice();
    } else {
      // グローバルカスタムイベントでも通知を発火
      window.dispatchEvent(new CustomEvent('tdm:open-notice-modal'));
    }
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="システム移行のお知らせ・大型アップデート"
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
        <div
          onClick={handleBannerClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBannerClick();
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            cursor: 'pointer',
            minWidth: 0,
            textDecoration: 'none'
          }}
        >
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
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            重要
          </span>
          <span style={{ fontSize: '11.5px', color: '#1e293b', fontWeight: 700, lineHeight: '1.4' }}>
            【重要】トリプルデートマップ 大型アップデートのお知らせ（システム環境リニューアル・機能改善）
            <span
              style={{
                color: '#db2777',
                fontWeight: 800,
                marginLeft: '8px',
                textDecoration: 'underline',
                whiteSpace: 'nowrap',
                display: 'inline-inline'
              }}
            >
              詳細を確認する ＞
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
