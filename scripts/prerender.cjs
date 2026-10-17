const fs = require('fs');
const path = require('path');

// ⚙️ ユーティリティ関数
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

// スラッグ自動生成
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

console.log('🚀 静的プリレンダリングエンジンの起動...');

const DIST_DIR = path.join(__dirname, '../dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('❌ エラー: dist/index.html が見つかりません。まず vite build を実行してください。');
  process.exit(1);
}

const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// 1. 聖地データの抽出と補正
console.log('📦 聖地データを解析中...');
const dbTsPath = path.join(__dirname, '../src/db.ts');
const dbTsContent = fs.readFileSync(dbTsPath, 'utf8');
const startIdxSpots = dbTsContent.indexOf('const INITIAL_SPOTS: Spot[] = [');

if (startIdxSpots === -1) {
  console.error('❌ エラー: db.ts 内の INITIAL_SPOTS の検出に失敗しました。');
  process.exit(1);
}

let bracketCount = 0;
let arrayString = '';
for (let i = startIdxSpots + 'const INITIAL_SPOTS: Spot[] = '.length; i < dbTsContent.length; i++) {
  const char = dbTsContent[i];
  if (char === '[') bracketCount++;
  if (char === ']') bracketCount--;
  arrayString += char;
  if (bracketCount === 0 && arrayString.trim().startsWith('[')) {
    break;
  }
}

let rawSpots = [];
try {
  rawSpots = eval('(' + arrayString + ')');
} catch (e) {
  console.error('❌ エラー: INITIAL_SPOTS の eval パースに失敗しました。', e);
  process.exit(1);
}

const spots = rawSpots.map(spot => {
  let slug = spot.slug || spot.id.replace(/^(spot-real-|spot-special-)/, '');
  if (!slug || slug.trim() === '') {
    slug = spot.id;
  }
  const status = spot.status || 'published';
  const address = spot.address || '';
  const nearest_station = spot.nearest_station || '';
  const walk_time = spot.walk_time || '';
  const scene = (spot.scene && !spot.scene.includes('MVに登場した名場面シーン')) ? spot.scene.trim() : '';
  const visitor_notes = spot.visitor_notes || '';
  const check_points = (spot.check_points && spot.check_points.length > 0 && !(spot.check_points.length === 2 && spot.check_points[0] === '現地での記念撮影' && spot.check_points[1] === '周辺の散策')) ? spot.check_points : [];
  const last_confirmed_date = spot.last_confirmed_date || '2026-10-12';
  
  return {
    ...spot,
    slug,
    status,
    address,
    nearest_station,
    walk_time,
    scene,
    visitor_notes,
    check_points,
    last_confirmed_date
  };
});

console.log(`✅ 有効な聖地スポット数: ${spots.length}件`);

// 2. コースデータの抽出
console.log('📦 モデルコースデータを解析中...');
const coursesTsPath = path.join(__dirname, '../src/courses.ts');
const coursesTsContent = fs.readFileSync(coursesTsPath, 'utf8');
const startIdxCourses = coursesTsContent.indexOf('export const INITIAL_COURSES: Course[] = [');

if (startIdxCourses === -1) {
  console.error('❌ エラー: courses.ts 内の INITIAL_COURSES の検出に失敗しました。');
  process.exit(1);
}

bracketCount = 0;
let coursesArrayString = '';
for (let i = startIdxCourses + 'export const INITIAL_COURSES: Course[] = '.length; i < coursesTsContent.length; i++) {
  const char = coursesTsContent[i];
  if (char === '[') bracketCount++;
  if (char === ']') bracketCount--;
  coursesArrayString += char;
  if (bracketCount === 0 && coursesArrayString.trim().startsWith('[')) {
    break;
  }
}

let courses = [];
try {
  courses = eval('(' + coursesArrayString + ')');
} catch (e) {
  console.error('❌ エラー: INITIAL_COURSES の eval パースに失敗しました。', e);
  process.exit(1);
}
console.log(`✅ 有効なモデルコース数: ${courses.length}件`);

// 3. 記事データの抽出
console.log('📦 記事データを解析中...');
const articlesTsPath = path.join(__dirname, '../src/articles.ts');
const articlesTsContent = fs.readFileSync(articlesTsPath, 'utf8');
const startIdxArticles = articlesTsContent.indexOf('export const INITIAL_ARTICLES: Article[] = [');

let articles = [];
if (startIdxArticles !== -1) {
  bracketCount = 0;
  let articlesArrayString = '';
  for (let i = startIdxArticles + 'export const INITIAL_ARTICLES: Article[] = '.length; i < articlesTsContent.length; i++) {
    const char = articlesTsContent[i];
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
    articlesArrayString += char;
    if (bracketCount === 0 && articlesArrayString.trim().startsWith('[')) {
      break;
    }
  }
  try {
    articles = eval('(' + articlesArrayString + ')');
  } catch (e) {
    console.error('❌ エラー: INITIAL_ARTICLES の eval パースに失敗しました。', e);
  }
}
console.log(`✅ 有効な記事数: ${articles.length}件`);

// ヘルパー: spotId からスポット情報を取得
const spotMap = new Map();
spots.forEach(s => {
  spotMap.set(s.id, s);
  spotMap.set(s.slug, s);
});

// 共通ヘッダー・ナビゲーションHTML
const renderGlobalNav = () => `
  <header style="background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 14px 20px; position: sticky; top: 0; z-index: 100;">
    <div style="max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
      <a href="/" style="text-decoration: none; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 22px;">🗺️</span>
        <strong style="font-size: 18px; color: #0f172a; font-weight: 900;">トリプルデートマップ</strong>
        <span style="font-size: 11px; color: #ff6897; background: #ffe4e6; padding: 2px 8px; borderRadius: 12px; font-weight: bold;">非公式</span>
      </a>
      <nav style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; font-weight: bold;">
        <a href="/spots" style="color: #334155; text-decoration: none;">聖地スポット</a>
        <a href="/courses" style="color: #334155; text-decoration: none;">モデルコース</a>
        <a href="/areas" style="color: #334155; text-decoration: none;">地域別</a>
        <a href="/groups" style="color: #334155; text-decoration: none;">グループ別</a>
        <a href="/guide" style="color: #334155; text-decoration: none;">巡礼ガイド</a>
        <a href="/about" style="color: #334155; text-decoration: none;">このサイトについて</a>
      </nav>
    </div>
  </header>
`;

// 共通フッターHTML
const renderGlobalFooter = () => `
  <footer style="background: #0f172a; color: #94a3b8; padding: 48px 20px; font-size: 12px; margin-top: 60px;">
    <div style="max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; text-align: center;">
      <div style="display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; font-weight: bold;">
        <a href="/" style="color: #cbd5e1; text-decoration: none;">トップページ</a>
        <span style="color: #334155;">|</span>
        <a href="/spots" style="color: #cbd5e1; text-decoration: none;">聖地スポット一覧</a>
        <span style="color: #334155;">|</span>
        <a href="/courses" style="color: #cbd5e1; text-decoration: none;">巡礼モデルコース</a>
        <span style="color: #334155;">|</span>
        <a href="/articles" style="color: #cbd5e1; text-decoration: none;">巡礼コラム・レポート</a>
        <span style="color: #334155;">|</span>
        <a href="/guide" style="color: #cbd5e1; text-decoration: none;">初めての方向けガイド</a>
        <span style="color: #334155;">|</span>
        <a href="/about" style="color: #cbd5e1; text-decoration: none;">このサイトについて</a>
        <span style="color: #334155;">|</span>
        <a href="/editorial-policy" style="color: #cbd5e1; text-decoration: none;">編集方針</a>
        <span style="color: #334155;">|</span>
        <a href="/profile" style="color: #cbd5e1; text-decoration: none;">運営者情報</a>
        <span style="color: #334155;">|</span>
        <a href="/contact" style="color: #cbd5e1; text-decoration: none;">お問い合わせ</a>
        <span style="color: #334155;">|</span>
        <a href="/privacy" style="color: #cbd5e1; text-decoration: none;">プライバシーポリシー</a>
        <span style="color: #334155;">|</span>
        <a href="/terms" style="color: #cbd5e1; text-decoration: none;">利用規約</a>
        <span style="color: #334155;">|</span>
        <a href="/disclaimer" style="color: #cbd5e1; text-decoration: none;">免責事項</a>
        <span style="color: #334155;">|</span>
        <a href="/copyright" style="color: #cbd5e1; text-decoration: none;">著作権・権利者への配慮</a>
      </div>
      <div style="line-height: 1.8; color: #64748b; font-size: 11px;">
        当サイトは個人（運営者：れつぴ）が運営する非公式ファンサイトです。<br/>
        ＝LOVE、≠ME、≒JOYの関係者、所属事務所（株式会社代々木アニメーション学院等）、レコード会社とは一切関係ありません。<br/>
        © ${new Date().getFullYear()} トリプルデートマップ (非公式) All Rights Reserved.
      </div>
    </div>
  </footer>
`;

// 🌐 プリレンダリング対象ルート
const routes = [];

// 1. トップページ
routes.push({
  path: '/',
  title: 'トリプルデートマップ - イコノイジョイ聖地巡礼ファンマップ',
  desc: '＝LOVE・≠ME・≒JOY（イコノイジョイ）のMVロケ地、ライブ会場、番組ロケ地を網羅した非公式聖地巡礼メディア。全293件の聖地詳細解説と10本のモデルコースを掲載中！',
  type: 'home'
});

// 2. 固定静的ページ
routes.push({
  path: '/about',
  title: 'このサイトについて - トリプルデートマップ',
  desc: 'トリプルデートマップの目的、運営者「れつぴ」の情報、非公式ファンサイトとしての位置付け、公式情報と独自調査の検証方針を掲載しています。',
  type: 'about'
});

routes.push({
  path: '/editorial-policy',
  title: '編集方針・ファクトチェック指針 - トリプルデートマップ',
  desc: 'トリプルデートマップにおける情報収集、公式資料の優先、照合基準、修正方針、著作権への配慮など6箇条の編集指針を定めています。',
  type: 'editorial-policy'
});

