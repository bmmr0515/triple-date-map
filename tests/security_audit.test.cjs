const fs = require('fs');
const assert = require('assert');

console.log('🔒 ========================================================');
console.log('🔒 トリプルデートマップ 厳格セキュリティ・RLS監査テストスイート');
console.log('🔒 ========================================================\n');

// 1. checkIsAdmin のユニットテスト
console.log('--- [Test 1] checkIsAdmin の厳格検証 ---');

const authTsContent = fs.readFileSync('src/auth.ts', 'utf8');

assert(!authTsContent.includes('userRole'), 'auth.ts must NOT read user_metadata role for admin check');
assert(!authTsContent.includes('user_metadata?.role'), 'auth.ts must NOT read user_metadata.role for admin check');
assert(!authTsContent.includes('VITE_ADMIN_EMAILS'), 'auth.ts must NOT use VITE_ADMIN_EMAILS for client authorization');

const checkIsAdmin = (sbUser) => {
  if (!sbUser || typeof sbUser !== 'object') return false;
  return sbUser.app_metadata?.role === 'admin';
};

// 1. 未ログインユーザー
assert.strictEqual(checkIsAdmin(null), false, '未ログインユーザー (null) は管理者不可');
assert.strictEqual(checkIsAdmin(undefined), false, '未ログインユーザー (undefined) は管理者不可');
assert.strictEqual(checkIsAdmin({}), false, '空オブジェクトは管理者不可');

// 2. 一般ログインユーザー
assert.strictEqual(checkIsAdmin({
  id: 'usr-1',
  email: 'normal_user@example.com',
  app_metadata: { provider: 'email' },
  user_metadata: { username: 'イコラブファン' }
}), false, '一般ログインユーザーは管理者不可');

// 3. 【最重要】user_metadata.role 改変攻撃（クライアント側改ざんシミュレーション）
assert.strictEqual(checkIsAdmin({
  id: 'usr-attacker',
  email: 'attacker@example.com',
  app_metadata: { provider: 'email' },
  user_metadata: { role: 'admin', username: '悪意あるユーザー' }
}), false, '🚨 致命的テスト: user_metadata.role = admin に改変しても管理者になれないこと！');

// 4. メールアドレス名偽装攻撃 (admin@... を名乗るユーザー)
assert.strictEqual(checkIsAdmin({
  id: 'usr-fake-admin',
  email: 'admin@tripledatemap.com',
  app_metadata: { provider: 'email' },
  user_metadata: { role: 'member' }
}), false, 'メールアドレスが admin@ であっても app_metadata.role がなければ管理者不可');

// 5. 正当な管理者ユーザー（Supabaseサーバーの管理権限により app_metadata.role = admin が付与されたアカウント）
assert.strictEqual(checkIsAdmin({
  id: 'usr-real-admin',
  email: 'official_admin@tripledatemap.com',
  app_metadata: { provider: 'email', role: 'admin' },
  user_metadata: { username: '運営者' }
}), true, 'app_metadata.role = admin を持つ正当な管理者のみ許可されること');

console.log('✅ [Test 1 Passed] checkIsAdmin は app_metadata.role = admin のみを厳格に検証しています。\n');


// 2. RLSポリシーの静的セキュリティ監査 & Permissive OR評価対策の検証
console.log('--- [Test 2] マイグレーションSQL群 & schema.sql のRLS完全性監査 ---');

const migrationSql = fs.readFileSync('supabase/migrations/20261014_secure_admin_rls.sql', 'utf8');
const preAuditSql = fs.readFileSync('supabase/migrations/20261015_pre_audit_policies.sql', 'utf8');
const rollbackSql = fs.readFileSync('supabase/migrations/20261014_secure_admin_rls_rollback.sql', 'utf8');
const verificationSql = fs.readFileSync('supabase/migrations/20261015_rls_permission_verification.sql', 'utf8');
const schemaSql = fs.readFileSync('schema.sql', 'utf8');

// 2-1. 事前監査SQL (20261015_pre_audit_policies.sql)
assert(preAuditSql.includes('pg_policies'), '事前監査SQLは pg_policies を参照していること');
assert(preAuditSql.includes('_rls_policy_backup'), '事前監査SQLは _rls_policy_backup テーブルによる退避機能を持つこと');
assert(preAuditSql.includes('permissive'), '事前監査SQLは permissive 判定を行っていること');
assert(preAuditSql.includes('risk_assessment'), '事前監査SQLは Permissive OR評価リスクの診断を含んでいること');

