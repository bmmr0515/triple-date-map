-- ================================================================
-- 🧪 トリプルデートマップ: RLS権限マトリクス実機検証SQL
-- File: supabase/migrations/20261015_rls_permission_verification.sql
-- 目的: 
--   管理者・一般ユーザー・匿名ユーザーの3者における
--   SELECT, INSERT, UPDATE, DELETE 権限の分離を実機SQLエディタで完全検証する。
-- 
-- 🔒 安全設計:
--   ・全体が BEGIN ... ROLLBACK トランザクション内で実行されます。
--   ・テスト用に投入されたレコードは終了時にすべて自動消去され、本番データには一切痕跡を残しません。
-- ================================================================

BEGIN;

-- 0. テスト結果格納用の一時テーブルを作成
CREATE TEMP TABLE IF NOT EXISTS _rls_test_results (
    test_id serial PRIMARY KEY,
    user_type text NOT NULL,
    target_table text NOT NULL,
    operation text NOT NULL,
    expected text NOT NULL,
    actual text NOT NULL,
    passed boolean NOT NULL
);

-- テストロール（anon / authenticated）から一時テーブルへの書き込みを許可
GRANT ALL ON TABLE _rls_test_results TO anon, authenticated, public;
GRANT USAGE, SELECT ON SEQUENCE _rls_test_results_test_id_seq TO anon, authenticated, public;

-- ----------------------------------------------------------------
-- 準備: テスト対象テーブルの存在確認とテスト用レコードの作成（postgresロールで実行）
-- ----------------------------------------------------------------
DO $$
DECLARE
    msg_id uuid := '00000000-0000-0000-0000-000000000099'::uuid;
    inq_id uuid := '00000000-0000-0000-0000-000000000099'::uuid;
BEGIN
    -- national_stadium_messages テスト行
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'national_stadium_messages') THEN
        DELETE FROM public.national_stadium_messages WHERE id = msg_id;
        INSERT INTO public.national_stadium_messages (id, name, message, color, device_id)
        VALUES (msg_id, 'テスト巡礼者', 'テスト用メッセージです。がんばれイコラブ！', 'pink', 'device-test-001');
    END IF;

    -- contact_inquiries テスト行
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_inquiries') THEN
        DELETE FROM public.contact_inquiries WHERE id = inq_id;
        INSERT INTO public.contact_inquiries (id, name, email, inquiry_type, message)
        VALUES (inq_id, 'テスト送信者', 'test@example.com', 'ご意見・ご要望', '問い合わせテスト本文');
    END IF;
END $$;


-- ================================================================
-- 🧪 TEST 1: 匿名ユーザー (anon / 未ログイン訪問者)
-- ================================================================
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" = '{"role": "anon"}';

-- 1-1. national_stadium_messages
DO $$
DECLARE
    v_count integer;
    v_updated integer;
    v_deleted integer;
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'national_stadium_messages') THEN
        -- SELECT
        SELECT count(*) INTO v_count FROM public.national_stadium_messages WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('1. 匿名ユーザー (anon)', 'national_stadium_messages', 'SELECT (閲覧)', '閲覧可能 (1件)', '取得 ' || v_count || '件', v_count = 1);

        -- INSERT
        BEGIN
            INSERT INTO public.national_stadium_messages (name, message, color, device_id)
            VALUES ('名無しファン', '匿名からのメッセージ投稿テストです！', 'blue', 'device-anon-001');
            INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
            VALUES ('1. 匿名ユーザー (anon)', 'national_stadium_messages', 'INSERT (投稿)', '投稿成功', '投稿成功', true);
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
            VALUES ('1. 匿名ユーザー (anon)', 'national_stadium_messages', 'INSERT (投稿)', '投稿成功', 'エラー: ' || SQLERRM, false);
        END;

        -- UPDATE (改ざん試行 -> 0件更新で遮断されるべき)
        UPDATE public.national_stadium_messages 
        SET message = '改ざんされたメッセージ' 
        WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        GET DIAGNOSTICS v_updated = ROW_COUNT;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('1. 匿名ユーザー (anon)', 'national_stadium_messages', 'UPDATE (更新)', '拒否 (0件更新)', v_updated || '件更新', v_updated = 0);

        -- DELETE (不正削除試行 -> 0件削除で遮断されるべき)
        DELETE FROM public.national_stadium_messages 
        WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        GET DIAGNOSTICS v_deleted = ROW_COUNT;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('1. 匿名ユーザー (anon)', 'national_stadium_messages', 'DELETE (削除)', '拒否 (0件削除)', v_deleted || '件削除', v_deleted = 0);
    END IF;
