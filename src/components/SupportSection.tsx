import React from 'react';
import { Heart, Server, Globe, Map } from 'lucide-react';

interface SupportSectionProps {
  ofuseUrl?: string;
}

export const SupportSection: React.FC<SupportSectionProps> = ({ 
  ofuseUrl = import.meta.env.VITE_OFUSE_URL || 'https://ofuse.me/XXXXXXXX' 
}) => {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '24px',
      padding: '24px',
      margin: '24px 0',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
      textAlign: 'center'
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <div style={{
          background: '#fef2f2',
          padding: '12px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Heart className="text-rose-400" size={24} />
        </div>
      </div>
      
      <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#334155', marginBottom: '12px' }}>
        巡礼文化を長く残すために
      </h3>
      
      <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.7', marginBottom: '20px', textAlign: 'left' }}>
        このアプリは個人開発で運営しています。<br/>
        皆様のアクセス増加に伴い、より快適にご利用いただけるようサーバーを増強しました🙏<br/>
        今後も長く巡礼文化を残していくため、応援していただけると開発・維持の励みになります。
      </p>

      {/* 運営コストの透明性 */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px',
        textAlign: 'left'
      }}>
        <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>
          💡 現在の主な運営費
        </p>
        <ul style={{ 
          margin: 0, padding: 0, listStyle: 'none', 
          display: 'flex', flexDirection: 'column', gap: '8px',
          fontSize: '11px', color: '#64748b' 
        }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Server size={12} className="text-slate-400" /> Vercel Pro (サーバー)</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Map size={12} className="text-slate-400" /> Map API (地図描画)</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={12} className="text-slate-400" /> ドメイン維持費</li>
        </ul>
      </div>

      <a
        href={ofuseUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #ff6897 0%, #ff8dae 100%)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '9999px',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: '900',
          boxShadow: '0 4px 15px rgba(255, 104, 151, 0.3)',
          transition: 'transform 0.2s'
        }}
      >
        <Heart size={16} fill="white" />
        運営と巡礼文化を支援する
      </a>
    </div>
  );
};
