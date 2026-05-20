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
        return { success: false, error: err.message || 'アカウント作成に失敗しました。' };
      }
    }

    // 2. ローカルシミュレータ処理
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getSimUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'このメールアドレスは既に登録されています。' };
    }

    const newUser: SimUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email: email,
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
          email,
          password
        });
        if (error) throw error;
        return { success: true };
      } catch (err: any) {
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

  // 本物のX (Twitter) OAuth 認証画面へリダイレクト (Supabase twitter provider)
  async signInWithX(): Promise<{ success: boolean; error?: string }> {
    // 1. 本物のSupabaseが有効な場合
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'twitter',
          options: {
            redirectTo: window.location.origin // ログイン成功後にアプリへ戻る
          }
        });
        if (error) throw error;
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'X認証の開始に失敗しました。' };
      }
    }

    // 2. ローカルシミュレータ処理 (オフラインデバッグ用)
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockEmail = 'ikonoijoy_twt@gmail.com';
    const users = getSimUsers();
    let found = users.find(u => u.email.toLowerCase() === mockEmail.toLowerCase());

    if (!found) {
      found = {
        id: 'usr_twt' + Math.random().toString(36).substr(2, 5),
        email: mockEmail,
        passwordHash: 'twitter_oauth_bypass',
        username: 'Xから来た巡礼者',
        oshi_group: '合同',
        acquired_titles: [],
        titles: [],
        active_title: ''
      };
      users.push(found);
      saveSimUsers(users);
    }

    const userSession: User = {
      id: found.id,
      username: found.username,
      oshi_group: found.oshi_group,
      acquired_titles: found.acquired_titles,
      titles: found.titles,
      active_title: found.active_title
    };

    const session: AuthSession = { user: userSession, email: found.email };
    localStorage.setItem('tdm_auth_session', JSON.stringify(session));
    localStorage.setItem('tdm_user', JSON.stringify(userSession));

    this._notify(session);
    return { success: true };
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
  }
};
