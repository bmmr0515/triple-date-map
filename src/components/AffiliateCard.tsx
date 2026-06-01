import React from 'react';
import { ShoppingBag, ExternalLink } from 'lucide-react';

export interface AffiliateData {
  title: string;
  url: string;
  imageUrl?: string;
  description?: string;
  type?: 'MV' | 'Live' | 'Other';
}

interface AffiliateCardProps {
  data: AffiliateData;
}

export const AffiliateCard: React.FC<AffiliateCardProps> = ({ data }) => {
  const getContextMessage = () => {
    if (data.description) return data.description;
    if (data.type === 'MV') return 'このMV収録作品はこちら';
    if (data.type === 'Live') return 'ライブ映像はこちら';
    return '巡礼前に見ると没入感かなり上がります。';
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '16px',
      marginTop: '16px',
      border: '1px solid #f1f5f9',
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShoppingBag size={14} className="text-slate-400" />
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>
          {getContextMessage()}
        </span>
      </div>

      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
          color: 'inherit',
          background: '#f8fafc',
          padding: '12px',
          borderRadius: '12px',
          transition: 'background 0.2s',
          border: '1px solid transparent'
        }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
      >
        {data.imageUrl && (
          <img 
            src={data.imageUrl} 
            alt={data.title} 
            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
          />
        )}
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '12px', fontWeight: '900', color: '#334155', margin: '0 0 4px 0', lineHeight: '1.4' }}>
            {data.title}
          </h4>
          <span style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            公式ショップで見る <ExternalLink size={10} />
          </span>
        </div>
      </a>
    </div>
  );
};
