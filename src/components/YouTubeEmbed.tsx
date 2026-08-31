import React, { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';

/**
 * 瀧脇笙古ファンサイト準拠: YouTube URL / IDから 11桁の videoId を正確に抽出する関数
 */
export const extractYouTubeVideoId = (input: string | null | undefined): string | null => {
  if (!input || typeof input !== 'string') return null;

  let trimmed = input.trim();

  // 1. iframe文字列からのsrc抽出
  if (trimmed.includes('<iframe')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      trimmed = srcMatch[1];
    }
  }

  // 2. HTMLエスケープ解除
  trimmed = trimmed.replace(/&amp;/g, '&');

  // 3. watch?v= または &v=
  const watchMatch = trimmed.match(/(?:watch\?v=|&v=)([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // 4. youtu.be/
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // 5. shorts/
  const shortsMatch = trimmed.match(/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // 6. live/
  const liveMatch = trimmed.match(/live\/([a-zA-Z0-9_-]{11})/i);
  if (liveMatch && liveMatch[1]) return liveMatch[1];

  // 7. embed/
  const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  // 8. 11桁のvideoId単体
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  return null;
};

// 互換性のためのエイリアス
export const extractYouTubeId = extractYouTubeVideoId;

interface YouTubeEmbedProps {
  youtubeIdOrUrl?: string;
  youtubeId?: string;
  title?: string;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ youtubeIdOrUrl, youtubeId, title = "公式動画" }) => {
  const [hasError, setHasError] = useState(false);
  const videoId = extractYouTubeVideoId(youtubeIdOrUrl || youtubeId);

  if (!videoId) return null;

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const embedSrc = `https://www.youtube.com/embed/${videoId}`;

  // 再生不能時・エラー検知時は黒いプレーヤーを見せず、サムネイル＋YouTubeで公式動画を見るボタンへ自動フォールバック
  if (hasError) {
    return (
      <div 
        className="youtube-thumbnail-fallback-card"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          backgroundImage: `url(${thumbnailUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.45) 50%, rgba(15, 23, 42, 0.25) 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            textAlign: 'center',
            gap: '12px'
          }}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#ff0000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(255, 0, 0, 0.45)'
          }}>
            <Play className="w-7 h-7 text-white fill-white ml-1" />
          </div>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ff0000',
              color: '#ffffff',
              padding: '10px 22px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 'bold',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(255, 0, 0, 0.4)',
              transition: 'all 0.2s ease'
            }}
            className="pop-button"
          >
            YouTubeで公式動画を見る
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    );
  }

  // 瀧脇笙古ファンサイトの構成
  return (
    <div 
      className="youtube-embed-box" 
      style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000000' }}
    >
      <iframe
        src={embedSrc}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{ width: '100%', height: '100%', border: 'none' }}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default YouTubeEmbed;



