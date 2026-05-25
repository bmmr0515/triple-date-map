const { execSync } = require('child_process');

console.log('🚀 Starting Fighter & Kyunkawa Pilgrim Mission Production Deployment Pipeline...');

try {
  // 1. 本番用コンパイルチェック (Vite & tsc)
  console.log('📦 Running build verification (npm run build)...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build verification successful!');

  // 2. 現在のGitブランチ名の取得
  console.log('🔍 Checking current Git branch...');
  const branchName = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  console.log(`📍 Current branch is: ${branchName}`);

  // 3. すべての変更をGitに追加
  console.log('📝 Adding all modified files to Git staging area...');
  execSync('git add -u', { stdio: 'inherit' });
  
  console.log('💾 Committing files...');
  const commitMsg = 'feat: 「排他的ファイター」「きゅんかわ人生」巡礼ミッション始動！新規スポット8箇所追加と限定称号2種類の実装';
  execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
  console.log('✅ Commit complete!');

  // 4. リモートへプッシュ（Vercel等の自動デプロイをトリガー）
  console.log(`📤 Pushing updates to origin ${branchName}...`);
  execSync(`git push origin ${branchName}`, { stdio: 'inherit' });
  console.log('🎉 Production deployment successfully triggered!');

} catch (error) {
  console.error('❌ Deployment pipeline failed:', error.message || error);
  process.exit(1);
}
