-- ================================================================
-- 🛡️ トリプルデートマップ: 管理者RLSポリシー差分マイグレーション
-- File: supabase/migrations/20261014_secure_admin_rls.sql
-- 目的: 
--   1. 管理者権限の判定を (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' に完全統一
--   2. Permissive PolicyのOR評価による意図せぬ権限残存を機械的に防止
--   3. テーブル存在確認により、テーブルが存在しない環境でも安全にスキップ
--   4. 既存のメッセージデータ・ユーザーデータ・問い合わせデータを100%完全保持
-- ================================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. 🏟️ national_stadium_messages テーブルの保護とポリシー再定義
-- ----------------------------------------------------------------
DO $$
DECLARE
    table_exists boolean;
    risky_policy_count integer;
    r record;
BEGIN
    SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'national_stadium_messages'
    ) INTO table_exists;

    IF NOT table_exists THEN
        RAISE NOTICE 'ℹ️ national_stadium_messages テーブルが存在しないため、スキップしました。';
    ELSE
        -- 1-1. RLS 有効化
        EXECUTE 'ALTER TABLE public.national_stadium_messages ENABLE ROW LEVEL SECURITY;';

        -- 1-2. 事前監査で特定された既知の旧ポリシーを安全に削除
        -- （※未確認ポリシーの一括無差別削除は行わず、特定されたポリシー名のみ削除）
        EXECUTE 'DROP POLICY IF EXISTS "Allow admins to delete messages" ON public.national_stadium_messages;';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admins to update messages" ON public.national_stadium_messages;';
        EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated admins delete" ON public.national_stadium_messages;';
        EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated admins update" ON public.national_stadium_messages;';
        EXECUTE 'DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.national_stadium_messages;';
        EXECUTE 'DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.national_stadium_messages;';
        EXECUTE 'DROP POLICY IF EXISTS "Enable delete for users" ON public.national_stadium_messages;';
        EXECUTE 'DROP POLICY IF EXISTS "Enable update for users" ON public.national_stadium_messages;';
        EXECUTE 'DROP POLICY IF EXISTS "Allow delete for all users" ON public.national_stadium_messages;';
        EXECUTE 'DROP POLICY IF EXISTS "Allow update for all users" ON public.national_stadium_messages;';

        -- 1-3. 閲覧ポリシー（一般公開: SELECT）
        EXECUTE 'DROP POLICY IF EXISTS "Allow anyone to read messages" ON public.national_stadium_messages;';
        EXECUTE 'CREATE POLICY "Allow anyone to read messages" 
                 ON public.national_stadium_messages 
                 FOR SELECT 
                 USING (true);';

        -- 1-4. 投稿ポリシー（一般公開: INSERT）
        EXECUTE 'DROP POLICY IF EXISTS "Allow anyone to insert messages" ON public.national_stadium_messages;';
        EXECUTE 'CREATE POLICY "Allow anyone to insert messages" 
                 ON public.national_stadium_messages 
                 FOR INSERT 
                 WITH CHECK (true);';

        -- 1-5. 厳格な管理者削除ポリシー（app_metadata.role = ''admin'' のみ許可）
        EXECUTE 'CREATE POLICY "Allow admins to delete messages" 
                 ON public.national_stadium_messages 
                 FOR DELETE 
                 TO authenticated 
                 USING (
                     (auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin''
                 );';

        -- 1-6. 厳格な管理者更新ポリシー（app_metadata.role = ''admin'' のみ許可）
        EXECUTE 'CREATE POLICY "Allow admins to update messages" 
                 ON public.national_stadium_messages 
                 FOR UPDATE 
                 TO authenticated 
                 USING (
                     (auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin''
                 )
                 WITH CHECK (
                     (auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin''
                 );';

        -- 1-7. 🛡️ Permissive OR評価リスクの自動検査アサーション
        -- もし管理者チェック以外の甘い DELETE/UPDATE/ALL ポリシーが残っていた場合、即座にエラーを出してロールバックします。
        FOR r IN 
            SELECT policyname, cmd, qual 
            FROM pg_policies 
            WHERE schemaname = 'public' 
              AND tablename = 'national_stadium_messages'
              AND permissive = 'PERMISSIVE'
              AND cmd IN ('DELETE', 'UPDATE', 'ALL')
              AND (qual IS NULL OR qual NOT ILIKE '%app_metadata%admin%')
        LOOP
            RAISE EXCEPTION '🚨 RLS安全監査エラー: 未知の危険なポリシー "%" (CMD: %) が残存しています。PostgreSQLのPermissive OR評価により一般・匿名ユーザーに管理者権限が漏洩する恐れがあります。事前監査SQLで確認の上、スクリプトのDROP POLICY一覧に対象ポリシー名を追加してください。', r.policyname, r.cmd;
        END LOOP;

        RAISE NOTICE '✅ national_stadium_messages: RLSポリシーを厳格な管理者設定へ安全に更新しました。';
    END IF;
END $$;


-- ----------------------------------------------------------------
-- 2. 📩 contact_inquiries（お問い合わせ）テーブルの保護
-- ----------------------------------------------------------------
DO $$
DECLARE
    table_exists boolean;
    r record;
BEGIN
    SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'contact_inquiries'
    ) INTO table_exists;

    IF NOT table_exists THEN
        RAISE NOTICE 'ℹ️ contact_inquiries テーブルが存在しないため、スキップしました。';
    ELSE
        -- 2-1. RLS 有効化
        EXECUTE 'ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;';

        -- 2-2. 既知の旧ポリシーを安全に削除
        EXECUTE 'DROP POLICY IF EXISTS "Allow admins to view inquiries" ON public.contact_inquiries;';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admins to delete inquiries" ON public.contact_inquiries;';
        EXECUTE 'DROP POLICY IF EXISTS "Allow admins to update inquiries" ON public.contact_inquiries;';
        EXECUTE 'DROP POLICY IF EXISTS "Allow anyone to view inquiries" ON public.contact_inquiries;';

        -- 2-3. 送信ポリシー（一般公開: INSERT のみ）
        EXECUTE 'DROP POLICY IF EXISTS "Allow anyone to submit inquiry" ON public.contact_inquiries;';
        EXECUTE 'CREATE POLICY "Allow anyone to submit inquiry" 
                 ON public.contact_inquiries 
                 FOR INSERT 
                 WITH CHECK (true);';

        -- 2-4. 管理者専用閲覧ポリシー（app_metadata.role = ''admin'' のみ許可）
        EXECUTE 'CREATE POLICY "Allow admins to view inquiries" 
                 ON public.contact_inquiries 
                 FOR SELECT 
                 TO authenticated 
                 USING (
                     (auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin''
                 );';

        -- 2-5. 管理者専用削除ポリシー（app_metadata.role = ''admin'' のみ許可）
        EXECUTE 'CREATE POLICY "Allow admins to delete inquiries" 
                 ON public.contact_inquiries 
                 FOR DELETE 
                 TO authenticated 
                 USING (
                     (auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin''
                 );';

        -- 2-6. 🛡️ Permissive OR評価リスクの自動検査アサーション
        -- SELECT / DELETE / UPDATE / ALL で管理者判定以外の甘い条件が残っていないか検証
        FOR r IN 
            SELECT policyname, cmd, qual 
            FROM pg_policies 
            WHERE schemaname = 'public' 
              AND tablename = 'contact_inquiries'
              AND permissive = 'PERMISSIVE'
              AND cmd IN ('SELECT', 'DELETE', 'UPDATE', 'ALL')
              AND (qual IS NULL OR qual NOT ILIKE '%app_metadata%admin%')
        LOOP
            RAISE EXCEPTION '🚨 RLS安全監査エラー: contact_inquiries に危険なポリシー "%" (CMD: %) が残存しています。個人情報漏洩のリスクがあるため、マイグレーションを中止しました。', r.policyname, r.cmd;
        END LOOP;

        RAISE NOTICE '✅ contact_inquiries: RLSポリシーを厳格な管理者設定へ安全に更新しました。';
    END IF;
END $$;

COMMIT;

-- ----------------------------------------------------------------
-- 🔍 適用後確認クエリ
-- ----------------------------------------------------------------
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_expression
FROM pg_policies 
WHERE tablename IN ('national_stadium_messages', 'contact_inquiries')
ORDER BY tablename, cmd;