routes.push({
  path: '/profile',
  title: '運営者情報 - トリプルデートマップ',
  desc: 'トリプルデートマップの企画・開発・運営者「れつぴ」のプロフィール、連絡先SNS（@ikonoijoy_tools）、運営目的を掲載しています。',
  type: 'profile'
});

routes.push({
  path: '/contact',
  title: 'お問い合わせ - トリプルデートマップ',
  desc: 'トリプルデートマップへのご連絡、ロケ地情報の修正依頼、新規聖地のご提供窓口です。',
  type: 'contact'
});

routes.push({
  path: '/privacy',
  title: 'プライバシーポリシー - トリプルデートマップ',
  desc: 'トリプルデートマップにおける個人情報の取り扱い、Cookie利用、Google AdSense、アクセス解析、Supabase認証に関する方針です。',
  type: 'privacy'
});

routes.push({
  path: '/terms',
  title: '利用規約 - トリプルデートマップ',
  desc: 'トリプルデートマップをご利用いただく際の規約、GPSチェックイン機能の利用条件、免責事項を定めています。',
  type: 'terms'
});

routes.push({
  path: '/disclaimer',
  title: '免責事項 - トリプルデートマップ',
  desc: '掲載情報の正確性、店舗営業状況の変更、聖地巡礼に伴う自己責任原則および免責事項を明記しています。',
  type: 'disclaimer'
});

routes.push({
  path: '/copyright',
  title: '著作権・権利者への配慮 - トリプルデートマップ',
  desc: '知的財産権の尊重、公式YouTube動画埋め込み仕様、権利者様からの修正・削除要請への対応窓口についてご説明します。',
  type: 'copyright'
});

routes.push({
  path: '/guide',
  title: '初めての方向けガイド＆巡礼マナー - トリプルデートマップ',
  desc: 'トリプルデートマップの使い方、マップや検索の活用法、そして聖地巡礼時に必ず守るべきルールとマナーをまとめています。',
  type: 'guide'
});

routes.push({
  path: '/courses',
  title: 'イコノイジョイ聖地巡礼モデルコース一覧 - トリプルデートマップ',
  desc: '渋谷・原宿、秩父、湘南・鎌倉、福島・あぶくま、京都、沖縄など、効率よくロケ地を巡れる厳選10コースを掲載中！',
  type: 'courses-list'
});

routes.push({
  path: '/spots',
  title: '聖地スポット一覧 - トリプルデートマップ',
  desc: 'イコノイジョイの全293箇所のMVロケ地・イベント会場・番組訪問スポットを一覧で探せます。',
  type: 'spots-list',
  page: 1
});

// スポット一覧のページネーション (1ページ25件)
const ITEMS_PER_PAGE = 25;
const totalSpotPages = Math.ceil(spots.length / ITEMS_PER_PAGE);
for (let p = 1; p <= totalSpotPages; p++) {
  routes.push({
    path: `/spots/page/${p}`,
    title: `聖地スポット一覧 (${p}/${totalSpotPages}ページ) - トリプルデートマップ`,
    desc: `イコノイジョイの聖地スポット一覧 第${p}ページ。全${spots.length}件中 ${(p-1)*ITEMS_PER_PAGE + 1}〜${Math.min(p*ITEMS_PER_PAGE, spots.length)}件目を表示。`,
    type: 'spots-list',
    page: p
  });
}

routes.push({
  path: '/areas',
  title: '地域別聖地一覧 - トリプルデートマップ',
  desc: '東京都、千葉県、埼玉県、神奈川県、京都府、沖縄県など、全国の都道府県・地域別に聖地スポットを一覧で探せます。',
  type: 'areas-list'
});

routes.push({
  path: '/groups',
  title: 'グループ別聖地一覧 - トリプルデートマップ',
  desc: '＝LOVE（イコラブ）、≠ME（ノイミー）、≒JOY（ニアジョイ）、合同のグループ別にロケ地・聖地を探せます。',
  type: 'groups-list'
});

routes.push({
  path: '/songs',
  title: '作品・楽曲別聖地一覧 - トリプルデートマップ',
  desc: '『この空がトリガー』『絶対アイドル辞めないで』『サマーツインテール』など、楽曲・映像作品別に聖地を探せます。',
  type: 'songs-list'
});

routes.push({
  path: '/articles',
  title: '巡礼コラム・レポート一覧 - トリプルデートマップ',
  desc: 'イコノイジョイの聖地ロケ地巡礼に関する詳細なレポートコラムや、背景解説記事の一覧です。',
  type: 'articles-list'
});

// 404ページ (noindex)
routes.push({
  path: '/404',
  title: '404 ページが見つかりません - トリプルデートマップ',
  desc: 'お探しのページは見つかりませんでした。トリプルデートマップのトップページより聖地をお探しください。',
  type: '404',
  noindex: true
});