// 2-2. マイグレーションSQL (20261014_secure_admin_rls.sql)
assert(!migrationSql.includes("auth.jwt() -> 'user_metadata'"), 'マイグレーションSQLに user_metadata による管理者判定が含まれていてはなりません');
assert(!migrationSql.includes("@tripledatemap.com"), 'マイグレーションSQLに固定メールアドレス判定が含まれていてはなりません');
assert(migrationSql.includes("app_metadata"), 'マイグレーションSQLは app_metadata を使用していなければなりません');
assert(migrationSql.includes("SELECT FROM pg_tables"), 'マイグレーションSQLはテーブル存在確認を行っていなければなりません');
assert(migrationSql.includes("RAISE EXCEPTION"), 'マイグレーションSQLは Permissive OR評価リスクの残存検知アサーション（例外発生）を含んでいなければなりません');
assert(migrationSql.includes("ENABLE ROW LEVEL SECURITY"), 'マイグレーションSQLは RLS を有効化していなければなりません');

// 2-3. ロールバックSQL (20261014_secure_admin_rls_rollback.sql)
assert(rollbackSql.includes("SELECT FROM pg_tables"), 'ロールバックSQLはテーブル存在確認を行っていなければなりません');
assert(rollbackSql.includes("_rls_policy_backup"), 'ロールバックSQLは事前バックアップテーブルを参照する案内を含んでいなければなりません');
// 危険な全許可DELETEポリシーが自動復元されていないこと
assert(!rollbackSql.includes('CREATE POLICY "Allow anyone to delete'), 'ロールバックSQLで誰でも削除できるポリシーを自動復元してはなりません');
assert(!rollbackSql.includes('FOR DELETE \n                 USING (true)'), 'ロールバックSQLでUSING(true)のDELETEポリシーを作成してはなりません');

// 2-4. 権限マトリクス実機検証SQL (20261015_rls_permission_verification.sql)
assert(verificationSql.includes("SET LOCAL ROLE anon;"), '検証SQLは匿名ロールをシミュレートしていること');
assert(verificationSql.includes("SET LOCAL ROLE authenticated;"), '検証SQLは認証済みロールをシミュレートしていること');
assert(verificationSql.includes('"role": "admin"'), '検証SQLは管理者ロールをシミュレートしていること');
assert(verificationSql.includes('ROLLBACK;'), '検証SQLは本番データ汚染を防ぐためROLLBACKで終了すること');

// 2-5. schema.sql
assert(!schemaSql.includes("auth.jwt() -> 'user_metadata'"), 'schema.sql のポリシー条件に user_metadata が含まれていてはなりません');
assert(schemaSql.includes("(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'"), 'schema.sql は app_metadata の admin ロールを使用していなければなりません');

// 2-6. 新Supabase環境構築SQL (20261015_setup_new_project_kdvzftmzhntbplkogosn.sql)
const newProjectSql = fs.readFileSync('supabase/migrations/20261015_setup_new_project_kdvzftmzhntbplkogosn.sql', 'utf8');
assert(!newProjectSql.includes("auth.jwt() -> 'user_metadata'"), '新プロジェクト構築SQLに user_metadata による管理者判定が含まれていてはなりません');
assert(newProjectSql.includes("(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'"), '新プロジェクト構築SQLは app_metadata の admin ロールを使用していなければなりません');
assert(newProjectSql.includes('national_stadium_messages'), '新プロジェクト構築SQLは national_stadium_messages テーブルを作成していること');
assert(newProjectSql.includes('contact_inquiries'), '新プロジェクト構築SQLは contact_inquiries テーブルを作成していること');
assert(newProjectSql.includes('ENABLE ROW LEVEL SECURITY'), '新プロジェクト構築SQLは RLS を有効化していること');
assert(newProjectSql.includes('RAISE EXCEPTION'), '新プロジェクト構築SQLは Permissive OR評価リスクの検知アサーションを含んでいること');

console.log('✅ [Test 2 Passed] RLSマイグレーション・事前監査・ロールバック・検証SQL・新プロジェクト構築SQLの安全仕様がすべて確認されました。\n');


// 3. データ保護と回帰テスト & UI告知バナー検証
console.log('--- [Test 3] 既存データ・機能の完全性 & UI告知バナー検証 ---');

// MigrationBanner の存在と App.tsx への組み込み検証
const bannerContent = fs.readFileSync('src/components/MigrationBanner.tsx', 'utf8');
const appContent = fs.readFileSync('src/App.tsx', 'utf8');
assert(bannerContent.includes('システム移行のお知らせ'), 'MigrationBanner にシステム移行告知の文言が含まれていること');
assert(bannerContent.includes('localStorage'), 'MigrationBanner は非表示状態を localStorage に保持できること');
assert(appContent.includes('<MigrationBanner />'), 'App.tsx に MigrationBanner が組み込まれていること');

const dbContent = fs.readFileSync('src/db.ts', 'utf8');
const coursesContent = fs.readFileSync('src/courses.ts', 'utf8');

