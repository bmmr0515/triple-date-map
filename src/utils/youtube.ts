import { getOfficialVideoBySpot } from '../officialVideos';

/**
 * 様々な形式のYouTube参照から純粋な11文字の動画IDを抽出・正規化する関数
 * 
 * 対応形式:
 * - 11文字の動画ID (例: "F8V34JsNV4A")
 * - https://www.youtube.com/watch?v=VIDEO_ID (クエリパラメータ付きも可: ?si=, &list=, &t=)
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube-nocookie.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - <iframe ... src="https://www.youtube.com/embed/VIDEO_ID?si=..." ...></iframe> (iframeタグ全体)
 */
export function extractYouTubeVideoId(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') return null;

  let trimmed = input.trim();
  if (!trimmed) return null;

  // 1. iframe タグからの src 属性抽出
  if (trimmed.includes('<iframe')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      trimmed = srcMatch[1];
    }
  }

  // 2. HTMLエスケープ解除
  trimmed = trimmed.replace(/&amp;/g, '&');

  // 3. 各種URLパターンのマッチング（クエリパラメータは自動で除去され11文字IDのみ捕捉）
  const urlPatterns = [
    // embed, v, shorts, live
    /(?:youtube\.com|youtube-nocookie\.com)\/(?:embed\/|v\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/i,
    // watch?v= または watch?...&v=
    /(?:youtube\.com|youtube-nocookie\.com)\/watch\?(?:[^&]*&)*v=([a-zA-Z0-9_-]{11})/i,
    // youtu.be/
    /youtu\.be\/([a-zA-Z0-9_-]{11})/i
  ];

  for (const pattern of urlPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 4. 純粋な11文字の動画ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 5. フォールバック: パラメータ中の v=11文字
  const fallbackMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (fallbackMatch && fallbackMatch[1]) {
    return fallbackMatch[1];
  }

  return null;
}

// 互換性用エイリアス
export const extractYouTubeId = extractYouTubeVideoId;

/**
 * 説明文等のテキストから iframe タグを完全除去し、文字としても残さない
 */
export function stripIframeTags(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<iframe[^>]*\/?>/gi, '')
    .trim();
}

export interface SpotVideoResolution {
  /** 埋め込み表示する代表動画ID（1件のみ、原則1聖地1動画） */
  primaryVideoId: string | null;
  /** 他に登録されている関連動画ID（外部リンク用） */
  otherVideoIds: string[];
  /** 重複排除後の全動画ID一覧 */
  allUniqueVideoIds: string[];
}

/**
 * 聖地スポット情報および作品マスターから動画IDを収集・正規化し、重複を完全排除して解決する
 */
export function resolveSpotVideos(
  spot: {
    youtubeId?: string;
    youtube_url?: string;
    workKey?: string;
  },
  additionalSources?: (string | null | undefined)[]
): SpotVideoResolution {
  // 1. 作品マスターからの公式動画情報を取得
  const officialVideo = getOfficialVideoBySpot(spot);
  const officialVideoId = officialVideo?.youtubeId;

  // 2. 優先順位に従って候補を収集:
  //    ① スポット自身の youtubeId (明示指定)
  //    ② 作品マスターの公式 youtubeId
  //    ③ スポットの youtube_url
  //    ④ その他追加ソース
  const candidates: (string | null | undefined)[] = [
    spot.youtubeId,
    officialVideoId,
    spot.youtube_url,
    ...(additionalSources || [])
  ];

  // 3. 全候補を11桁IDへ正規化
  const normalizedIds = candidates
    .map(extractYouTubeVideoId)
    .filter((id): id is string => Boolean(id));

  // 4. 重複を完全除外（最初の登録順を維持）
  const allUniqueVideoIds = Array.from(new Set(normalizedIds));

  return {
    primaryVideoId: allUniqueVideoIds[0] ?? null,
    otherVideoIds: allUniqueVideoIds.slice(1),
    allUniqueVideoIds
  };
}
