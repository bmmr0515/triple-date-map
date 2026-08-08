import React from 'react';
import { Spot } from '../db';
import { Course } from '../courses';
import { MapPin, ArrowRight, Music, Users } from 'lucide-react';
import { AdPlaceholder } from './AdPlaceholder';

interface ListPagesProps {
  spots: Spot[];
  courses?: Course[];
  onNavigate: (path: string) => void;
  onViewOnMap: (spot: Spot) => void;
}

// 共通パンくずコンポーネント
export const Breadcrumb: React.FC<{ items: { name: string; path?: string }[]; onNavigate: (path: string) => void }> = ({ items, onNavigate }) => {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748b', marginBottom: '16px', fontWeight: 'bold' }}>
      <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('/'); }} style={{ color: '#64748b', textDecoration: 'none' }}>トップ</a>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span>&gt;</span>
          {item.path ? (
            <a href={item.path} onClick={(e) => { e.preventDefault(); onNavigate(item.path!); }} style={{ color: '#64748b', textDecoration: 'none' }}>{item.name}</a>
          ) : (
            <span style={{ color: '#0f172a' }}>{item.name}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// 1. スポット一覧ページ
export const SpotsListPage: React.FC<ListPagesProps> = ({ spots, onNavigate, onViewOnMap }) => {
  const publishedSpots = spots.filter(s => s.status === 'published');
  
  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '24px' }}>
      <Breadcrumb items={[{ name: 'スポット一覧' }]} onNavigate={onNavigate} />
      <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '24px', borderBottom: '3px solid #ff6897', paddingBottom: '10px' }}>📍 スポット一覧 ({publishedSpots.length}箇所)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {publishedSpots.reduce<React.ReactNode[]>((acc, spot, index) => {
          acc.push(
            <div key={spot.id} className="list-spot-card" style={{ display: 'flex', flexDirection: 'column', padding: '18px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: spot.group === '=LOVE' ? '#ff6897' : spot.group === '≠ME' ? '#58ccff' : spot.group === '≒JOY' ? '#ffdf3f' : '#cbd5e1', background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', alignSelf: 'flex-start', marginBottom: '8px' }}>{spot.group}</span>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>{spot.name}</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{spot.description.split('⚠️')[0]}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a href={`/spots/${spot.slug}`} onClick={(e) => { e.preventDefault(); onNavigate(`/spots/${spot.slug}`); }} style={{ flexGrow: 1, textAlign: 'center', background: '#f1f5f9', color: '#0f172a', textDecoration: 'none', padding: '8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  詳細を見る <ArrowRight size={14} />
                </a>
                <button onClick={() => onViewOnMap(spot)} style={{ background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> 地図
                </button>
              </div>
            </div>
          );
          
          // 4件ごとに広告を追加 (0始まりなので index === 3, 7, 11... の後)
          if ((index + 1) % 4 === 0) {
            acc.push(
              <div key={`ad-${spot.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '12px' }}>
                <AdPlaceholder />
              </div>
            );
          }
          
          return acc;
        }, [])}
      </div>
    </div>
  );
};

// 2. 地域別一覧ページ
export const AreasListPage: React.FC<ListPagesProps> = ({ spots, onNavigate }) => {
  const extractArea = (spot: Spot): string => {
    const areaMatch = spot.description.match(/(東京都|北海道|京都府|大阪府|神奈川県|千葉県|埼玉県|愛知県|兵庫県|福岡県|静岡県|茨城県|広島県|宮城県|新潟県|長野県|栃木県|群馬県|熊本県|岡山県|三重県|鹿児島県|山口県|愛媛県|福島県|滋賀県|青森県|山形県|石川県|秋田県|香川県|和歌山県|宮崎県|富山県|佐賀県|鳥取県|徳島県|高知県|島根県|岩手県|山梨県|長崎県|大分県|沖縄県|奈良県|福井県|岐阜県)/);
    return areaMatch ? areaMatch[0] : 'その他・海外';
  };

  const groupedByArea: Record<string, Spot[]> = {};
  spots.filter(s => s.status === 'published').forEach(spot => {
    const area = extractArea(spot);
    if (!groupedByArea[area]) groupedByArea[area] = [];
    groupedByArea[area].push(spot);
  });

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px' }}>
      <Breadcrumb items={[{ name: '地域から探す' }]} onNavigate={onNavigate} />
      <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '24px', borderBottom: '3px solid #ff6897', paddingBottom: '10px' }}>🗺️ 地域別一覧</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {Object.keys(groupedByArea).sort().map(area => (
          <div key={area} style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 'bold', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={18} color="#ff6897" /> {area} ({groupedByArea[area].length}箇所)</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {groupedByArea[area].map(spot => (
                <a key={spot.id} href={`/spots/${spot.slug}`} onClick={(e) => { e.preventDefault(); onNavigate(`/spots/${spot.slug}`); }} style={{ display: 'block', background: '#f8fafc', color: '#334155', textDecoration: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12.5px', border: '1px solid #e2e8f0', fontWeight: '500' }}>
                  {spot.name}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. グループ別一覧ページ
export const GroupsListPage: React.FC<ListPagesProps> = ({ spots, onNavigate }) => {
  const groups: ("=LOVE" | "≠ME" | "≒JOY" | "合同")[] = ["=LOVE", "≠ME", "≒JOY", "合同"];

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px' }}>
      <Breadcrumb items={[{ name: 'グループから探す' }]} onNavigate={onNavigate} />
      <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '24px', borderBottom: '3px solid #ff6897', paddingBottom: '10px' }}>👥 グループ別一覧</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {groups.map(group => {
          const groupSpots = spots.filter(s => s.group === group && s.status === 'published');
          return (
            <div key={group} style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 'bold', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={18} color="#a78bfa" /> {group} ({groupSpots.length}箇所)</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {groupSpots.map(spot => (
                  <a key={spot.id} href={`/spots/${spot.slug}`} onClick={(e) => { e.preventDefault(); onNavigate(`/spots/${spot.slug}`); }} style={{ display: 'block', background: '#f8fafc', color: '#334155', textDecoration: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12.5px', border: '1px solid #e2e8f0', fontWeight: '500' }}>
                    {spot.name}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 4. 作品・楽曲・MV別一覧ページ
export const SongsListPage: React.FC<ListPagesProps> = ({ spots, onNavigate }) => {
  // スポットの reward_title または tags から関連する楽曲名を取り出してグループ化
  const extractSongName = (spot: Spot): string => {
    if (spot.tags && spot.tags.length > 0) {
      // 巡礼タグ以外の最初のタグを楽曲名とする
      const songTag = spot.tags.find(t => !t.includes('巡礼') && t !== '桜並木' && t !== 'アバコスタジオ' && t !== '浦和ルーテル' && t !== 'ロングウッドステーション');
      if (songTag) return `『${songTag}』`;
    }
    if (spot.youtube_title) {
      const match = spot.youtube_title.match(/『(.*?)』/);
      if (match) return `『${match[1]}』`;
    }
    return 'その他・番組企画等';
  };

  const groupedBySong: Record<string, Spot[]> = {};
  spots.filter(s => s.status === 'published').forEach(spot => {
    const song = extractSongName(spot);
    if (!groupedBySong[song]) groupedBySong[song] = [];
    groupedBySong[song].push(spot);
  });

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px' }}>
      <Breadcrumb items={[{ name: '楽曲から探す' }]} onNavigate={onNavigate} />
      <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '24px', borderBottom: '3px solid #ff6897', paddingBottom: '10px' }}>🎵 作品・楽曲・MV別一覧</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {Object.keys(groupedBySong).sort().map(song => (
          <div key={song} style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 'bold', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Music size={18} color="#f59e0b" /> {song} ({groupedBySong[song].length}箇所)</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {groupedBySong[song].map(spot => (
                <a key={spot.id} href={`/spots/${spot.slug}`} onClick={(e) => { e.preventDefault(); onNavigate(`/spots/${spot.slug}`); }} style={{ display: 'block', background: '#f8fafc', color: '#334155', textDecoration: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '12.5px', border: '1px solid #e2e8f0', fontWeight: '500' }}>
                  {spot.name}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. 巡礼モデルコース一覧ページ
export const CoursesListPage: React.FC<{ courses: Course[]; spots: Spot[]; onNavigate: (path: string) => void }> = ({ courses, spots, onNavigate }) => {
  const publishedCourses = courses.filter(c => c.status === 'published');

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px' }}>
      <Breadcrumb items={[{ name: '巡礼モデルコース一覧' }]} onNavigate={onNavigate} />
      <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '24px', borderBottom: '3px solid #ff6897', paddingBottom: '10px' }}>🗺️ おすすめ巡礼モデルコース</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {publishedCourses.map(course => (
          <div key={course.slug} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{course.name}</h2>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ff6897', background: '#fff5f5', padding: '4px 10px', borderRadius: '8px', border: '1px solid #fed7d7' }}>🕒 {course.duration}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12.5px', color: '#64748b' }}>
              <span>🚶 移動方法: <strong>{course.transportation}</strong></span>
              <span>☀️ 推奨時間: <strong>{course.recommended_time}</strong></span>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '12px', color: '#475569' }}>
              <strong style={{ display: 'block', marginBottom: '6px', color: '#0f172a' }}>🗺️ コースルート:</strong>
              {course.spots.map((cs, i) => {
                const s = spots.find(sp => sp.id === cs.spot_id);
                const spotName = s ? s.name : '未登録スポット';
                return (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {i > 0 && <span style={{ margin: '0 6px', color: '#cbd5e1' }}>→</span>}
                    <span style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', fontWeight: '500' }}>{i + 1}. {spotName}</span>
                  </span>
                );
              })}
            </div>
            <a href={`/courses/${course.slug}`} onClick={(e) => { e.preventDefault(); onNavigate(`/courses/${course.slug}`); }} style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontSize: '12.5px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(255,104,151,0.15)' }}>
              コース詳細・マップを見る <ArrowRight size={14} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
