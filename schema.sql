-- 🏟️ 国立競技場デジタル寄せ書きボード用テーブルスキーマ
-- Supabase SQL Editor または PostgreSQL クライアントで実行してください。

CREATE TABLE IF NOT EXISTS public.national_stadium_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    message VARCHAR(140) NOT NULL,
    color VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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
