// SupabaseやFirebase等のBaaSへの移行が極めて容易な認証サービスラッパー
// ローカル検証環境では自動的にlocalStorageベースのBaaSシミュレータにフォールバックし、
// 本番環境に環境変数が定義された瞬間、自動で本物のSupabase Auth (Google OAuth/Email)に切り替わります。

import { createClient } from '@supabase/supabase-js';
import { GroupType, User } from './db';

export interface AuthSession {
  user: User | null;
  email: string | null;
}

type AuthStateCallback = (session: AuthSession | null) => void;

// シミュレータ用のユーザーデータベース型
interface SimUser {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  oshi_group: GroupType;
  acquired_titles: string[];
  titles: string[];
  active_title: string;
}

// ローカルストレージベースの擬似ユーザーDB操作
const getSimUsers = (): SimUser[] => {
  const data = localStorage.getItem('tdm_sim_users');
  return data ? JSON.parse(data) : [];
};

const saveSimUsers = (users: SimUser[]) => {
  localStorage.setItem('tdm_sim_users', JSON.stringify(users));
};

// 🔐 Supabaseの環境変数検知
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
const isRealBaaSConfigured = SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';

// 本物のSupabaseクライアント（設定されている場合のみ初期化）
export const supabase = isRealBaaSConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

// イベントリスナーの管理 (モックおよびSupabase両用)
const listeners: AuthStateCallback[] = [];

// 🔑 パスワードリカバリー専用リスナーの管理
export interface PasswordRecoveryState {
  isRecovery: boolean;
  error?: string;
}

type PasswordRecoveryCallback = (state: PasswordRecoveryState) => void;
const recoveryListeners: PasswordRecoveryCallback[] = [];
let currentRecoveryState: PasswordRecoveryState = { isRecovery: false };

/**
 * 🛡️ 認証URLトークンのサニタイズ (要件: トークンをログや分析ツールへ送信しない)
 * URLに含まれる access_token, refresh_token, code などの認証情報を
 * 履歴・分析ツール・外部リンクのリファラーから保護するため、即座にURLバーから除去します。
 */
export const sanitizeUrlTokens = () => {
  if (typeof window === 'undefined') return;
  try {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const hasTokens = 
      hash.includes('access_token') ||
      hash.includes('type=recovery') ||
      hash.includes('error=') ||
      search.includes('code=') ||
      search.includes('error=');

    if (hasTokens) {
      window.history.replaceState(null, document.title, window.location.pathname);
    }
  } catch (e) {
    console.error('Failed to sanitize URL tokens:', e);
  }
};

// URL初期ロード時およびハッシュ変更時のパスワードリカバリートークン・エラーの直接検知
const checkUrlForRecovery = () => {
  if (typeof window === 'undefined') return;
  const hash = window.location.hash || '';
  const search = window.location.search || '';

  // 1. 有効期限切れ・無効リンクの検知
  if (hash.includes('error=') || search.includes('error=')) {
    const rawParams = hash.includes('error=') ? hash.replace(/^#/, '') : search.replace(/^\?/, '');
    const params = new URLSearchParams(rawParams);
    const errorCode = params.get('error_code');
    const errorDescription = params.get('error_description') || params.get('error') || '';

    if (
      errorCode === 'otp_expired' ||
      errorCode === 'access_denied' ||
      errorDescription.toLowerCase().includes('expired') ||
      errorDescription.toLowerCase().includes('invalid')
    ) {
      currentRecoveryState = {
        isRecovery: true,
        error: 'パスワード再設定リンクの有効期限が切れているか、すでに使用されています。お手数ですが、再度パスワード再設定メールを送信してください。'
      };
      sanitizeUrlTokens();
      setTimeout(() => {
        recoveryListeners.forEach(cb => cb(currentRecoveryState));
      }, 50);
    }
  } else if (hash.includes('type=recovery') || search.includes('type=recovery')) {
    // 2. 正常なリカバリートークンを含むURLの検知
    currentRecoveryState = { isRecovery: true };
    setTimeout(() => {
      sanitizeUrlTokens();
      recoveryListeners.forEach(cb => cb(currentRecoveryState));
    }, 50);
  }
};

if (typeof window !== 'undefined') {
  checkUrlForRecovery();
  window.addEventListener('hashchange', checkUrlForRecovery);
}

// Supabaseセッションから既存のUser型へ変換・同期するヘルパー
const mapSupabaseUserToTdmUser = (sbUser: any): User => {
  const metadata = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    username: metadata.username || sbUser.email?.split('@')[0] || 'イコノイジョイファン',
    oshi_group: (metadata.oshi_group as GroupType) || '合同',
    acquired_titles: metadata.acquired_titles || [],
    titles: metadata.titles || [],
    active_title: metadata.active_title || ''
  };
};

