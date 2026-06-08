-- 🏟️ 国立競技場デジタル寄せ書きボード用テーブルスキーマ
-- Supabase SQL Editor または PostgreSQL クライアントで実行してください。

CREATE TABLE IF NOT EXISTS public.national_stadium_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    message VARCHAR(100) NOT NULL, -- 最大100文字に変更
    color VARCHAR(50) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- 🛡️ DBレベルの堅牢なコンテンツバリデーション制約
    CONSTRAINT check_message_length CHECK (char_length(trim(message)) >= 3 AND char_length(trim(message)) <= 100), -- 3文字以上100文字以下
    CONSTRAINT check_no_url CHECK (
        message !~* 'https?://' AND 
        message !~* 'www\.' AND
        message !~* '\.[a-zA-Z]{2,6}\b'
    ) -- スパムURL・ドメインの禁止
);

-- 既存の単一device_idユニーク制約を削除し、メンバー色(color)との複合ユニーク制約へ切り替えます(1人につき各メンバー1回ずつ・最大10回)
ALTER TABLE public.national_stadium_messages DROP CONSTRAINT IF EXISTS unique_device_message;
ALTER TABLE public.national_stadium_messages DROP CONSTRAINT IF EXISTS unique_device_member_color;
ALTER TABLE public.national_stadium_messages ADD CONSTRAINT unique_device_member_color UNIQUE (device_id, color);

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
