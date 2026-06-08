const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    console.log("Page loaded!");
  } catch (e) {
    console.error("Failed to load page:", e);
    await browser.close();
    process.exit(1);
  }

  // 1. Dismiss tutorial modals
  await page.evaluate(() => {
    const popBtns = Array.from(document.querySelectorAll('button'));
    const playBtn = popBtns.find(b => b.textContent.includes('さっそく遊ぶ') || b.textContent.includes('わかった！') || b.textContent.includes('閉じる'));
    if (playBtn) {
      playBtn.click();
      console.log("Dismissed welcome/play modal");
    }
    const skipBtn = popBtns.find(b => b.textContent.includes('スキップ'));
    if (skipBtn) {
      skipBtn.click();
      console.log("Dismissed tutorial modal");
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  // 2. Load all spots by clicking "さらに読み込む" loop
  console.log("Loading all spots...");
  let loadCount = 0;
  while (loadCount < 10) {
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const loadMoreBtn = buttons.find(b => b.textContent.includes('さらに読み込む'));
      if (loadMoreBtn) {
        loadMoreBtn.click();
        return true;
      }
      return false;
    });
    if (!clicked) break;
    loadCount++;
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(`Pagination finished. Clicked 'Load More' ${loadCount} times.`);

  // 3. ZERO BLANC Spot Exist Check
  const zeroBlancExists = await page.evaluate(() => {
    return document.body.textContent.includes('ZERO BLANC');
  });
  console.log("ZERO BLANC Spot Exist in DOM:", zeroBlancExists);

  // 4. ミッションの存在確認
  // ミッションタブをクリックしてミッションを表示させる
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const missionBtn = buttons.find(b => b.textContent.includes('ミッション'));
    if (missionBtn) {
      missionBtn.click();
      return true;
    }
    return false;
  });
  await new Promise(r => setTimeout(r, 1000));

  const moratoriumMissionExists = await page.evaluate(() => {
    const textContent = document.body.textContent;
    return textContent.includes('大好きでずるい人') && textContent.includes('モラトリアム 巡礼ミッション');
  });
  console.log("Moratorium Mission Exist:", moratoriumMissionExists);

  // 5. 絞り込みフィルターの確認
  await page.evaluate(() => {
    const select = document.querySelector('select');
    if (select) {
      select.value = 'moratorium';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  });
  await new Promise(r => setTimeout(r, 1000));

  const filteredSpotsCount = await page.evaluate(() => {
    const listContainer = document.querySelector('.info-scroll-area');
    const items = listContainer ? listContainer.textContent : '';
    const hasStellato = items.includes('Stellato');
    const hasParkmall = items.includes('パークモール');
    const hasZeroBlanc = items.includes('ZERO BLANC'); // ZERO BLANC shouldn't be in the moratorium filter
    console.log("Filtered panel content includes Stellato:", hasStellato, "Parkmall:", hasParkmall, "ZERO BLANC (should be false):", hasZeroBlanc);
    return hasStellato && hasParkmall && !hasZeroBlanc ? 7 : 0;
  });
  console.log("Filtered moratorium spots check:", filteredSpotsCount === 7 ? "OK" : "FAILED");

  // 6. Stellato詳細の動画埋め込み確認
  // フィルターを元に戻す
  await page.evaluate(() => {
    const select = document.querySelector('select');
    if (select) {
      select.value = 'すべて';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    // 聖地詳細タブを選択
    const buttons = Array.from(document.querySelectorAll('button'));
    const detailTabBtn = buttons.find(b => b.textContent.includes('詳細') || b.textContent.includes('聖地詳細'));
    if (detailTabBtn) detailTabBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Stellato の詳細を開く (DOMを遡って正しいボタンを特定)
  const detailOpened = await page.evaluate(() => {
    const headers = Array.from(document.querySelectorAll('h3'));
    const stellatoHeader = headers.find(h => h.textContent.includes('Stellato'));
    if (stellatoHeader) {
      let parent = stellatoHeader.parentElement;
      while (parent) {
        const detailBtn = Array.from(parent.querySelectorAll('button')).find(b => b.textContent.includes('詳細'));
        if (detailBtn) {
          detailBtn.click();
          return true;
        }
        parent = parent.parentElement;
      }
    }
    return false;
  });
  console.log("Click Stellato detail button:", detailOpened);

  await new Promise(r => setTimeout(r, 2000));

  // YouTubeのiframeが詳細エリアにあるか確認
  const youtubeIframeExists = await page.evaluate(() => {
    const videoBox = document.querySelector('.video-section, .video-box');
    if (videoBox) {
      const iframe = videoBox.querySelector('iframe');
      return !!iframe && iframe.src.includes('youtube.com/embed/ZROuG57QGls');
    }
    return false;
  });
  console.log("YouTube iframe for Moratorium exists:", youtubeIframeExists);

  await browser.close();
})();
