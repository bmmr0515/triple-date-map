import React, { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';

export const extractYouTubeId = (input: string | undefined | null): string | null => {
  if (!input || typeof input !== 'string') return null;
  let str = input.trim();
  if (!str) return null;

  // 1. iframe文字列からのsrc抽出
  if (str.includes('<iframe')) {
    const srcMatch = str.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      str = srcMatch[1];
    }
  }

  // 2. HTMLエスケープ解除
  str = str.replace(/&amp;/g, '&');

  // 3. 各パターンのマッチング
  const watchMatch = str.match(/(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  const shortMatch = str.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  const embedMatch = str.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/i);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  const shortsMatch = str.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  const rawIdMatch = str.match(/^[a-zA-Z0-9_-]{11}$/);
  if (rawIdMatch) return str;

  return null;
};

interface YouTubeEmbedProps {
  youtubeIdOrUrl?: string;
  youtubeId?: string;
  title?: string;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ youtubeIdOrUrl, youtubeId, title = "公式動画" }) => {
  const [hasError, setHasError] = useState(false);
  const videoId = extractYouTubeId(youtubeIdOrUrl || youtubeId);

  if (!videoId) return null;

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // 本番ドメインおよび環境に応じた origin パラメータの自動取得
  const getOrigin = () => {
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return encodeURIComponent(window.location.origin);
    }
    return encodeURIComponent('https://tripledatemap.com');
  };

  const embedUrl = `https://www.youtube.com/embed/${videoId}?origin=${getOrigin()}`;

  // 再生不可時・エラー発生時は、利用者に黒いエラー画面を見せず、高画質サムネイル＋公式視聴ボタンカードを表示
  if (hasError) {
    return (
      <div 
        className="youtube-thumbnail-fallback"
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
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(15, 23, 42, 0.2) 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            textAlign: 'center',
            gap: '10px'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#ff0000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 0, 0, 0.4)'
          }}>
            <Play className="w-6 h-6 text-white fill-white ml-1" />
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
              padding: '10px 20px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 'bold',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(255, 0, 0, 0.35)',
              transition: 'transform 0.2s ease, background-color 0.2s ease'
            }}
            className="pop-button"
          >
            YouTubeで公式MVを見る
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="youtube-embed-container" style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#0f172a' }}>
      <iframe
        src={embedUrl}
        title={`${title} 公式動画`}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ width: '100%', height: '100%', border: 'none' }}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default YouTubeEmbed;


