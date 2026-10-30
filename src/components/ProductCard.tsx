import React from 'react';
import { SpotProductLink } from '../db';
import { Disc3, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  productInfo?: SpotProductLink;
}

export const ProductCard: React.FC<ProductCardProps> = ({ productInfo }) => {
  if (!productInfo) return null;

  return (
    <div style={{
      margin: '24px 0 16px 0',
      padding: '16px 20px',
      background: '#f8fafc',
      border: '1.5px solid #e2e8f0',
      borderRadius: '14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      position: 'relative'
    }}>
      {/* PR / 広告バッジ（アフィリエイト時のみ表示） */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#1e293b'
        }}>
          <Disc3 size={18} style={{ color: '#d97706' }} />
          <span>💿 『ロックスター様』CD情報</span>
        </div>
        {productInfo.isAffiliate && (
          <span style={{
            fontSize: '10px',
            color: '#64748b',
            background: '#e2e8f0',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            PR（広告）
          </span>
        )}
      </div>

      <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', marginBottom: '12px' }}>
        <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{productInfo.title}</div>
        {productInfo.edition && <div style={{ fontSize: '12px', color: '#64748b' }}>{productInfo.edition}</div>}
        <div style={{ fontSize: '12px', color: '#64748b' }}>{productInfo.releaseDate}発売</div>
        {productInfo.jan && <div style={{ fontSize: '11px', color: '#94a3b8' }}>JAN: {productInfo.jan}</div>}
      </div>

      <a
        href={productInfo.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          background: '#d97706',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 'bold',
          textDecoration: 'none',
          boxShadow: '0 2px 4px rgba(217,119,6,0.2)'
        }}
      >
        <span>［{productInfo.shopName}で商品を見る］</span>
        <ExternalLink size={14} />
      </a>

      {productInfo.isAffiliate && (
        <div style={{ marginTop: '8px', fontSize: '10px', color: '#94a3b8' }}>
          ※アフィリエイト広告を利用しています
        </div>
      )}
    </div>
  );
};
