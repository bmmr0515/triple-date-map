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
  const extractedVideoId = extractYouTubeVideoId(originalYoutubeValue);
  const generatedEmbedUrl = extractedVideoId ? `https://www.youtube.com/embed/${extractedVideoId}` : null;

  if (!generatedEmbedUrl) return null;

  return (
    <div className="video-wrapper">
      <iframe
        width="100%"
        height="100%"
        src={generatedEmbedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
};


export default YouTubeEmbed;





