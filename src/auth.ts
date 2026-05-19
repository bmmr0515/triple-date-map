// SupabaseやFirebase等のBaaSへの移行が極めて容易な認証サービスラッパー
// ローカル検証環境では自動的にlocalStorageベースのBaaSシミュレータにフォールバックし、
// インターネット接続やAPIキーのない状態でも完璧に動作確認できます。

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
  passwordHash: string; // 簡単な平文模擬
  username: string;
  oshi_group: GroupType;
  acquired_titles: string[];
  titles: string[];
  active_title: string;
}

// ローカルストレージベースのユーザーDB初期化
const getSimUsers = (): SimUser[] => {
  const data = localStorage.getItem('tdm_sim_users');
  return data ? JSON.parse(data) : [];
};

const saveSimUsers = (users: SimUser[]) => {
  localStorage.setItem('tdm_sim_users', JSON.stringify(users));
};

// サポートされている環境変数の検知（将来実機接続する場合のデモ）
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
const isRealBaaSConfigured = SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';

// イベントリスナーの管理
const listeners: AuthStateCallback[] = [];

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

  // 状態変更の通知
  _notify(session: AuthSession | null) {
    listeners.forEach(cb => cb(session));
  },

  // 新規登録 (サインアップ)
  async signUp(email: string, password: string, username: string, oshiGroup: GroupType): Promise<{ success: boolean; error?: string }> {
    // 1. 実機BaaSが設定されている場合は本物のSupabase/Firebase通信を実行可能（コードモック）
    if (isRealBaaSConfigured) {
      console.log('BaaS Sign Up Triggered for:', email);
      // Example Supabase call:
      // const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username, oshi_group: oshiGroup } } });
    }

    // 2. 自動シミュレータ処理
    await new Promise(resolve => setTimeout(resolve, 800)); // 通信レイテンシを再現

    const users = getSimUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'このメールアドレスは既に登録されています。' };
    }

    const newUser: SimUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email: email,
      passwordHash: password, // シミュレータのため平文で保持
      username: username,
      oshi_group: oshiGroup,
      acquired_titles: [],
      titles: [],
      active_title: ''
    };

    users.push(newUser);
    saveSimUsers(users);

    // 新規登録成功後に自動でログインセッションを作成
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
    // tdm_user にも設定して既存のdb.tsロジックと同期
    localStorage.setItem('tdm_user', JSON.stringify(userSession));

    this._notify(session);
    return { success: true };
  },

  // ログイン (サインイン)
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (isRealBaaSConfigured) {
      console.log('BaaS Sign In Triggered for:', email);
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    const users = getSimUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password);

    if (!found) {
      return { success: false, error: 'メールアドレスまたはパスワードが正しくありません。' };
    }

    // セッション作成
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

    // そのユーザーの過去のチェックイン情報を同期（もしあれば）
    // （シミュレータではチェックインDBはtdm_checkinsに残るためそのまま共有されます）

    this._notify(session);
    return { success: true };
  },

  // Google連携ログイン (シミュレータ)
  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    if (isRealBaaSConfigured) {
      console.log('BaaS Google Login Triggered');
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    const mockEmail = 'ikonoijoy_fan@gmail.com';
    const users = getSimUsers();
    let found = users.find(u => u.email.toLowerCase() === mockEmail.toLowerCase());

    if (!found) {
      found = {
        id: 'usr_ggl' + Math.random().toString(36).substr(2, 5),
        email: mockEmail,
        passwordHash: 'google_oauth_bypass',
        username: 'イコノイジョイ狂信者',
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
    if (isRealBaaSConfigured) {
      console.log('BaaS Sign Out Triggered');
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    localStorage.removeItem('tdm_auth_session');
    // デフォルトユーザー（ゲスト状態）に戻す
    localStorage.removeItem('tdm_user');

    this._notify(null);
  },

  // 現在ログイン中のユーザー情報を同期する（プロフィール変更などの反映用）
  syncUserProfile(updatedUser: User) {
    const session = this.getSession();
    if (session && session.user && session.user.id === updatedUser.id) {
      session.user = updatedUser;
      localStorage.setItem('tdm_auth_session', JSON.stringify(session));
      this._notify(session);
    }

    // 模擬DB側も更新
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
