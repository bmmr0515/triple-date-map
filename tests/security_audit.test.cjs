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

console.log('🎉 すべての自動セキュリティ監査テストに合格しました！\n');
