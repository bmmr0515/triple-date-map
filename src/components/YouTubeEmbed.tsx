import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

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

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ youtubeIdOrUrl, youtubeId, title = "YouTube 関連動画" }) => {
  const [hasError, setHasError] = useState(false);
  const videoId = extractYouTubeId(youtubeIdOrUrl || youtubeId);

  if (!videoId || hasError) {
    if (!videoId) return null;

    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    return (
      <div 
        className="youtube-fallback-box"
        style={{
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: '16px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          textAlign: 'center',
          gap: '12px',
          boxSizing: 'border-box'
        }}
      >
        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
          この動画はサイト内で再生できません
        </p>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background-color 0.2s'
          }}
        >
          YouTubeで見る
          <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  return (
    <div className="youtube-embed" style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden' }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
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

