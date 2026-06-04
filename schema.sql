-- 🏟️ 国立競技場デジタル寄せ書きボード用テーブルスキーマ
-- Supabase SQL Editor または PostgreSQL クライアントで実行してください。

CREATE TABLE IF NOT EXISTS public.national_stadium_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    message VARCHAR(140) NOT NULL,
    color VARCHAR(50) NOT NULL,
    device_id VARCHAR(255) UNIQUE NOT NULL, -- デバイスごとの一意ID (1人1回制限)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- 🛡️ DBレベルの堅牢なコンテンツバリデーション制約
    CONSTRAINT check_message_length CHECK (char_length(trim(message)) >= 3), -- 最低3文字以上
    CONSTRAINT check_no_url CHECK (
        message !~* 'https?://' AND 
        message !~* 'www\.' AND
        message !~* '\.[a-zA-Z]{2,6}\b'
    ) -- スパムURL・ドメインの禁止
);

-- RLS (Row Level Security) の有効化 (任意)
ALTER TABLE public.national_stadium_messages ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザー(Anon)によるメッセージの閲覧と追加を許可するポリシー
CREATE POLICY "Allow anyone to read messages" 
ON public.national_stadium_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Allow anyone to insert messages" 
ON public.national_stadium_messages 
FOR INSERT 
WITH CHECK (true);
