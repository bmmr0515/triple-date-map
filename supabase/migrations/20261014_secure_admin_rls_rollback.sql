-- ================================================================
-- ↩️ ロールバック用スクリプト: 20261014_secure_admin_rls_rollback
-- File: supabase/migrations/20261014_secure_admin_rls_rollback.sql
-- 目的: 
--   1. 万が一問題が発生した際、新設したポリシーを安全に撤回
--   2. 危険な古い許可ポリシー（誰でも削除可能な状態等）は【自動復元しない】安全設計
--   3. バックアップテーブル (_rls_policy_backup) から事前の状態を確認可能
--   4. テーブル存在確認により、環境依存エラーを防止
--   ※テーブルや既存メッセージデータは一切削除されません
-- ================================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. national_stadium_messages のロールバック
-- ----------------------------------------------------------------
DO $$
DECLARE
    table_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'national_stadium_messages'
    ) INTO table_exists;

    IF table_exists THEN
        -- 新設した管理者専用ポリシーを削除
        EXECUTE 'DROP POLICY IF EXISTS "Allow admins to delete messages" ON public.national_stadium_messages;';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admins to update messages" ON public.national_stadium_messages;';

        -- 一般ユーザー向けの閲覧・投稿ポリシーは安全なベースラインとして維持
        EXECUTE 'DROP POLICY IF EXISTS "Allow anyone to read messages" ON public.national_stadium_messages;';
        EXECUTE 'CREATE POLICY "Allow anyone to read messages" 
                 ON public.national_stadium_messages 
                 FOR SELECT 
                 USING (true);';

        EXECUTE 'DROP POLICY IF EXISTS "Allow anyone to insert messages" ON public.national_stadium_messages;';
        EXECUTE 'CREATE POLICY "Allow anyone to insert messages" 
                 ON public.national_stadium_messages 
                 FOR INSERT 
                 WITH CHECK (true);';

        -- ⚠️ 【安全保護方針】
        -- 危険な古い許可ポリシー（例: USING (true) でのDELETEなど）は自動復元しません。
        -- 現在の状態: メッセージ閲覧・投稿のみ可能、削除・更新は全ユーザー拒否（安全な最小権限）
        RAISE NOTICE '✅ national_stadium_messages: 管理者ポリシーを撤回し、安全なベースライン（閲覧・投稿のみ許可）に設定しました。';
    END IF;
END $$;

-- ----------------------------------------------------------------
-- 2. contact_inquiries のロールバック
-- ----------------------------------------------------------------
DO $$
DECLARE
    table_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'contact_inquiries'
    ) INTO table_exists;

    IF table_exists THEN
        -- 新設した管理者ポリシーを削除
        EXECUTE 'DROP POLICY IF EXISTS "Allow admins to view inquiries" ON public.contact_inquiries;';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admins to delete inquiries" ON public.contact_inquiries;';

        -- 送信ポリシーのみ維持（個人情報は非公開・保護を継続）
        EXECUTE 'DROP POLICY IF EXISTS "Allow anyone to submit inquiry" ON public.contact_inquiries;';
        EXECUTE 'CREATE POLICY "Allow anyone to submit inquiry" 
                 ON public.contact_inquiries 
                 FOR INSERT 
                 WITH CHECK (true);';

        RAISE NOTICE '✅ contact_inquiries: 管理者ポリシーを撤回し、安全なベースライン（送信のみ許可・非公開）に設定しました。';
    END IF;
END $$;

COMMIT;

-- ----------------------------------------------------------------
-- 📋 （参考）マイグレーション前の旧ポリシー定義を確認したい場合
-- 事前監査SQLで保存されたバックアップテーブルから参照できます。
-- ----------------------------------------------------------------
-- SELECT * FROM public._rls_policy_backup ORDER BY backed_up_at DESC;
