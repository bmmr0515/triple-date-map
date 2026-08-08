const fs = require('fs');
const path = require('path');

// ⚙️ ユーティリティ関数
// パス再帰作成
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

// スラッグ自動生成 (db.ts の実装と同期)
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

console.log('🚀 静的プリレンダリングの開始...');

// 📁 ファイルパス定義
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

// デフォルト値の補完 (db.ts の getSpots ロジックを再現)
const spots = rawSpots.map(spot => {
  let slug = spot.slug || generateSlug(spot.name);
  if (!slug || slug === '-' || slug.trim() === '') {
    slug = `spot-${spot.id}`;
  }
  const status = spot.status || 'published';
  const address = spot.address || '日本、東京都周辺';
  const nearest_station = spot.nearest_station || '最寄り駅情報なし';
  const walk_time = spot.walk_time || '徒歩時間情報なし';
  const scene = spot.scene || 'MVに登場した名場面シーン';
  const visitor_notes = spot.visitor_notes || '特になし。近隣住民の方へのご迷惑にならないようマナーを守って訪問しましょう。';
  const check_points = spot.check_points || ['現地での記念撮影', '周辺の散策'];
  const last_confirmed_date = spot.last_confirmed_date || '2026-06-29';
  
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

// 2. コースデータの抽出
console.log('📦 モデルコースデータを解析中...');
const coursesTsPath = path.join(__dirname, '../src/courses.ts');
const coursesTsContent = fs.readFileSync(coursesTsPath, 'utf8');
const startIdxCourses = coursesTsContent.indexOf('const INITIAL_COURSES: Course[] = [');

if (startIdxCourses === -1) {
  console.error('❌ エラー: courses.ts 内の INITIAL_COURSES の検出に失敗しました。');
  process.exit(1);
}

bracketCount = 0;
let coursesArrayString = '';
for (let i = startIdxCourses + 'const INITIAL_COURSES: Course[] = '.length; i < coursesTsContent.length; i++) {
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

// 3. 記事データの抽出
console.log('📦 記事データを解析中...');
const articlesTsPath = path.join(__dirname, '../src/articles.ts');
const articlesTsContent = fs.readFileSync(articlesTsPath, 'utf8');
const startIdxArticles = articlesTsContent.indexOf('const INITIAL_ARTICLES: Article[] = [');

if (startIdxArticles === -1) {
  console.error('❌ エラー: articles.ts 内の INITIAL_ARTICLES の検出に失敗しました。');
  process.exit(1);
}

let articlesBracketCount = 0;
let articlesArrayString = '';
for (let i = startIdxArticles + 'const INITIAL_ARTICLES: Article[] = '.length; i < articlesTsContent.length; i++) {
  const char = articlesTsContent[i];
  if (char === '[') articlesBracketCount++;
  if (char === ']') articlesBracketCount--;
  articlesArrayString += char;
  if (articlesBracketCount === 0 && articlesArrayString.trim().startsWith('[')) {
    break;
  }
}

let articles = [];
try {
  articles = eval('(' + articlesArrayString + ')');
} catch (e) {
  console.error('❌ エラー: INITIAL_ARTICLES の eval パースに失敗しました。', e);
  process.exit(1);
}

// 🌐 プリレンダリング用ルートリスト定義
const routes = [
  // 固定・一覧ページ
  { path: '/', title: 'トリプルデートマップ - イコノイジョイ聖地巡礼ファンマップ', desc: '＝LOVE・≠ME・≒JOY（イコノイジョイ）のMVロケ地、ライブ会場、聖地店舗などを探せる非公式ファンマップ。GPSチェックインや称号の獲得も楽しめます！' },
  { path: '/about', title: 'このサイトについて - トリプルデートマップ', desc: 'トリプルデートマップの概要、目的、使い方などを解説するページです。' },
  { path: '/profile', title: '運営者情報 - トリプルデートマップ', desc: 'トリプルデートマップの運営者プロフィールおよび開発の経緯をご紹介します。' },
  { path: '/contact', title: 'お問い合わせ - トリプルデートマップ', desc: 'トリプルデートマップへのご連絡、データの修正依頼、お問い合わせ窓口です。' },
  { path: '/privacy', title: 'プライバシーポリシー - トリプルデートマップ', desc: 'トリプルデートマップにおける個人情報の取り扱いおよびCookie等に関する方針です。' },
  { path: '/terms', title: '利用規約 - トリプルデートマップ', desc: 'トリプルデートマップをご利用いただく際の規約と免責事項を定めています。' },
  { path: '/disclaimer', title: '免責事項 - トリプルデートマップ', desc: '当サイトの提供情報に関する保証の有無や免責事項について明記しています。' },
  { path: '/copyright', title: '著作権・権利者への配慮 - トリプルデートマップ', desc: '肖像権や著作権などの知的財産権に対する配慮方針について説明しています。' },
  { path: '/guide', title: '初めての方向けガイド - トリプルデートマップ', desc: '当サイトの使い方や聖地巡礼のマナー、安全な訪問の仕方をまとめています。' },
  { path: '/spots', title: '聖地スポット一覧 - トリプルデートマップ', desc: '登録されているすべての聖地巡礼ロケ地・イベント会場などのスポット一覧です。' },
  { path: '/areas', title: '地域別聖地一覧 - トリプルデートマップ', desc: '都道府県や市区町村などの地域別に分類された聖地一覧ページです。' },
  { path: '/groups', title: 'グループ別聖地一覧 - トリプルデートマップ', desc: '=LOVE（イコラブ）、≠ME（ノイミー）、≒JOY（ニアジョイ）のグループ別聖地一覧です。' },
  { path: '/songs', title: '作品・楽曲別聖地一覧 - トリプルデートマップ', desc: 'ミュージックビデオ（MV）やロケ番組などの作品・楽曲別の聖地一覧です。' },
  { path: '/courses', title: '聖地巡礼モデルコース一覧 - トリプルデートマップ', desc: '効率よく聖地を回れるおすすめのモデルコース情報一覧です。' },
  { path: '/articles', title: '巡礼コラム・レポート一覧 - トリプルデートマップ', desc: 'イコノイジョイの聖地ロケ地巡礼に関する詳細なレポートコラムや、背景解説記事の一覧です。' }
];

// 個別スポットを追加
spots.forEach(spot => {
  if (spot.status === 'published') {
    routes.push({
      path: `/spots/${spot.slug}`,
      title: `${spot.name}（${spot.group}聖地） - トリプルデートマップ`,
      desc: `${spot.name}のロケ地情報・場面解説。${spot.scene}。所在地: ${spot.address}。最寄り駅: ${spot.nearest_station}（徒歩${spot.walk_time}）。`,
      isSpot: true,
      spotData: spot
    });
  }
});

// コースを追加
courses.forEach(course => {
  routes.push({
    path: `/courses/${course.slug}`,
    title: `${course.name}（聖地巡礼モデルコース） - トリプルデートマップ`,
    desc: `${course.name}の巡礼コース。所要時間: ${course.duration}、移動手段: ${course.transportation}。効率的な回り方と周辺おすすめカフェ情報を掲載。`,
    isCourse: true,
    courseData: course
  });
});

// コラムを追加
articles.forEach(article => {
  routes.push({
    path: `/articles/${article.slug}`,
    title: `${article.title} - トリプルデートマップ`,
    desc: article.excerpt,
    isArticle: true,
    articleData: article
  });
});

// 3. プリレンダリング処理実行
routes.forEach(route => {
  console.log(`📝 プリレンダリング生成中: ${route.path}`);
  
  let html = templateHtml;
  
  // A. メタデータの置換 (title, description, canonical, OGP)
  const canonicalUrl = `https://tripledatemap.com${route.path}`;
  const ogImage = 'https://tripledatemap.com/ogp-image.png'; // 必要に応じて差し替え
  
  // title 置換
  html = html.replace(/<title>[^<]*<\/title>/g, `<title>${route.title}</title>`);
  
  // meta tags の差し替え・挿入
  const metaTags = `
  <meta name="description" content="${route.desc}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta property="og:title" content="${route.title}" />
  <meta property="og:description" content="${route.desc}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:type" content="${route.path === '/' ? 'website' : 'article'}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${route.title}" />
  <meta name="twitter:description" content="${route.desc}" />
  <meta name="twitter:image" content="${ogImage}" />
  `;
  
  // </head> の直前にメタタグを差し込む
  html = html.replace('</head>', `${metaTags}\n</head>`);
  
  // B. クローラー用の主要テキストHTMLコンテンツのインジェクション (<div id="root"> の中)
  let bodyContent = '';
  
  if (route.path === '/') {
    // トップページ用のHTML構造
    bodyContent = `
      <div class="prerendered-content" style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1>トリプルデートマップ (非公式)</h1>
        <p>＝LOVE・≠ME・≒JOY（イコノイジョイ）の聖地巡礼ファンマップ</p>
        <p>${route.desc}</p>
        <nav>
          <ul>
            <li><a href="/spots">聖地スポット一覧</a></li>
            <li><a href="/areas">地域から探す</a></li>
            <li><a href="/groups">グループから探す</a></li>
            <li><a href="/songs">作品・楽曲から探す</a></li>
            <li><a href="/courses">モデルコース一覧</a></li>
            <li><a href="/guide">初めての方向けガイド</a></li>
            <li><a href="/about">このサイトについて</a></li>
            <li><a href="/privacy">プライバシーポリシー</a></li>
          </ul>
        </nav>
        <h2>おすすめスポット</h2>
        <ul>
          ${spots.slice(0, 5).map(s => `<li><a href="/spots/${s.slug}">${s.name} (${s.group})</a></li>`).join('')}
        </ul>
      </div>
    `;
  } else if (route.isSpot) {
    const s = route.spotData;
    // パンくず
    const breadcrumbs = `
      <nav aria-label="breadcrumb">
        <ol style="display:flex; list-style:none; padding:0; font-size:11px; gap:8px;">
          <li><a href="/">トップ</a> &gt;</li>
          <li><a href="/groups">${s.group}</a> &gt;</li>
          <li><a href="/spots">${s.name}</a></li>
        </ol>
      </nav>
    `;
    
    // 構造化データ
    const structData = {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      "name": s.name,
      "description": s.description,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": s.address
      },
      "url": canonicalUrl
    };
    
    const showAddress = s.address && !s.address.includes('日本、東京都周辺');
    const showAccess = s.nearest_station && !s.nearest_station.includes('最寄り駅情報なし');
    const showScene = s.scene && !s.scene.includes('MVに登場した名場面シーン');
    const showNotes = s.visitor_notes && !s.visitor_notes.includes('特になし');

    let accessText = '';
    if (showAccess) {
      const walkText = s.walk_time && !s.walk_time.includes('徒歩時間情報なし') ? ` (徒歩 ${s.walk_time})` : '';
      accessText = `<li><strong>最寄り駅:</strong> ${s.nearest_station}${walkText}</li>`;
    }
    
    const showYoutube = s.youtube_title || s.youtube_url;
    let youtubeSection = '';
    if (showYoutube) {
      youtubeSection = `
        <h2>登場作品・関連動画</h2>
        ${s.youtube_title ? `<p><strong>作品名:</strong> ${s.youtube_title.replace('🎥 関連映像: ', '').replace('🎥 関連映像：', '')}</p>` : ''}
        ${s.youtube_url ? `
        <div class="video-container" style="width: 100%; aspect-ratio: 16/9; max-width: 560px; margin: 16px 0; border-radius: 12px; overflow: hidden; background: #000;">
          ${s.youtube_url.includes('<iframe') ? s.youtube_url.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"') : `<iframe width="100%" height="100%" src="${s.youtube_url}" frameborder="0" allowfullscreen></iframe>`}
        </div>` : ''}
      `;
    }

    const rewardSection = s.reward_title ? `
      <h2>巡礼チェックイン特典</h2>
      <p>実際に現地を訪れてGPSチェックインを達成すると、限定アワード称号 <strong>✨【${s.reward_title}】</strong> を獲得できます！</p>
    ` : '';

    const adSectionPrerender = `
      <!-- AdSense / Banner Ad Area -->
      <div style="width: 100%; max-width: 336px; min-height: 250px; background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 12px; margin: 30px auto; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; font-size: 11px; gap: 8px;">
        <span style="font-size: 16px;">📰</span>
        <span>広告プレースホルダー (レクタングル広告)</span>
      </div>
    `;

    bodyContent = `
      <div class="prerendered-content" style="max-width: 800px; margin: 0 auto; padding: 20px;">
        ${breadcrumbs}
        <script type="application/ld+json">${JSON.stringify(structData)}</script>
        <h1>${s.name}</h1>
        <p><strong>グループ:</strong> ${s.group} | <strong>カテゴリ:</strong> ${s.category}</p>
        <hr/>
        <h2>聖地・ロケ地概要</h2>
        <p>${s.description}</p>
        ${showScene ? `<h2>場面説明・見どころ</h2>\n<p>${s.scene}</p>` : ''}
        ${(showAddress || showAccess) ? `
        <h2>ロケ地住所・最寄り駅アクセス</h2>
        <ul>
          ${showAddress ? `<li><strong>所在地:</strong> ${s.address}</li>` : ''}
          ${accessText}
        </ul>
        ` : ''}
        ${showNotes ? `<h2>訪問時の注意事項・マナー</h2>\n<p>${s.visitor_notes}</p>` : ''}
        
        <h2>現地注目チェックポイント</h2>
        <ul>
          ${s.check_points.map(cp => `<li>${cp}</li>`).join('')}
        </ul>

        ${youtubeSection}
        ${rewardSection}
        ${adSectionPrerender}

        <p style="margin-top: 40px;"><small>データ最終確認日: ${s.last_confirmed_date}</small></p>
        <p><a href="/contact?subject=${encodeURIComponent(s.name + 'の修正・情報提供')}">⚠️ この聖地スポット情報の修正・提供はこちら</a></p>
      </div>
    `;
  } else if (route.isCourse) {
    const c = route.courseData;
    const structData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": c.name,
      "description": route.desc,
      "author": {
        "@type": "Person",
        "name": "トリプルデートマップ運営部"
      }
    };
    
    bodyContent = `
      <div class="prerendered-content" style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <script type="application/ld+json">${JSON.stringify(structData)}</script>
        <h1>${c.name}</h1>
        <p><strong>所要時間:</strong> ${c.duration} | <strong>移動手段:</strong> ${c.transportation} | <strong>推奨時間帯:</strong> ${c.recommendedTime}</p>
        <p>${c.description}</p>
        <hr/>
        <h2>巡礼ルート・順番</h2>
        <ol>
          ${c.spots.map(cs => `
            <li>
              <h3>${cs.name}</h3>
              <p>${cs.comment}</p>
            </li>
          `).join('')}
        </ol>
        <h2>注意事項</h2>
        <p>${c.notes}</p>
        <h2>周辺おすすめ飲食店・カフェ情報</h2>
        <p>${c.cafeInfo}</p>
      </div>
    `;
  } else if (route.isArticle) {
    const a = route.articleData;
    const structData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": a.title,
      "description": a.excerpt,
      "datePublished": a.publishedAt,
      "author": {
        "@type": "Person",
        "name": "トリプルデートマップ編集部"
      }
    };

    const relatedSpotItems = spots.filter(s => a.relatedSpotIds?.includes(s.id));
    const relatedSpotsHtml = relatedSpotItems.length > 0 ? `
      <h2>この記事に関連する聖地スポット</h2>
      <ul>
        ${relatedSpotItems.map(s => `<li><a href="/spots/${s.slug}">${s.name} (${s.group})</a></li>`).join('')}
      </ul>
    ` : '';

    const formattedBodyHtml = a.content
      .split('\n\n')
      .map(p => {
        const t = p.trim();
        if (t.startsWith('####')) return `<h4>${t.replace(/^####\s*/, '')}</h4>`;
        if (t.startsWith('###')) return `<h3>${t.replace(/^###\s*/, '')}</h3>`;
        if (t.startsWith('##')) return `<h2>${t.replace(/^##\s*/, '')}</h2>`;
        if (t.startsWith('>')) {
          const blockContent = t.split('\n').map(line => line.replace(/^>\s*/, '')).join('<br/>');
          return `<blockquote style="background:#f8fafc; border-left:4px solid #a78bfa; padding:12px 18px; margin:20px 0; font-style:italic; color:#475569;">${blockContent}</blockquote>`;
        }
        return `<p>${t.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('\n');

    bodyContent = `
      <div class="prerendered-content" style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <script type="application/ld+json">${JSON.stringify(structData)}</script>
        <h1>${a.title}</h1>
        <p><small>公開日: ${a.publishedAt} | カテゴリ: ${a.category}</small></p>
        <hr/>
        <div class="article-text" style="font-size:14.5px; line-height:1.8; color:#334155;">
          ${formattedBodyHtml}
        </div>
        <hr/>
        ${relatedSpotsHtml}
        
        <!-- Ad Placeholder -->
        <div style="width:100%; max-width:336px; min-height:250px; background:#f8fafc; border:1.5px dashed #cbd5e1; border-radius:12px; margin:30px auto; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:11px;">
          広告プレースホルダー (レクタングル広告)
        </div>

        <p><a href="/articles">← コラム一覧へ戻る</a></p>
      </div>
    `;
  } else {
    // その他の固定・一覧ページ
    bodyContent = `
      <div class="prerendered-content" style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1>${route.title}</h1>
        <p>${route.desc}</p>
        <div style="margin-top:20px; font-size:13px; line-height:1.7;">
          プリレンダリングによる静的読み込みテキストです。JavaScript有効環境では完全なWebアプリ体験が提供されます。
        </div>
      </div>
    `;
  }
  
  // <div id="root"></div> に主要HTMLを挿入する
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyContent}</div>`);
  
  // 💾 ファイル書込み先の決定
  let outputFilePath;
  if (route.path === '/') {
    outputFilePath = path.join(DIST_DIR, 'index.html');
  } else {
    outputFilePath = path.join(DIST_DIR, route.path, 'index.html');
  }
  
  ensureDirectoryExistence(outputFilePath);
  fs.writeFileSync(outputFilePath, html, 'utf8');
});

// 4. sitemap.xml の生成
console.log('🗺️ sitemap.xml を生成中...');
const sitemapUrls = routes.map(route => {
  const loc = `https://tripledatemap.com${route.path === '/' ? '' : route.path}`;
  const lastmod = '2026-06-29';
  const changefreq = route.path === '/' ? 'daily' : 'weekly';
  const priority = route.path === '/' ? '1.0' : route.isSpot ? '0.8' : '0.5';
  
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>`;

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
console.log('✅ sitemap.xml の出力完了！');

// 5. robots.txt の生成
console.log('🤖 robots.txt を生成中...');
const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://tripledatemap.com/sitemap.xml
`;
fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt, 'utf8');
console.log('✅ robots.txt の出力完了！');

console.log('🎉 すべての静的プリレンダリング生成プロセスが正常終了しました！');
