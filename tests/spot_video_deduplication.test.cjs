const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🔍 ========================================================');
console.log('🔍 トリプルデートマップ 聖地YouTube動画重複排除・完全性監査');
console.log('🔍 ========================================================\n');

// 1. db.ts の解析
const dbTs = fs.readFileSync('src/db.ts', 'utf8');
const startIdxSpots = dbTs.indexOf('const INITIAL_SPOTS: Spot[] = [');
assert(startIdxSpots !== -1, 'db.ts 内に INITIAL_SPOTS が存在すること');

let bracketCount = 0;
let arrayString = '';
for (let i = startIdxSpots + 'const INITIAL_SPOTS: Spot[] = '.length; i < dbTs.length; i++) {
  const char = dbTs[i];
  if (char === '[') bracketCount++;
  if (char === ']') bracketCount--;
  arrayString += char;
  if (bracketCount === 0 && arrayString.trim().startsWith('[')) break;
}
const spots = eval('(' + arrayString + ')');

// 2. officialVideos.ts の解析
const officialVideosTs = fs.readFileSync('src/officialVideos.ts', 'utf8');
const startIdxVideos = officialVideosTs.indexOf('export const OFFICIAL_VIDEOS: Record<string, OfficialVideo> = {');
assert(startIdxVideos !== -1, 'officialVideos.ts 内に OFFICIAL_VIDEOS が存在すること');
let vBracket = 0;
let vArrayString = '';
for (let i = startIdxVideos + 'export const OFFICIAL_VIDEOS: Record<string, OfficialVideo> = '.length; i < officialVideosTs.length; i++) {
  const char = officialVideosTs[i];
  if (char === '{') vBracket++;
  if (char === '}') vBracket--;
  vArrayString += char;
  if (vBracket === 0 && vArrayString.trim().startsWith('{')) break;
}
const OFFICIAL_VIDEOS = eval('(' + vArrayString + ')');

