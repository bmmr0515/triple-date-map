-- ================================================================
-- 🏟️ 国立競技場デジタル寄せ書きボード用テーブルスキーマ & RLSセキュリティ設定
-- （新規セットアップ用スキーマ定義）
-- ※既存の運用中データベースへの適用時は、本ファイルではなく
--   差分マイグレーションSQL (supabase/migrations/20261014_secure_admin_rls.sql)
--   を使用してください。既存データは一切消去されません。
-- ================================================================

CREATE TABLE IF NOT EXISTS public.national_stadium_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    message VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- 🛡️ DBレベルの堅牢なコンテンツバリデーション制約
    CONSTRAINT check_message_length CHECK (char_length(trim(message)) >= 3 AND char_length(trim(message)) <= 100),
    CONSTRAINT check_no_url CHECK (
        message !~* 'https?://' AND 
        message !~* 'www\.' AND
        message !~* '\.[a-zA-Z]{2,6}\b'
    ) -- スパムURL・ドメインの禁止
);

-- ================================================================
-- 🔐 RLS (Row Level Security) による厳格なアクセス制御
-- ================================================================
ALTER TABLE public.national_stadium_messages ENABLE ROW LEVEL SECURITY;

-- 1. 閲覧 (SELECT): 一般訪問者（anon / authenticated）すべてに許可
DROP POLICY IF EXISTS "Allow anyone to read messages" ON public.national_stadium_messages;
CREATE POLICY "Allow anyone to read messages" 
ON public.national_stadium_messages 
FOR SELECT 
USING (true);

-- 2. 投稿 (INSERT): 一般訪問者（anon / authenticated）すべてに許可（制約条件付き）
DROP POLICY IF EXISTS "Allow anyone to insert messages" ON public.national_stadium_messages;
CREATE POLICY "Allow anyone to insert messages" 
ON public.national_stadium_messages 
FOR INSERT 
WITH CHECK (true);

-- 3. 削除 (DELETE): 🔐 Supabaseの管理権限（app_metadata.role = 'admin'）を持つユーザーのみ許可
DROP POLICY IF EXISTS "Allow admins to delete messages" ON public.national_stadium_messages;
CREATE POLICY "Allow admins to delete messages" 
ON public.national_stadium_messages 
FOR DELETE 
TO authenticated 
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- 4. 更新 (UPDATE): 🔐 Supabaseの管理権限（app_metadata.role = 'admin'）を持つユーザーのみ許可（改ざん防止）
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

-- ================================================================
-- 📩 お問い合わせテーブル (contact_inquiries) の保護設定
-- ================================================================
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    inquiry_type VARCHAR(100) NOT NULL,
    target_url TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 一般ユーザーは送信(INSERT)のみ可能
DROP POLICY IF EXISTS "Allow anyone to submit inquiry" ON public.contact_inquiries;
CREATE POLICY "Allow anyone to submit inquiry" 
ON public.contact_inquiries 
FOR INSERT 
WITH CHECK (true);

-- 閲覧(SELECT)・削除(DELETE)・更新(UPDATE)は管理者のみ可能（個人情報保護）
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