END $$;

-- 1-2. contact_inquiries (お問い合わせ)
DO $$
DECLARE
    v_count integer;
    v_deleted integer;
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_inquiries') THEN
        -- SELECT (個人情報漏洩防止 -> 0件で遮断されるべき)
        SELECT count(*) INTO v_count FROM public.contact_inquiries WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('1. 匿名ユーザー (anon)', 'contact_inquiries', 'SELECT (個人情報閲覧)', '拒否 (0件)', v_count || '件取得', v_count = 0);

        -- INSERT (問い合わせ送信 -> 成功すべき)
        BEGIN
            INSERT INTO public.contact_inquiries (name, email, inquiry_type, message)
            VALUES ('一般訪問者', 'guest@example.com', '質問', 'サイトの質問です');
            INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
            VALUES ('1. 匿名ユーザー (anon)', 'contact_inquiries', 'INSERT (送信)', '送信成功', '送信成功', true);
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
            VALUES ('1. 匿名ユーザー (anon)', 'contact_inquiries', 'INSERT (送信)', '送信成功', 'エラー: ' || SQLERRM, false);
        END;

        -- DELETE (削除試行 -> 0件で遮断)
        DELETE FROM public.contact_inquiries WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        GET DIAGNOSTICS v_deleted = ROW_COUNT;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('1. 匿名ユーザー (anon)', 'contact_inquiries', 'DELETE (削除)', '拒否 (0件削除)', v_deleted || '件削除', v_deleted = 0);
    END IF;
END $$;


-- ================================================================
-- 🧪 TEST 2: 一般ログインユーザー (authenticated / non-admin)
-- ※あえて user_metadata.role = 'admin' を付与し、クライアント改ざん攻撃をシミュレート
-- ================================================================
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{
    "sub": "00000000-0000-0000-0000-000000000001",
    "role": "authenticated",
    "email": "attacker_or_normal@example.com",
    "app_metadata": {"provider": "email"},
    "user_metadata": {"role": "admin"}
}';

DO $$
DECLARE
    v_count integer;
    v_updated integer;
    v_deleted integer;
    v_inq_count integer;
    v_inq_deleted integer;
BEGIN
    -- national_stadium_messages
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'national_stadium_messages') THEN
        -- SELECT
        SELECT count(*) INTO v_count FROM public.national_stadium_messages WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('2. 一般ユーザー (user_metadata改ざん)', 'national_stadium_messages', 'SELECT (閲覧)', '閲覧可能 (1件)', '取得 ' || v_count || '件', v_count = 1);

        -- UPDATE (改ざん試行 -> user_metadataではなくapp_metadataを検証しているため0件で遮断されるべき)
        UPDATE public.national_stadium_messages 
        SET message = '一般ユーザーによる不正改ざん' 
        WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        GET DIAGNOSTICS v_updated = ROW_COUNT;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('2. 一般ユーザー (user_metadata改ざん)', 'national_stadium_messages', 'UPDATE (更新)', '拒否 (0件更新)', v_updated || '件更新', v_updated = 0);

        -- DELETE (不正削除試行 -> 0件で遮断されるべき)
        DELETE FROM public.national_stadium_messages 
        WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        GET DIAGNOSTICS v_deleted = ROW_COUNT;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('2. 一般ユーザー (user_metadata改ざん)', 'national_stadium_messages', 'DELETE (削除)', '拒否 (0件削除)', v_deleted || '件削除', v_deleted = 0);
    END IF;

    -- contact_inquiries
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_inquiries') THEN
        -- SELECT (個人情報漏洩防止 -> 0件で遮断)
        SELECT count(*) INTO v_inq_count FROM public.contact_inquiries WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('2. 一般ユーザー (user_metadata改ざん)', 'contact_inquiries', 'SELECT (個人情報閲覧)', '拒否 (0件)', v_inq_count || '件取得', v_inq_count = 0);

        -- DELETE (他者の問い合わせ削除試行 -> 0件で遮断)
        DELETE FROM public.contact_inquiries WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        GET DIAGNOSTICS v_inq_deleted = ROW_COUNT;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('2. 一般ユーザー (user_metadata改ざん)', 'contact_inquiries', 'DELETE (削除)', '拒否 (0件削除)', v_inq_deleted || '件削除', v_inq_deleted = 0);
    END IF;
