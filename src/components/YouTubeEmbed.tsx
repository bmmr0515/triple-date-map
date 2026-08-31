import React from 'react';
import { Play, ExternalLink } from 'lucide-react';

/**
 * YouTube URL / IDから 11桁の videoId を正確に抽出する関数
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

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ youtubeIdOrUrl, youtubeId }) => {

  const videoId = extractYouTubeVideoId(youtubeIdOrUrl || youtubeId);

  if (!videoId) return null;

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <a
      href={watchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="youtube-thumbnail-card pop-button"
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#0f172a',
        backgroundImage: `url(${thumbnailUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        textDecoration: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(15, 23, 42, 0.2) 100%)',
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
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#ff0000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(255, 0, 0, 0.5)',
          transition: 'transform 0.2s ease'
        }}>
          <Play className="w-8 h-8 text-white fill-white ml-1" />
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#ff0000',
          color: '#ffffff',
          padding: '10px 22px',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 'bold',
          boxShadow: '0 4px 16px rgba(255, 0, 0, 0.4)'
        }}>
          YouTubeで公式動画を見る
          <ExternalLink size={14} />
        </div>
      </div>
    </a>
  );
};

export default YouTubeEmbed;




