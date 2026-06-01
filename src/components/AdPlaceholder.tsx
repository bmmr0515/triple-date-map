import React from 'react';

interface AdPlaceholderProps {
  children?: React.ReactNode;
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ children }) => {
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '24px 0',
      padding: '16px 0',
      borderTop: '1px solid #f1f5f9',
      borderBottom: '1px solid #f1f5f9'
    }}>
      <span style={{ fontSize: '9px', color: '#cbd5e1', marginBottom: '8px', letterSpacing: '0.05em' }}>
        SPONSORED
      </span>
      {children ? (
        children
      ) : (
        <div style={{
          width: '100%',
          maxWidth: '320px',
          height: '50px',
          background: '#f8fafc',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: '10px'
        }}>
          {/* 将来的にGoogle AdSenseやASPバナーを配置する安全なコンテナ */}
          広告プレースホルダー
        </div>
      )}
    </div>
  );
};
