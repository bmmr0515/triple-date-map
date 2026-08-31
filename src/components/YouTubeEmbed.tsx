import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

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

// oEmbed API 機械検証で特定された「非公開・削除」動画IDリスト
const DELETED_VIDEO_IDS = new Set([
  'wJ5Qe8g_P30', 'pZ03uFm0sSc', 'F4Sg8Lshmks', 'p-jc9qMpMp4', 'xJ87q08cZ_w',
  '41j_7c96Tsk', '2_X0m3ZvhW8', '7V8eS16Y-zY', 'zR7-eBv28_w', 'BkyRth1s_lM',
  'p1022tthj7s', 't08XqB-E43k', '3e2s5Z_W0_8', '20QxaOu6B4g', 'Y0rQz2K51sA',
  'g2f0W7s3Ves', 'V6dnp58i_Q8', '5F_3l4n2k8Y', '6iW_iO7W7pA', '4yW4m_S_7wY',
  'g2qM40T0F2Y', 'G6jWn6_n4jU', 'R28z0qBqO_k'
]);

interface YouTubeEmbedProps {
  youtubeIdOrUrl?: string;
  youtubeId?: string;
  title?: string;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ youtubeIdOrUrl, youtubeId, title = "公式動画" }) => {
  const [hasError, setHasError] = useState(false);
  const originalYoutubeValue = youtubeIdOrUrl || youtubeId;
  const videoId = extractYouTubeVideoId(originalYoutubeValue);

  if (!videoId) return null;

  const isDeleted = DELETED_VIDEO_IDS.has(videoId) || hasError;

  if (isDeleted) {
    return (
      <div 
        className="youtube-deleted-notice-card"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: '16px',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
          gap: '8px'
        }}
      >
        <AlertCircle className="w-8 h-8 text-slate-400" />
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#cbd5e1' }}>
          現在、この動画は公開されていません
        </div>
        <div style={{ fontSize: '11px', color: '#64748b' }}>
          (YouTube上で非公開または削除された動画のため、聖地記録のみ保持しています)
        </div>
      </div>
    );
  }

  const generatedEmbedUrl = `https://www.youtube.com/embed/${videoId}`;

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
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default YouTubeEmbed;






