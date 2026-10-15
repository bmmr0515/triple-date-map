-- ================================================================
-- 🚀 トリプルデートマップ: 新Supabase環境構築SQL
-- Project ID: kdvzftmzhntbplkogosn
-- File: supabase/migrations/20261015_setup_new_project_kdvzftmzhntbplkogosn.sql
-- 目的:
--   1. 新規FreeプランSupabaseプロジェクトの完全な初期セットアップ
--   2. 国立競技場寄せ書きボード (national_stadium_messages) テーブル & 制約の作成
--   3. お問い合わせフォーム (contact_inquiries) テーブルの作成
--   4. app_metadata.role = 'admin' に完全統一された厳格なRLSセキュリティポリシーの配備
--   5. Permissive OR評価による権限漏洩防止ガードの自動検査
-- ================================================================
-- 💡 実行方法:
--   新Supabaseプロジェクト (kdvzftmzhntbplkogosn) の管理画面を開き、
--   左側メニュー「SQL Editor」で「New query」を作成して本スクリプトを貼り付け、「Run」を実行してください。
-- ================================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1. 🏟️ 国立競技場デジタル寄せ書きボード用テーブル
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.national_stadium_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    message VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- 🛡️ DBレベルのコンテンツバリデーション制約
    CONSTRAINT check_message_length CHECK (char_length(trim(message)) >= 3 AND char_length(trim(message)) <= 100),
    CONSTRAINT check_no_url CHECK (
        message !~* 'https?://' AND 
        message !~* 'www\.' AND
        message !~* '\.[a-zA-Z]{2,6}\b'
    ) -- スパムURL・悪意あるドメインリンクの禁止
);

-- パフォーマンス向上のためのインデックス
CREATE INDEX IF NOT EXISTS idx_stadium_messages_created_at 
ON public.national_stadium_messages (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stadium_messages_device_color 
ON public.national_stadium_messages (device_id, color);


-- ----------------------------------------------------------------
-- 2. 📩 お問い合わせテーブル (contact_inquiries)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    inquiry_type VARCHAR(100) NOT NULL,
    target_url TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- お問い合わせ管理用インデックス
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at 
ON public.contact_inquiries (created_at DESC);


-- ----------------------------------------------------------------
-- 3. 🔐 RLS (Row Level Security) の有効化
-- ----------------------------------------------------------------
ALTER TABLE public.national_stadium_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;


-- ----------------------------------------------------------------
-- 4. 🛡️ national_stadium_messages RLSポリシー設定
-- ----------------------------------------------------------------
-- 4-1. 閲覧 (SELECT): 一般訪問者（anon / authenticated）すべてに許可
DROP POLICY IF EXISTS "Allow anyone to read messages" ON public.national_stadium_messages;
CREATE POLICY "Allow anyone to read messages" 
ON public.national_stadium_messages 
FOR SELECT 
USING (true);

-- 4-2. 投稿 (INSERT): 一般訪問者（anon / authenticated）すべてに許可（テーブル制約による防御）
DROP POLICY IF EXISTS "Allow anyone to insert messages" ON public.national_stadium_messages;
CREATE POLICY "Allow anyone to insert messages" 
ON public.national_stadium_messages 
FOR INSERT 
WITH CHECK (true);

-- 4-3. 削除 (DELETE): 🔐 サーバー管理権限 (app_metadata.role = 'admin') を持つ管理者のみ許可
DROP POLICY IF EXISTS "Allow admins to delete messages" ON public.national_stadium_messages;
CREATE POLICY "Allow admins to delete messages" 
ON public.national_stadium_messages 
FOR DELETE 
TO authenticated 
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- 4-4. 更新 (UPDATE): 🔐 サーバー管理権限 (app_metadata.role = 'admin') を持つ管理者のみ許可
DROP POLICY IF EXISTS "Allow admins to update messages" ON public.national_stadium_messages;
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
-- 5. 🛡️ contact_inquiries RLSポリシー設定
-- ----------------------------------------------------------------
-- 5-1. 送信 (INSERT): 一般訪問者すべてに許可
DROP POLICY IF EXISTS "Allow anyone to submit inquiry" ON public.contact_inquiries;
CREATE POLICY "Allow anyone to submit inquiry" 
ON public.contact_inquiries 
FOR INSERT 
WITH CHECK (true);

-- 5-2. 閲覧 (SELECT): 🔐 管理者のみ許可（個人情報保護のため一般非公開）
DROP POLICY IF EXISTS "Allow admins to view inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow admins to view inquiries" 
ON public.contact_inquiries 
FOR SELECT 
TO authenticated 
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- 5-3. 削除 (DELETE): 🔐 管理者のみ許可
DROP POLICY IF EXISTS "Allow admins to delete inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow admins to delete inquiries" 
ON public.contact_inquiries 
FOR DELETE 
TO authenticated 
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);


-- ----------------------------------------------------------------
-- 6. 🚨 Permissive OR評価リスクの自動検査アサーション
-- ----------------------------------------------------------------
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN 
        SELECT tablename, policyname, cmd, qual 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('national_stadium_messages', 'contact_inquiries')
          AND permissive = 'PERMISSIVE'
          AND cmd IN ('DELETE', 'UPDATE', 'ALL')
          AND (qual IS NULL OR qual NOT ILIKE '%app_metadata%admin%')
    LOOP
        RAISE EXCEPTION '🚨 初期化監査エラー: 危険なポリシー "%" (テーブル: %, コマンド: %) が検出されました。トランザクションを中止します。', r.policyname, r.tablename, r.cmd;
    END LOOP;
    
    RAISE NOTICE '✅ RLSセキュリティ検査に合格しました。すべての更新・削除権限は app_metadata.role = ''admin'' のみに厳格制限されています。';
END $$;

COMMIT;

-- ----------------------------------------------------------------
-- 🔍 構築後の確認クエリ
-- ----------------------------------------------------------------
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('national_stadium_messages', 'contact_inquiries')
ORDER BY tablename, cmd;

-- ================================================================
-- 👤 管理者アカウントの作成・権限付与手順
-- ================================================================
-- 1. 新Supabase管理画面の Authentication > Users で「Add user」をクリックし、
--    管理者のメールアドレスとパスワードを登録します（または画面上で新規登録）。
-- 2. 登録完了後、SQL Editorで以下のクエリを実行して管理者権限を付与してください:
--
-- UPDATE auth.users 
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb 
-- WHERE email = 'ここに管理者のメールアドレス';
--
-- 3. 権限確認:
-- SELECT id, email, raw_app_meta_data->>'role' AS role FROM auth.users WHERE email = 'ここに管理者のメールアドレス';
-- ================================================================