// 個別スポット詳細ページ
spots.forEach(spot => {
  const cleanScene = (spot.scene && !spot.scene.includes('MVに登場した名場面シーン')) ? spot.scene.trim() : '';
  const cleanDesc = (spot.description || '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/⚠️\s*聖地巡礼に関する重要なお願い[\s\S]*$/, '')
    .replace(/【[^】]*】/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const summaryText = cleanScene || cleanDesc;
  const shortSummary = summaryText.length > 90 ? summaryText.slice(0, 90) + '…' : summaryText;
  const accessPart = (spot.nearest_station && !spot.nearest_station.includes('情報なし'))
    ? `最寄り駅: ${spot.nearest_station}${spot.walk_time && !spot.walk_time.includes('情報なし') ? `（徒歩${spot.walk_time}）` : ''}。`
    : '';
  const rawDesc = `${spot.name}の聖地巡礼情報・ロケ地解説。${shortSummary ? `${shortSummary}。` : ''}${spot.address ? `所在地: ${spot.address}。` : ''}${accessPart}`;
  const spotDesc = rawDesc.replace(/。+/g, '。').trim();

  routes.push({
    path: `/spots/${spot.slug}`,
    title: `${spot.name}（${spot.group}聖地） - トリプルデートマップ`,
    desc: spotDesc,
    type: 'spot-detail',
    spotData: spot
  });

  // spot.id と spot.slug が異なる場合は spot.id 側も出力（URL互換性）
  if (spot.id !== spot.slug && spot.id !== `spot-${spot.slug}`) {
    routes.push({
      path: `/spots/${spot.id}`,
      canonicalPath: `/spots/${spot.slug}`,
      title: `${spot.name}（${spot.group}聖地） - トリプルデートマップ`,
      desc: spotDesc,
      type: 'spot-detail',
      spotData: spot
    });
  }
});

// モデルコース詳細ページ
courses.forEach(course => {
  routes.push({
    path: `/courses/${course.slug}`,
    title: `${course.name}（聖地巡礼モデルコース） - トリプルデートマップ`,
    desc: `${course.name}の巡礼コース。所要時間: ${course.duration}、移動手段: ${course.transportation}、費用目安: ${course.estimated_cost}。効率的な回り方と周辺おすすめカフェ情報を掲載。`,
    type: 'course-detail',
    courseData: course
  });
});

// コラム詳細ページ
articles.forEach(article => {
  routes.push({
    path: `/articles/${article.slug}`,
    title: `${article.title} - トリプルデートマップ`,
    desc: article.excerpt,
    type: 'article-detail',
    articleData: article
  });
});

console.log(`📋 総プリレンダリング対象ページ数: ${routes.length}件`);

// 3. 各ページ固有の本文HTML生成関数群

const buildPageContent = (route) => {
  const nav = renderGlobalNav();
  const footer = renderGlobalFooter();

  let mainContent = '';

  switch (route.type) {
    case 'home': {
      // トップページ
      const recentSpots = spots.slice(0, 6);
      const popularSpots = [
        spots.find(s => s.id === 'spot-real-yoyogi-ani'),
        spots.find(s => s.id === 'spot-real-budokan'),
        spots.find(s => s.id === 'spot-real-miyashita-park'),
        spots.find(s => s.id === 'spot-real-chichibu-imamiya-shrine'),
        spots.find(s => s.id === 'spot-real-mahoroba-observatory'),
        spots.find(s => s.id === 'spot-real-zaimokuza-beach')
      ].filter(Boolean);

      mainContent = `
        <main style="max-width: 1000px; margin: 0 auto; padding: 30px 20px;">
          <!-- ヒーローセクション -->
          <section style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #fff1f2 0%, #f5f3ff 100%); border-radius: 24px; margin-bottom: 40px; border: 1px solid #ffe4e6;">
            <h1 style="font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 14px; line-height: 1.3;">
              イコノイジョイ聖地巡礼ファンメディア<br/>
              <span style="background: linear-gradient(135deg, #ff6897 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">トリプルデートマップ</span>
            </h1>
            <p style="font-size: 15px; color: #475569; max-width: 720px; margin: 0 auto 24px; line-height: 1.8;">
              指原莉乃プロデュース「＝LOVE」「≠ME」「≒JOY」のメンバーが訪れたMVロケ地、ライブ会場、番組ロケ地等の聖地を網羅！現地調査と公式映像を徹底照合した詳細な場面解説・アクセス・マナー情報を提供します。
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <a href="/spots" style="background: linear-gradient(135deg, #ff6897 0%, #a78bfa 100%); color: #fff; padding: 12px 28px; border-radius: 24px; text-decoration: none; font-weight: bold; font-size: 14px; box-shadow: 0 4px 14px rgba(255,104,151,0.3);">聖地一覧を見る（全${spots.length}件）</a>
              <a href="/courses" style="background: #ffffff; color: #0f172a; border: 1.5px solid #cbd5e1; padding: 12px 28px; border-radius: 24px; text-decoration: none; font-weight: bold; font-size: 14px;">おすすめモデルコース（全${courses.length}本）</a>
            </div>
          </section>

          <!-- 初めての方向け案内 -->
          <section style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; margin-bottom: 40px;">
            <h2 style="font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 0; display: flex; align-items: center; gap: 8px;">
              🔰 初めての方へ（安心・安全な聖地巡礼のために）
            </h2>
            <p style="font-size: 13.5px; color: #475569; line-height: 1.7; margin-bottom: 16px;">
              トリプルデートマップは、ファンが作品のロケ地を楽しく・正しく巡礼するための非公式メディアです。学校や住宅街、私有地への無断立ち入りは固くお断りしております。訪問の際は必ずマナーを守り、近隣住民や一般利用客への配慮をお願いいたします。
            </p>
            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
              <a href="/guide" style="color: #ff6897; font-weight: bold; text-decoration: underline; font-size: 13.5px;">詳しい巡礼ガイド＆マナーを見る →</a>
              <a href="/about" style="color: #64748b; font-weight: bold; text-decoration: underline; font-size: 13.5px;">サイトの運営方針・検証基準について →</a>
            </div>
          </section>

          <!-- 厳選モデルコース -->
          <section style="margin-bottom: 40px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h2 style="font-size: 20px; font-weight: bold; color: #0f172a; margin: 0;">🗺️ 編集部おすすめモデルコース</h2>
              <a href="/courses" style="font-size: 13px; color: #ff6897; font-weight: bold; text-decoration: none;">全${courses.length}コースを見る →</a>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              ${courses.slice(0, 3).map(c => `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                  <div style="font-size: 11px; color: #ff6897; font-weight: bold; margin-bottom: 6px;">⏱️ ${c.duration} | 🚶 ${c.transportation}</div>
                  <h3 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0 0 10px 0; line-height: 1.4;">
                    <a href="/courses/${c.slug}" style="color: inherit; text-decoration: none;">${c.name}</a>
                  </h3>
                  <p style="font-size: 12.5px; color: #64748b; line-height: 1.6; margin: 0 0 12px 0;">
                    出発地: ${c.start_point} → 目的地: ${c.end_point}<br/>
                    費用目安: ${c.estimated_cost}
                  </p>
                  <a href="/courses/${c.slug}" style="font-size: 12px; color: #ff6897; font-weight: bold; text-decoration: underline;">コース詳細を見る →</a>
                </div>
              `).join('')}
            </div>
          </section>

          <!-- 王道・人気聖地スポット -->
          <section style="margin-bottom: 40px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h2 style="font-size: 20px; font-weight: bold; color: #0f172a; margin: 0;">⭐ 王道・人気聖地スポット</h2>
              <a href="/spots" style="font-size: 13px; color: #ff6897; font-weight: bold; text-decoration: none;">全スポットを見る →</a>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              ${popularSpots.map(s => {
                const cleanScene = (s.scene && !s.scene.includes('MVに登場した名場面シーン')) ? s.scene.trim() : '';
                const cleanDesc = (s.description || '')
                  .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                  .replace(/⚠️\s*聖地巡礼に関する重要なお願い[\s\S]*$/, '')
                  .replace(/【[^】]*】/g, '')
                  .replace(/\s+/g, ' ')
                  .trim();
                const cardSnippet = cleanScene || cleanDesc;
                return `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                  <span style="font-size: 10px; font-weight: bold; color: #fff; background: ${s.group === '=LOVE' ? '#ff6897' : s.group === '≠ME' ? '#0ea5e9' : s.group === '≒JOY' ? '#f59e0b' : '#64748b'}; padding: 3px 8px; border-radius: 6px;">${s.group}</span>
                  <h3 style="font-size: 15px; font-weight: bold; color: #0f172a; margin: 8px 0 4px 0;">
                    <a href="/spots/${s.slug}" style="color: inherit; text-decoration: none;">${s.name}</a>
                  </h3>
                  <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0;">📍 ${s.address || '日本'}</p>
                  ${cardSnippet ? `<p style="font-size: 12.5px; color: #334155; line-height: 1.5; margin: 0;">${cardSnippet.slice(0, 70)}...</p>` : ''}
                </div>
              `;
              }).join('')}
            </div>
          </section>

          <!-- 新着スポット -->
          <section style="margin-bottom: 40px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h2 style="font-size: 20px; font-weight: bold; color: #0f172a; margin: 0;">🆕 新着・最近追加された聖地</h2>
              <a href="/spots" style="font-size: 13px; color: #ff6897; font-weight: bold; text-decoration: none;">スポット一覧 →</a>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              ${recentSpots.map(s => {
                const cleanScene = (s.scene && !s.scene.includes('MVに登場した名場面シーン')) ? s.scene.trim() : '';
                const cleanDesc = (s.description || '')
                  .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                  .replace(/⚠️\s*聖地巡礼に関する重要なお願い[\s\S]*$/, '')
                  .replace(/【[^】]*】/g, '')
                  .replace(/\s+/g, ' ')
                  .trim();
                const cardSnippet = cleanScene || cleanDesc;
                return `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                  <span style="font-size: 10px; font-weight: bold; color: #fff; background: ${s.group === '=LOVE' ? '#ff6897' : s.group === '≠ME' ? '#0ea5e9' : s.group === '≒JOY' ? '#f59e0b' : '#64748b'}; padding: 3px 8px; border-radius: 6px;">${s.group}</span>
                  <h3 style="font-size: 15px; font-weight: bold; color: #0f172a; margin: 8px 0 4px 0;">
                    <a href="/spots/${s.slug}" style="color: inherit; text-decoration: none;">${s.name}</a>
                  </h3>
                  <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0;">📍 ${s.address || '日本'}</p>
                  ${cardSnippet ? `<p style="font-size: 12.5px; color: #334155; line-height: 1.5; margin: 0;">${cardSnippet.slice(0, 70)}...</p>` : ''}
                </div>
              `;
              }).join('')}
            </div>
          </section>

          <!-- グループ別・地域別入口 -->
          <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 40px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px;">
              <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 0;">🎤 グループから探す</h2>
              <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px;">
                <a href="/groups" style="display: flex; justify-content: space-between; padding: 10px 14px; background: #fff1f2; border-radius: 10px; text-decoration: none; color: #be123c; font-weight: bold; font-size: 13.5px;">
                  <span>＝LOVE（イコラブ）</span> <span>${spots.filter(s => s.group === '=LOVE').length}件 →</span>
                </a>
                <a href="/groups" style="display: flex; justify-content: space-between; padding: 10px 14px; background: #f0f9ff; border-radius: 10px; text-decoration: none; color: #0369a1; font-weight: bold; font-size: 13.5px;">
                  <span>≠ME（ノイミー）</span> <span>${spots.filter(s => s.group === '≠ME').length}件 →</span>
                </a>
                <a href="/groups" style="display: flex; justify-content: space-between; padding: 10px 14px; background: #fffbeb; border-radius: 10px; text-decoration: none; color: #b45309; font-weight: bold; font-size: 13.5px;">
                  <span>≒JOY（ニアジョイ）</span> <span>${spots.filter(s => s.group === '≒JOY').length}件 →</span>
                </a>
                <a href="/groups" style="display: flex; justify-content: space-between; padding: 10px 14px; background: #f8fafc; border-radius: 10px; text-decoration: none; color: #334155; font-weight: bold; font-size: 13.5px;">
                  <span>合同・全体</span> <span>${spots.filter(s => s.group === '合同').length}件 →</span>
                </a>
              </div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px;">
              <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 0;">📍 主要エリアから探す</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px;">
                <a href="/areas" style="padding: 8px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #0f172a; font-size: 13px; font-weight: 500;">東京都</a>
                <a href="/areas" style="padding: 8px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #0f172a; font-size: 13px; font-weight: 500;">神奈川県（横浜・鎌倉）</a>
                <a href="/areas" style="padding: 8px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #0f172a; font-size: 13px; font-weight: 500;">埼玉県（秩父）</a>
                <a href="/areas" style="padding: 8px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #0f172a; font-size: 13px; font-weight: 500;">千葉県</a>
                <a href="/areas" style="padding: 8px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #0f172a; font-size: 13px; font-weight: 500;">京都府・関西</a>
                <a href="/areas" style="padding: 8px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #0f172a; font-size: 13px; font-weight: 500;">福島県</a>
                <a href="/areas" style="padding: 8px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #0f172a; font-size: 13px; font-weight: 500;">沖縄県</a>
                <a href="/areas" style="padding: 8px 14px; background: #ffe4e6; border: 1px solid #fecdd3; border-radius: 8px; text-decoration: none; color: #be123c; font-size: 13px; font-weight: bold;">すべての地域を見る →</a>
              </div>
            </div>
          </section>

          <!-- 聖地巡礼マナー -->
          <section style="background: #fffbeb; border: 1.5px solid #fef3c7; border-radius: 20px; padding: 24px; margin-bottom: 40px;">
            <h2 style="font-size: 18px; font-weight: bold; color: #b45309; margin-top: 0;">🚨 聖地巡礼のマナー（必ずお守りください）</h2>
            <ul style="margin: 10px 0 0 20px; padding: 0; font-size: 13px; color: #78350f; line-height: 1.8;">
              <li><strong>学校・住宅街・私有地への無断立ち入り禁止：</strong> 撮影専用スタジオや学校等は公道から静かに見学してください。</li>
              <li><strong>一般の方への配慮：</strong> 写真撮影時は通行人の写り込みに配慮し、長時間の場所占有は控えましょう。</li>
              <li><strong>恩返し巡礼：</strong> 飲食店や商業施設を訪れる際は、マナーを守って飲食・お買い物をして現地を応援しましょう。</li>
            </ul>
          </section>
        </main>
      `;
      break;
    }

    case 'spot-detail': {
      // 個別スポット詳細
      const s = route.spotData;
      const groupColor = s.group === '=LOVE' ? '#ff6897' : s.group === '≠ME' ? '#0ea5e9' : s.group === '≒JOY' ? '#f59e0b' : '#64748b';
      
      // 同じグループの関連スポット（自スポット除く）
      const relatedSpots = spots
        .filter(other => other.id !== s.id && (other.group === s.group || other.workKey === s.workKey))
        .slice(0, 4);

      mainContent = `
        <main style="max-width: 850px; margin: 0 auto; padding: 24px 20px;">
          <!-- パンくずリスト -->
          <nav aria-label="breadcrumb" style="font-size: 12px; margin-bottom: 16px; color: #64748b;">
            <a href="/" style="color: #64748b; text-decoration: none;">トップ</a> &gt; 
            <a href="/groups" style="color: #64748b; text-decoration: none;">${s.group}</a> &gt; 
            <a href="/spots" style="color: #64748b; text-decoration: none;">聖地スポット</a> &gt; 
            <span style="color: #0f172a; font-weight: bold;">${s.name}</span>
          </nav>

          <!-- 記事ヘッダー -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 28px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
              <span style="font-size: 11px; font-weight: bold; color: #fff; background: ${groupColor}; padding: 4px 10px; border-radius: 8px;">${s.group}</span>
              <span style="font-size: 11px; font-weight: bold; color: #334155; background: #f1f5f9; padding: 4px 10px; border-radius: 8px;">🏷️ ${s.category || 'MVロケ地'}</span>
              ${s.verification_status ? `<span style="font-size: 11px; font-weight: bold; color: #047857; background: #d1fae5; padding: 4px 10px; border-radius: 8px;">✓ ${s.verification_status}</span>` : ''}
            </div>

            <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 0 0 16px 0; line-height: 1.4;">
              ${s.name}
            </h1>

            <div style="background: #f8fafc; border-radius: 12px; padding: 14px 18px; font-size: 13px; color: #475569; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
              ${s.address ? `<div><strong>📍 所在地:</strong> ${s.address}</div>` : ''}
              ${(s.nearest_station && !s.nearest_station.includes('情報なし')) ? `<div><strong>🚉 最寄り駅:</strong> ${s.nearest_station} ${s.walk_time && !s.walk_time.includes('情報なし') ? `(徒歩${s.walk_time})` : ''}</div>` : ''}
              ${s.event_date ? `<div><strong>📅 関連日:</strong> ${s.event_date}</div>` : ''}
              <div><strong>📅 最終確認日:</strong> ${s.last_confirmed_date}</div>
            </div>
          </div>

          <!-- 聖地解説セクション -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 28px; margin-bottom: 24px;">
            <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 0; border-left: 4px solid #ff6897; padding-left: 10px;">
              📖 聖地・ロケ地としての詳しい解説
            </h2>
            <div style="font-size: 14.5px; line-height: 1.8; color: #334155; white-space: pre-wrap; margin-bottom: 24px;">
${s.description}
            </div>

            ${s.holy_point ? `
            <div style="background: #fdf2f8; border: 1.5px solid #fce7f3; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
              <h3 style="font-size: 15px; font-weight: bold; color: #9d174d; margin: 0 0 8px 0;">✨ 聖地注目ポイント</h3>
              <p style="font-size: 13.5px; line-height: 1.7; color: #831843; margin: 0;">${s.holy_point}</p>
            </div>
            ` : ''}

            ${(s.scene && !s.scene.includes('MVに登場した名場面シーン') && s.scene.trim().length > 0) ? `
            <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 24px; border-left: 4px solid #ff6897; padding-left: 10px;">
              🎬 MV・映像作品での具体的な登場場面
            </h2>
            <p style="font-size: 14px; line-height: 1.8; color: #334155; margin-bottom: 24px;">
              ${s.scene}
            </p>
            ` : ''}

            ${(s.check_points && s.check_points.length > 0) ? `
            <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 24px; border-left: 4px solid #ff6897; padding-left: 10px;">
              👀 現地注目チェックポイント
            </h2>
            <ul style="font-size: 13.5px; line-height: 1.8; color: #334155; margin: 0 0 24px 20px; padding: 0;">
              ${s.check_points.map(cp => `<li>${cp}</li>`).join('')}
            </ul>
            ` : ''}

            <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 24px; border-left: 4px solid #f59e0b; padding-left: 10px;">
              ⚠️ 訪問時の注意事項・巡礼マナー
            </h2>
            <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px; font-size: 13px; color: #92400e; line-height: 1.7;">
              ${s.visitor_notes || '学校や私有地への無断立ち入りを避け、近隣住民や一般利用者のご迷惑にならないようマナーを守って巡礼をお楽しみください。店舗利用時は他のお客様への配慮をお願いいたします。'}
            </div>

            ${s.youtube_title || s.youtube_url ? `
            <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 28px; border-left: 4px solid #ff6897; padding-left: 10px;">
              🎥 登場作品・公式映像情報
            </h2>
            ${s.youtube_title ? `<p style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 12px;">${s.youtube_title}</p>` : ''}
            ${s.youtube_url ? `
            <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">
              <a href="${s.youtube_url.includes('embed/') ? s.youtube_url.replace('embed/', 'watch?v=') : s.youtube_url}" target="_blank" rel="noopener noreferrer" style="color: #ff6897; font-weight: bold; text-decoration: underline;">
                ▶ YouTube公式動画を新しいタブで視聴する（公式再生数に貢献）
              </a>
            </p>
            <div style="width: 100%; aspect-ratio: 16/9; max-width: 640px; margin: 16px 0; border-radius: 14px; overflow: hidden; background: #000;">
              ${s.youtube_url.includes('<iframe') ? s.youtube_url : `<iframe width="100%" height="100%" src="${s.youtube_url}" title="${s.name} 関連公式動画" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`}
            </div>
            ` : ''}
            ` : ''}

            ${s.reward_title ? `
            <div style="background: #fdf4ff; border: 1px solid #fae8ff; border-radius: 14px; padding: 18px; margin-top: 24px;">
              <h3 style="font-size: 15px; font-weight: bold; color: #86198f; margin: 0 0 6px 0;">🏆 GPSチェックイン特典アワード称号</h3>
              <p style="font-size: 13px; color: #701a75; margin: 0;">現地を訪れてGPSチェックインを完了すると、限定称号 <strong>「${s.reward_title}」</strong> を獲得できます！</p>
            </div>
            ` : ''}

            <!-- 修正依頼・情報提供 -->
            <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap; font-size: 12px; color: #64748b;">
              <span>情報確認基準：公式YouTube／自治体・公式施設資料（非公式ファン調査）</span>
              <a href="/contact?subject=${encodeURIComponent(s.name + 'の修正・情報提供')}" style="color: #ff6897; text-decoration: underline; font-weight: bold;">
                ⚠️ このスポット情報の修正・提供はこちら
              </a>
            </div>
          </div>

          <!-- 関連スポットへの内部リンク -->
          ${relatedSpots.length > 0 ? `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px;">
            <h2 style="font-size: 17px; font-weight: bold; color: #0f172a; margin-top: 0; margin-bottom: 14px;">
              🔗 関連する聖地スポット
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
              ${relatedSpots.map(rs => `
                <a href="/spots/${rs.slug}" style="display: block; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-decoration: none; color: inherit;">
                  <span style="font-size: 10px; font-weight: bold; color: #ff6897;">${rs.group}</span>
                  <strong style="display: block; font-size: 13.5px; color: #0f172a; margin: 4px 0;">${rs.name}</strong>
                  <span style="font-size: 11.5px; color: #64748b;">📍 ${rs.address || '日本'}</span>
                </a>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </main>
      `;
      break;
    }

    case 'course-detail': {
      // モデルコース詳細
      const c = route.courseData;
      mainContent = `
        <main style="max-width: 850px; margin: 0 auto; padding: 24px 20px;">
          <nav aria-label="breadcrumb" style="font-size: 12px; margin-bottom: 16px; color: #64748b;">
            <a href="/" style="color: #64748b; text-decoration: none;">トップ</a> &gt; 
            <a href="/courses" style="color: #64748b; text-decoration: none;">モデルコース一覧</a> &gt; 
            <span style="color: #0f172a; font-weight: bold;">${c.name}</span>
          </nav>

          <article style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
              ${c.related_groups.map(g => `<span style="font-size: 11px; font-weight: bold; color: #fff; background: ${g === '=LOVE' ? '#ff6897' : g === '≠ME' ? '#0ea5e9' : g === '≒JOY' ? '#f59e0b' : '#64748b'}; padding: 4px 10px; border-radius: 8px;">${g}</span>`).join('')}
              ${c.related_songs.map(s => `<span style="font-size: 11px; font-weight: bold; color: #334155; background: #f1f5f9; padding: 4px 10px; border-radius: 8px;">🎵 ${s}</span>`).join('')}
            </div>

            <h1 style="font-size: 26px; font-weight: 900; color: #0f172a; margin: 0 0 20px 0; line-height: 1.3;">
              ${c.name}
            </h1>

            <!-- コース基本スペック -->
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; font-size: 13px;">
              <div>⏱️ <strong>想定所要時間:</strong> <span style="color: #0f172a; font-weight: bold;">${c.duration}</span></div>
              <div>🚶 <strong>推奨移動手段:</strong> <span style="color: #0f172a; font-weight: bold;">${c.transportation}</span></div>
              <div>🌤️ <strong>推奨時間帯:</strong> <span style="color: #0f172a; font-weight: bold;">${c.recommended_time}</span></div>
              <div>💰 <strong>費用目安:</strong> <span style="color: #0f172a; font-weight: bold;">${c.estimated_cost}</span></div>
              <div>🚩 <strong>出発地:</strong> <span style="color: #0f172a; font-weight: bold;">${c.start_point}</span></div>
              <div>🏁 <strong>目的地:</strong> <span style="color: #0f172a; font-weight: bold;">${c.end_point}</span></div>
              <div>📅 <strong>最終更新日:</strong> <span style="color: #0f172a; font-weight: bold;">${c.updated_at}</span></div>
            </div>

            <h2 style="font-size: 19px; font-weight: bold; color: #0f172a; margin-top: 0; border-left: 4px solid #ff6897; padding-left: 10px;">
              🗺️ 巡礼ルートと各スポットの見どころ
            </h2>
            <div style="display: flex; flex-direction: column; gap: 24px; margin: 24px 0 32px 10px; border-left: 3px dashed #e2e8f0; padding-left: 24px;">
              ${c.spots.map((cs, idx) => {
                const sInfo = spotMap.get(cs.spot_id);
                return `
                  <div style="position: relative;">
                    <div style="position: absolute; left: -37px; top: 0; width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #ff6897 0%, #a78bfa 100%); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">
                      ${idx + 1}
                    </div>
                    <div style="background: #ffffff; border: 1px solid #f1f5f9; padding: 18px; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <h3 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0;">
                          ${sInfo ? sInfo.name : cs.spot_id}
                        </h3>
                        ${sInfo ? `<a href="/spots/${sInfo.slug}" style="font-size: 12px; color: #ff6897; font-weight: bold; text-decoration: none;">スポット詳細を見る →</a>` : ''}
                      </div>
                      ${sInfo ? `<p style="font-size: 12px; color: #64748b; margin: 4px 0 10px 0;">📍 ${sInfo.address || ''}</p>` : ''}
                      <p style="font-size: 13.5px; line-height: 1.7; color: #334155; margin: 0;">
                        ${cs.short_commentary}
                      </p>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            ${c.notes ? `
            <h2 style="font-size: 18px; font-weight: bold; color: #b45309; margin-top: 32px; border-left: 4px solid #f59e0b; padding-left: 10px;">
              ⚠️ 巡礼時の注意事項・マナー
            </h2>
            <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 14px; padding: 18px; font-size: 13.5px; color: #92400e; line-height: 1.7; margin: 12px 0 24px 0;">
              ${c.notes}
            </div>
            ` : ''}

            ${c.cafe_spots && c.cafe_spots.length > 0 ? `
            <h2 style="font-size: 18px; font-weight: bold; color: #15803d; margin-top: 32px; border-left: 4px solid #22c55e; padding-left: 10px;">
              ☕ 周辺のおすすめカフェ・休憩場所
            </h2>
            <div style="background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 14px; padding: 18px; margin: 12px 0 24px 0;">
              <ul style="margin: 0 0 0 20px; padding: 0; font-size: 13.5px; color: #166534; line-height: 1.8;">
                ${c.cafe_spots.map(cafe => `<li>${cafe}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            ${c.external_map_url ? `
            <div style="text-align: center; margin: 36px 0 20px 0;">
              <a href="${c.external_map_url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #0f172a; color: #fff; padding: 14px 32px; border-radius: 24px; text-decoration: none; font-weight: bold; font-size: 14px;">
                🗺️ Googleマップで全ルートを開く
              </a>
            </div>
            ` : ''}
          </article>
        </main>
      `;
      break;
    }

    case 'courses-list': {
      // モデルコース一覧
      mainContent = `
        <main style="max-width: 900px; margin: 0 auto; padding: 30px 20px;">
          <h1 style="font-size: 26px; font-weight: 900; color: #0f172a; margin-bottom: 12px; border-bottom: 3.5px solid #ff6897; padding-bottom: 12px;">
            🗺️ イコノイジョイ聖地巡礼モデルコース一覧
          </h1>
          <p style="font-size: 14.5px; color: #475569; line-height: 1.8; margin-bottom: 32px;">
            初めて聖地巡礼をする方からディープにロケ地を極めたいファンまで、無理のない移動時間・おすすめ時間帯・周辺カフェ情報を含めた厳選モデルコース全${courses.length}本をご紹介します。
          </p>

          <div style="display: flex; flex-direction: column; gap: 24px;">
            ${courses.map(c => `
              <article style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.02);">
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;">
                  ${c.related_groups.map(g => `<span style="font-size: 10px; font-weight: bold; color: #fff; background: ${g === '=LOVE' ? '#ff6897' : g === '≠ME' ? '#0ea5e9' : g === '≒JOY' ? '#f59e0b' : '#64748b'}; padding: 3px 8px; border-radius: 6px;">${g}</span>`).join('')}
                  ${c.related_songs.map(s => `<span style="font-size: 10px; font-weight: bold; color: #475569; background: #f1f5f9; padding: 3px 8px; border-radius: 6px;">🎵 ${s}</span>`).join('')}
                </div>
                <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 0 0 12px 0;">
                  <a href="/courses/${c.slug}" style="color: inherit; text-decoration: none;">${c.name}</a>
                </h2>
                <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 12.5px; color: #64748b; margin-bottom: 14px;">
                  <span>⏱️ <strong>所要時間:</strong> ${c.duration}</span>
                  <span>🚶 <strong>移動:</strong> ${c.transportation}</span>
                  <span>💰 <strong>費用目安:</strong> ${c.estimated_cost}</span>
                  <span>🚩 <strong>区間:</strong> ${c.start_point} → ${c.end_point}</span>
                </div>
                <div style="background: #f8fafc; border-radius: 12px; padding: 14px; font-size: 13px; color: #334155; margin-bottom: 16px;">
                  <strong>巡るスポット（全${c.spots.length}箇所）：</strong>
                  <ol style="margin: 6px 0 0 20px; padding: 0;">
                    ${c.spots.map(cs => {
                      const sInfo = spotMap.get(cs.spot_id);
                      return `<li>${sInfo ? sInfo.name : cs.spot_id}</li>`;
                    }).join('')}
                  </ol>
                </div>
                <div style="text-align: right;">
                  <a href="/courses/${c.slug}" style="display: inline-block; background: linear-gradient(135deg, #ff6897 0%, #a78bfa 100%); color: #fff; padding: 10px 22px; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 13px;">
                    このコースの詳しい道順を見る →
                  </a>
                </div>
              </article>
            `).join('')}
          </div>
        </main>
      `;
      break;
    }

    case 'spots-list': {
      // スポット一覧（ページネーション対応）
      const currentPage = route.page || 1;
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const currentSpots = spots.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      let paginationHtml = '<div style="display: flex; justify-content: center; gap: 8px; margin-top: 36px; flex-wrap: wrap;">';
      for (let p = 1; p <= totalSpotPages; p++) {
        if (p === currentPage) {
          paginationHtml += `<span style="padding: 8px 14px; background: #ff6897; color: #fff; border-radius: 8px; font-weight: bold; font-size: 13px;">${p}</span>`;
        } else {
          paginationHtml += `<a href="${p === 1 ? '/spots' : `/spots/page/${p}`}" style="padding: 8px 14px; background: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a; border-radius: 8px; text-decoration: none; font-size: 13px;">${p}</a>`;
        }
      }
      paginationHtml += '</div>';

      mainContent = `
        <main style="max-width: 900px; margin: 0 auto; padding: 30px 20px;">
          <h1 style="font-size: 26px; font-weight: 900; color: #0f172a; margin-bottom: 12px; border-bottom: 3.5px solid #ff6897; padding-bottom: 12px;">
            📍 イコノイジョイ聖地スポット一覧
          </h1>
          <p style="font-size: 14.5px; color: #475569; line-height: 1.8; margin-bottom: 24px;">
            登録されている全${spots.length}件の聖地ロケ地・イベント会場の一覧です（${currentPage}/${totalSpotPages}ページ、${startIndex + 1}〜${Math.min(startIndex + ITEMS_PER_PAGE, spots.length)}件目を表示）。
          </p>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${currentSpots.map(s => {
              const cleanScene = (s.scene && !s.scene.includes('MVに登場した名場面シーン')) ? s.scene.trim() : '';
              const cleanDesc = (s.description || '')
                .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                .replace(/⚠️\s*聖地巡礼に関する重要なお願い[\s\S]*$/, '')
                .replace(/【[^】]*】/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              const cardSnippet = cleanScene || cleanDesc;
              return `
              <article style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                  <div>
                    <span style="font-size: 10px; font-weight: bold; color: #fff; background: ${s.group === '=LOVE' ? '#ff6897' : s.group === '≠ME' ? '#0ea5e9' : s.group === '≒JOY' ? '#f59e0b' : '#64748b'}; padding: 3px 8px; border-radius: 6px;">${s.group}</span>
                    <span style="font-size: 11px; color: #64748b; margin-left: 6px;">🏷️ ${s.category || 'MVロケ地'}</span>
                  </div>
                  <span style="font-size: 11.5px; color: #64748b;">確認日: ${s.last_confirmed_date}</span>
                </div>
                <h2 style="font-size: 17px; font-weight: bold; color: #0f172a; margin: 0 0 6px 0;">
                  <a href="/spots/${s.slug}" style="color: inherit; text-decoration: none;">${s.name}</a>
                </h2>
                <p style="font-size: 12.5px; color: #64748b; margin: 0 0 10px 0;">
                  📍 ${s.address || '日本'} ${(s.nearest_station && !s.nearest_station.includes('情報なし')) ? `(最寄り: ${s.nearest_station})` : ''}
                </p>
                ${cardSnippet ? `<p style="font-size: 13.5px; color: #334155; line-height: 1.6; margin: 0 0 12px 0;">${cardSnippet.slice(0, 110)}...</p>` : ''}
                <div style="text-align: right;">
                  <a href="/spots/${s.slug}" style="font-size: 12.5px; color: #ff6897; font-weight: bold; text-decoration: underline;">
                    詳細解説とアクセスを見る →
                  </a>
                </div>
              </article>
            `;
            }).join('')}
          </div>

          ${paginationHtml}
        </main>
      `;
      break;
    }

    case 'about': {
      mainContent = `
        <main style="max-width: 800px; margin: 40px auto; padding: 24px; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 20px; border-bottom: 3px solid #ff6897; padding-bottom: 10px;">🗺️ このサイトについて</h1>
          <div style="line-height: 1.8; color: #334155; display: flex; flex-direction: column; gap: 20px;">
            <p>「トリプルデートマップ」は、指原莉乃プロデュースのアイドルグループ「＝LOVE（イコラブ）」「≠ME（ノイミー）」「≒JOY（ニアジョイ）」のメンバーが訪れたミュージックビデオ（MV）ロケ地、イベント会場、番組ロケ地等の聖地を検索・記録できる非公式の聖地巡礼ファンメディアです。</p>
            
            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">📌 サイトの目的</h2>
              <p>当サイトは、イコノイジョイの楽曲や映像作品の魅力をより深く体験し、ファン同士が安全かつマナーを守って聖地巡礼を楽しめる文化の活性化を目的として運営されています。作品の背景や現地の見どころ、アクセス、訪問時のマナーを分かりやすく整理・提供します。</p>
            </div>

            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">👤 運営者情報</h2>
              <p>当サイトは、個人のファン・開発者である<strong>「れつぴ」</strong>（運営事務局）によって企画・開発・運営されています。<br/>
              連絡先SNS：<a href="https://x.com/ikonoijoy_tools" target="_blank" rel="noopener noreferrer" style="color: #ff6897; text-decoration: underline; font-weight: bold;">@ikonoijoy_tools (X)</a></p>
            </div>

            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">⚠️ 非公式ファンサイトであることの明記</h2>
              <p>当サイトは個人が運営する<strong>非公式ファンサイト</strong>であり、各グループの所属事務所（代々木アニメーション学院等）、所属レコード会社（ソニー・ミュージックエンタテインメント、キングレコード等）、および各自治体・施設・店舗の運営元とは一切関係ありません。</p>
            </div>

            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">📋 情報収集と掲載方針（公式情報と独自調査の区別）</h2>
              <p>当サイトでは、公式YouTube動画、公式SNS、CDブックレット等の公表資料を最優先の根拠とし、管理者が現地景観や施設公式情報と照合する「独自調査」を行ってロケ地を特定・掲載しています。個人のSNSやブログのみの噂情報は掲載せず、特定根拠が不十分な場所は確認待ちとしています。詳細は<a href="/editorial-policy" style="color: #ff6897; text-decoration: underline; font-weight: bold;">編集方針ページ</a>をご覧ください。</p>
            </div>

            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">🔄 誤情報の修正と更新方針</h2>
              <p>ロケ地情報や施設情報（営業時間、利用可否、移転等）は定期的に見直しを行っています。万が一掲載内容に誤りがある場合や施設の営業状況に変更が生じた場合は、ユーザー様からのご指摘を受け付け、速やかに調査・修正履歴の更新を行います。<a href="/contact" style="color: #ff6897; text-decoration: underline; font-weight: bold;">お問い合わせフォーム</a>よりご連絡ください。</p>
            </div>

            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">📰 広告掲載方針</h2>
              <p>当サイトはサーバー維持費および現地調査・取材等の運営費用の一部を補うため、Google AdSenseをはじめとする第三者配信広告を掲載する場合があります。コンテンツの閲覧性を損なわない適切な配置に努め、薄いページや規約上不適切なページには広告を配信しません。</p>
            </div>

            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">🛡️ 権利者様からの連絡窓口</h2>
              <p>当サイトは著作権および肖像権の尊重を徹底しております。掲載内容（文章・画像・リンク等）に関して権利者様より削除・修正のご要望がございましたら、権利関係を確認の上、速やかに対応いたします。<a href="/contact" style="color: #ff6897; text-decoration: underline; font-weight: bold;">お問い合わせ窓口</a>よりご連絡いただけますようお願い申し上げます。</p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="/" style="background: linear-gradient(135deg, #ff6897 0%, #a78bfa 100%); color: #fff; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: bold; display: inline-block;">マップへ戻る</a>
          </div>
        </main>
      `;
      break;
    }

    case 'editorial-policy': {
      mainContent = `
        <main style="max-width: 800px; margin: 40px auto; padding: 24px; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 20px; border-bottom: 3px solid #ff6897; padding-bottom: 10px;">📜 編集方針・ファクトチェック指針</h1>
          <div style="line-height: 1.8; color: #334155; display: flex; flex-direction: column; gap: 20px;">
            <p>「トリプルデートマップ」では、正確で信頼性の高い聖地巡礼情報を提供し、ファンが安心して訪問できるようにするため、以下の編集方針・検証基準を厳格に定めて運営しています。</p>

            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">1. 公式情報および施設公式情報の優先</h2>
              <p>作品に紐づく聖地の特定においては、各グループの公式YouTube動画、公式SNS、公式ファンクラブ等の一次情報を最優先の調査元とします。また、施設名や所在地、利用条件の確認には、自治体や施設・店舗の公式サイト・公式発表資料を用います。</p>
            </div>

            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">2. 個人ブログやSNSの噂のみを根拠にしない</h2>
              <p>個人のブログ、掲示板、SNSの投稿のみを根拠としてスポットを「確定聖地」として登録することはありません。必ず公式MVや動画の映像シーンと、国土地理院地図・ストリートビュー・自治体資料・現地写真等の客観的特徴を多角的に比較照合した上で登録します。</p>
            </div>

            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">3. 場所を特定できない情報は「確認待ち」とする</h2>
              <p>映像に登場しても、具体的な施設名や公道上の位置が特定できない場合、または類似の風景が多く確証が得られない場所は登録せず、十分な照合情報が揃うまで「確認待ち」として扱います。推測や未確認情報を事実であるかのように掲載することはありません。</p>
            </div>

            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">4. 住所・座標・施設名を公開前に多重照合</h2>
              <p>すべてのスポットは、公開前に正式な施設名称、正確な所在地住所（郵便番号・都道府県・市区町村）、および地図座標（緯度・経度）を公的データベースや自治体情報と照合して設定しています。私有地や立ち入り禁止区域にピンが置かれないよう配慮しています。</p>
            </div>

            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">5. 誤りが判明した場合は速やかに修正履歴を反映</h2>
              <p>店舗の閉店、建物の解体、施設の利用規則変更、または特定箇所の誤りが判明した場合は、速やかにデータベースを修正し、必要に応じて更新日や注意事項を更新します。</p>
            </div>

            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">6. 画像・動画の著作権・権利関係の尊重</h2>
              <p>公式MVの紹介にはYouTube公式の標準埋め込みプレイヤーを使用し、公式動画の再生数が正当にカウントされる仕様を遵守しています。私有地や撮影専用スタジオ等の掲載にあたっては、敷地外からの見学マナーや注意事項を明記し、権利者・近隣住民への迷惑防止を徹底します。</p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="/" style="background: linear-gradient(135deg, #ff6897 0%, #a78bfa 100%); color: #fff; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: bold; display: inline-block;">マップへ戻る</a>
          </div>
        </main>
      `;
      break;
    }

    case 'profile': {
      mainContent = `
        <main style="max-width: 800px; margin: 40px auto; padding: 24px; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 20px; border-bottom: 3px solid #ff6897; padding-bottom: 10px;">👤 運営者情報</h1>
          <div style="line-height: 1.8; color: #334155; display: flex; flex-direction: column; gap: 16px;">
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tbody>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold; width: 30%;">運営者名</td>
                  <td style="padding: 12px;">トリプルデートマップ運営事務局（管理人：れつぴ）</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold;">サイト運営の目的</td>
                  <td style="padding: 12px;">=LOVE, ≠ME, ≒JOYの魅力をより多くの人に広め、聖地巡礼を楽しむファンを増やすこと。</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold;">管理人連絡先 (SNS)</td>
                  <td style="padding: 12px;">
                    <a href="https://x.com/ikonoijoy_tools" target="_blank" rel="noopener noreferrer" style="color: #ff6897; text-decoration: underline; font-weight: bold;">@ikonoijoy_tools (X)</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold;">更新方針</td>
                  <td style="padding: 12px;">新曲のMVロケ地が公開された際や、番組等で新しい聖地が判明した際に随時更新を行います。また、ユーザーの皆様からの情報提供や修正依頼に基づき、定期的にメンテナンスを行っています。</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: bold;">お問い合わせ先</td>
                  <td style="padding: 12px;">お気づきの点や修正依頼がございましたら、<a href="/contact" style="color: #ff6897; text-decoration: underline;">お問い合わせフォーム</a>よりご連絡ください。</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="/" style="background: linear-gradient(135deg, #ff6897 0%, #a78bfa 100%); color: #fff; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: bold; display: inline-block;">マップへ戻る</a>
          </div>
        </main>
      `;
      break;
    }

    case 'contact': {
      mainContent = `
        <main style="max-width: 800px; margin: 40px auto; padding: 24px; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 20px; border-bottom: 3px solid #ff6897; padding-bottom: 10px;">📮 お問い合わせ・情報提供</h1>
          <div style="line-height: 1.8; color: #334155; display: flex; flex-direction: column; gap: 16px;">
            <p>トリプルデートマップをご利用いただきありがとうございます。掲載されている聖地情報の修正依頼、新規スポットのご提供、ご意見・ご要望がございましたら、以下の連絡先またはフォームよりご連絡ください。</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 10px 0;">
              <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 0;">直接のご連絡・公式SNS</h2>
              <p style="margin: 0; font-size: 13.5px;">X（旧Twitter）公式窓口：<a href="https://x.com/ikonoijoy_tools" target="_blank" rel="noopener noreferrer" style="color: #ff6897; font-weight: bold; text-decoration: underline;">@ikonoijoy_tools</a></p>
            </div>
            <p style="font-size: 13px; color: #64748b;">※JavaScriptが有効な環境では画面上にインタラクティブなお問い合わせフォームが表示されます。</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="/" style="background: linear-gradient(135deg, #ff6897 0%, #a78bfa 100%); color: #fff; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: bold; display: inline-block;">マップへ戻る</a>
          </div>
        </main>
      `;
      break;
    }

    case 'privacy': {
      mainContent = `
        <main style="max-width: 800px; margin: 40px auto; padding: 24px; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 20px; border-bottom: 3px solid #ff6897; padding-bottom: 10px;">📜 プライバシーポリシー</h1>
          <div style="font-size: 12px; color: #9f1239; line-height: 1.7; background: #fff1f2; padding: 16px; border-radius: 12px; border: 1.5px solid #ffe4e6; font-weight: bold; margin-bottom: 24px;">
            💡 免責事項（非公式宣言）<br/>
            本サービス「トリプルデートマップ」は、＝LOVE / ≠ME / ≒JOYおよび各公式運営・所属事務所・権利者とは一切関係のない非公式ファンサービスです。
          </div>
          <div style="display: flex; flex-direction: column; gap: 20px; font-size: 13.5px; color: #334155; line-height: 1.8;">
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0 0 8px 0;">1. 収集する情報</h2>
              <p>アカウント登録時にご入力いただいたメールアドレス、ニックネーム、推しグループ等の情報は認証サービス「Supabase」（米国）のクラウドサーバーに安全に保管されます。パスワードはハッシュ化（暗号化）され平文では保持されません。チェックイン履歴はお使いの端末（localStorage）にのみ保存されます。</p>
            </div>
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0 0 8px 0;">2. 位置情報（GPSデータ）</h2>
              <p>聖地チェックイン機能を利用する際、ユーザーの現在地情報を一時的に取得します。この情報は距離判定にのみ使用され、移動履歴としてサーバーに保存・追跡されることはありません。</p>
            </div>
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0 0 8px 0;">3. 広告の配信およびCookie（クッキー）について</h2>
              <p>当サービスでは第三者配信の広告サービス（Google AdSense等）およびアクセス解析ツールを利用しています。これらはCookieを使用して適切な広告配信や利用状況分析を行いますが、個人を特定する情報は含まれません。ユーザーはブラウザ設定やGoogle広告設定でCookie・パーソナライズ広告を無効にできます。</p>
            </div>
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0 0 8px 0;">4. アフィリエイトプログラムに関する表記</h2>
              <p>当サービスは、各種アフィリエイトプログラム（じゃらんnet、楽天トラベル、A8.net等のアフィリエイトサービスプロバイダ）に参加しています。当サイト内のリンクを経由して宿泊予約や旅行商品の申し込みが行われた場合、当サービスに紹介料が支払われることがあります。提携リンクを含むコンテンツにおいては「PR」「プロモーション」等の表記を行い、適切な属性（rel="sponsored"）を設定しています。</p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="/" style="background: linear-gradient(135deg, #ff6897 0%, #a78bfa 100%); color: #fff; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: bold; display: inline-block;">マップへ戻る</a>
          </div>
        </main>
      `;
      break;
    }

    case 'terms': {
      mainContent = `
        <main style="max-width: 800px; margin: 40px auto; padding: 24px; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 20px; border-bottom: 3px solid #ff6897; padding-bottom: 10px;">⚖️ 利用規約</h1>
          <div style="display: flex; flex-direction: column; gap: 20px; font-size: 13.5px; color: #334155; line-height: 1.8;">
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0 0 6px 0;">第1条（規約の適用）</h2>
              <p style="margin: 0;">本規約は、本サービスを利用するすべてのユーザーに適用されます。本サービスをご利用いただくことにより同意したものとみなされます。</p>
            </div>
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0 0 6px 0;">第2条（位置情報及びチェックイン）</h2>
              <p style="margin: 0;">GPS機能を利用したチェックイン機能を提供しますが、環境により正しく動作しない場合があります。これに伴う損害について運営者は責任を負いません。</p>
            </div>
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0 0 6px 0;">第3条（聖地巡礼のマナーと自己責任）</h2>
              <p style="margin: 0;">聖地巡礼にあたっては近隣住民への配慮、公共マナーを厳守してください。発生したトラブルについて運営者は一切の責任を負いません。</p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="/" style="background: linear-gradient(135deg, #ff6897 0%, #a78bfa 100%); color: #fff; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: bold; display: inline-block;">マップへ戻る</a>
          </div>
        </main>
      `;
      break;
    }

    case 'disclaimer': {
      mainContent = `
        <main style="max-width: 800px; margin: 40px auto; padding: 24px; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 20px; border-bottom: 3px solid #ff6897; padding-bottom: 10px;">⚖️ 免責事項</h1>
          <div style="display: flex; flex-direction: column; gap: 20px; font-size: 13.5px; color: #334155; line-height: 1.8;">
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0 0 6px 0;">1. 情報の正確性について</h2>
              <p style="margin: 0;">掲載情報は個人が独自に調査したものであり完全性や正確性を保証するものではありません。営業時間や移転情報等は事前に施設公式発表をご確認ください。</p>
            </div>
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0 0 6px 0;">2. トラブル・損害への責任</h2>
              <p style="margin: 0;">当サイトの利用またはスポットへの訪問に伴い生じたあらゆる損害について運営者は一切の責任を負いません。</p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="/" style="background: linear-gradient(135deg, #ff6897 0%, #a78bfa 100%); color: #fff; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: bold; display: inline-block;">マップへ戻る</a>
          </div>
        </main>
      `;
      break;
    }

    case 'copyright': {
      mainContent = `
        <main style="max-width: 800px; margin: 40px auto; padding: 24px; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 20px; border-bottom: 3px solid #ff6897; padding-bottom: 10px;">🛡️ 著作権・権利者への配慮</h1>
          <div style="display: flex; flex-direction: column; gap: 20px; font-size: 13.5px; color: #334155; line-height: 1.8;">
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0 0 6px 0;">1. 非公式ファンの立ち位置</h2>
              <p style="margin: 0;">当サイトは非公式ファンサイトであり、各所属事務所、レコード会社、施設運営者とは一切関係ありません。</p>
            </div>
            <div>
              <h2 style="font-size: 16px; font-weight: bold; color: #0f172a; margin: 0 0 6px 0;">2. 動画埋め込みと権利の尊重</h2>
              <p style="margin: 0;">YouTube公式標準埋め込み機能を利用し、公式チャンネルの権利と再生数カウントを尊重して掲載しています。</p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="/" style="background: linear-gradient(135deg, #ff6897 0%, #a78bfa 100%); color: #fff; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: bold; display: inline-block;">マップへ戻る</a>
          </div>
        </main>
      `;
      break;
    }

    case 'guide': {
      mainContent = `
        <main style="max-width: 850px; margin: 40px auto; padding: 32px 24px; background: #ffffff; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <h1 style="font-size: 26px; font-weight: 900; color: #0f172a; margin-bottom: 20px; border-bottom: 3.5px solid #ff6897; padding-bottom: 12px;">🔰 初めての方向けガイド＆巡礼マナー</h1>
          <div style="display: flex; flex-direction: column; gap: 24px; font-size: 14px; color: #334155; line-height: 1.8;">
            <p>「トリプルデートマップ」は、イコノイジョイ（＝LOVE、≠ME、≒JOY）のメンバーが活動の軌跡を残した聖地やロケ地を楽しく巡るための非公式ファンメディアです。</p>
            <div style="background: #fffbeb; border: 1.5px solid #fef3c7; border-radius: 16px; padding: 20px;">
              <h2 style="font-size: 17px; font-weight: bold; color: #b45309; margin-top: 0;">🚨 聖地巡礼のマナー（必ずお守りください）</h2>
              <ul style="margin: 10px 0 0 20px; padding: 0; font-size: 13.5px; color: #78350f; line-height: 1.8;">
                <li><strong>私有地や学校へ無断で立ち入らない：</strong> 撮影スタジオや現役の学校など見学不可の場所は敷地外から眺めるだけにしましょう。</li>
                <li><strong>一般の方の写り込みに配慮する：</strong> 写真撮影時は通行人の顔が映らないよう配慮しましょう。</li>
                <li><strong>大声での会話や長時間の占有を避ける：</strong> 周辺住民や通行人の妨げにならないよう配慮しましょう。</li>
                <li><strong>恩返し巡礼：</strong> 飲食店等ではマナーよく注文し、現地にお金を落とす巡礼を心がけましょう。</li>
              </ul>
            </div>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="/" style="background: linear-gradient(135deg, #ff6897 0%, #a78bfa 100%); color: #fff; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: bold; display: inline-block;">マップへ戻る</a>
          </div>
        </main>
      `;
      break;
    }

    case 'areas-list': {
      // エリア別一覧
      const byPref = {};
      spots.forEach(s => {
        const pref = (s.address || 'その他').split(' ')[0].replace(/〒\d{3}-\d{4}/, '').trim() || 'その他';
        if (!byPref[pref]) byPref[pref] = [];
        byPref[pref].push(s);
      });

      mainContent = `
        <main style="max-width: 900px; margin: 30px auto; padding: 0 20px;">
          <h1 style="font-size: 26px; font-weight: 900; color: #0f172a; margin-bottom: 12px; border-bottom: 3.5px solid #ff6897; padding-bottom: 12px;">📍 地域・都道府県別聖地一覧</h1>
          <div style="display: flex; flex-direction: column; gap: 24px; margin-top: 24px;">
            ${Object.keys(byPref).sort((a,b) => byPref[b].length - byPref[a].length).map(pref => `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;">
                <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 0 0 12px 0;">${pref} (${byPref[pref].length}件)</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
                  ${byPref[pref].slice(0, 8).map(s => `
                    <a href="/spots/${s.slug}" style="display: block; padding: 10px; background: #f8fafc; border-radius: 8px; text-decoration: none; color: #0f172a; font-size: 13px;">
                      <span style="font-size: 10px; font-weight: bold; color: #ff6897;">${s.group}</span>
                      <strong style="display: block; margin-top: 2px;">${s.name}</strong>
                    </a>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </main>
      `;
      break;
    }

    case 'groups-list': {
      mainContent = `
        <main style="max-width: 900px; margin: 30px auto; padding: 0 20px;">
          <h1 style="font-size: 26px; font-weight: 900; color: #0f172a; margin-bottom: 12px; border-bottom: 3.5px solid #ff6897; padding-bottom: 12px;">🎤 グループ別聖地一覧</h1>
          <div style="display: flex; flex-direction: column; gap: 24px; margin-top: 24px;">
            ${['=LOVE', '≠ME', '≒JOY', '合同'].map(grp => {
              const grpSpots = spots.filter(s => s.group === grp);
              return `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;">
                  <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 0 0 12px 0;">${grp} (${grpSpots.length}件)</h2>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
                    ${grpSpots.slice(0, 9).map(s => `
                      <a href="/spots/${s.slug}" style="display: block; padding: 10px; background: #f8fafc; border-radius: 8px; text-decoration: none; color: #0f172a; font-size: 13px;">
                        <strong style="display: block;">${s.name}</strong>
                        <span style="font-size: 11.5px; color: #64748b;">📍 ${s.address || '日本'}</span>
                      </a>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </main>
      `;
      break;
    }

    case 'songs-list': {
      // 楽曲・作品別
      const byWork = {};
      spots.forEach(s => {
        const title = (s.youtube_title || s.workKey || 'その他作品').replace('🎥 関連映像: ', '').replace('🎥 関連映像：', '').trim();
        if (!byWork[title]) byWork[title] = [];
        byWork[title].push(s);
      });

      mainContent = `
        <main style="max-width: 900px; margin: 30px auto; padding: 0 20px;">
          <h1 style="font-size: 26px; font-weight: 900; color: #0f172a; margin-bottom: 12px; border-bottom: 3.5px solid #ff6897; padding-bottom: 12px;">🎵 作品・楽曲別聖地一覧</h1>
          <div style="display: flex; flex-direction: column; gap: 24px; margin-top: 24px;">
            ${Object.keys(byWork).sort((a,b) => byWork[b].length - byWork[a].length).slice(0, 30).map(work => `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;">
                <h2 style="font-size: 17px; font-weight: bold; color: #0f172a; margin: 0 0 12px 0;">${work} (${byWork[work].length}件)</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
                  ${byWork[work].map(s => `
                    <a href="/spots/${s.slug}" style="display: block; padding: 10px; background: #f8fafc; border-radius: 8px; text-decoration: none; color: #0f172a; font-size: 13px;">
                      <span style="font-size: 10px; font-weight: bold; color: #ff6897;">${s.group}</span>
                      <strong style="display: block; margin-top: 2px;">${s.name}</strong>
                    </a>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </main>
      `;
      break;
    }

    case 'articles-list': {
      mainContent = `
        <main style="max-width: 900px; margin: 30px auto; padding: 0 20px;">
          <h1 style="font-size: 26px; font-weight: 900; color: #0f172a; margin-bottom: 12px; border-bottom: 3.5px solid #ff6897; padding-bottom: 12px;">📰 巡礼コラム・レポート一覧</h1>
          <div style="display: flex; flex-direction: column; gap: 20px; margin-top: 24px;">
            ${articles.map(a => `
              <article style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                <span style="font-size: 11px; font-weight: bold; color: #7c3aed; background: #f3e8ff; padding: 3px 8px; border-radius: 6px;">${a.category}</span>
                <span style="font-size: 12px; color: #64748b; margin-left: 8px;">${a.publishedAt}</span>
                <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 10px 0 8px 0;">
                  <a href="/articles/${a.slug}" style="color: inherit; text-decoration: none;">${a.title}</a>
                </h2>
                <p style="font-size: 13.5px; color: #475569; line-height: 1.7; margin: 0 0 12px 0;">${a.excerpt}</p>
                <div style="text-align: right;">
                  <a href="/articles/${a.slug}" style="font-size: 12.5px; color: #ff6897; font-weight: bold; text-decoration: underline;">記事を読む →</a>
                </div>
              </article>
            `).join('')}
          </div>
        </main>
      `;
      break;
    }

    case 'article-detail': {
      const a = route.articleData;
      mainContent = `
        <main style="max-width: 800px; margin: 30px auto; padding: 0 20px;">
          <nav aria-label="breadcrumb" style="font-size: 12px; margin-bottom: 16px; color: #64748b;">
            <a href="/" style="color: #64748b; text-decoration: none;">トップ</a> &gt; 
            <a href="/articles" style="color: #64748b; text-decoration: none;">コラム一覧</a> &gt; 
            <span style="color: #0f172a; font-weight: bold;">${a.title}</span>
          </nav>

          <article style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <span style="font-size: 11px; font-weight: bold; color: #7c3aed; background: #f3e8ff; padding: 3px 8px; border-radius: 6px;">${a.category}</span>
            <span style="font-size: 12px; color: #64748b; margin-left: 8px;">公開日: ${a.publishedAt}</span>
            <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 12px 0 20px 0; line-height: 1.4;">${a.title}</h1>
            <div style="font-size: 14.5px; line-height: 1.85; color: #334155; margin-bottom: 30px;">
              ${a.content.split('\n\n').map(p => `<p style="margin-bottom: 16px;">${p.replace(/\n/g, '<br/>')}</p>`).join('')}
            </div>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
              <a href="/articles" style="color: #ff6897; font-weight: bold; text-decoration: underline;">← コラム一覧へ戻る</a>
            </div>
          </article>
        </main>
      `;
      break;
    }

    case '404': {
      mainContent = `
        <main style="max-width: 700px; margin: 80px auto; padding: 40px 20px; text-align: center; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <span style="font-size: 48px; display: block; margin-bottom: 16px;">🗺️ 404</span>
          <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 14px;">ページが見つかりませんでした</h1>
          <p style="font-size: 14px; color: #64748b; line-height: 1.8; margin-bottom: 24px;">
            指定されたページは移動または削除された可能性があります。<br/>
            トリプルデートマップのトップページより聖地をお探しください。
          </p>
          <a href="/" style="background: linear-gradient(135deg, #ff6897 0%, #a78bfa 100%); color: #fff; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            トップページへ戻る
          </a>
        </main>
      `;
      break;
    }

    default:
      mainContent = `<div>${route.title}</div>`;
  }

  return `
    <div id="prerendered-page-wrapper">
      ${nav}
      ${mainContent}
      ${footer}
    </div>
  `;
};

// 4. 静的HTMLファイル生成ループ
console.log('📝 HTMLファイルの生成中...');
routes.forEach(route => {
  let html = templateHtml;
  const canonicalUrl = `https://tripledatemap.com${route.canonicalPath || route.path}`;
  const ogImage = 'https://tripledatemap.com/ogp-image.png';

  // title 置換
  html = html.replace(/<title>[^<]*<\/title>/g, `<title>${route.title}</title>`);
  // 既存の description メタタグを削除（二重化防止）
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/gi, '');

  // 構造化データ（JSON-LD）の生成
  let jsonLdScript = '';
  if (route.type === 'spot-detail') {
    const s = route.spotData;
    const structData = {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      "name": s.name,
      "description": s.description,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": s.address || "日本"
      },
      "url": canonicalUrl
    };
    jsonLdScript = `\n  <script type="application/ld+json">${JSON.stringify(structData)}</script>`;
  } else if (route.type === 'course-detail') {
    const c = route.courseData;
    const structData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": c.name,
      "description": route.desc,
      "dateModified": c.updated_at,
      "author": {
        "@type": "Person",
        "name": "トリプルデートマップ運営事務局（れつぴ）"
      },
      "url": canonicalUrl
    };
    jsonLdScript = `\n  <script type="application/ld+json">${JSON.stringify(structData)}</script>`;
  }

  // meta tags 置換・挿入
  const robotsTag = route.noindex ? '<meta name="robots" content="noindex, nofollow" />' : '<meta name="robots" content="index, follow" />';
  const metaTags = `
  <meta name="description" content="${route.desc.replace(/"/g, '&quot;')}" />
  ${robotsTag}
  <link rel="canonical" href="${canonicalUrl}" />
  <meta property="og:title" content="${route.title.replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${route.desc.replace(/"/g, '&quot;')}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:type" content="${route.path === '/' ? 'website' : 'article'}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${route.title.replace(/"/g, '&quot;')}" />
  <meta name="twitter:description" content="${route.desc.replace(/"/g, '&quot;')}" />
  <meta name="twitter:image" content="${ogImage}" />${jsonLdScript}
  `;

  html = html.replace('</head>', `${metaTags}\n</head>`);

  // 本文HTMLの注入
  const bodyContent = buildPageContent(route);
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyContent}</div>`);

  // 出力先ファイルの決定
  let outputFilePath;
  if (route.path === '/') {
    outputFilePath = path.join(DIST_DIR, 'index.html');
  } else if (route.path === '/404') {
    outputFilePath = path.join(DIST_DIR, '404.html');
  } else {
    outputFilePath = path.join(DIST_DIR, route.path, 'index.html');
  }

  ensureDirectoryExistence(outputFilePath);
  fs.writeFileSync(outputFilePath, html, 'utf8');
});

// 404.html が dist 直下にない場合のフォールバック保証
const fourOhFourDest = path.join(DIST_DIR, '404.html');
if (!fs.existsSync(fourOhFourDest)) {
  const fourOhFourRoute = routes.find(r => r.path === '/404');
  if (fourOhFourRoute) {
    let html = templateHtml.replace(/<title>[^<]*<\/title>/g, `<title>${fourOhFourRoute.title}</title>`);
    html = html.replace('</head>', `<meta name="robots" content="noindex, nofollow" />\n</head>`);
    html = html.replace('<div id="root"></div>', `<div id="root">${buildPageContent(fourOhFourRoute)}</div>`);
    fs.writeFileSync(fourOhFourDest, html, 'utf8');
  }
}

// 5. sitemap.xml の生成 (index対象のみ、重複排除)
console.log('🗺️ sitemap.xml を生成中...');
const sitemapUrlMap = new Map();
routes.forEach(route => {
  if (route.noindex) return;
  const targetPath = route.canonicalPath || route.path;
  if (sitemapUrlMap.has(targetPath)) return;

  const loc = `https://tripledatemap.com${targetPath === '/' ? '' : targetPath}`;
  const changefreq = targetPath === '/' ? 'daily' : targetPath.startsWith('/spots') ? 'weekly' : 'monthly';
  const priority = targetPath === '/' ? '1.0' : targetPath.startsWith('/courses') ? '0.8' : targetPath.startsWith('/spots') ? '0.7' : '0.5';

  sitemapUrlMap.set(targetPath, `  <url>
    <loc>${loc}</loc>
    <lastmod>2026-10-12</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
});

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(sitemapUrlMap.values()).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
console.log(`✅ sitemap.xml の出力完了！掲載URL数: ${sitemapUrlMap.size}件`);

// 6. robots.txt の生成
console.log('🤖 robots.txt を生成中...');
const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/*

Sitemap: https://tripledatemap.com/sitemap.xml
`;
fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt, 'utf8');
console.log('✅ robots.txt の出力完了！');

console.log('🎉 すべての静的プリレンダリング生成プロセスが正常終了しました！');
