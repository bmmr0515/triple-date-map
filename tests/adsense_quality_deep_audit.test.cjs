const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🔍 ========================================================');
console.log('🔍 トリプルデートマップ AdSense再審査対策 徹底品質・SEO監査');
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

// 2. courses.ts の解析
const coursesTs = fs.readFileSync('src/courses.ts', 'utf8');
const startIdxCourses = coursesTs.indexOf('export const INITIAL_COURSES: Course[] = [');
assert(startIdxCourses !== -1, 'courses.ts 内に INITIAL_COURSES が存在すること');
let coursesBracket = 0;
let coursesArrayString = '';
for (let i = startIdxCourses + 'export const INITIAL_COURSES: Course[] = '.length; i < coursesTs.length; i++) {
  const char = coursesTs[i];
  if (char === '[') coursesBracket++;
  if (char === ']') coursesBracket--;
  coursesArrayString += char;
  if (coursesBracket === 0 && coursesArrayString.trim().startsWith('[')) break;
}
const courses = eval('(' + coursesArrayString + ')');

// 3. articles.ts の解析
const articlesTs = fs.readFileSync('src/articles.ts', 'utf8');
assert(articlesTs.includes('INITIAL_ARTICLES'), 'articles.ts 内に INITIAL_ARTICLES が存在すること');

// --- [Test 1] 聖地スポット293件 & モデルコース10件の完全保持 ---
console.log('--- [Test 1] 聖地スポット293件 & モデルコース10件の完全保持 ---');
assert.strictEqual(spots.length, 293, '全293件の聖地スポットが1件も欠損せず維持されていること');
assert.strictEqual(courses.length, 10, '全10件のモデルコースが維持されていること');
console.log('✅ [Test 1 Passed] 293スポット & 10モデルコースのデータ完全性を確認。\n');

// --- [Test 2] 住所完全性監査（都道府県のみの住所 0 件 & 撮影地点整合性） ---
console.log('--- [Test 2] 住所完全性監査（都道府県のみの住所 0 件 & 撮影地点整合性） ---');
const prefRegex = /^(東京都|神奈川県|千葉県|埼玉県|茨城県|栃木県|群馬県|静岡県|高知県|福島県|京都府|大阪府|沖縄県|長野県|山口県|愛知県|北海道|兵庫県|山梨県|鹿児島県)$/;
const incompleteAddresses = spots.filter(s => {
  const addr = (s.address || '').trim();
  return addr.length <= 4 || prefRegex.test(addr);
});
assert.strictEqual(incompleteAddresses.length, 0, `都道府県名のみの不完全な住所が0件であること（検出: ${incompleteAddresses.length}件）`);

const emptyAddresses = spots.filter(s => !s.address || s.address.trim() === '');
assert.strictEqual(emptyAddresses.length, 0, '住所が空欄のスポットが0件であること');

// 具体的スポットの撮影地点・住所の整合性検証
const yoyogi = spots.find(s => s.id === 'spot-real-yoyogi-ani');
assert(yoyogi.address.includes('千代田区神田三崎町'), '代々木アニメーション学院東京校はオーディション当時の水道橋校舎（千代田区神田三崎町）が設定されていること');

const akaiyane = spots.find(s => s.id === 'spot-real-sakurasaku-akaiyane');
assert(akaiyane.address.includes('伊東市川奈'), '赤いやねは川奈（伊東市川奈1327-11）が設定されていること');

const avaco = spots.find(s => s.id === 'spot-real-zettaiidol-avacosaginuma');
assert(avaco.address.includes('宮前区犬蔵'), 'アバコさぎ沼スタジオは宮前区犬蔵が設定されていること');

const lutheran = spots.find(s => s.id === 'spot-real-todoitelove-urawalutheran');
assert(lutheran.address.includes('緑区大字大崎3642'), '浦和ルーテル学院は緑区大字大崎3642が設定されていること');

console.log('✅ [Test 2 Passed] 全293件の住所完全性が100%（都道府県のみ0件）かつ撮影地点の整合性を確認。\n');

// --- [Test 3] 定型文・ダミープレースホルダーの完全根絶 ---
console.log('--- [Test 3] 定型文・ダミープレースホルダーの完全根絶 ---');
const distDir = path.join(__dirname, '../dist');
assert(fs.existsSync(distDir), 'dist ディレクトリが存在すること（ビルド済みであること）');

const checkHtmlForPhrase = (dir, phrase) => {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const fullPath = path.join(dir, f.name);
    if (f.isDirectory()) {
      checkHtmlForPhrase(fullPath, phrase);
    } else if (f.name.endsWith('.html')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      assert(!content.includes(phrase), `ファイル ${fullPath} に禁止定型文 "${phrase}" が含まれています`);
    }
  }
};

checkHtmlForPhrase(distDir, 'MVに登場した名場面シーン');
console.log('✅ [Test 3 Passed] 全静的HTMLファイルにおいてダミー定型文「MVに登場した名場面シーン」が0件であることを確認。\n');

// --- [Test 4] 多面的品質判定・段階的インデックス（noindex, follow）と sitemap.xml の整合性監査 ---
console.log('--- [Test 4] 多面的品質判定・段階的インデックス（noindex, follow）と sitemap.xml の整合性監査 ---');
const sitemapPath = path.join(distDir, 'sitemap.xml');
assert(fs.existsSync(sitemapPath), 'dist/sitemap.xml が生成されていること');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

