import React from 'react';
import { Spot } from '../db';
import { Breadcrumb } from './ListViews';
import { AdPlaceholder } from './AdPlaceholder';
import { MapPin, Train, Calendar, ShieldAlert, Heart, HelpCircle, Compass } from 'lucide-react';

interface SpotDetailProps {
  spot: Spot;
  allSpots: Spot[];
  onNavigate: (path: string) => void;
  onViewOnMap: (spot: Spot) => void;
}

export const SpotDetailView: React.FC<SpotDetailProps> = ({ spot, allSpots, onNavigate, onViewOnMap }) => {
  // 都道府県・市区町村の簡易抽出ロジック（パンくず用）
  const getBreadcrumbItems = (s: Spot) => {
    const text = s.address || s.description;
    const prefMatch = text.match(/(東京都|北海道|京都府|大阪府|神奈川県|千葉県|埼玉県|愛知県|兵庫県|福岡県|静岡県|茨城県|広島県|宮城県|新潟県|長野県|栃木県|群馬県|熊本県|岡山県|三重県|鹿児島県|山口県|愛媛県|福島県|滋賀県|青森県|山形県|石川県|秋田県|香川県|和歌山県|宮崎県|富山県|佐賀県|鳥取県|徳島県|高知県|島根県|岩手県|山梨県|長崎県|大分県|沖縄県|奈良県|福井県|岐阜県)/);
    const pref = prefMatch ? prefMatch[0] : '';
    
    let city = '';
    if (pref) {
      const prefIndex = text.indexOf(pref);
      if (prefIndex !== -1) {
        const rest = text.substring(prefIndex + pref.length);
        const cityMatch = rest.match(/^[^0-9\s]*?[市区町村]/); // 数字やスペースを含まない市区町村名
        if (cityMatch) {
          city = cityMatch[0].trim();
        }
      }
    }
    
    const items = [];
    items.push({ name: '聖地スポット', path: '/spots' });
    if (pref) {
      items.push({ name: pref, path: '/areas' });
    }
    if (city) {
      items.push({ name: city });
    }
    items.push({ name: s.name });
    return items;
  };

  // 周辺の関連スポット（同じグループ or 同じ都道府県の他のスポットから3つ）
  const getRelatedSpots = () => {
    const text = spot.address || spot.description;
    const prefMatch = text.match(/(東京都|北海道|京都府|大阪府|神奈川県|千葉県|埼玉県|愛知県|兵庫県|福岡県|静岡県|茨城県|広島県|宮城県|新潟県|長野県|栃木県|群馬県|熊本県|岡山県|三重県|鹿児島県|山口県|愛媛県|福島県|滋賀県|青森県|山形県|石川県|秋田県|香川県|和歌山県|宮崎県|富山県|佐賀県|鳥取県|徳島県|高知県|島根県|岩手県|山梨県|長崎県|大分県|沖縄県|奈良県|福井県|岐阜県)/);
    const pref = prefMatch ? prefMatch[0] : '';

    return allSpots
      .filter(s => s.id !== spot.id && s.status === 'published')
      .filter(s => {
        const sText = s.address || s.description;
        const isSamePref = pref && sText.includes(pref);
        const isSameGroup = s.group === spot.group;
        return isSamePref || isSameGroup;
      })
      .slice(0, 3);
  };

  const relatedSpots = getRelatedSpots();

  // YouTube埋め込みURLの処理
  const renderYoutube = () => {
    if (!spot.youtube_url) return null;
    const isIframe = spot.youtube_url.includes('<iframe');
    
    if (isIframe) {
      return (
        <div 
          className="video-box" 
          style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', margin: '16px 0' }}
          dangerouslySetInnerHTML={{ 
            __html: spot.youtube_url
              .replace(/width="\d+"/, 'width="100%"')
              .replace(/height="\d+"/, 'height="100%"')
          }} 
        />
      );
    }

    return (
      <div className="video-box" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', margin: '16px 0' }}>
        <iframe
          width="100%"
          height="100%"
          src={`${spot.youtube_url}?modestbranding=1&rel=0`}
          title={spot.youtube_title || "YouTube video player"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  };

  // メイン説明文の警告を除去したクリーンアップ
  const getCleanDescription = () => {
    const iframeRegex = /<iframe[^>]*>.*?<\/iframe>/gi;
    let clean = spot.description.replace(iframeRegex, '').trim();
    if (clean.includes('⚠️聖地巡礼に関する重要なお願い')) {
      clean = clean.split('⚠️聖地巡礼に関する重要なお願い')[0].trim();
    }
    return clean;
  };

  const cleanDescription = getCleanDescription();

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      <Breadcrumb items={getBreadcrumbItems(spot)} onNavigate={onNavigate} />
      
      {/* ヘッダー情報 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', background: spot.group === '=LOVE' ? '#ff6897' : spot.group === '≠ME' ? '#58ccff' : spot.group === '≒JOY' ? '#f59e0b' : '#64748b', padding: '4px 10px', borderRadius: '8px' }}>
            {spot.group}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px' }}>
            {spot.category}
          </span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', margin: '6px 0 0 0', lineHeight: '1.3' }}>{spot.name}</h1>
      </div>

      {/* メイン画像（あれば） */}
      {spot.images && spot.images.length > 0 ? (
        <div style={{ width: '100%', maxHeight: '400px', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', position: 'relative' }}>
          <img src={spot.images[0].url} alt={spot.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {spot.images[0].caption && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '10px 16px', fontSize: '12px' }}>
              {spot.images[0].caption}
              {spot.images[0].photographer && `（撮影：${spot.images[0].photographer}）`}
            </div>
          )}
        </div>
      ) : null}

      {/* 広告枠（記事中） */}
      <AdPlaceholder />

      {/* 基本情報グリッド */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: 0, borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>📍 スポット基本情報</h2>
          
          {spot.address && (
            <div style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
              <MapPin size={16} style={{ color: '#ff6897', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#475569', display: 'block', fontSize: '11px' }}>所在地</strong>
                <span style={{ color: '#0f172a' }}>{spot.address}</span>
              </div>
            </div>
          )}

          {(spot.nearest_station || spot.walk_time) && (
            <div style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
              <Train size={16} style={{ color: '#a78bfa', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#475569', display: 'block', fontSize: '11px' }}>最寄り駅 / アクセス</strong>
                <span style={{ color: '#0f172a' }}>{spot.nearest_station || ''} {spot.walk_time ? `(徒歩 ${spot.walk_time})` : ''}</span>
              </div>
            </div>
          )}

          {spot.event_date && (
            <div style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
              <Calendar size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#475569', display: 'block', fontSize: '11px' }}>記念日・登場日</strong>
                <span style={{ color: '#0f172a' }}>{spot.event_date}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: 0, borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>🎥 関連コンテンツ</h2>
          {spot.youtube_title && (
            <div style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
              <Heart size={16} style={{ color: '#ec4899', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#475569', display: 'block', fontSize: '11px' }}>登場作品・番組</strong>
                <span style={{ color: '#0f172a' }}>{spot.youtube_title.replace('🎥 関連映像: ', '').replace('🎥 関連映像：', '')}</span>
              </div>
            </div>
          )}
          {spot.reward_title && (
            <div style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
              <Compass size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#475569', display: 'block', fontSize: '11px' }}>スタンプ獲得称号</strong>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✨ 【{spot.reward_title}】</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* スポット解説 */}
      {cleanDescription && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>📝 聖地解説</h3>
          <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#334155', whiteSpace: 'pre-wrap', margin: 0 }}>{cleanDescription}</p>
        </div>
      )}

      {/* どの場面で登場したか */}
      {spot.scene && (
        <div style={{ marginBottom: '24px', background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#b45309', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>🎬 どの場面で登場した？</h3>
          <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#78350f', margin: 0 }}>{spot.scene}</p>
        </div>
      )}

      {/* 現地で確認できるポイント */}
      {spot.check_points && spot.check_points.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>🔍 現地での注目ポイント</h3>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: '1.6' }}>
            {spot.check_points.map((pt, i) => (
              <li key={i}>{pt}</li>
            ))}
          </ul>
        </div>
      )}

      {/* YouTube映像埋め込み */}
      {renderYoutube()}

      {/* 訪問時の注意 */}
      {spot.visitor_notes ? (
        <div style={{ padding: '16px', background: '#fff5f5', border: '2px solid #feb2b2', borderRadius: '14px', margin: '24px 0', fontSize: '12.5px', color: '#9b2c2c', lineHeight: '1.6' }}>
          <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#c53030', fontWeight: 'bold' }}>
            <ShieldAlert size={18} /> ⚠️ 訪問時の注意事項
          </span>
          <span style={{ display: 'block', whiteSpace: 'pre-wrap' }}>{spot.visitor_notes}</span>
        </div>
      ) : spot.description.includes('⚠️') ? (
        // 旧仕様のdescription警告部パース
        <div style={{ padding: '16px', background: '#fff5f5', border: '2px solid #feb2b2', borderRadius: '14px', margin: '24px 0', fontSize: '12.5px', color: '#9b2c2c', lineHeight: '1.6' }}>
          <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#c53030', fontWeight: 'bold' }}>
            <ShieldAlert size={18} /> ⚠️ 聖地巡礼に関する重要なお願い
          </span>
          <span style={{ display: 'block', whiteSpace: 'pre-wrap' }}>{spot.description.split('⚠️聖地巡礼に関する重要なお願い')[1]?.trim()}</span>
        </div>
      ) : null}

      {/* アクションボタン */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '30px 0' }}>
        <button onClick={() => onViewOnMap(spot)} style={{ flexGrow: 1, background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(255,104,151,0.2)' }}>
          <MapPin size={18} /> 地図上で位置を確認する
        </button>
        <a 
          href={`/contact?url=${encodeURIComponent(window.location.origin + '/spots/' + spot.slug)}&subject=${encodeURIComponent(spot.name + ' の情報修正依頼')}`}
          onClick={(e) => { e.preventDefault(); onNavigate(`/contact?url=${encodeURIComponent(window.location.origin + '/spots/' + spot.slug)}&subject=${encodeURIComponent(spot.name + ' の情報修正・提供')}`); }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1.5px solid #cbd5e1', color: '#475569', background: '#fff', textDecoration: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px' }}
        >
          <HelpCircle size={16} /> 情報提供・修正依頼
        </a>
      </div>

      {/* 最終確認日 */}
      {spot.last_confirmed_date && (
        <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginBottom: '24px' }}>
          最終情報確認日: {spot.last_confirmed_date}
        </div>
      )}

      {/* 広告枠（記事下部） */}
      <AdPlaceholder />

      {/* 周辺の関連スポット推薦 */}
      {relatedSpots.length > 0 && (
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px', marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '14px' }}>🚶 周辺・関連する聖地スポット</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {relatedSpots.map(s => (
              <a key={s.id} href={`/spots/${s.slug}`} onClick={(e) => { e.preventDefault(); onNavigate(`/spots/${s.slug}`); }} style={{ display: 'block', padding: '14px', background: '#f8fafc', borderRadius: '12px', textDecoration: 'none', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '9px', fontWeight: 'bold', color: s.group === '=LOVE' ? '#ff6897' : s.group === '≠ME' ? '#58ccff' : '#f59e0b', display: 'block', marginBottom: '4px' }}>{s.group}</span>
                <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{s.name}</strong>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
