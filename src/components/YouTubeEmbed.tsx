import React, { useState, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

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

export type YouTubeDisplayMode = 'embed' | 'link' | 'none';

interface YouTubeEmbedProps {
  youtubeIdOrUrl?: string;
  youtubeId?: string;
  title?: string;
  displayMode?: YouTubeDisplayMode;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ 
  youtubeIdOrUrl, 
  youtubeId, 
  title = "公式動画",
  displayMode = 'embed'
}) => {
  const [playbackError, setPlaybackError] = useState<boolean>(false);
  const originalYoutubeValue = youtubeIdOrUrl || youtubeId;
  const videoId = extractYouTubeVideoId(originalYoutubeValue);

  // スポット変更時（videoId 変更時）に再生エラー状態を安全にリセット
  useEffect(() => {
    setPlaybackError(false);
  }, [videoId]);

  if (displayMode === 'none' || !videoId) {
    return null;
  }

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  // 手動 displayMode === 'link' または YouTube Player API の onError イベント検知時
  if (displayMode === 'link' || playbackError) {
    return (
      <div 
        className="youtube-link-card"
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
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.6) 50%, rgba(15, 23, 42, 0.3) 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            textAlign: 'center',
            gap: '8px'
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>
            {title}
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>
            この動画はサイト内で再生できないため、YouTubeでご覧ください。
          </div>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pop-button font-bold"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ff0000',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '9999px',
              fontSize: '12px',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(255, 0, 0, 0.4)'
            }}
          >
            YouTubeで公式動画を見る ↗
          </a>
        </div>
      </div>
    );
  }

  // react-youtube のプレイヤーオプション
  const opts: YouTubeProps['opts'] = {
    width: '100%',
    height: '100%',
    playerVars: {
      rel: 0,
      playsinline: 1,
      origin: typeof window !== 'undefined' ? window.location.origin : undefined
    }
  };

  return (
    <div className="youtube-embed-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div className="youtube-embed">
        <YouTube
          videoId={videoId}
          title={`${title} 公式動画`}
          opts={opts}
          onError={(event: { data: number }) => {
            console.warn("YouTube playback error detected via Player API onError:", {
              videoId,
              errorCode: event.data
            });
            setPlaybackError(true);
          }}

          style={{ width: '100%', height: '100%' }}
          iframeClassName="youtube-player-iframe"
        />
      </div>
      <a
        href={watchUrl}
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











