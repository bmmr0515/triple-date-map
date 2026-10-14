import React from 'react';

interface AdPlaceholderProps {
  children?: React.ReactNode;
  className?: string;
  label?: string;
}

/**
 * 広告配信コンテナ
 * - children（実際のAdSenseコードやアフィリエイトバナー）が存在する場合のみ表示します。
 * - 広告未設定・未配信時はダミー枠を表示せず null を返し、レイアウト崩れや「未完成コンテンツ」判定を防ぎます。
 */
export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ children, className, label = 'SPONSORED' }) => {
  if (!children) {
    return null;
  }

  return (
    <div 
      className={className}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '24px 0',
        padding: '16px 0',
        borderTop: '1px solid #f1f5f9',
        borderBottom: '1px solid #f1f5f9'
      }}
    >
      <span style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.05em', fontWeight: 'bold' }}>
        {label}
      </span>
      {children}
    </div>
  );
};