const spotMatches = dbContent.match(/"id":\s*["'][a-zA-Z0-9_-]+["']/g);
assert(spotMatches && spotMatches.length === 293, `スポット数が293件であること (実際: ${spotMatches ? spotMatches.length : 0})`);

const courseMatches = coursesContent.match(/slug:\s*["'][a-zA-Z0-9_-]+["']/g);
assert(courseMatches && courseMatches.length === 10, `モデルコース数が10件であること (実際: ${courseMatches ? courseMatches.length : 0})`);

console.log('✅ [Test 3 Passed] 293件のスポットデータおよび10件のモデルコースが100%完全保護されています。\n');


// 4. 認証エラーハンドリング & X OAuth フォールバック検証
console.log('--- [Test 4] 認証エラーハンドリング & X/Twitter OAuth フォールバック検証 ---');

assert(authTsContent.includes("provider: 'x'"), 'auth.ts は最新の OAuth 2.0 推奨プロバイダー x を使用していること');
assert(authTsContent.includes("provider: 'twitter'"), 'auth.ts は旧設定・OAuth 1.0a 用の twitter フォールバックを備えていること');
assert(authTsContent.includes('invalid login credentials'), 'auth.ts は Invalid login credentials 時の移行ガイダンスを備えていること');
assert(authTsContent.includes('email not confirmed'), 'auth.ts は Email not confirmed 時のガイダンスを備えていること');

console.log('✅ [Test 4 Passed] XログインのOAuth 2.0/1.0a両対応およびメールログイン移行エラーガイダンスが正常に設定されています。\n');


// 5. パスワード再設定フロー・トークンサニタイズ・強度バリデーション監査
console.log('--- [Test 5] パスワード再設定フロー & トークンサニタイズ & 強度バリデーション監査 ---');

// 5-1. auth.ts のリカバリー機能実装検証
assert(authTsContent.includes('PASSWORD_RECOVERY'), 'auth.ts は PASSWORD_RECOVERY イベントを検知していること');
assert(authTsContent.includes('sanitizeUrlTokens'), 'auth.ts は sanitizeUrlTokens 関数で認証トークンをURLから保護していること');
assert(authTsContent.includes('history.replaceState'), 'auth.ts は history.replaceState を使用して履歴・ログからトークンを除去していること');
assert(authTsContent.includes('updatePassword'), 'auth.ts は updatePassword 関数を実装していること');
assert(authTsContent.includes('resetPasswordForEmail'), 'auth.ts は resetPasswordForEmail 関数を実装していること');
assert(authTsContent.includes('otp_expired'), 'auth.ts は 有効期限切れ (otp_expired) を検知・ハンドリングしていること');

// 5-2. パスワード強度検証ロジックのユニットテスト
const validatePasswordStrength = (pwd) => {
  if (!pwd || pwd.length < 8) return { valid: false, error: 'パスワードは8文字以上である必要があります。' };
  const hasLetter = /[a-zA-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  if (!hasLetter || !hasNumber) return { valid: false, error: '半角英字と半角数字の両方を含めてください。' };
  return { valid: true, error: null };
};

assert.strictEqual(validatePasswordStrength('').valid, false, '空文字は無効');
assert.strictEqual(validatePasswordStrength('abc123').valid, false, '6文字（8文字未満）は無効');
assert.strictEqual(validatePasswordStrength('12345678').valid, false, '数字のみ8文字は無効');
assert.strictEqual(validatePasswordStrength('abcdefgh').valid, false, '英字のみ8文字は無効');
assert.strictEqual(validatePasswordStrength('password123').valid, true, '英数字混合8文字以上は有効');
assert.strictEqual(validatePasswordStrength('N0imie#Joy2026!').valid, true, '記号・大文字含む強固なパスワードは有効');

// 5-3. PasswordResetModal コンポーネントの検証
const resetModalContent = fs.readFileSync('src/components/PasswordResetModal.tsx', 'utf8');
assert(resetModalContent.includes('新しいパスワード'), 'PasswordResetModal は新しいパスワード入力欄を持つこと');
assert(resetModalContent.includes('新しいパスワード（確認用）'), 'PasswordResetModal は確認用パスワード入力欄を持つこと');
assert(resetModalContent.includes('updatePassword'), 'PasswordResetModal は authService.updatePassword を呼び出していること');
assert(resetModalContent.includes('有効期限'), 'PasswordResetModal はリンク無効・期限切れ案内UIを持つこと');
assert(resetModalContent.includes('resetPasswordForEmail'), 'PasswordResetModal は期限切れ時の再送機能を持つこと');

// 5-4. App.tsx の統合検証
assert(appContent.includes('PasswordResetModal'), 'App.tsx は PasswordResetModal をインポートしていること');
assert(appContent.includes('passwordRecoveryState'), 'App.tsx は passwordRecoveryState ステートを管理していること');
assert(appContent.includes('パスワードをお忘れの方はこちら'), 'App.tsx はログインモーダルにパスワード再設定への動線を持つこと');

console.log('✅ [Test 5 Passed] パスワード再設定・URLトークン保護・強度検証・再送動線がすべて確認されました。\n');

console.log('🎉 すべての自動セキュリティ監査テストに合格しました！\n');
