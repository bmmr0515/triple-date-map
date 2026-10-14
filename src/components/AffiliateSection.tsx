import React from 'react';
import { ExternalLink, Hotel } from 'lucide-react';
import { getActiveAffiliateLinks, AFFILIATE_CONFIG } from '../config/affiliate';

interface AffiliateSectionProps {
  courseSlug?: string;
  area?: string;
  className?: string;
}

/**
 * 旅行・宿泊系アフィリエイトセクション
 * - 有効な提携URL（isEnabled === true かつ 正規URL）が存在する場合のみ表示します。
 * - 提携URLが未設定の場合は null を返し、ダミーリンクや不要な枠は一切出力しません。
 * - 景品表示法・ステマ規制に準拠した「PR」表記と、rel="sponsored noopener noreferrer" を付与します。
 */
export const AffiliateSection: React.FC<AffiliateSectionProps> = ({ courseSlug, area, className }) => {
  const activeLinks = getActiveAffiliateLinks(courseSlug, area);

  if (!activeLinks || activeLinks.length === 0) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        margin: '28px 0',
        padding: '20px',
        background: '#faf5ff',
        border: '1px solid #e9d5ff',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* ヘッダー・PR表記 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#f3e8ff', color: '#9333ea', padding: '6px', borderRadius: '8px', display: 'flex' }}>
            <Hotel size={18} />
          </div>
          <span style={{ fontSize: '15px', fontWeight: '900', color: '#581c87' }}>
            聖地巡礼のおすすめ宿泊・移動プラン
          </span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#7e22ce', background: '#ede9fe', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>
          PR / 提携広告
        </span>
      </div>

      {/* リンクカード一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activeLinks.map(item => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '16px',
              background: '#ffffff',
              border: '1px solid #e9d5ff',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(147, 51, 234, 0.04)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#c084fc';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e9d5ff';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#7e22ce', background: '#f3e8ff', padding: '2px 8px', borderRadius: '4px' }}>
                  {item.serviceName}
                </span>
                {item.badgeText && (
                  <span style={{ fontSize: '10px', color: '#6b21a8', background: '#fae8ff', padding: '2px 6px', borderRadius: '4px' }}>
                    {item.badgeText}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '11px', color: '#9333ea', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                プランを見る <ExternalLink size={12} />
              </span>
            </div>

            <h4 style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#1e293b', margin: '4px 0 2px 0', lineHeight: '1.4' }}>
              {item.title}
            </h4>

            {item.description && (
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                {item.description}
              </p>
            )}
          </a>
        ))}
      </div>

      {/* 注意書き */}
      <p style={{ fontSize: '10.5px', color: '#7e22ce', margin: 0, lineHeight: '1.5', opacity: 0.85 }}>
        {AFFILIATE_CONFIG.disclaimerText}
      </p>
    </div>
  );
};