// 多面的評価関数の再現
const evaluateSpotQuality = (spot) => {
  const cleanDesc = (spot.description || '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/⚠️\s*聖地巡礼に関する重要なお願い[\s\S]*$/, '')
    .replace(/【[^】]*】/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const hasNotes = !!(spot.visitor_notes && spot.visitor_notes.trim().length > 0);
  const hasScene = !!(spot.scene && spot.scene.trim().length > 0 && !spot.scene.includes('MVに登場した名場面シーン'));
  const hasHolyPoint = !!(spot.holy_point && spot.holy_point.trim().length > 0);
  const hasCheckPoints = !!(spot.check_points && spot.check_points.length > 0);
  const isOneLiner = /^(MV『[^』]+』のロケ地。?[^。]*。?|『[^』]+』MVロケ地です。?|『[^』]+』巡礼スポット[①-⑤]。?)$/.test(cleanDesc);

  return isOneLiner || cleanDesc.length < 30 || (cleanDesc.length < 50 && !hasNotes && !hasScene && !hasHolyPoint && !hasCheckPoints);
};

const noindexSpots = spots.filter(evaluateSpotQuality);
console.log(`多面的評価による情報調査中（noindex対象）スポット数: ${noindexSpots.length}件`);
assert(noindexSpots.length > 0, '調査中スポットが適切に検出されていること');

noindexSpots.forEach(s => {
  const slug = s.slug || s.id;
  assert(!sitemapContent.includes(`/spots/${slug}<`), `noindex対象スポット /spots/${slug} が sitemap.xml に含まれてはなりません`);
  
  // 生成されたHTMLファイルのrobotsタグ検証: noindex, follow であること（404以外）
  const htmlPath = path.join(distDir, 'spots', slug, 'index.html');
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    assert(html.includes('<meta name="robots" content="noindex, follow" />'), `調査中スポット ${slug} に noindex, follow タグが設定されていること`);
  }
});

// 充実スポット（代々木アニメーション学院、日本武道館等）が sitemap.xml に掲載され index, follow であること
const richSpotSlugs = ['yoyogi-ani', 'budokan'];
richSpotSlugs.forEach(slug => {
  assert(sitemapContent.includes(`/spots/${slug}<`), `充実スポット /spots/${slug} は sitemap.xml に掲載されていること`);
  const htmlPath = path.join(distDir, 'spots', slug, 'index.html');
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    assert(html.includes('<meta name="robots" content="index, follow" />'), `充実スポット ${slug} は index, follow であること`);
  }
});

// 404ページが noindex, nofollow であること
const fourOhFourHtml = fs.readFileSync(path.join(distDir, '404.html'), 'utf8');
assert(fourOhFourHtml.includes('<meta name="robots" content="noindex, nofollow" />'), '404.html は noindex, nofollow であること');

// モデルコース全10本が sitemap.xml に掲載されていること
courses.forEach(c => {
  assert(sitemapContent.includes(`/courses/${c.slug}<`), `モデルコース ${c.slug} が sitemap.xml に掲載されていること`);
});

// 固定重要ページが sitemap.xml に掲載されていること
['/about', '/courses', '/spots', '/editorial-policy', '/privacy', '/terms', '/contact'].forEach(p => {
  assert(sitemapContent.includes(`https://tripledatemap.com${p}<`), `重要固定ページ ${p} が sitemap.xml に掲載されていること`);
});

console.log('✅ [Test 4 Passed] 多面的品質判定・段階的インデックス制御（noindex, follow）と sitemap.xml の整合性を確認。\n');

// --- [Test 5] 構造化データ（JSON-LD）のジオ座標・アドレス検証 ---
console.log('--- [Test 5] 構造化データ（JSON-LD）のジオ座標・アドレス検証 ---');
const yoyogiHtml = fs.readFileSync(path.join(distDir, 'spots/yoyogi-ani/index.html'), 'utf8');
assert(yoyogiHtml.includes('"@type":"TouristAttraction"'), 'JSON-LD に TouristAttraction が含まれること');
assert(yoyogiHtml.includes('"geo":{"@type":"GeoCoordinates"'), 'JSON-LD に geo 座標が含まれること');
assert(yoyogiHtml.includes('"streetAddress"'), 'JSON-LD に streetAddress が含まれること');
console.log('✅ [Test 5 Passed] 構造化データのジオ座標・所在地プロパティを確認。\n');

// --- [Test 6] ads.txt & Google AdSense 設定監査 ---
console.log('--- [Test 6] ads.txt & Google AdSense 設定監査 ---');
const adsTxtPath = path.join(__dirname, '../public/ads.txt');
assert(fs.existsSync(adsTxtPath), 'public/ads.txt が存在すること');
const adsTxtContent = fs.readFileSync(adsTxtPath, 'utf8');
assert(adsTxtContent.includes('pub-4748794057004872'), 'ads.txt に正規のサイト運営者IDが含まれていること');

const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
assert(indexHtml.includes('ca-pub-4748794057004872'), 'index.html に正規の AdSense コードが含まれていること');
console.log('✅ [Test 6 Passed] ads.txt および AdSense 審査タグが正常に設定されていることを確認。\n');

console.log('🎉 ========================================================');
console.log('🎉 すべての AdSense 再審査品質・SEO 監査テストに完全合格しました！');
console.log('🎉 ========================================================\n');
