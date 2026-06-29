import React from 'react';
import { Course } from '../courses';
import { Spot } from '../db';
import { Breadcrumb } from './ListViews';
import { AdPlaceholder } from './AdPlaceholder';
import { Clock, Navigation, CalendarDays, ExternalLink, Coffee } from 'lucide-react';

interface CourseDetailProps {
  course: Course;
  allSpots: Spot[];
  onNavigate: (path: string) => void;
}

export const CourseDetailView: React.FC<CourseDetailProps> = ({ course, allSpots, onNavigate }) => {
  // spot_id からスポット情報をルックアップする
  const getSpotById = (id: string): Spot | undefined => {
    return allSpots.find(s => s.id === id);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      <Breadcrumb items={[{ name: '巡礼モデルコース', path: '/courses' }, { name: course.name }]} onNavigate={onNavigate} />

      {/* コースヘッダー */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {course.related_groups.map(g => (
            <span key={g} style={{ fontSize: '10px', fontWeight: 'bold', color: '#fff', background: g === '=LOVE' ? '#ff6897' : g === '≠ME' ? '#58ccff' : g === '≒JOY' ? '#f59e0b' : '#64748b', padding: '4px 8px', borderRadius: '6px' }}>
              {g}
            </span>
          ))}
          {course.related_songs.map(s => (
            <span key={s} style={{ fontSize: '10px', fontWeight: 'bold', color: '#475569', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>
              🎵 {s}
            </span>
          ))}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '6px 0 0 0', lineHeight: '1.3' }}>{course.name}</h1>
      </div>

      {/* コース基本情報 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} color="#ff6897" />
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>想定所要時間</span>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{course.duration}</strong>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Navigation size={20} color="#a78bfa" />
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>推奨移動方法</span>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{course.transportation}</strong>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarDays size={20} color="#f59e0b" />
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>推奨時間帯</span>
            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{course.recommended_time}</strong>
          </div>
        </div>
      </div>

      {/* 広告枠（コース中） */}
      <AdPlaceholder />

      {/* 巡礼ルート解説（回る順番） */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', margin: '30px 0 30px 10px', borderLeft: '3px dashed #e2e8f0', paddingLeft: '24px' }}>
        {course.spots.map((cSpot, index) => {
          const sInfo = getSpotById(cSpot.spot_id);
          return (
            <div key={cSpot.spot_id} style={{ position: 'relative' }}>
              {/* ナンバリングサークル */}
              <div style={{ position: 'absolute', left: '-37px', top: '0', width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                {index + 1}
              </div>
              
              <div style={{ background: '#fff', border: '1px solid #f1f5f9', padding: '16px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                {sInfo ? (
                  <>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {sInfo.name}
                      <a href={`/spots/${sInfo.slug}`} onClick={(e) => { e.preventDefault(); onNavigate(`/spots/${sInfo.slug}`); }} style={{ fontSize: '11px', color: '#ff6897', textDecoration: 'none', fontWeight: 'bold' }}>
                        スポット詳細 →
                      </a>
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 10px 0' }}>📍 {sInfo.address || ''}</p>
                  </>
                ) : (
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444', margin: '0 0 6px 0' }}>未登録スポット ({cSpot.spot_id})</h3>
                )}
                
                {cSpot.short_commentary && (
                  <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#475569', margin: 0 }}>
                    {cSpot.short_commentary}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 注意事項 */}
      {course.notes && (
        <div style={{ padding: '16px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '14px', margin: '24px 0', fontSize: '12.5px', color: '#b45309', lineHeight: '1.6' }}>
          <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#d97706', fontWeight: 'bold' }}>
            ⚠️ 巡礼時の注意事項
          </span>
          {course.notes}
        </div>
      )}

      {/* Googleマップ等への外部リンク */}
      {course.external_map_url && (
        <div style={{ margin: '24px 0' }}>
          <a 
            href={course.external_map_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#0f172a', color: '#fff', textDecoration: 'none', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}
          >
            Googleマップで全ルートを開く <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* 周辺の飲食店や休憩場所 */}
      {course.cafe_spots && course.cafe_spots.length > 0 && (
        <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '20px', borderRadius: '16px', margin: '24px 0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#15803d', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Coffee size={18} /> ☕ 周辺のおすすめカフェ・休憩場所
          </h3>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, fontSize: '13px', color: '#166534', lineHeight: '1.6' }}>
            {course.cafe_spots.map((cafe, i) => (
              <li key={i}>{cafe}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 広告枠（下部） */}
      <AdPlaceholder />
    </div>
  );
};