END $$;


-- ================================================================
-- 🧪 TEST 3: 正当な管理者ユーザー (authenticated / app_metadata.role = 'admin')
-- ================================================================
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{
    "sub": "00000000-0000-0000-0000-000000000002",
    "role": "authenticated",
    "email": "real_admin@tripledatemap.com",
    "app_metadata": {"provider": "email", "role": "admin"},
    "user_metadata": {}
}';

DO $$
DECLARE
    v_count integer;
    v_updated integer;
    v_deleted integer;
    v_inq_count integer;
    v_inq_deleted integer;
BEGIN
    -- national_stadium_messages
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'national_stadium_messages') THEN
        -- SELECT
        SELECT count(*) INTO v_count FROM public.national_stadium_messages WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('3. 管理者 (app_metadata.role=admin)', 'national_stadium_messages', 'SELECT (閲覧)', '閲覧可能 (1件)', '取得 ' || v_count || '件', v_count = 1);

        -- UPDATE (モデレーション更新 -> 成功すべき)
        UPDATE public.national_stadium_messages 
        SET message = '【運営更新】メッセージ確認済み' 
        WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        GET DIAGNOSTICS v_updated = ROW_COUNT;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('3. 管理者 (app_metadata.role=admin)', 'national_stadium_messages', 'UPDATE (更新)', '成功 (1件更新)', v_updated || '件更新', v_updated = 1);

        -- DELETE (スパム削除 -> 成功すべき)
        DELETE FROM public.national_stadium_messages 
        WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        GET DIAGNOSTICS v_deleted = ROW_COUNT;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('3. 管理者 (app_metadata.role=admin)', 'national_stadium_messages', 'DELETE (削除)', '成功 (1件削除)', v_deleted || '件削除', v_deleted = 1);
    END IF;

    -- contact_inquiries
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_inquiries') THEN
        -- SELECT (管理者のみ問い合わせ一覧を閲覧可能 -> 1件取得できるべき)
        SELECT count(*) INTO v_inq_count FROM public.contact_inquiries WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('3. 管理者 (app_metadata.role=admin)', 'contact_inquiries', 'SELECT (個人情報閲覧)', '閲覧可能 (1件)', '取得 ' || v_inq_count || '件', v_inq_count = 1);

        -- DELETE (対応済み問い合わせの削除 -> 成功すべき)
        DELETE FROM public.contact_inquiries WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;
        GET DIAGNOSTICS v_inq_deleted = ROW_COUNT;
        INSERT INTO _rls_test_results (user_type, target_table, operation, expected, actual, passed)
        VALUES ('3. 管理者 (app_metadata.role=admin)', 'contact_inquiries', 'DELETE (削除)', '成功 (1件削除)', v_inq_deleted || '件削除', v_inq_deleted = 1);
    END IF;
END $$;


-- ================================================================
-- 📊 権限マトリクス検証結果レポートの出力
-- ================================================================
RESET ROLE;

SELECT 
    user_type AS "ユーザー種別",
    target_table AS "テーブル",
    operation AS "操作 (CMD)",
    expected AS "期待動作",
    actual AS "実際の結果",
    CASE 
        WHEN passed THEN '✅ 合格 (PASS)'
        ELSE '❌ 不合格 (FAIL)'
    END AS "判定"
FROM _rls_test_results
ORDER BY test_id;

-- 🛡️ 本番データを1バイトも変更・破壊しないよう、テスト完了時に完全ロールバック
ROLLBACK;
