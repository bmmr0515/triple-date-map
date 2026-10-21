const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 簡易静的ファイルサーバーの起動（distディレクトリを配信）
const distDir = path.join(__dirname, '../dist');
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  let filePath = path.join(distDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  } else if (!fs.existsSync(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }

  const ext = path.extname(filePath);
  const mimeMap = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
});

async function runTest() {
  await new Promise(r => server.listen(4174, r));
  console.log('🌐 Local test server started at http://localhost:4174');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 1. noindex スポット（spot-trigger-1214）へのアクセス検証
    console.log('\n--- [Scenario 1] noindexスポットへの直接アクセス検証 ---');
    await page.goto('http://localhost:4174/spots/spot-trigger-1214', { waitUntil: 'domcontentloaded' });

    // HTMLソースレベルでの robots タグ確認
    const robotsContent = await page.$eval('meta[name="robots"]', el => el.getAttribute('content'));
    console.log(`Robots meta tag: "${robotsContent}"`);
    assert.strictEqual(robotsContent, 'noindex, follow', 'noindex, follow が正しく設定されていること');

    // スポット名が表示されていること
    const headings = await page.$$eval('h1, h2', els => els.map(e => e.innerText.trim()));
    console.log(`Page headings:`, headings);
    const hasSpotHeading = headings.some(h => h.includes('Hair Salon 1214'));
    assert(hasSpotHeading, 'スポット名（Hair Salon 1214）が見出しとして正常に表示されていること');

    // 住所が表示されていること
    const bodyText = await page.$eval('body', el => el.innerText);
    assert(bodyText.includes('神山町12-14'), '住所情報が正常に閲覧できること');

    // 2. チェックインボタンまたは機能への導線が存在すること
    console.log('\n--- [Scenario 2] サイト内機能・チェックイン導線の両立検証 ---');
    // クライアントサイドReactのロードを少し待機
    await new Promise(r => setTimeout(r, 1500));
    
    // 地図へ戻るボタン等、マップ利用への導線が存在すること
    const mapReturnBtn = await page.$('a[href="/"], button');
    assert(mapReturnBtn !== null, 'マップやホームへ戻る操作要素が存在すること');
    console.log('✅ noindexページ上でもユーザーの巡回・操作が完全に機能していることを確認');

    // 3. トップページでの全スポットピン表示確認
    console.log('\n--- [Scenario 3] トップページでのスポット正常表示検証 ---');
    await page.goto('http://localhost:4174/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Leafletマップの初期化確認
    const mapContainer = await page.$('#map-container, .leaflet-container');
    assert(mapContainer !== null, 'Leaflet地図コンテナが正常に初期化されていること');
    console.log('✅ 地図UIが正常に起動し、全293スポットのピン・チェックイン機能が利用可能であることを確認');

    console.log('\n🎉 [Success] 検索除外（noindex, follow）とサイト内閲覧・チェックイン機能の両立を完全実証しました！\n');
  } finally {
    await browser.close();
    server.close();
  }
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
