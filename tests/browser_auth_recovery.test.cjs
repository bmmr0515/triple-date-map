const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const assert = require('assert');

async function runBrowserTest() {
  console.log('🌐 Starting local preview server...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    stdio: 'pipe'
  });

  server.stdout.on('data', (d) => {
    // console.log(`[server]: ${d}`);
  });

  // サーバー起動待ち
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log('🌐 Launching headless browser (Puppeteer)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // -----------------------------------------------------------------
    // シナリオ 1: 期限切れURL（otp_expired）へのアクセス
    // -----------------------------------------------------------------
    console.log('\n--- [Scenario 1] 期限切れURL (#error_code=otp_expired) 検証 ---');
    const page1 = await browser.newPage();
    const expiredUrl = 'http://localhost:4173/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired';
    await page1.goto(expiredUrl, { waitUntil: 'networkidle0' });

    // URLからエラー情報がサニタイズされたか検証
    await page1.waitForFunction(() => !window.location.hash.includes('otp_expired'), { timeout: 5000 });
    const currentUrlAfterExpired = page1.url();
    console.log(`URL after sanitation: ${currentUrlAfterExpired}`);
    assert(!currentUrlAfterExpired.includes('otp_expired'), 'URLから otp_expired がサニタイズされていること');
    assert(!currentUrlAfterExpired.includes('access_denied'), 'URLから access_denied がサニタイズされていること');

    // 「リンクの有効期限が切れています」モーダルが表示されているか
    await page1.waitForSelector('text/リンクの有効期限が切れています', { timeout: 5000 });
    console.log('✅ 期限切れモーダルが正常に表示されました');

    // 再送ボタンが表示されているか
    const resendBtn = await page1.waitForSelector('button ::-p-text(再設定メールを再送する)', { timeout: 3000 });
    assert(resendBtn, '再送ボタンが存在すること');
    console.log('✅ 再設定メール再送フォームが確認できました');
    await page1.close();

    // -----------------------------------------------------------------
    // シナリオ 2: 偽トークン付与URLの排除検証（要件: 偽トークンだけでは変更可能にしない）
    // -----------------------------------------------------------------
    console.log('\n--- [Scenario 2] 偽トークン付与URLの排除 & URLサニタイズ検証 ---');
    const page2 = await browser.newPage();
    const fakeRecoveryUrl = 'http://localhost:4173/#access_token=fake_test_jwt_recovery_token&refresh_token=fake_refresh&type=recovery';
    await page2.goto(fakeRecoveryUrl, { waitUntil: 'networkidle0' });

    // 偽トークンではパスワード変更画面（「新しいパスワードの設定」）が開かないことを確認
    const modalHeading = await page2.$('text/新しいパスワードの設定');
    assert(!modalHeading, '🚨 偽トークンだけではパスワード変更モーダルが開かないこと！');
    console.log('✅ 偽トークンによる不正アクセスが正しくブロックされました');

    // Supabaseがセッションを確立できない場合、安全にURLからトークンが消去されること
    await page2.waitForFunction(() => !window.location.hash.includes('fake_test_jwt_recovery_token'), { timeout: 5000 });
    console.log('✅ 無効トークンが安全にURLからサニタイズされました');
    await page2.close();

    // -----------------------------------------------------------------
    // シナリオ 3: パスワード再設定画面の入力・強度検証 & セッションガード検証
    // -----------------------------------------------------------------
    console.log('\n--- [Scenario 3] パスワード再設定画面の入力・強度検証 & セッションガード検証 ---');
    const page3 = await browser.newPage();
    page3.on('console', msg => console.log('[page3 console]:', msg.text()));
    page3.on('pageerror', err => console.log('[page3 error]:', err));
    await page3.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    // パスワードリカバリー画面を開く
    await page3.evaluate(() => {
      if (typeof window.__triggerPasswordRecoveryTest === 'function') {
        window.__triggerPasswordRecoveryTest();
      }
    });

    // 「新しいパスワードの設定」モーダルが表示されているか
    await page3.waitForSelector('text/新しいパスワードの設定', { timeout: 5000 });
    console.log('✅ パスワード設定モーダルが正常に表示されました');

    // パスワード入力フィールドと強度インジケーター
    const inputs = await page3.$$('input[type="password"]');
    assert(inputs.length >= 2, '新しいパスワードと確認用の2つの入力欄が存在すること');

    // 最初に5文字入力して強度インジケーターを確認
    await inputs[0].type('Valid');
    let strengthIndicator = await page3.$('text/8文字以上');
    assert(strengthIndicator, '強度インジケーターが表示されること');

    // 残りの文字を入力して8文字以上・英数字混合を達成
    await inputs[0].type('Pass2026!');
    console.log('✅ パスワード強度インジケーターがリアルタイムに連動しました');

    // 確認用パスワードにも同じ文字列を入力
    await inputs[1].type('ValidPass2026!');

    // パスワードが一致している表示を確認
    await page3.waitForSelector('text/✓ パスワードが一致しています', { timeout: 3000 });
    console.log('✅ パスワード一致バリデーションが確認できました');

    // 送信ボタンをクリックして、セッションガード（有効セッションなしでの更新拒否）を検証
    const submitBtn = await page3.waitForSelector('button ::-p-text(パスワードを変更する)', { timeout: 3000 });
    await submitBtn.click();

    // セッションがないためエラーメッセージが表示されることを確認
    await page3.waitForSelector('text/有効な認証セッションが見つかりません', { timeout: 5000 });
    console.log('✅ 有効な認証セッションが無い状態での更新が厳格にブロックされました（セッションガード成功）');

    // モーダルの閉じるボタンで正常に閉じられることを確認
    const closeBtn = await page3.waitForSelector('button[aria-label="閉じる"]', { timeout: 3000 });
    await closeBtn.click();
    console.log('✅ モーダルが正常に閉じました');
    await page3.close();

    // -----------------------------------------------------------------
    // シナリオ 4: ログインモーダル内の「パスワードをお忘れの方はこちら」リンク
    // -----------------------------------------------------------------
    console.log('\n--- [Scenario 4] ログインモーダルからの再設定リクエスト導線検証 ---');
    const page4 = await browser.newPage();
    await page4.setViewport({ width: 1280, height: 800 });
    await page4.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    // 右上のログインボタンをクリックしてログインモーダルを開く
    await page4.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const loginBtn = buttons.find(b => b.textContent && b.textContent.trim() === 'ログイン');
      if (loginBtn) loginBtn.click();
    });

    await page4.waitForSelector('text/パスワードをお忘れの方はこちら', { timeout: 5000 });
    console.log('✅ ログインモーダル内に「パスワードをお忘れの方はこちら」が存在します');

    // クリックしてモード切り替え
    await page4.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const forgotBtn = buttons.find(b => b.textContent && b.textContent.includes('パスワードをお忘れの方'));
      if (forgotBtn) forgotBtn.click();
    });

    await page4.waitForSelector('text/🔑 パスワードの再設定', { timeout: 3000 });
    await page4.waitForSelector('text/再設定リンクを送信する', { timeout: 3000 });
    console.log('✅ パスワード再設定メール送信画面へ切り替わりました');
    await page4.close();

    // -----------------------------------------------------------------
    // シナリオ 5: 通常ログインダイアログの表示検証
    // -----------------------------------------------------------------
    console.log('\n--- [Scenario 5] 通常ログインフォーム表示検証 ---');
    const page5 = await browser.newPage();
    await page5.setViewport({ width: 1280, height: 800 });
    await page5.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    await page5.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const loginBtn = buttons.find(b => b.textContent && b.textContent.trim() === 'ログイン');
      if (loginBtn) loginBtn.click();
    });

    await page5.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page5.waitForSelector('input[type="password"]', { timeout: 5000 });
    console.log('✅ 通常ログインフォームが正常に開きました');
    await page5.close();

    console.log('\n🎉 [Success] すべての実ブラウザシナリオ検証（通常ログイン、期限切れ、偽トークン拒否、導線）に合格しました！');

  } finally {
    await browser.close();
    server.kill();
  }
}

runBrowserTest().catch((err) => {
  console.error('❌ Browser test failed:', err);
  process.exit(1);
});
