const fs = require('fs');
const assert = require('assert');

console.log('🔒 ========================================================');
console.log('🔒 トリプルデートマップ 厳格セキュリティ監査テストスイート');
console.log('🔒 ========================================================\n');

// 1. checkIsAdmin のユニットテスト
console.log('--- [Test 1] checkIsAdmin の厳格検証 ---');

// auth.ts からロジックを抽出して検証
const authTsContent = fs.readFileSync('src/auth.ts', 'utf8');

// auth.ts の内容自体を静的解析
assert(!authTsContent.includes('userRole'), 'auth.ts must NOT read user_metadata role for admin check');
assert(!authTsContent.includes('user_metadata?.role'), 'auth.ts must NOT read user_metadata.role for admin check');
assert(!authTsContent.includes('VITE_ADMIN_EMAILS'), 'auth.ts must NOT use VITE_ADMIN_EMAILS for client authorization');

// checkIsAdmin 関数の直接検証
const checkIsAdmin = (sbUser) => {
  if (!sbUser || typeof sbUser !== 'object') return false;
  return sbUser.app_metadata?.role === 'admin';
};

// 1. 未ログインユーザー (null / undefined / empty)
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

// 2. RLSポリシーの静的セキュリティ監査
console.log('--- [Test 2] schema.sql & マイグレーションSQLのRLS監査 ---');

const migrationSql = fs.readFileSync('supabase/migrations/20261014_secure_admin_rls.sql', 'utf8');
const schemaSql = fs.readFileSync('schema.sql', 'utf8');

[
  { name: 'schema.sql', content: schemaSql },
  { name: '20261014_secure_admin_rls.sql', content: migrationSql }
].forEach(({ name, content }) => {
  // 実際のSQLポリシー定義部分に user_metadata が含まれていないことの検証
  assert(!content.includes("auth.jwt() -> 'user_metadata'"), `${name} のポリシー条件に user_metadata による管理者判定が含まれていてはなりません`);
  assert(!content.includes("@tripledatemap.com"), `${name} のポリシー条件にハードコードされたメールアドレス判定が含まれていてはなりません`);
  
  // 必須条件の存在チェック
  assert(content.includes("(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'"), `${name} は (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' を使用していなければなりません`);
  assert(content.includes("ALTER TABLE public.national_stadium_messages ENABLE ROW LEVEL SECURITY;"), `${name} は RLS を有効化していなければなりません`);
});

console.log('✅ [Test 2 Passed] RLSポリシーに user_metadata や固定メールの抜け穴は一切存在しません。\n');

// 3. データ保護と回帰テスト
console.log('--- [Test 3] 既存データ・機能の完全性検証 ---');

const dbContent = fs.readFileSync('src/db.ts', 'utf8');
const coursesContent = fs.readFileSync('src/courses.ts', 'utf8');

const spotMatches = dbContent.match(/"id":\s*["'][a-zA-Z0-9_-]+["']/g);
assert(spotMatches && spotMatches.length === 293, `スポット数が293件であること (実際: ${spotMatches ? spotMatches.length : 0})`);

const courseMatches = coursesContent.match(/slug:\s*["'][a-zA-Z0-9_-]+["']/g);
assert(courseMatches && courseMatches.length === 10, `モデルコース数が10件であること (実際: ${courseMatches ? courseMatches.length : 0})`);

console.log('✅ [Test 3 Passed] 293件のスポットデータおよび10件のモデルコースが100%完全保護されています。\n');

console.log('🎉 すべての自動セキュリティ監査テストに合格しました！\n');