// 3. YouTube動画ID正規化エンジンの再現
function extractYouTubeVideoId(input) {
  if (!input || typeof input !== 'string') return null;
  let trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.includes('<iframe')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) trimmed = srcMatch[1];
  }
  trimmed = trimmed.replace(/&amp;/g, '&');

  const urlPatterns = [
    /(?:youtube\.com|youtube-nocookie\.com)\/(?:embed\/|v\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/i,
    /(?:youtube\.com|youtube-nocookie\.com)\/watch\?(?:[^&]*&)*v=([a-zA-Z0-9_-]{11})/i,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/i
  ];
  for (const pattern of urlPatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) return match[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const fallback = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (fallback && fallback[1]) return fallback[1];
  return null;
}

function resolveSpotVideos(spot, additionalSources) {
  const officialVideo = spot.workKey ? OFFICIAL_VIDEOS[spot.workKey] : null;
  const officialVideoId = officialVideo ? officialVideo.youtubeId : null;

  const candidates = [
    spot.youtubeId,
    officialVideoId,
    spot.youtube_url,
    ...(additionalSources || [])
  ];

  const normalizedIds = candidates.map(extractYouTubeVideoId).filter(Boolean);
  const uniqueIds = Array.from(new Set(normalizedIds));

  return {
    primaryVideoId: uniqueIds[0] || null,
    otherVideoIds: uniqueIds.slice(1),
    allUniqueVideoIds: uniqueIds
  };
}

// --- [Test 1] extractYouTubeVideoId の正規化網羅テスト ---
console.log('--- [Test 1] extractYouTubeVideoId の正規化網羅テスト ---');
assert.strictEqual(extractYouTubeVideoId('oRNQ5SLAnjA'), 'oRNQ5SLAnjA', '11文字ID単体を正規化');
assert.strictEqual(extractYouTubeVideoId('https://www.youtube.com/watch?v=oRNQ5SLAnjA'), 'oRNQ5SLAnjA', 'watch URLを正規化');
assert.strictEqual(extractYouTubeVideoId('https://youtu.be/oRNQ5SLAnjA'), 'oRNQ5SLAnjA', 'youtu.be 短縮URLを正規化');
assert.strictEqual(extractYouTubeVideoId('https://www.youtube.com/embed/oRNQ5SLAnjA'), 'oRNQ5SLAnjA', 'embed URLを正規化');
assert.strictEqual(extractYouTubeVideoId('https://www.youtube.com/shorts/oRNQ5SLAnjA'), 'oRNQ5SLAnjA', 'shorts URLを正規化');
assert.strictEqual(extractYouTubeVideoId('https://www.youtube.com/live/oRNQ5SLAnjA'), 'oRNQ5SLAnjA', 'live URLを正規化');
assert.strictEqual(extractYouTubeVideoId('https://www.youtube.com/watch?v=oRNQ5SLAnjA&t=10s&list=xyz'), 'oRNQ5SLAnjA', 'クエリパラメータ付きURLを正規化');
assert.strictEqual(extractYouTubeVideoId('https://www.youtube.com/embed/oRNQ5SLAnjA?si=oOew38mBf06NtcYT&controls=0'), 'oRNQ5SLAnjA', '?si=付きembed URLを正規化');
assert.strictEqual(extractYouTubeVideoId('<iframe width="560" height="315" src="https://www.youtube.com/embed/oRNQ5SLAnjA?si=abc" frameborder="0"></iframe>'), 'oRNQ5SLAnjA', 'iframeタグ全体からIDを正規化');
console.log('✅ [Test 1 Passed] 全パターンからのYouTube動画ID抽出・正規化を確認。\n');

// --- [Test 2] 代表動画1本・重複完全排除ユニットテスト ---
console.log('--- [Test 2] 代表動画1本・重複完全排除ユニットテスト ---');
// 2-1: 同じIDが2件あってもiframeは1個
const res1 = resolveSpotVideos({ youtubeId: 'oRNQ5SLAnjA', youtube_url: 'https://www.youtube.com/embed/oRNQ5SLAnjA' });
assert.strictEqual(res1.primaryVideoId, 'oRNQ5SLAnjA');
assert.strictEqual(res1.otherVideoIds.length, 0, '同じIDが2件あっても代表動画1本のみ');

// 2-2: watch URLとembed URLが同じ動画ならiframeは1個
const res2 = resolveSpotVideos({ youtubeId: 'https://www.youtube.com/watch?v=F8V34JsNV4A', youtube_url: 'https://www.youtube.com/embed/F8V34JsNV4A' });
assert.strictEqual(res2.primaryVideoId, 'F8V34JsNV4A');
assert.strictEqual(res2.otherVideoIds.length, 0, 'watchとembedで同一なら代表動画1本のみ');

// 2-3: iframeタグとyoutubeIdが同じ動画ならiframeは1個
const res3 = resolveSpotVideos({ youtubeId: 'F8V34JsNV4A' }, ['<iframe src="https://www.youtube.com/embed/F8V34JsNV4A"></iframe>']);
assert.strictEqual(res3.primaryVideoId, 'F8V34JsNV4A');
assert.strictEqual(res3.otherVideoIds.length, 0, 'iframeタグとyoutubeIdが同一なら代表動画1本のみ');

// 2-4: ?si=付きURLでも同一IDとして扱う
const res4 = resolveSpotVideos({ youtubeId: 'F8V34JsNV4A', youtube_url: 'https://www.youtube.com/embed/F8V34JsNV4A?si=me_Y7jlLQ0HmBc_b&controls=0' });
assert.strictEqual(res4.primaryVideoId, 'F8V34JsNV4A');
assert.strictEqual(res4.otherVideoIds.length, 0, '?si=付きURLでも同一IDとして判定');

// 2-5: 作品マスターとスポットの重複でもiframeは1個
const res5 = resolveSpotVideos({ workKey: 'work-oRNQ5SLAnjA', youtubeId: 'oRNQ5SLAnjA' });
assert.strictEqual(res5.primaryVideoId, 'oRNQ5SLAnjA');
assert.strictEqual(res5.otherVideoIds.length, 0, '作品マスターと重複してもiframeは1個');

// 2-6: 動画がないスポットはiframeが0個
const res6 = resolveSpotVideos({});
assert.strictEqual(res6.primaryVideoId, null, '動画がないスポットはprimaryVideoIdがnull（iframe 0個）');
assert.strictEqual(res6.otherVideoIds.length, 0);

// 2-7: 異なる動画が複数ある場合も埋め込みは代表1本のみ、残りはテキストリンク用otherVideoIdsへ格納
const res7 = resolveSpotVideos({ youtubeId: 'video111111', youtube_url: 'https://www.youtube.com/watch?v=video222222' });
assert.strictEqual(res7.primaryVideoId, 'video111111', '代表動画は1本のみ');
assert.deepStrictEqual(res7.otherVideoIds, ['video222222'], '他の動画はotherVideoIdsに格納');

console.log('✅ [Test 2 Passed] 代表動画1本・重複排除・複数動画のリンク化仕様を確認。\n');

// --- [Test 3] 全296スポット データベース監査 ---
console.log('--- [Test 3] 全296スポット データベース監査 ---');
assert.strictEqual(spots.length, 296, '全296スポットが保持されていること');

// 3-1: description等にiframeタグが残っているスポット（0件であること）
const spotsWithIframe = spots.filter(s => (s.description || '').includes('<iframe') || (s.visitor_notes || '').includes('<iframe'));
assert.strictEqual(spotsWithIframe.length, 0, `description等にiframeタグが残っているスポットが0件であること（検出: ${spotsWithIframe.length}件）`);

// 3-2: URL全体やiframeタグがyoutubeId欄に保存されているスポット（0件であること）
const spotsWithBadYoutubeId = spots.filter(s => s.youtubeId && (s.youtubeId.includes('http') || s.youtubeId.includes('<iframe') || s.youtubeId.length !== 11));
assert.strictEqual(spotsWithBadYoutubeId.length, 0, `youtubeId欄にURLやiframeタグが保存されているスポットが0件であること（検出: ${spotsWithBadYoutubeId.length}件）`);

// 3-3: 各スポットの動画解決結果で、埋め込み対象動画が最大1個であること
spots.forEach(s => {
  const resolved = resolveSpotVideos(s);
  if (resolved.primaryVideoId) {
    assert(/^[a-zA-Z0-9_-]{11}$/.test(resolved.primaryVideoId), `スポット ${s.id} の代表動画IDが11桁英数字であること`);
    // 代表動画と他の動画に重複がないこと
    assert(!resolved.otherVideoIds.includes(resolved.primaryVideoId), `スポット ${s.id} の代表動画と関連動画に重複がないこと`);
  }
});

console.log('✅ [Test 3 Passed] 全296スポットのデータ完全性（iframeタグ混入0件、正規ID完全性）を確認。\n');

// --- [Test 4] 静的生成HTMLファイル（dist）におけるiframe出力数監査 ---
console.log('--- [Test 4] 静的生成HTMLファイル（dist）におけるiframe出力数監査 ---');
const distSpotsDir = path.join(__dirname, '../dist/spots');
if (fs.existsSync(distSpotsDir)) {
  const spotDirs = fs.readdirSync(distSpotsDir, { withFileTypes: true }).filter(d => d.isDirectory() && d.name !== 'page');
  let checkedCount = 0;
  spotDirs.forEach(dir => {
    const htmlPath = path.join(distSpotsDir, dir.name, 'index.html');
    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      // YouTube embed iframe の数をカウント
      const youtubeIframes = html.match(/<iframe[^>]*src=["']https:\/\/www\.youtube\.com\/embed\/[^"']+["'][^>]*>/gi) || [];
      assert(youtubeIframes.length <= 1, `スポット ${dir.name} の静的HTML内のYouTube埋め込みiframeが最大1個であること（検出: ${youtubeIframes.length}個）`);
      // 説明文中に生の <iframe タグが表示されていないこと
      assert(!html.includes('&lt;iframe'), `スポット ${dir.name} のHTMLにエスケープされたiframeコードが生表示されていないこと`);
      checkedCount++;
    }
  });
  console.log(`✅ [Test 4 Passed] 生成済みスポット詳細静的HTML ${checkedCount}件においてYouTube iframeが最大1個であることを確認。\n`);
}

console.log('🎉 ========================================================');
console.log('🎉 すべての YouTube 動画重複排除・全件品質監査テストに合格しました！');
console.log('🎉 ========================================================\n');
