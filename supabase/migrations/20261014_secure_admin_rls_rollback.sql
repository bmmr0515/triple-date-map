-- ================================================================
-- ↩️ ロールバック用スクリプト: 20261014_secure_admin_rls
-- 万が一問題が発生した場合に、本マイグレーション適用前のポリシー状態に戻すスクリプトです。
-- （※テーブルや既存メッセージデータは一切削除されません）
-- ================================================================

BEGIN;

-- 1. 新設した管理者専用ポリシーの削除
DROP POLICY IF EXISTS "Allow admins to delete messages" ON public.national_stadium_messages;
DROP POLICY IF EXISTS "Allow admins to update messages" ON public.national_stadium_messages;

-- 2. 閲覧・投稿ポリシーの維持（通常運用に支障が出ないよう残します）
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

-- 3. contact_inquiries の管理者ポリシー削除
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_inquiries') THEN
        DROP POLICY IF EXISTS "Allow admins to view inquiries" ON public.contact_inquiries;
        DROP POLICY IF EXISTS "Allow admins to delete inquiries" ON public.contact_inquiries;
    END IF;
END $$;

COMMIT;
