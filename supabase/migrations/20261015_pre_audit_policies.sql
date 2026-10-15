-- ================================================================
-- 🔍 トリプルデートマップ: RLS事前監査 & バックアップSQL
-- File: supabase/migrations/20261015_pre_audit_policies.sql
-- 目的: 
--   1. 本番DBの対象テーブル存在確認とRLS有効状態の確認
--   2. pg_policies を用いた現行ポリシーの完全な可視化
--   3. Permissive PolicyのOR評価リスク（一般・匿名への意図せぬ権限漏洩）の特定
--   4. マイグレーション前のポリシー定義の安全なバックアップ
-- ================================================================
-- 💡 使い方:
--   Supabase管理画面の「SQL Editor」に本スクリプトを貼り付けて「Run」を実行してください。
--   SELECT結果が表示され、現在の設定状況と潜在的リスクが一覧で確認できます。
--   ※本スクリプトは読み取りおよびバックアップテーブル作成のみを行い、既存データや運用ポリシーの削除・変更は一切行いません。
-- ================================================================

-- ----------------------------------------------------------------
-- 1. 対象テーブルの存在確認および RLS 有効化ステータス確認
-- ----------------------------------------------------------------
SELECT 
    schemaname,
    tablename,
    rowsecurity AS rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS有効'
        ELSE '⚠️ RLS無効（データが保護されていません）'
    END AS status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('national_stadium_messages', 'contact_inquiries')
ORDER BY tablename;

-- ----------------------------------------------------------------
-- 2. 対象テーブルに存在するすべてのRLSポリシー詳細一覧
-- ----------------------------------------------------------------
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_expression,
    with_check AS check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('national_stadium_messages', 'contact_inquiries')
ORDER BY tablename, cmd, policyname;

-- ----------------------------------------------------------------
-- 3. 🚨 Permissive OR評価リスクの特定クエリ
-- ----------------------------------------------------------------
-- PostgreSQLでは、同一テーブル・同一コマンドの複数PERMISSIVEポリシーは「OR」結合されます。
-- もし DELETE / UPDATE / ALL を許可するポリシーの中に、
-- 管理者判定 (app_metadata->>'role' = 'admin') 以外の甘い条件（USING(true) 等）が残っていると、
-- 管理者ポリシーを追加しても一般ユーザーが削除・更新できてしまいます。
-- 以下のクエリで「⚠️ 危険 / 要削除」と判定されたポリシーは、マイグレーション時に確実に削除する必要があります。
-- ----------------------------------------------------------------
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_expression,
    CASE 
        -- SELECT / INSERT は一般公開が前提のため許容
        WHEN cmd IN ('SELECT', 'INSERT') THEN '🟢 正常 (閲覧・投稿用)'
        -- 管理者権限 (app_metadata.role = admin) が付与されている場合
        WHEN qual ILIKE '%app_metadata%admin%' THEN '✅ 安全 (厳格な管理者判定)'
        -- それ以外の DELETE / UPDATE / ALL は危険な甘いポリシーの疑い
        ELSE '🚨 要削除候補 (OR評価により一般・匿名ユーザーに管理者権限が漏洩するリスクあり)'
    END AS risk_assessment
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('national_stadium_messages', 'contact_inquiries')
  AND permissive = 'PERMISSIVE'
ORDER BY 
    CASE 
        WHEN qual NOT ILIKE '%app_metadata%admin%' AND cmd IN ('DELETE', 'UPDATE', 'ALL') THEN 1
        ELSE 2
    END,
    tablename, cmd;

-- ----------------------------------------------------------------
-- 4. 💾 事前ポリシー定義のバックアップテーブル作成と保存
-- ----------------------------------------------------------------
-- ロールバックが必要になった場合に備え、現行のポリシー情報をバックアップテーブルに記録します。
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public._rls_policy_backup (
    backup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backed_up_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    schemaname VARCHAR(255) NOT NULL,
    tablename VARCHAR(255) NOT NULL,
    policyname VARCHAR(255) NOT NULL,
    permissive VARCHAR(50) NOT NULL,
    roles TEXT[] NOT NULL,
    cmd VARCHAR(50) NOT NULL,
    qual TEXT,
    with_check TEXT
);

-- バックアップ実行
INSERT INTO public._rls_policy_backup (
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('national_stadium_messages', 'contact_inquiries');

-- 記録されたバックアップ件数の確認
SELECT 
    count(*) AS backed_up_policies_count,
    max(backed_up_at) AS latest_backup_time
FROM public._rls_policy_backup;

-- ----------------------------------------------------------------
-- 5. 🛠️ 既存ポリシーの復元用DDL生成クエリ（万が一のバックアップ参照用）
-- ----------------------------------------------------------------
SELECT 
    tablename,
    policyname,
    format(
        'CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s USING (%s)%s;',
        policyname,
        schemaname,
        tablename,
        permissive,
        cmd,
        array_to_string(roles, ', '),
        COALESCE(qual, 'true'),
        CASE WHEN with_check IS NOT NULL THEN format(' WITH CHECK (%s)', with_check) ELSE '' END
    ) AS recreate_sql
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('national_stadium_messages', 'contact_inquiries')
ORDER BY tablename, policyname;
