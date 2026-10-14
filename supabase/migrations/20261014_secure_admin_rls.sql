-- ================================================================
-- 🛡️ トリプルデートマップ: 管理者RLSポリシー差分マイグレーション
-- Migration ID: 20261014_secure_admin_rls
-- 目的: 
--   1. 管理者権限の判定を (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' に完全統一
--   2. user_metadata やメールアドレス直書きによる権限昇格リスクを排除
--   3. 既存の寄せ書きメッセージ・ユーザーデータ・問い合わせデータを100%保持
-- ================================================================

-- ----------------------------------------------------------------
-- ⚠️ 実行前チェック（Supabase SQL Editorで事前に実行して件数・ポリシーを確認してください）
-- ----------------------------------------------------------------
-- SELECT count(*) AS message_count FROM public.national_stadium_messages;
-- SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE schemaname = 'public';

BEGIN;

-- 1. national_stadium_messages テーブルの存在確認とRLS有効化
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'national_stadium_messages') THEN
        ALTER TABLE public.national_stadium_messages ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. 既存の古い管理者ポリシーを安全に削除（テーブル・データは一切変更されません）
DROP POLICY IF EXISTS "Allow admins to delete messages" ON public.national_stadium_messages;
DROP POLICY IF EXISTS "Allow admins to update messages" ON public.national_stadium_messages;
DROP POLICY IF EXISTS "Allow authenticated admins delete" ON public.national_stadium_messages;
DROP POLICY IF EXISTS "Allow authenticated admins update" ON public.national_stadium_messages;

-- 3. 閲覧・投稿ポリシーの確認と再適用
DROP POLICY IF EXISTS "Allow anyone to read messages" ON public.national_stadium_messages;
CREATE POLICY "Allow anyone to read messages" 
ON public.national_stadium_messages 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow anyone to insert messages" ON public.national_stadium_messages;
CREATE POLICY "Allow anyone to insert messages" 
ON public.national_stadium_messages 
FOR INSERT 
WITH CHECK (true);

-- 4. 厳格な管理者専用ポリシーの適用（app_metadata.role = 'admin' のみ許可）
-- ※ user_metadata や email による判定は一切含まれず、権限昇格を恒久遮断します
CREATE POLICY "Allow admins to delete messages" 
ON public.national_stadium_messages 
FOR DELETE 
TO authenticated 
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Allow admins to update messages" 
ON public.national_stadium_messages 
FOR UPDATE 
TO authenticated 
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ----------------------------------------------------------------
-- 📩 contact_inquiries（お問い合わせ）テーブルが存在する場合のRLS保護
-- ----------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_inquiries') THEN
        ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Allow anyone to submit inquiry" ON public.contact_inquiries;
        CREATE POLICY "Allow anyone to submit inquiry" 
        ON public.contact_inquiries 
        FOR INSERT 
        WITH CHECK (true);

        DROP POLICY IF EXISTS "Allow admins to view inquiries" ON public.contact_inquiries;
        CREATE POLICY "Allow admins to view inquiries" 
        ON public.contact_inquiries 
        FOR SELECT 
        TO authenticated 
        USING (
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        );

        DROP POLICY IF EXISTS "Allow admins to delete inquiries" ON public.contact_inquiries;
        CREATE POLICY "Allow admins to delete inquiries" 
        ON public.contact_inquiries 
        FOR DELETE 
        TO authenticated 
        USING (
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        );
    END IF;
END $$;

COMMIT;

-- ================================================================
-- 🔍 実行後検証クエリ
-- 以下のクエリを実行し、ポリシーが正しく設定されていることを確認してください。
-- ================================================================
-- SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE tablename IN ('national_stadium_messages', 'contact_inquiries');