// 本物のSupabase接続時のセッション変更購読の開始
if (supabase) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔔 Supabase Auth Event:', event);

    // 🔑 PASSWORD_RECOVERY イベントの明示的捕捉
    if (event === 'PASSWORD_RECOVERY') {
      currentRecoveryState = { isRecovery: true };
      sanitizeUrlTokens();
      recoveryListeners.forEach(cb => cb(currentRecoveryState));
    }

    if (session && session.user) {
      // ユーザーのメタデータを含めてセッションを作成
      const tdmUser = mapSupabaseUserToTdmUser(session.user);
      const authSession: AuthSession = {
        user: tdmUser,
        email: session.user.email || null
      };

      // 既存アプリコードとの互換性のためにLocalStorageを同期
      localStorage.setItem('tdm_auth_session', JSON.stringify(authSession));
      localStorage.setItem('tdm_user', JSON.stringify(tdmUser));

      // 登録されているコールバックへ通知
      listeners.forEach(cb => cb(authSession));
    } else {
      // ログアウト状態
      localStorage.removeItem('tdm_auth_session');
      localStorage.removeItem('tdm_user');
      listeners.forEach(cb => cb(null));
    }
  });
}

export const authService = {
  // 現在のアクティブセッションの取得
  getSession(): AuthSession | null {
    const sessionData = localStorage.getItem('tdm_auth_session');
    if (!sessionData) return null;
    try {
      return JSON.parse(sessionData);
    } catch (e) {
      return null;
    }
  },

  // ログイン状態変更の購読
  onAuthStateChange(callback: AuthStateCallback): () => void {
    listeners.push(callback);
    // 初期状態を即時送信
    callback(this.getSession());

    // 解除関数を返す
    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) {
        listeners.splice(idx, 1);
      }
    };
  },

  // 状態変更の通知（シミュレータ用）
  _notify(session: AuthSession | null) {
    listeners.forEach(cb => cb(session));
  },

  // 新規登録 (サインアップ)
  async signUp(email: string, password: string, username: string, oshiGroup: GroupType): Promise<{ success: boolean; error?: string }> {
    // 1. 本物のSupabaseが有効な場合
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
              oshi_group: oshiGroup,
              acquired_titles: [],
              titles: [],
              active_title: ''
            }
          }
        });

        if (error) throw error;
        
        // Supabaseは設定によっては確認メールを送るため、即時セッションが作られない場合があります。
        // そのため確認が完了するまではモック側のように即ログイン扱いにならない場合があるためメッセージを返す
        if (data.user && !data.session) {
          return { success: true, error: '⚡ アカウントを作成しました。確認メールをお送りしましたので認証を完了させてください！' };
        }
        
        return { success: true };
      } catch (err: any) {
        const msg: string = err?.message || '';

        // ⏱️ レートリミットエラー（1時間の確認メール送信上限超過）
        if (
          msg.toLowerCase().includes('rate limit') ||
          msg.toLowerCase().includes('over_email_send_rate_limit') ||
          msg.toLowerCase().includes('email rate limit exceeded') ||
          msg.toLowerCase().includes('for security purposes')
        ) {
          return {
            success: false,
            error:
              '⏱️ 現在、確認メールの送信数が上限に達しています。\n\n' +
              '【解決方法】\n' +
              '① しばらく時間をおいてから（目安：1時間後）再度お試しください。\n' +
              '② すでに登録済みの方はそのままログインをお試しください。\n' +
              '③ Xアカウントでのログインもご利用いただけます。'
          };
        }

        // 📧 メールアドレス重複エラー
        if (
          msg.toLowerCase().includes('user already registered') ||
          msg.toLowerCase().includes('already been registered')
        ) {
          return {
            success: false,
            error: 'このメールアドレスはすでに登録されています。ログイン画面からサインインしてください。'
          };
        }

        return { success: false, error: msg || 'アカウント作成に失敗しました。' };
      }
    }

    // 2. ローカルシミュレータ処理
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getSimUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'このメールアドレスは既に登録されています。' };
    }

    // ⚠️【開発シミュレータ専用】
    // VITE_SUPABASE_URL が未設定のローカル開発時のみ実行されます。
    // 本番環境では必ず if (supabase) ブロック（Supabase Auth）が先に実行されます。
    // パスワードはブラウザのlocalStorageにのみ保存され、サーバーには一切送信されません。
    const newUser: SimUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email: email,
      // 開発シミュレータのため簡易照合用に保持（本番Supabaseではbcryptハッシュ化される）
      passwordHash: password,
      username: username,
      oshi_group: oshiGroup,
      acquired_titles: [],
      titles: [],
      active_title: ''
    };

    users.push(newUser);
    saveSimUsers(users);

    const userSession: User = {
      id: newUser.id,
      username: newUser.username,
      oshi_group: newUser.oshi_group,
      acquired_titles: newUser.acquired_titles,
      titles: newUser.titles,
      active_title: newUser.active_title
    };

    const session: AuthSession = { user: userSession, email: newUser.email };
    localStorage.setItem('tdm_auth_session', JSON.stringify(session));
    localStorage.setItem('tdm_user', JSON.stringify(userSession));

    this._notify(session);
    return { success: true };
  },

  // ログイン (サインイン)
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    // 1. 本物のSupabaseが有効な場合
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) throw error;
        return { success: true };
      } catch (err: any) {
        const msg = (err?.message || '').toLowerCase();

        // 🔑 認証情報不一致 (Invalid login credentials)
        if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
          return {
            success: false,
            error:
              'メールアドレスまたはパスワードが正しくありません。\n\n' +
              '【新環境への移行に伴う重要なお知らせ】\n' +
              '・新データベースへの移行に伴い、過去に作成されたアカウントは再登録が必要です。まだ新環境で登録されていない場合は「新規登録」をお試しください。\n' +
              '・新規登録直後の場合は、確認メール内の認証リンクをクリックして認証を完了させてからログインしてください。'
          };
        }

        // ✉️ メール確認未完了
        if (msg.includes('email not confirmed')) {
          return {
            success: false,
            error:
              'メールアドレスの確認が完了していません。\n' +
              'ご登録時に送信された確認メール内の認証リンクをクリックしてください。\n' +
              '（※メールが届いていない場合は、迷惑メールフォルダをご確認いただくか、Supabase管理画面の「Authentication > Providers > Email」で「Confirm email」がOFFに設定されているかご確認ください）'
          };
        }

        return { success: false, error: err.message || 'ログインに失敗しました。' };
      }
    }

    // 2. ローカルシミュレータ処理
    await new Promise(resolve => setTimeout(resolve, 600));

    const users = getSimUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password);

    if (!found) {
      return { success: false, error: 'メールアドレスまたはパスワードが正しくありません。' };
    }

    const userSession: User = {
      id: found.id,
      username: found.username,
      oshi_group: found.oshi_group,
      acquired_titles: found.acquired_titles || [],
      titles: found.titles || [],
      active_title: found.active_title || ''
    };

    const session: AuthSession = { user: userSession, email: found.email };
    localStorage.setItem('tdm_auth_session', JSON.stringify(session));
    localStorage.setItem('tdm_user', JSON.stringify(userSession));

    this._notify(session);
    return { success: true };
  },

  // 本物のX (Twitter) OAuth 認証画面へリダイレクト (Supabase X / Twitter provider)
  async signInWithX(): Promise<{ success: boolean; error?: string }> {
    // 本物のSupabaseクライアントが存在しない（環境変数が未設定）場合はエラーを返す
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabaseの環境変数 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) が設定されていません。.envファイルまたはホスティング環境で環境変数を正しく設定してください。' 
      };
    }

    try {
      // 1. まず最新の OAuth 2.0 推奨プロバイダー 'x' で試行
      let { error } = await supabase.auth.signInWithOAuth({
        provider: 'x',
        options: {
          redirectTo: window.location.origin
        }
      });

      // 2. もし 'x' が未有効（古い設定やOAuth 1.0a側の設定等）の場合、'twitter' でフォールバック試行
      if (error && (error.message.toLowerCase().includes('not enabled') || error.message.toLowerCase().includes('unsupported provider'))) {
        console.warn('provider: x failed, trying fallback to twitter:', error.message);
        const retry = await supabase.auth.signInWithOAuth({
          provider: 'twitter',
          options: {
            redirectTo: window.location.origin
          }
        });
        error = retry.error;
      }

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      const msg: string = (err?.message || '').toLowerCase();
      if (msg.includes('not enabled') || msg.includes('unsupported provider')) {
        return {
          success: false,
          error:
            '⚠️ X (Twitter) ログイン機能が新Supabase環境で有効化されていません。\n\n' +
            '【運営者向け設定手順】\n' +
            'Supabase管理画面の「Authentication > Providers」で「X / Twitter (OAuth 2.0)」または「Twitter」を有効化（Enabled）し、Client IDとClient Secretを設定してください。'
        };
      }
      return { success: false, error: err.message || 'X認証の開始に失敗しました。' };
    }
  },



  // ログアウト (サインアウト)
  async signOut(): Promise<void> {
    // 1. 本物のSupabaseが有効な場合
    if (supabase) {
      await supabase.auth.signOut();
      return;
    }

    // 2. ローカルシミュレータ処理
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.removeItem('tdm_auth_session');
    localStorage.removeItem('tdm_user');
    this._notify(null);
  },

  // プロフィール変更等の反映同期
  async syncUserProfile(updatedUser: User) {
    // 1. 本物のSupabaseが有効な場合
    if (supabase) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: {
            username: updatedUser.username,
            oshi_group: updatedUser.oshi_group,
            active_title: updatedUser.active_title || '',
            acquired_titles: updatedUser.acquired_titles || [],
            titles: updatedUser.titles || []
          }
        });
        if (error) throw error;
      } catch (err) {
        console.error('Failed to sync profile with Supabase:', err);
      }
      return;
    }

    // 2. ローカルシミュレータ処理
    const session = this.getSession();
    if (session && session.user && session.user.id === updatedUser.id) {
      session.user = updatedUser;
      localStorage.setItem('tdm_auth_session', JSON.stringify(session));
      this._notify(session);
    }

    const users = getSimUsers();
    const idx = users.findIndex(u => u.id === updatedUser.id);
    if (idx !== -1) {
      users[idx].username = updatedUser.username;
      users[idx].oshi_group = updatedUser.oshi_group;
      users[idx].active_title = updatedUser.active_title || '';
      users[idx].acquired_titles = updatedUser.acquired_titles || [];
      users[idx].titles = updatedUser.titles || [];
      saveSimUsers(users);
    }
  },

  // 🔑 パスワードリカバリー状態の購読
  onPasswordRecovery(callback: PasswordRecoveryCallback): () => void {
    recoveryListeners.push(callback);
    if (currentRecoveryState.isRecovery) {
      callback(currentRecoveryState);
    }
    return () => {
      const idx = recoveryListeners.indexOf(callback);
      if (idx !== -1) {
        recoveryListeners.splice(idx, 1);
      }
    };
  },

  // 🔑 パスワードリカバリー状態のリセット
  clearPasswordRecovery() {
    currentRecoveryState = { isRecovery: false };
    recoveryListeners.forEach(cb => cb(currentRecoveryState));
  },

  // 📩 パスワード再設定メールの送信
  async resetPasswordForEmail(email: string): Promise<{ success: boolean; error?: string }> {
    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/`
        });
        if (error) throw error;
        return { success: true };
      } catch (err: any) {
        const msg = (err?.message || '').toLowerCase();
        if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
          return {
            success: false,
            error: '⏱️ メール送信数の上限に達しました。しばらく時間をおいてから再度お試しください。'
          };
        }
        return { success: false, error: err.message || 'パスワード再設定メールの送信に失敗しました。' };
      }
    }

    // ローカルシミュレータ処理
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  // 🔐 新しいパスワードへの更新実行 (supabase.auth.updateUser)
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (supabase) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) throw error;
        this.clearPasswordRecovery();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'パスワードの更新に失敗しました。' };
      }
    }

    // ローカルシミュレータ処理
    await new Promise(resolve => setTimeout(resolve, 500));
    const session = this.getSession();
    if (session && session.email) {
      const users = getSimUsers();
      const user = users.find(u => u.email.toLowerCase() === session.email?.toLowerCase());
      if (user) {
        user.passwordHash = newPassword;
        saveSimUsers(users);
      }
    }
    this.clearPasswordRecovery();
    return { success: true };
  }
};

/**
 * 🔐 管理者権限の検証
 * - 管理者権限の唯一の信頼できる根拠:
 *   Supabaseの管理権限（service_role等）によってのみ付与可能な app_metadata.role = 'admin' のみを検証します。
 * - ❌ user_metadata はクライアントから改変可能なため絶対に使用しません。
 * - ❌ 環境変数のメールリストやメールアドレス接頭辞、localStorage等のクライアント側情報は一切使用しません。
 */
export const checkIsAdmin = (sbUser: any): boolean => {
  if (!sbUser || typeof sbUser !== 'object') return false;
  return sbUser.app_metadata?.role === 'admin';
};

export const adminAuthService = {
  /**
   * 現在のセッションのSupabaseユーザーおよび管理者権限状態を取得
   * - Supabase未接続時は管理者操作を一切許可しない安全設計
   */
  async getAdminSession(): Promise<{ isAuthenticated: boolean; isAdmin: boolean; email: string | null; user: any }> {
    if (!supabase) {
      return { isAuthenticated: false, isAdmin: false, email: null, user: null };
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return { isAuthenticated: false, isAdmin: false, email: null, user: null };
      }
      const isAdmin = checkIsAdmin(user);
      return {
        isAuthenticated: true,
        isAdmin,
        email: user.email || null,
        user
      };
    } catch (e) {
      return { isAuthenticated: false, isAdmin: false, email: null, user: null };
    }
  },

  /**
   * Supabase Auth による管理者ログイン（サーバー側でパスワード検証）
   */
  async signIn(email: string, password: string): Promise<{ success: boolean; isAdmin?: boolean; error?: string }> {
    if (!supabase) {
      return {
        success: false,
        error: 'Supabaseの接続設定が存在しないため、管理者機能は利用できません。'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) {
        const msg = (error.message || '').toLowerCase();
        let userFacingError = error.message;
        if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
          userFacingError =
            'メールアドレスまたはパスワードが正しくありません。\n' +
            '新Supabase環境（kdvzftmzhntbplkogosn）で管理者アカウントが作成されているかご確認ください。';
        } else if (msg.includes('email not confirmed')) {
          userFacingError =
            '管理者アカウントのメールアドレス確認が未完了です。メール内のリンクをクリックするか、Supabase管理画面で手動確認（Confirm User）してください。';
        }
        return { success: false, error: userFacingError };
      }
      if (!data.user) {
        return { success: false, error: 'ユーザー情報の取得に失敗しました。' };
      }

      const isAdmin = checkIsAdmin(data.user);
      if (!isAdmin) {
        return {
          success: true,
          isAdmin: false,
          error: 'このアカウントには管理者権限（app_metadata.role = "admin"）が付与されていません。'
        };
      }

      return { success: true, isAdmin: true };
    } catch (err: any) {
      return { success: false, error: err.message || '管理者ログイン処理中にエラーが発生しました。' };
    }
  },

  /**
   * 管理者ログアウト
   */
  async signOut(): Promise<void> {
    await authService.signOut();
  }
};


