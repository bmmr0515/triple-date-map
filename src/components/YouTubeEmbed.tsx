import React from 'react';

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

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ youtubeIdOrUrl, youtubeId, title = "公式動画" }) => {
  const originalYoutubeValue = youtubeIdOrUrl || youtubeId;
  const videoId = extractYouTubeVideoId(originalYoutubeValue);

  if (!videoId) {
    return null;
  }

  return (
    <div className="youtube-embed-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div className="youtube-embed">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
          title={`${title} 公式動画`}
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="youtube-external-link"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '10px',
          backgroundColor: '#f1f5f9',
          color: '#0f172a',
          fontSize: '12px',
          fontWeight: 'bold',
          textDecoration: 'none',
          border: '1px solid #e2e8f0',
          transition: 'all 0.2s ease'
        }}
      >
        YouTubeで公式動画を見る ↗
      </a>
    </div>
  );
};

export default YouTubeEmbed;









