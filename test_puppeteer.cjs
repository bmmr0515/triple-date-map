const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  // Helper to dismiss modals
  const dismissModals = async () => {
    await page.evaluate(() => {
      const popBtns = Array.from(document.querySelectorAll('button'));
      const playBtn = popBtns.find(b => b.textContent.includes('さっそく遊ぶ') || b.textContent.includes('わかった！') || b.textContent.includes('閉じる'));
      if (playBtn) playBtn.click();
      const skipBtn = popBtns.find(b => b.textContent.includes('スキップ'));
      if (skipBtn) skipBtn.click();
    });
  };

  // ==========================================
  // Test 1: Check if the gallery button is hidden for guest users inside stadium board modal
  // ==========================================
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    console.log("Main Page loaded!");
  } catch (e) {
    console.error("Failed to load page:", e);
    await browser.close();
    process.exit(1);
  }

  // Dismiss welcome notice if present
  await dismissModals();
  // Wait for the special stadium welcome modal to pop up (1s in App.tsx)
  await new Promise(r => setTimeout(r, 1500));

  console.log("Focusing on National Stadium from welcome modal...");
  const clickedFocus = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('マップで国立競技場を見る'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log("Clicked 'マップで国立競技場を見る' button:", clickedFocus);

  await new Promise(r => setTimeout(r, 1500));

  console.log("Opening stadium board modal...");
  const clickedOpenBoard = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('寄せ書きメッセージを書く / 見る'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log("Clicked '寄せ書きメッセージを書く / 見る' button:", clickedOpenBoard);

  await new Promise(r => setTimeout(r, 1000));

  const guestGalleryBtnExists = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(b => b.textContent.includes('寄せ書きギャラリーを開く'));
  });
  console.log("Guest Gallery Button Exists in Board Modal (should be false):", guestGalleryBtnExists);

  // Close the stadium board modal
  console.log("Closing board modal...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const closeBtn = buttons.find(b => b.style.position === 'absolute' && b.style.top === '16px');
    if (closeBtn) {
      closeBtn.click();
      return true;
    }
    return false;
  });
  await new Promise(r => setTimeout(r, 1000));

  // ==========================================
  // Test 2: Accessing gallery paths directly should fall back to App (Even for Admin)
  // ==========================================
  console.log("Accessing /messages/gallery directly (should fall back)...");
  await page.goto('http://localhost:5173/messages/gallery', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const accessRestricted1 = await page.evaluate(() => {
    const hasGalleryTitle = document.body.textContent.includes('寄せ書きメッセージギャラリー');
    const hasMap = !!document.querySelector('.leaflet-container');
    return !hasGalleryTitle && hasMap;
  });
  console.log("Access to /messages/gallery Blocked (should be true):", accessRestricted1);

  console.log("Accessing /admin/gallery directly (should fall back)...");
  await page.goto('http://localhost:5173/admin/gallery', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const accessRestricted2 = await page.evaluate(() => {
    const hasGalleryTitle = document.body.textContent.includes('寄せ書きメッセージギャラリー');
    const hasMap = !!document.querySelector('.leaflet-container');
    return !hasGalleryTitle && hasMap;
  });
  console.log("Access to /admin/gallery Blocked (should be true):", accessRestricted2);

  // ==========================================
  // Test 3: Log in as admin and verify the dashboard contents
  // ==========================================
  console.log("Navigating to admin page...");
  await page.goto('http://localhost:5173/admin/messages', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const passwordInput = 'input[type="password"]';
  await page.waitForSelector(passwordInput);
  await page.type(passwordInput, 'triple-date-admin-2026');
  
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const adminPageVerified = await page.evaluate(() => {
    const hasAdminTitle = document.body.textContent.includes('寄せ書き管理ダッシュボード');
    const buttons = Array.from(document.querySelectorAll('button'));
    const hasGalleryBtn = buttons.some(b => b.textContent.includes('ギャラリーを確認'));
    return hasAdminTitle && !hasGalleryBtn; // Gallery button should NOT exist
  });
  console.log("Admin Dashboard Logged In & Gallery Button does NOT Exist (should be true):", adminPageVerified);

  // ==========================================
  // Test 4: Verify Admin cannot view Message Gallery via direct URL even when authenticated
  // ==========================================
  console.log("Attempting to access message gallery directly as authenticated admin...");
  await page.goto('http://localhost:5173/admin/gallery', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const adminBlockedFromGallery = await page.evaluate(() => {
    const hasGalleryTitle = document.body.textContent.includes('寄せ書きメッセージギャラリー');
    const hasMap = !!document.querySelector('.leaflet-container');
    return !hasGalleryTitle && hasMap; // Should fall back to map
  });
  console.log("Authenticated Admin Access to Gallery Blocked (should be true):", adminBlockedFromGallery);

  // ==========================================
  // Test 5: Verify Gallery Button is not visible on map inside stadium board modal for Admin
  // ==========================================
  // We are already redirected to map page
  await dismissModals();
  await new Promise(r => setTimeout(r, 1000));

  // Switch to list view tab
  console.log("Switching to list view...");
  const clickedListTab = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const listTabBtn = buttons.find(b => b.textContent.includes('リスト'));
    if (listTabBtn) {
      listTabBtn.click();
      return true;
    }
    return false;
  });
  console.log("Switched to list view tab:", clickedListTab);
  await new Promise(r => setTimeout(r, 1000));

  // Open National Stadium details from spot list
  console.log("Searching for National Stadium in the list...");
  const searchInputSelector = 'input[placeholder="スポット名、関連曲、住所、キーワードで検索..."]';
  await page.waitForSelector(searchInputSelector);
  await page.type(searchInputSelector, '国立競技場');
  await new Promise(r => setTimeout(r, 1000));

  console.log("Opening National Stadium details from spot list...");
  const clickedDetail = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.list-spot-card'));
    const stadiumCard = cards.find(card => card.textContent.includes('国立競技場'));
    if (stadiumCard) {
      const buttons = Array.from(stadiumCard.querySelectorAll('button'));
      const detailBtn = buttons.find(b => b.textContent.includes('詳細') || b.textContent.includes('地図で見る'));
      if (detailBtn) {
        detailBtn.click();
        return true;
      }
    }
    return false;
  });
  console.log("Clicked stadium detail button:", clickedDetail);
  
  await new Promise(r => setTimeout(r, 1500));

  // Open stadium board modal
  console.log("Opening stadium board modal...");
  const clickedBoardAdmin = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const boardBtn = buttons.find(b => b.textContent.includes('寄せ書きメッセージを書く / 見る'));
    if (boardBtn) {
      boardBtn.click();
      return true;
    }
    return false;
  });
  console.log("Clicked '寄せ書きメッセージを書く / 見る' button:", clickedBoardAdmin);
  
  await new Promise(r => setTimeout(r, 1500));

  const adminGalleryBtnOnMap = await page.evaluate(() => {
    const isAuth = sessionStorage.getItem('tdm_admin_authenticated');
    const buttons = Array.from(document.querySelectorAll('button'));
    const hasBtn = buttons.some(b => b.textContent.includes('寄せ書きギャラリーを開く'));
    return {
      isAuth,
      hasBtn,
      buttonsText: buttons.map(b => b.textContent)
    };
  });
  console.log("SessionStorage 'tdm_admin_authenticated' status:", adminGalleryBtnOnMap.isAuth);
  console.log("Visible buttons:", adminGalleryBtnOnMap.buttonsText);
  console.log("Admin Map does NOT show Gallery Button (should be false):", !adminGalleryBtnOnMap.hasBtn);

  await browser.close();
})();
