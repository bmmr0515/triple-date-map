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
    const page = await browser.newPage();

    // -----------------------------------------------------------------
    // シナリオ 1: 期限切れURL（otp_expired）へのアクセス
    // -----------------------------------------------------------------
    console.log('\n--- [Scenario 1] 期限切れURL (#error_code=otp_expired) 検証 ---');
    const expiredUrl = 'http://localhost:4173/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired';
    await page.goto(expiredUrl, { waitUntil: 'networkidle0' });

    // URLからエラー情報がサニタイズされたか検証
    const currentUrlAfterExpired = page.url();
    console.log(`URL after sanitation: ${currentUrlAfterExpired}`);
    assert(!currentUrlAfterExpired.includes('otp_expired'), 'URLから otp_expired がサニタイズされていること');
    assert(!currentUrlAfterExpired.includes('access_denied'), 'URLから access_denied がサニタイズされていること');

    // 「リンクの有効期限が切れています」モーダルが表示されているか
    await page.waitForSelector('text/リンクの有効期限が切れています', { timeout: 5000 });
    console.log('✅ 期限切れモーダルが正常に表示されました');

    // 再送ボタンが表示されているか
    const resendBtn = await page.waitForSelector('button ::-p-text(再設定メールを再送する)', { timeout: 3000 });
    assert(resendBtn, '再送ボタンが存在すること');
    console.log('✅ 再設定メール再送フォームが確認できました');

    // -----------------------------------------------------------------
    // シナリオ 2: リカバリーURL (#access_token=...&type=recovery) 検証
    // -----------------------------------------------------------------
    console.log('\n--- [Scenario 2] パスワード再設定URL (#access_token=...&type=recovery) 検証 ---');
    const page2 = await browser.newPage();
    page2.on('console', msg => {
      // console.log(`[Browser Console]: ${msg.text()}`);
    });

    const recoveryUrl = 'http://localhost:4173/#access_token=fake_test_jwt_recovery_token&refresh_token=fake_refresh&type=recovery';
    await page2.goto(recoveryUrl, { waitUntil: 'networkidle0' });

    // URLから access_token / refresh_token がサニタイズされたか
    await page2.waitForFunction(() => !window.location.hash.includes('access_token'), { timeout: 5000 });
    const currentUrlAfterRecovery = page2.url();
    console.log(`URL after sanitation: ${currentUrlAfterRecovery}`);
    assert(!currentUrlAfterRecovery.includes('fake_test_jwt_recovery_token'), 'URLから access_token がサニタイズされていること');
    assert(!currentUrlAfterRecovery.includes('type=recovery'), 'URLから type=recovery がサニタイズされていること');
    console.log('✅ URLトークンの即時サニタイズ（ログ・履歴保護）が成功しました');

    // 「新しいパスワードの設定」モーダルが表示されているか
    await page2.waitForSelector('text/新しいパスワードの設定', { timeout: 5000 });
    console.log('✅ パスワード設定モーダルが正常に表示されました');

    // パスワード入力フィールドとバリデーション
    const inputs = await page2.$$('input[type="password"]');
    assert(inputs.length >= 2, '新しいパスワードと確認用の2つの入力欄が存在すること');

    // 8文字未満を入力して強度インジケーターのチェック
    await inputs[0].type('short');
    let strengthIndicator = await page2.$('text/8文字以上');
    assert(strengthIndicator, '強度インジケーターが表示されること');
    console.log('✅ パスワード強度インジケーターがリアルタイムに連動しました');


    // -----------------------------------------------------------------
    // シナリオ 3: ログインモーダル内の「パスワードをお忘れの方はこちら」リンク
    // -----------------------------------------------------------------
    console.log('\n--- [Scenario 3] ログインモーダルからの再設定リクエスト導線検証 ---');
    const page3 = await browser.newPage();
    await page3.setViewport({ width: 1280, height: 800 });
    await page3.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    // 右上のログインボタンをクリックしてログインモーダルを開く
    await page3.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const loginBtn = buttons.find(b => b.textContent && b.textContent.trim() === 'ログイン');
      if (loginBtn) loginBtn.click();
    });

    await page3.waitForSelector('text/パスワードをお忘れの方はこちら', { timeout: 5000 });
    console.log('✅ ログインモーダル内に「パスワードをお忘れの方はこちら」が存在します');

    // クリックしてモード切り替え
    await page3.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const forgotBtn = buttons.find(b => b.textContent && b.textContent.includes('パスワードをお忘れの方'));
      if (forgotBtn) forgotBtn.click();
    });

    await page3.waitForSelector('text/🔑 パスワードの再設定', { timeout: 3000 });
    await page3.waitForSelector('text/再設定リンクを送信する', { timeout: 3000 });
    console.log('✅ パスワード再設定メール送信画面へ切り替わりました');

    console.log('\n🎉 [Success] すべての実ブラウザシナリオ検証に合格しました！');

  } finally {
    await browser.close();
    server.kill();
  }
}

runBrowserTest().catch((err) => {
  console.error('❌ Browser test failed:', err);
  process.exit(1);
});
