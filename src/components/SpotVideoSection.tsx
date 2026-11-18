import React from 'react';
import { YouTubeEmbed } from './YouTubeEmbed';
import { resolveSpotVideos } from '../utils/youtube';
import { Play, ExternalLink } from 'lucide-react';

export interface SpotVideoSectionProps {
  spot: {
    id: string;
    name: string;
    youtubeId?: string;
    youtube_url?: string;
    youtube_title?: string;
    workKey?: string;
  };
  /** スポット固有の動画タイトル（未指定時はデフォルト） */
  title?: string;
  className?: string;
}

/**
 * 聖地スポット用のYouTube動画共通セクション
 * 
 * 厳格仕様:
 * 1. 1つの聖地につき、埋め込み動画（iframe）は原則1本のみ表示（代表動画）
 * 2. 同一動画IDの重複登録は完全除外
 * 3. 異なる動画が複数存在する場合は、代表動画以外を「その他の関連動画」としてテキストリンク表示（iframeは並べない）
 * 4. 動画が未登録の場合はiframeを0個（非表示）とする
 */
export const SpotVideoSection: React.FC<SpotVideoSectionProps> = ({
  spot,
  title,
  className
}) => {
  const { primaryVideoId, otherVideoIds } = resolveSpotVideos(spot);

  // 動画が1件も存在しない場合は何も描画しない
  if (!primaryVideoId) {
    return null;
  }

  const videoTitle = title || spot.youtube_title || `${spot.name} 関連動画`;

  return (
    <div className={`spot-video-section ${className || ''}`} style={{ margin: '16px 0' }}>
      {/* 🎬 代表動画ヘッダー */}
      <div 
        className="video-label-bold" 
        style={{ 
          fontWeight: 'bold', 
          fontSize: '12px', 
          color: '#1e293b', 
          marginBottom: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px' 
        }}
      >
        <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
        <span>{videoTitle}</span>
      </div>

      {/* 📺 代表動画の埋め込み（1聖地につき1本のみ） */}
      <YouTubeEmbed
        key={`primary_${spot.id}_${primaryVideoId}`}
        youtubeId={primaryVideoId}
        title={videoTitle}
      />

      {/* 🔗 異なる動画が複数紐付いている場合のテキストリンク集（iframeは複数並べない） */}
      {otherVideoIds.length > 0 && (
        <div 
          className="other-videos-box" 
          style={{ 
            marginTop: '12px', 
            padding: '10px 14px', 
            background: '#f8fafc', 
            borderRadius: '10px', 
            border: '1px solid #e2e8f0' 
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px' }}>
            その他の関連動画:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {otherVideoIds.map((vid, idx) => (
              <a
                key={`other_${vid}_${idx}`}
                href={`https://www.youtube.com/watch?v=${vid}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  fontSize: '11.5px', 
                  color: '#2563eb', 
                  textDecoration: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  lineHeight: '1.5'
                }}
              >
                <span>▶ YouTubeで関連動画を見る（ID: {vid}）</span>
                <ExternalLink size={12} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotVideoSection;
