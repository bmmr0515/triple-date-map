import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  ChevronRight, 
  Play, 
  Award, 
  CheckCircle2, 
  Compass, 
  ExternalLink,
  User as UserIcon,
  Trophy,
  Sparkles,
  LogOut,
  Lock,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import { db, Spot, User, CheckIn, GroupType } from './db';
import { authService, AuthSession } from './auth';

// CDNで読み込んだグローバルな Leaflet (L) をTypeScriptに認識させる
declare const L: any;

// YouTube動画ID抽出関数（以前使われていた関数、現在はiframe対応のため削除）

// Haversineの公式で2点間の距離(メートル)を精密に計算する関数
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // 地球の半径 (メートル)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function App() {
  // データベース状態
  const [spots, setSpots] = useState<Spot[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [checkins, setCheckins] = useState<CheckIn[]>([]);

  // 🔐 認証状態
  const [authSession, setAuthSession] = useState<AuthSession | null>(authService.getSession());
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // ログインフォーム用ステート
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authOshiGroup, setAuthOshiGroup] = useState<GroupType>('合同');
  const [authError, setAuthError] = useState<string>('');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  // ログイン誘導モーダルのブロック表示用
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [blockMessage, setBlockMessage] = useState<string>('');

  // 📜 利用規約・免責事項のステート
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [agreeTermsSignup, setAgreeTermsSignup] = useState<boolean>(false);
  const [agreeTermsBlock, setAgreeTermsBlock] = useState<boolean>(false);
  
  // 📱 モバイルドロワー開閉用ステート
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // フィルター・表示制御状態
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [isCheckinAnimating, setIsCheckinAnimating] = useState<boolean>(false);
  const [showProfileEdit, setShowProfileEdit] = useState<boolean>(false);
  const [rightPanelTab, setRightPanelTab] = useState<'detail' | 'mypage' | 'mission'>('detail');
  const [missionExpanded, setMissionExpanded] = useState<boolean>(true);

  // 📱 スマホレスポンシブ判定用ステートとリサイズ監視
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && rightPanelTab === 'detail') {
        setRightPanelTab('mypage');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [rightPanelTab]);

  // GPS判定＆テスト用バイパス状態
  const [isGpsLocating, setIsGpsLocating] = useState<boolean>(false);
  const [gpsBypass, setGpsBypass] = useState<boolean>(false);

  // プロフィール編集用一時ステート
  const [editUsername, setEditUsername] = useState<string>('');
  const [editOshiGroup, setEditOshiGroup] = useState<GroupType>('合同');
  const [editActiveTitle, setEditActiveTitle] = useState<string>('');

  // 🔍 検索・絞り込み用ステート
  const [searchGroup, setSearchGroup] = useState<string>('すべて');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showNoResultsToast, setShowNoResultsToast] = useState<boolean>(false);

  // 📄 プライバシーポリシーページの表示制御 (SPA/URL同期ハイブリッドルーティング)
  const [showPrivacyPage, setShowPrivacyPage] = useState<boolean>(
    window.location.pathname === '/privacy' || window.location.pathname === '/privacy/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setShowPrivacyPage(window.location.pathname === '/privacy' || window.location.pathname === '/privacy/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToPrivacy = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    window.history.pushState(null, '', '/privacy');
    setShowPrivacyPage(true);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    window.history.pushState(null, '', '/');
    setShowPrivacyPage(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 📍 現在地（GPS）ジャンプ用ステート＆参照
  const [isGpsJumping, setIsGpsJumping] = useState<boolean>(false);
  const userLocationMarkerRef = useRef<any>(null);

  // LeafletマップのDOM参照と操作オブジェクト
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const clusterGroupRef = useRef<any>(null);

  // データ初期ロード ＆ 認証変更購読
  useEffect(() => {
    // 聖地データは静的JSON（INITIAL_SPOTS）としてメモリ上に強力にキャッシュされているためRead負荷ゼロ
    setSpots(db.getSpots());
    setCheckins(db.getCheckIns());

    const unsubscribe = authService.onAuthStateChange((session) => {
      setAuthSession(session);
      if (session && session.user) {
        setCurrentUser(session.user);
        setEditUsername(session.user.username);
        setEditOshiGroup(session.user.oshi_group);
        setEditActiveTitle(session.user.active_title || '');
      } else {
        // 未ログイン時はデフォルトのゲスト情報にする
        const guestUser: User = {
          id: "guest",
          username: "未ログインの巡礼者",
          oshi_group: "合同",
          titles: [],
          acquired_titles: []
        };
        setCurrentUser(guestUser);
        setEditUsername(guestUser.username);
        setEditOshiGroup(guestUser.oshi_group);
        setEditActiveTitle(guestUser.active_title || '');
      }
    });

    return () => unsubscribe();
  }, []);

  // 🏆 称号・アワードの獲得を監視・自動判定する
  useEffect(() => {
    if (spots.length === 0) return;

    const currentAcquired = currentUser.acquired_titles || [];
    const currentTitles = currentUser.titles || [];
    const newlyEarnedTitles: string[] = [];

    // ユニークな現地GPS巡礼済みのスポットIDのSet (現地チェックインのみ称号・アワードの対象にする)
    const checkedSpotIds = new Set(checkins.filter(c => c.is_manual !== true).map(c => c.spot_id));

    // 1. 各聖地ごとの固有称号 (reward_title) の判定
    spots.forEach(spot => {
      if (spot.reward_title && checkedSpotIds.has(spot.id)) {
        if (!currentAcquired.includes(spot.reward_title) && !newlyEarnedTitles.includes(spot.reward_title)) {
          newlyEarnedTitles.push(spot.reward_title);
        }
      }
    });

    // Helper: 特定のスポットグループまたはIDリストがすべて巡礼済みかチェック
    const isAllChecked = (targetSpots: Spot[]) => {
      if (targetSpots.length === 0) return false;
      return targetSpots.every(s => checkedSpotIds.has(s.id));
    };

    // 2. 『この空がトリガー』完遂者 (12箇所)
    const triggerSpots = spots.filter(s => s.tags && s.tags.includes("トリガー巡礼"));
    const triggerTitle = "『この空がトリガー』完遂者";
    if (triggerSpots.length > 0 && isAllChecked(triggerSpots)) {
      if (!currentAcquired.includes(triggerTitle) && !newlyEarnedTitles.includes(triggerTitle)) {
        newlyEarnedTitles.push(triggerTitle);
      }
    }

    // 3. イコラブの伝道師 (=LOVE全巡礼)
    const equalLoveSpots = spots.filter(s => s.group === "=LOVE");
    const equalLoveTitle = "イコラブの伝道師";
    if (equalLoveSpots.length > 0 && isAllChecked(equalLoveSpots)) {
      if (!currentAcquired.includes(equalLoveTitle) && !newlyEarnedTitles.includes(equalLoveTitle)) {
        newlyEarnedTitles.push(equalLoveTitle);
      }
    }

    // 4. ノイミーの開拓者 (≠ME全巡礼)
    const notEqualMeSpots = spots.filter(s => s.group === "≠ME");
    const notEqualMeTitle = "ノイミーの開拓者";
    if (notEqualMeSpots.length > 0 && isAllChecked(notEqualMeSpots)) {
      if (!currentAcquired.includes(notEqualMeTitle) && !newlyEarnedTitles.includes(notEqualMeTitle)) {
        newlyEarnedTitles.push(notEqualMeTitle);
      }
    }

    // 5. ニアジョイの先駆者 (≒JOY全巡礼)
    const nearlyJoySpots = spots.filter(s => s.group === "≒JOY");
    const nearlyJoyTitle = "ニアジョイの先駆者";
    if (nearlyJoySpots.length > 0 && isAllChecked(nearlyJoySpots)) {
      if (!currentAcquired.includes(nearlyJoyTitle) && !newlyEarnedTitles.includes(nearlyJoyTitle)) {
        newlyEarnedTitles.push(nearlyJoyTitle);
      }
    }

    // 6. トリプルデートマスター (全聖地巡礼)
    const allTitle = "トリプルデートマスター";
    if (checkedSpotIds.size === spots.length && spots.length > 0) {
      if (!currentAcquired.includes(allTitle) && !newlyEarnedTitles.includes(allTitle)) {
        newlyEarnedTitles.push(allTitle);
      }
    }

    // 7. [隠し] 聖地のアカデミア (神奈川工科大学、東京工科大学、実践女子大学 3大キャンパスすべて)
    const academyTitle = "聖地のアカデミア";
    const academyIds = ["spot-trigger-kait", "spot-trigger-tute", "spot-trigger-jissen"];
    const hasAllAcademy = academyIds.every(id => checkedSpotIds.has(id));
    if (hasAllAcademy) {
      if (!currentAcquired.includes(academyTitle) && !newlyEarnedTitles.includes(academyTitle)) {
        newlyEarnedTitles.push(academyTitle);
      }
    }

    // 8. [隠し] 失われた聖地の修復者 (旧三田川中学校、みらい館大明 2箇所すべて)
    const lostTitle = "失われた聖地の修復者";
    const lostIds = ["spot-real-mitagawa-school", "spot-trigger-taimei"];
    const hasAllLost = lostIds.every(id => checkedSpotIds.has(id));
    if (hasAllLost) {
      if (!currentAcquired.includes(lostTitle) && !newlyEarnedTitles.includes(lostTitle)) {
        newlyEarnedTitles.push(lostTitle);
      }
    }

    // 9. [隠し] 聖地巡礼の鬼 (ユニーク巡礼数 >= 20)
    const oniTitle = "聖地巡礼の鬼";
    if (checkedSpotIds.size >= 20) {
      if (!currentAcquired.includes(oniTitle) && !newlyEarnedTitles.includes(oniTitle)) {
        newlyEarnedTitles.push(oniTitle);
      }
    }

    // 称号獲得時の保存・適用処理
    if (newlyEarnedTitles.length > 0) {
      // 1. 未ログイン（ゲスト）ユーザーなら保存処理はスキップしてBaaS Read/Write負荷をゼロにする
      if (!authSession) {
        return;
      }

      const updatedAcquired = [...currentAcquired, ...newlyEarnedTitles];
      const updatedTitles = [...currentTitles, ...newlyEarnedTitles];
      
      const updatedUser = {
        ...currentUser,
        acquired_titles: updatedAcquired,
        titles: updatedTitles,
        active_title: currentUser.active_title || newlyEarnedTitles[0]
      };

      db.setCurrentUser(updatedUser);
      setCurrentUser(updatedUser);
      authService.syncUserProfile(updatedUser); // セッションとも同期！

      // 美しいトーストアラート
      alert(`🎉 称号を獲得しました！\n\n${newlyEarnedTitles.map(t => `✨ 【${t}】`).join('\n')}\n\nマイページで装備（設定）してアピールしましょう！`);
    }
  }, [checkins, spots, currentUser, authSession]);

  // マップの初期セットアップ（CDN経由で読み込んだLをDOMにマウント）
  useEffect(() => {
    let mapInstance = null;

    if (typeof L !== 'undefined') {
      const container = document.getElementById('map-canvas');
      if (container) {
        // 多重初期化エラー（Map container is already initialized）を防ぐための強力なセーフガード
        if ((container as any)._leaflet_id) {
          (container as any)._leaflet_id = null;
        }

        // 2. 地図の初期設定: 日本中心（35.6895, 139.6917）、ズームレベル6
        const map = L.map('map-canvas', {
          zoomControl: false,
          attributionControl: false
        }).setView([35.6895, 139.6917], 6);

        // ポップで明るい Voyager タイルをロード
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 20
        }).addTo(map);

        // ズームコントロールを右上にカスタマイズして追加
        L.control.zoom({
          position: 'topright'
        }).addTo(map);

        mapRef.current = map;
        mapInstance = map;
        
        // 初回のリサイズトリガー (複数回に分けて実行し、DOMマウントと完全に同期させてグレー背景バグを根絶)
        setTimeout(() => { map && map.invalidateSize(); }, 50);
        setTimeout(() => { map && map.invalidateSize(); }, 150);
        setTimeout(() => { map && map.invalidateSize(); }, 300);
        setTimeout(() => { map && map.invalidateSize(); }, 600);
        setTimeout(() => { map && map.invalidateSize(); }, 1000);
      }
    }

    // 🌟 マップインスタンスのクリーンアップ処理（アンマウント時に完全に破棄し再初期化を可能にする）
    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapRef.current = null;
      }
    };
  }, [showPrivacyPage]);

  // ウィンドウのリサイズやレイアウト変動時に Leaflet の描画サイズを完璧に追従・更新する
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    // 右パネルのタブ切り替えやレイアウトの縦並び化、初回レンダリング時などに確実に追従させるためのポーリング補正
    const interval = setInterval(handleResize, 400);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  // 🔍 検索・絞り込みを適用した聖地リスト (AND条件)
  const filteredSpotsOnMap = spots.filter(spot => {
    // 1. グループ絞り込み
    if (searchGroup !== 'すべて' && spot.group !== searchGroup) {
      return false;
    }
    // 2. キーワード検索（大文字小文字無視、曲名・施設名・エピソードから）
    if (searchKeyword.trim() !== '') {
      const keyword = searchKeyword.toLowerCase();
      const nameMatch = spot.name.toLowerCase().includes(keyword);
      const descMatch = spot.description.toLowerCase().includes(keyword);
      const ytMatch = spot.youtube_title?.toLowerCase().includes(keyword) || false;
      if (!nameMatch && !descMatch && !ytMatch) {
        return false;
      }
    }
    return true;
  });

  // 🔍 検索条件が変更されたら、0件トースト警告を即時に非表示化する
  useEffect(() => {
    setShowNoResultsToast(false);
  }, [searchGroup, searchKeyword]);

  // ぷっくりバルーン型カスタムピンのHTMLアイコン生成
  const createCustomPopIcon = (spot: Spot, isActive: boolean) => {
    const isVisited = checkins.some(c => c.spot_id === spot.id);
    let color = 'var(--color-joint)';
    let initial = 'T';
    if (spot.group === '=LOVE') { color = 'var(--color-equal-love)'; initial = 'L'; }
    else if (spot.group === '≠ME') { color = 'var(--color-not-equal-me)'; initial = 'M'; }
    else if (spot.group === '≒JOY') { color = 'var(--color-nearly-joy)'; initial = 'J'; }

    // 🏆 巡礼済みの場合はゴールドカラーに
    if (isVisited) {
      color = '#eab308'; // 明るく美しいゴールドイエロー
    }

    const html = `
      <div class="pop-pin-container ${isActive ? 'active' : ''} ${isVisited ? 'visited' : ''}" style="color: ${color};">
        ${isVisited ? '<div class="pop-pin-stamp" style="background: #eab308; box-shadow: 0 3px 6px rgba(234,179,8,0.4);">👑</div>' : ''}
        <div class="pop-pin-balloon" style="color: ${color}; background-color: ${isVisited ? '#ffd700' : 'currentColor'}; border-color: ${isVisited ? '#ffd700' : '#ffffff'}">
          <span class="pop-pin-text" style="color: ${isVisited ? '#000000' : '#ffffff'}; font-weight: 900;">${initial}</span>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-pin',
      iconSize: [44, 44],
      iconAnchor: [22, 34]
    });
  };

  // 聖地や年表スライダーが動いたときにマーカーをクリア＆再描画
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof L === 'undefined') return;

    // 既存のマーカーを完全に消去
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // 新しいクラスタグループを作成
    const useClustering = typeof L.markerClusterGroup === 'function';
    const clusterGroup = useClustering ? L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true
    }) : null;

    if (clusterGroup) {
      clusterGroupRef.current = clusterGroup;
    }

    // 新たにフィルタリングされたマーカーを追加
    filteredSpotsOnMap.forEach(spot => {
      const isActive = selectedSpot?.id === spot.id;
      const icon = createCustomPopIcon(spot, isActive);

      // bindPopupは使用せず、右側のInfo Panelにデータを反映する
      const marker = L.marker([spot.latitude, spot.longitude], { icon })
        .on('click', () => {
          setSelectedSpot(spot);
          setRightPanelTab('detail'); // ピンをタップしたら自動的に「詳細」タブを表示
          map.setView([spot.latitude, spot.longitude], map.getZoom(), { animate: true });
        });

      if (clusterGroup) {
        clusterGroup.addLayer(marker);
      } else {
        marker.addTo(map);
      }
      markersRef.current.push(marker);
    });

    if (clusterGroup) {
      map.addLayer(clusterGroup);
    }
  }, [spots, checkins, selectedSpot, searchGroup, searchKeyword, showPrivacyPage]);

  // GPS判定付きチェックイン実行 (オプティミスティックUI ＆ 未ログインガード対応)
  const handleCheckin = (spot: Spot) => {
    // 1. 未ログインユーザー制限: BaaS負荷軽減のため、現地チェックインなどのWrite処理は認証必須とする
    if (!authSession) {
      setBlockMessage("現地チェックインをして聖地巡礼を記録するには、無料のアカウント登録（ログイン）が必要です🗺️✨");
      setShowBlockModal(true);
      return;
    }

    const isVisited = checkins.some(c => c.spot_id === spot.id);
    if (isVisited) {
      // 登録済みの場合はオプティミスティックに即時解除
      const originalCheckins = [...checkins];
      const filtered = checkins.filter(c => c.spot_id !== spot.id);
      setCheckins(filtered);

      // バックグラウンド非同期処理でDBに保存（応答速度0msを実現し、BaaS Write負荷を軽減）
      setTimeout(() => {
        try {
          db.removeCheckIn(spot.id);
        } catch (e) {
          console.error("Failed to remove checkin from DB", e);
          setCheckins(originalCheckins); // ロールバック
        }
      }, 50);
      return;
    }

    // Geolocation API 存在確認
    if (!navigator.geolocation) {
      alert("お使いのブラウザはGPS（位置情報サービス）に対応していません。");
      return;
    }

    setIsGpsLocating(true);

    const performOptimisticCheckin = (distance: number, viaBypass: boolean) => {
      setIsCheckinAnimating(true);
      setIsGpsLocating(false);

      // 楽観的にチェックインレコードを作成し、Stateを即時更新
      const newCheckIn: CheckIn = {
        id: 'temp_' + Date.now(),
        user_id: currentUser.id,
        spot_id: spot.id,
        visited_at: new Date().toISOString()
      };
      
      const originalCheckins = [...checkins];
      setCheckins([...checkins, newCheckIn]);

      if (viaBypass) {
        alert(`🛠️【開発者バイパス】巡礼を許可しました！\n(実際の現在地との距離: 約 ${Math.round(distance / 1000 * 10) / 10}km)`);
      } else {
        alert(`🎉 巡礼に成功しました！\nGPS判定に成功しました。(スポットとの距離: 約 ${Math.round(distance)}m)`);
      }

      // バックグラウンド非同期処理で安全にDB/BaaSに保存
      setTimeout(() => {
        try {
          db.addCheckIn(spot.id);
        } catch (e) {
          console.error("Failed to save checkin to DB", e);
          setCheckins(originalCheckins); // エラー時はロールバック
        }
      }, 50);

      setTimeout(() => {
        setIsCheckinAnimating(false);
      }, 1000);
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        const distance = getDistance(userLat, userLon, spot.latitude, spot.longitude);

        // 判定ロジック: 500m以内、またはテストバイパスONなら成功
        if (gpsBypass || distance <= 500) {
          performOptimisticCheckin(distance, gpsBypass);
        } else {
          setIsGpsLocating(false);
          alert(`❌ スポットの近くにいないため巡礼できませんでした。\n(半径500m以内のみ有効 / 現在の距離: 約 ${Math.round(distance / 1000 * 10) / 10}km)\n\n※自宅からテストする場合は、パネル下部の「🛠️ 開発者用バイパス(500m制限無効化)」をONに設定してください。`);
        }
      },
      () => {
        setIsGpsLocating(false);
        // バイパス有効ならエラーでも特別許可
        if (gpsBypass) {
          performOptimisticCheckin(999999, true);
        } else {
          alert("❌ 位置情報の取得が許可されなかったか、GPSの測位に失敗したため巡礼できませんでした。");
        }
      },
      {
        enableHighAccuracy: true, // 🛰️ 高精度GPSセンサー（ハードウェアGPS）を強制起動
        timeout: 10000,           // 測位の安定化を待つため10秒間の猶予を設定
        maximumAge: 0             // 過去の古いキャッシュデータを使用せず、常に最新の現在地を取得
      }
    );
  };

  // 🔍 検索窓でEnterキー押下時にすべてのピンを画面にフィットさせる
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 日本語のIME変換確定のEnterキーは除外する
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      
      const map = mapRef.current;
      if (!map || typeof L === 'undefined') return;

      const matchedCount = filteredSpotsOnMap.length;
      if (matchedCount === 0) {
        // 検索実行(Enter)されたタイミングで初めて0件トーストを表示
        setShowNoResultsToast(true);
        // 3秒後に自動的にトーストを非表示にする
        setTimeout(() => {
          setShowNoResultsToast(false);
        }, 3000);
        return;
      }

      // ヒットした場合はトーストを即時隠す
      setShowNoResultsToast(false);

      if (matchedCount === 1) {
        // ヒットした聖地が1件だけの場合、そこを中心にズームレベル15で表示
        const singleSpot = filteredSpotsOnMap[0];
        map.setView([singleSpot.latitude, singleSpot.longitude], 15, { animate: true });
        setSelectedSpot(singleSpot);
        setRightPanelTab('detail');
      } else {
        // 複数ヒットした場合、すべてのピンを含む境界（Bounds）を計算してフィット
        const points = filteredSpotsOnMap.map(spot => L.latLng(spot.latitude, spot.longitude));
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, {
          padding: [50, 50],
          animate: true,
          duration: 1.0
        });
      }
    }
  };

  // 📍 現在地（GPS）へスムーズにカメラを戻す＆青い現在地ピンをマウント
  const handleJumpToCurrentUser = () => {
    if (!navigator.geolocation) {
      alert("❌ お使いのブラウザはGPS（位置情報サービス）に対応していません。");
      return;
    }

    setIsGpsJumping(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const map = mapRef.current;

        if (map && typeof L !== 'undefined') {
          // 既存の現在地マーカーがあれば削除
          if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.remove();
          }

          // 青いドットの現在地カスタムマーカー
          const userIcon = L.divIcon({
            html: `<div class="user-gps-dot"></div>`,
            className: 'custom-gps-dot',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const newMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
          userLocationMarkerRef.current = newMarker;

          // カメラをスムーズに現在地に移動＆適切なズーム（15）にセット
          map.setView([lat, lng], 15, { animate: true });
        }
        setIsGpsJumping(false);
      },
      () => {
        setIsGpsJumping(false);
        alert("❌ 現在の位置情報を取得できませんでした。デバイスのGPSがONになっているか、ブラウザの位置情報アクセス権限が許可されているかご確認ください。");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // X（Twitter）シェアWeb Intent発火
  const handleXShare = (spot: Spot) => {
    const text = `📍${spot.name} に到着✨
イコノイジョイ聖地MAP🗺️で推しの足跡を巡ってます🏃‍♂️💨

👇みんなも記録しよう！
${window.location.origin + window.location.pathname}
#イコラブ #ノイミー #ニアジョイ #聖地巡礼`;

    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(xUrl, '_blank');
  };

  // スポットを地図上で表示してフォーカスする
  const handleFocusSpotOnMap = (spot: Spot) => {
    setSelectedSpot(spot);
    setRightPanelTab('detail');
    
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.setView([spot.latitude, spot.longitude], mapRef.current.getZoom(), { animate: true });
      }
    }, 150);
  };

  // プロフィール更新
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authSession) {
      alert("❌ ログインが必要です。");
      return;
    }
    const user = db.getCurrentUser();
    user.username = editUsername;
    user.oshi_group = editOshiGroup;
    user.active_title = editActiveTitle;
    db.setCurrentUser(user);
    setCurrentUser(user);
    authService.syncUserProfile(user); // セッションDB同期
    setShowProfileEdit(false);
    alert("🎉 プロフィールを保存しました！");
  };

  // ファン称号の算出
  const getFanRank = (count: number) => {
    if (count === 0) return { title: 'ひよっこ巡礼者 🐣', color: 'text-slate-400', bg: 'bg-slate-100', border: 'border-slate-300' };
    if (count <= 2) return { title: 'ブロンズカメコ 🥉', color: 'text-[#b45309]', bg: 'bg-[#fef3c7]', border: 'border-[#f59e0b]/30' };
    if (count <= 4) return { title: 'シルバーカメコ 🥈', color: 'text-[#475569]', bg: 'bg-[#f1f5f9]', border: 'border-[#64748b]/30' };
    if (count <= 5) return { title: 'ゴールド巡礼者 🥇', color: 'text-[#d97706] font-bold', bg: 'bg-[#fef3c7]', border: 'border-[#ffd60a]/50' };
    return { title: '伝説のイコノイジョイマスター 👑', color: 'text-purple-600 font-extrabold', bg: 'bg-gradient-to-r from-[#ff6897]/10 to-[#00d2dd]/10', border: 'border-[#a78bfa]' };
  };

  const fanRank = getFanRank(checkins.length);

  // 📄 プライバシーポリシー全画面レンダリング (showPrivacyPage === true のとき)
  if (showPrivacyPage) {
    return (
      <div className="privacy-page-container" style={{
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#1e293b',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 💖 グラデーションヘッダー */}
        <header style={{
          background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)',
          padding: '32px 16px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(255, 104, 151, 0.15)',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '32px', animation: 'float 3s ease-in-out infinite' }}>📜</span>
            <h1 style={{ fontSize: '20px', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>
              プライバシーポリシー
            </h1>
            <p style={{ fontSize: '11px', opacity: 0.9, margin: 0, fontWeight: '700' }}>
              トリプルデート・マップ (非公式ファンサービス)
            </p>
          </div>
        </header>

        {/* 📚 ポリシー本文メインコンテンツ */}
        <main style={{ flex: 1, maxWidth: '720px', width: '100%', margin: '24px auto', padding: '0 16px 80px' }}>
          {/* マップに戻るフローティング誘導 */}
          <button
            onClick={navigateToHome}
            className="pop-button font-black"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              color: 'var(--text-main)',
              border: '2px solid #cbd5e1',
              padding: '10px 18px',
              borderRadius: '20px',
              fontSize: '11.5px',
              cursor: 'pointer',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            🗺️ 聖地マップに戻る
          </button>

          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '2px solid #e2e8f0',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.03)',
            padding: isMobile ? '24px 16px' : '40px 32px'
          }}>
            {/* 非公式明記の特別目立つアラートボックス */}
            <div style={{
              fontSize: '11.5px',
              color: '#9f1239',
              lineHeight: '1.7',
              background: '#fff1f2',
              padding: '18px',
              borderRadius: '16px',
              border: '1.5px solid #ffe4e6',
              fontWeight: '900',
              marginBottom: '28px'
            }}>
              💡 免責事項（非公式宣言）<br />
              本サービス「トリプルデートマップ」（以下「本サービス」）は、=LOVE / ≠ME / ≒JOY（以下「イコノイジョイ」）および各公式運営・所属事務所・権利者とは一切関係のない非公式サービスです。PWA / Webアプリとしてファン有志によって提供されています。
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '12px', color: '#334155', lineHeight: '1.8' }}>
              
              <div>
                <p style={{ margin: 0, fontWeight: '700', color: '#475569' }}>
                  『トリプルデートマップ』は、ユーザーの個人情報の取扱いおよびセキュリティについて、以下のとおり定めます。
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 8px 0', borderLeft: '4px solid #ff6897', paddingLeft: '8px' }}>
                  1. 収集する情報
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '12.5px' }}>● アカウント情報（外部連携）：</strong>
                    <span style={{ display: 'block', marginTop: '2px' }}>
                      本サービスはGoogle等のOAuth認証を利用しています。ログイン時にプラットフォームから提供される「メールアドレス」「氏名（表示名）」「プロフィール画像」のみを取得します。※ユーザーのパスワードは本サービスでは一切保持・管理いたしません。
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '12.5px' }}>● 位置情報（GPSデータ）：</strong>
                    <span style={{ display: 'block', marginTop: '2px' }}>
                      聖地での「チェックイン機能」を利用する際、ユーザーの現在地情報を取得します。この情報は、チェックイン対象スポットとの距離判定にのみ一時的に使用され、ユーザーの移動履歴としてサーバーに保存・追跡されることはありません。
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '12.5px' }}>● プロフィール・利用データ：</strong>
                    <span style={{ display: 'block', marginTop: '2px' }}>
                      獲得した称号（バッジ）、チェックイン履歴、ユーザーが提案・追加した聖地情報など、本サービス内でユーザーが生成したデータ。
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 8px 0', borderLeft: '4px solid #ff6897', paddingLeft: '8px' }}>
                  2. 利用目的
                </h3>
                <ul style={{ margin: '6px 0 0 20px', padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>本サービスの提供・維持、およびアカウント認証（ログイン）管理のため</li>
                  <li>GPSを利用した現在地とスポットの距離判定、およびチェックイン機能の提供のため</li>
                  <li>ユーザーサポートおよびお問い合わせ対応のため</li>
                  <li>サービスの利用状況分析および機能改善のため</li>
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 8px 0', borderLeft: '4px solid #ff6897', paddingLeft: '8px' }}>
                  3. 情報の管理と外部サービスの利用
                </h3>
                <ul style={{ margin: '6px 0 0 20px', padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>本サービスは、収集したデータを安全に管理するため、セキュリティ基準を満たした外部のクラウドデータベース（Supabase等）を利用してデータを保管しています。</li>
                  <li>法令に基づく場合を除き、ユーザーの同意を得ることなく第三者へ個人情報を提供することはありません。</li>
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 8px 0', borderLeft: '4px solid #ff6897', paddingLeft: '8px' }}>
                  4. 免責事項
                </h3>
                <ul style={{ margin: '6px 0 0 20px', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>本サービスは、アクセス制御（RLS）や通信の暗号化を実施しデータの保護に努めておりますが、個人開発による運営のため、予期せぬシステム障害、サイバー攻撃、またはサービス終了に伴うデータの消失や損害について、法令により免責が認められない場合（運営者の故意または重過失による場合等）を除き、一切の責任を負いかねます。</li>
                  <li style={{ color: '#ff6897', fontWeight: '800' }}>チェックイン記録などの大切な思い出のデータにつきましては、ユーザーご自身でもスクリーンショット等でバックアップを保管していただくことを強く推奨いたします。</li>
                  <li>端末のGPS精度の誤差や、通信環境によってチェックインが正常に行えなかった場合の補償等はいたしかねます。</li>
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 8px 0', borderLeft: '4px solid #ff6897', paddingLeft: '8px' }}>
                  5. データの削除
                </h3>
                <p style={{ margin: 0 }}>
                  ユーザーは、本サービス内の設定画面等より、いつでも自身のアカウントおよび紐づく全データを完全に削除（退会）することができます。
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 8px 0', borderLeft: '4px solid #ff6897', paddingLeft: '8px' }}>
                  6. 本ポリシーの変更
                </h3>
                <p style={{ margin: 0 }}>
                  本サービスは、必要に応じて本プライバシーポリシーを変更することがあります。変更した場合は、本サービス内でお知らせいたします。
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 8px 0', borderLeft: '4px solid #ff6897', paddingLeft: '8px' }}>
                  7. お問い合わせ
                </h3>
                <p style={{ margin: 0 }}>
                  個人情報の取扱い、または本サービスに関するお問い合わせは、公式Discordコミュニティにて、お願いいたします。
                </p>
                <div style={{ marginTop: '12px' }}>
                  <a
                    href="https://discord.gg/QBhyDJ5hF"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pop-button font-black"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #5865F2 0%, #a78bfa 100%)',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '16px',
                      textDecoration: 'none',
                      fontSize: '11.5px',
                      boxShadow: '0 4px 15px rgba(88, 101, 242, 0.3)'
                    }}
                  >
                    👾 公式Discordコミュニティに参加する
                  </a>
                </div>
              </div>

            </div>
          </div>
          
          {/* プライバシーポリシーページの下部簡易フッター */}
          <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '10px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '8px', fontWeight: '900' }}>
              {/* 📜 利用規約リンク (将来追加できるようにリンクを準備) */}
              <a href="#" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>利用規約</a>
              <span>•</span>
              <a href="#" onClick={navigateToHome} style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>聖地マップ</a>
              <span>•</span>
              <a href="https://discord.gg/QBhyDJ5hF" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>お問い合わせ (Discord)</a>
            </div>
            © {new Date().getFullYear()} トリプルデートマップ (非公式)
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      
      {/* 1. 上部パネル (Header) */}
      <header className="app-header">
        <div className="header-left">
          <div className="header-icon-box">
            <div className="header-icon-inner">
              🗺️
            </div>
          </div>
          <h1 className="header-title">
            トリプルデート・マップ
          </h1>
        </div>

        {/* アクティブグループの可愛いバッジ と アカウント認証UI */}
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* 📱 モバイル用3本線メニューボタン */}
          <button
            className="mobile-menu-trigger"
            onClick={() => setIsMobileMenuOpen(true)}
            style={{
              display: 'none',
              background: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              padding: '8px 12px',
              cursor: 'pointer',
              color: 'var(--text-main)',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              transition: 'all 0.2s',
              gap: '6px'
            }}
          >
            <Menu size={18} />
          </button>

          <div className="group-badges-container" style={{ display: 'flex', alignItems: 'center' }}>
            <span className="active-group-label" style={{ marginRight: '8px' }}>Active Groups</span>
            <span className="group-dot" style={{ backgroundColor: 'var(--color-equal-love)' }}></span>
            <span className="group-badge-text border-r-slate" style={{ color: 'var(--color-equal-love)' }}>=LOVE</span>
            
            <span className="group-dot" style={{ backgroundColor: 'var(--color-not-equal-me)' }}></span>
            <span className="group-badge-text border-r-slate" style={{ color: 'var(--color-not-equal-me)' }}>≠ME</span>
            
            <span className="group-dot" style={{ backgroundColor: 'var(--color-nearly-joy)' }}></span>
            <span className="group-badge-text" style={{ color: 'var(--color-nearly-joy)' }}>≒JOY</span>
          </div>

          <div className="auth-header-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {authSession ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.85)', border: '1px solid #ffeef2', padding: '4px 12px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                    {currentUser.username}
                  </span>
                  {currentUser.active_title && (
                    <span style={{ fontSize: '8px', color: '#ff6897', fontWeight: 'bold' }}>
                      👑 {currentUser.active_title}
                    </span>
                  )}
                </div>
                <button
                  onClick={async () => {
                    await authService.signOut();
                    alert("👋 ログアウトしました");
                  }}
                  title="ログアウト"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    borderRadius: '50%',
                    transition: 'all 0.2s'
                  }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setShowAuthModal(true);
                  }}
                  className="pop-button"
                  style={{
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    color: 'var(--text-main)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ログイン
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="pop-button font-black"
                  style={{
                    background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)',
                    border: 'none',
                    color: 'white',
                    fontSize: '10px',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(255, 104, 151, 0.2)'
                  }}
                >
                  無料登録
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. メイン領域 (左右分割: 左側が 地図 + 下部スライダー, 右側が Info Panel) */}
      <div className="main-area">
        
        {/* 左側: 地図領域 */}
        <div className="left-area">
          
          {/* 地図エリア (中央のメインエリア) */}
          <div className="map-container" style={{ position: 'relative' }}>
            {/* 🔍 フローティング検索バー */}
            <div className="map-search-bar">
              {/* グループ絞り込みセレクト */}
              <select
                value={searchGroup}
                onChange={(e) => setSearchGroup(e.target.value)}
                className="search-select"
              >
                <option value="すべて">すべて</option>
                <option value="=LOVE">=LOVE</option>
                <option value="≠ME">≠ME</option>
                <option value="≒JOY">≒JOY</option>
                <option value="合同">合同</option>
              </select>

              {/* キーワード入力 */}
              <input
                type="text"
                placeholder="曲名、メンバー名、場所で検索..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="search-input"
              />

              {/* キーワードクリアボタン（入力がある場合のみ） */}
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="search-clear-btn"
                >
                  ✕
                </button>
              )}
            </div>

            {/* ⚠️ 検索結果が0件の時のフィードバックトースト */}
            {showNoResultsToast && (
              <div className="map-no-results">
                <span>⚠️ 条件に一致するスポットが見つかりません。</span>
              </div>
            )}

            {/* ◎ 現在地へ戻るジャンプボタン */}
            <button
              onClick={handleJumpToCurrentUser}
              className={`gps-jump-btn ${isGpsJumping ? 'locating' : ''}`}
              title="現在地に移動"
              style={{
                position: 'absolute',
                bottom: '120px',
                right: '12px',
                zIndex: 999,
                background: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              <Compass className={`w-5 h-5 stroke-[2.5] ${isGpsJumping ? 'text-violet-500 animate-spin' : 'text-slate-700'}`} />
            </button>

            <div className="map-wrapper">
              <div 
                id="map-canvas" 
                style={{ width: '100%', height: '100%' }}
              ></div>
            </div>
          </div>

        </div>

        {/* 📱 モバイルメニュー用暗幕オーバーレイ */}
        {isMobileMenuOpen && (
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(30, 41, 59, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 1900,
              transition: 'opacity 0.3s ease'
            }}
          ></div>
        )}

        {/* 右側パネル (Info Panel / MyPage) */}
        <aside className={`right-panel ${isMobileMenuOpen ? 'mobile-open' : ''}`}>

          {/* 📱 スマホ専用ドロワーヘッダー（閉じるボタン & 認証コントロール） */}
          <div className="drawer-mobile-header" style={{ display: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'var(--gradient-triple)',
                padding: '2px'
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '6px', background: '#fff', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                  🗺️
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-main)' }}>メニュー</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* モバイル用認証コントロール */}
              <div className="mobile-auth-controls" style={{ display: 'flex', alignItems: 'center' }}>
                {authSession ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(244,247,254,0.7)', padding: '2px 8px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-main)', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {currentUser.username}
                    </span>
                    <button
                      onClick={async () => {
                        await authService.signOut();
                        alert("👋 ログアウトしました");
                        setIsMobileMenuOpen(false);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '1px' }}
                    >
                      <LogOut size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAuthMode('signin');
                      setShowAuthModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="pop-button"
                    style={{
                      background: 'var(--gradient-triple)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ログイン
                  </button>
                )}
              </div>

              {/* 閉じるボタン */}
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* ☕️ 開発者支援（カンパ）導線最優先枠 */}
          <div style={{
            padding: '12px 12px 8px 12px',
            borderBottom: '1px dashed #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: '64px'
          }}>
            <a 
              data-ofuse-widget-button="true"
              href="https://ofuse.me/o?uid=180694" 
              data-ofuse-id="180694" 
              data-ofuse-size="large" 
              data-ofuse-color="pink" 
              data-ofuse-text="開発費用を支援する" 
              data-ofuse-style="rectangle"
            >
              開発費用を支援する
            </a>
            <span style={{ 
              fontSize: '9.5px', 
              color: 'var(--text-muted)', 
              marginTop: '8px',
              textAlign: 'center',
              fontWeight: '700'
            }}>
              ※有料サーバー維持のためのOFUSE支援ページが開きます
            </span>
          </div>

          {/* ミニタブセレクター (ぷっくり角丸ボタン) */}
          <div className="panel-tab-bar" style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1.1fr', 
            gap: '6px', 
            padding: '12px' 
          }}>
            {!isMobile && (
              <button
                onClick={() => setRightPanelTab('detail')}
                className={`pop-button panel-tab-btn ${
                  rightPanelTab === 'detail'
                    ? 'active-detail'
                    : 'inactive'
                }`}
                style={{ padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '10px' }}
              >
                <Compass className="w-3.5 h-3.5" />
                聖地詳細
              </button>
            )}
            
            <button
              onClick={() => setRightPanelTab('mypage')}
              className={`pop-button panel-tab-btn ${
                rightPanelTab === 'mypage'
                  ? 'active-mypage'
                  : 'inactive'
              }`}
              style={{ padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '10px' }}
            >
              <UserIcon className="w-3.5 h-3.5" />
              マイページ
            </button>

            <button
              onClick={() => setRightPanelTab('mission')}
              className={`pop-button panel-tab-btn ${
                rightPanelTab === 'mission'
                  ? 'active-mission'
                  : 'inactive'
              }`}
              style={{ padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '10px' }}
            >
              <Trophy className="w-3.5 h-3.5" />
              ミッション 🏆
            </button>
          </div>

          {/* タブコンテンツ */}
          <div className="panel-content">

            {/* TAB 3: 巡礼ミッションエリア */}
            {rightPanelTab === 'mission' && (
              <div className="info-scroll-area" style={{ height: '100%', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* ヘッダー */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    <Trophy className="w-5 h-5 text-[#ffd60a]" />
                    <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>巡礼アワード・ミッション</h3>
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                    対象の聖地を実際に巡礼（チェックイン）して、限定の称号バッジを獲得しましょう！
                  </p>

                  {/* トリガーミッションの進捗カード */}
                  {(() => {
                    const triggerSpots = spots.filter(s => s.tags && s.tags.includes("トリガー巡礼"));
                    const checkedTriggerSpots = checkins.filter(c => {
                      const spot = spots.find(s => s.id === c.spot_id);
                      return spot && spot.tags && spot.tags.includes("トリガー巡礼");
                    });
                    const uniqueCheckedCount = new Set(checkedTriggerSpots.map(c => c.spot_id)).size;
                    const totalTriggerCount = triggerSpots.length || 12;
                    const percent = Math.min(100, Math.round((uniqueCheckedCount / totalTriggerCount) * 100));
                    const isCompleted = uniqueCheckedCount === totalTriggerCount;

                    return (
                      <div className="pop-panel" style={{
                        borderRadius: '16px',
                        border: '2px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-panel)'
                      }}>
                        {/* アコーディオンヘッダー */}
                        <div 
                          onClick={() => setMissionExpanded(!missionExpanded)}
                          style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 100%)',
                            borderBottom: '1px solid #e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '900', color: '#6d28d9' }}>
                              『この空がトリガー』全聖地巡礼せよ！
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800' }}>
                              進行状況: {uniqueCheckedCount} / {totalTriggerCount} 箇所 ({percent}%)
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isCompleted ? (
                              <span style={{ fontSize: '10px', fontWeight: '900', color: '#ff6897', background: '#ffffff', padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(255,104,151,0.2)' }}>達成！</span>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" style={{ transform: missionExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                            )}
                          </div>
                        </div>

                        {/* アコーディオンの中身（12箇所の聖地リスト） */}
                        {missionExpanded && (
                          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#ffffff' }}>
                            
                            {/* プログレスバー */}
                            <div style={{ padding: '4px 6px 10px 6px' }}>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #ff6897 0%, #a78bfa 100%)', transition: 'width 0.4s ease-out' }}></div>
                              </div>
                            </div>

                            {/* 12箇所のリスト */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {triggerSpots.map(spot => {
                                const isSpotChecked = checkins.some(c => c.spot_id === spot.id);
                                return (
                                  <div 
                                    key={spot.id} 
                                    onClick={() => {
                                      // マップ上でこの場所にジャンプ & タブを詳細に切り替えて開く
                                      handleFocusSpotOnMap(spot);
                                      setSelectedSpot(spot);
                                      setRightPanelTab('detail');
                                    }}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '10px 12px',
                                      borderRadius: '10px',
                                      background: isSpotChecked ? '#fff5f8' : '#f8fafc',
                                      border: isSpotChecked ? '1px solid rgba(255, 104, 151, 0.2)' : '1px solid #e2e8f0',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                    className="mission-spot-item"
                                  >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden', paddingRight: '12px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '800', color: isSpotChecked ? 'var(--text-main)' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {spot.name}
                                      </span>
                                      <span style={{ fontSize: '8px', color: '#94a3b8' }}>{spot.category}</span>
                                    </div>
                                    <div style={{ flexShrink: 0 }}>
                                      {isSpotChecked ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#ffffff', color: '#ff6897', padding: '2px 8px', borderRadius: '9999px', fontSize: '9px', fontWeight: '900', border: '1px solid rgba(255,104,151,0.2)' }}>
                                          <CheckCircle2 className="w-3 h-3 text-[#ff6897]" />
                                          行った！
                                        </div>
                                      ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#ffffff', color: '#94a3b8', padding: '2px 8px', borderRadius: '9999px', fontSize: '9px', fontWeight: '800', border: '1px solid #e2e8f0' }}>
                                          未チェック
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* 称号獲得の通知報酬枠 */}
                            <div style={{
                              marginTop: '8px',
                              padding: '10px',
                              borderRadius: '10px',
                              background: isCompleted ? 'linear-gradient(135deg, rgba(255,104,151,0.06) 0%, rgba(167,139,250,0.06) 100%)' : '#f8fafc',
                              border: isCompleted ? '1px dashed #a78bfa' : '1px dashed #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isCompleted ? 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)' : '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <Award className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '10px', fontWeight: '900', color: isCompleted ? '#ff6897' : '#64748b' }}>称号報酬: 『この空がトリガー』完遂者</span>
                                <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                  {isCompleted ? '🎉 称号報酬を獲得！マイページにバッジが光輝いています。' : '12箇所すべて巡るとプレミアム称号バッジが解放されます。'}
                                </span>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })()}

                </div>
              </div>
            )}

            {/* TAB 1: 聖地詳細エリア (PC専用、スマホではボトムシートへ分離) */}
            {!isMobile && rightPanelTab === 'detail' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                {!selectedSpot ? (
                  // デフォルト表示：「ピンをタップして詳細を表示」
                  <div className="welcome-container">
                    <div className="welcome-icon-box">
                      <Compass className="w-9 h-9 text-slate-300 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="welcome-title">聖地巡礼ステーション</h3>
                      <p className="welcome-desc">
                        左の地図上のピンをタップすると、イコノイジョイの聖地詳細やエピソードがここに表示されます！
                      </p>
                    </div>
                  </div>
                ) : (
                  // スポット情報表示
                  <div className="info-scroll-area">
                    
                    {/* カテゴリ ＆ 日付ヘッダー */}
                    <div className="detail-header">
                      <div className="detail-badges">
                        <span className="spot-group-badge" style={{
                          backgroundColor: selectedSpot.group === '=LOVE' ? '#fff5f8' :
                                           selectedSpot.group === '≠ME' ? '#e0fbfa' :
                                           selectedSpot.group === '≒JOY' ? '#fffbeb' : '#f5f3ff',
                          color: selectedSpot.group === '=LOVE' ? 'var(--color-equal-love)' :
                                 selectedSpot.group === '≠ME' ? 'var(--color-not-equal-me)' :
                                 selectedSpot.group === '≒JOY' ? '#d97706' : 'var(--color-joint)',
                          borderColor: selectedSpot.group === '=LOVE' ? 'rgba(255, 104, 151, 0.2)' :
                                       selectedSpot.group === '≠ME' ? 'rgba(0, 210, 221, 0.2)' :
                                       selectedSpot.group === '≒JOY' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(167, 139, 250, 0.2)'
                        }}>
                          {selectedSpot.group}
                        </span>
                        <span className="spot-cat-badge">
                          {selectedSpot.category}
                        </span>
                      </div>
                      <span className="spot-date-text">
                        {selectedSpot.event_date.replace(/-/g, '/')}
                      </span>
                    </div>

                    {/* スポット名 */}
                    <div className="detail-title-section">
                      <span className="detail-meta-label">SPOT NAME</span>
                      <h2 className="detail-title">
                        {selectedSpot.name}
                      </h2>
                    </div>

                    {/* 誕生年月 */}
                    <div className="detail-time-box">
                      <Calendar className="w-4 h-4 text-[#a78bfa]" />
                      <div className="detail-time-text">
                        <span style={{ fontWeight: '800', color: 'var(--color-equal-love)', marginRight: '6px', letterSpacing: '0.05em' }}>MEMORIAL DAY:</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: '900' }}>{selectedSpot.event_date.split('-').map((v, i) => v + ['年', '月', '日'][i]).join('')}</span>
                      </div>
                    </div>

                    {/* エピソード (改行対応) */}
                    <div className="episode-container animate-fade-in-up">
                      <h4 className="detail-meta-label">
                        聖地のエピソード
                      </h4>
                      <p className="episode-text">
                        {selectedSpot.description}
                      </p>
                    </div>

                    {/* YouTube動画自動埋め込み */}
                    {selectedSpot.youtube_url && (() => {
                      const isIframe = selectedSpot.youtube_url.includes('<iframe');
                      let watchUrl = "";
                      
                      if (isIframe) {
                        const match = selectedSpot.youtube_url.match(/src="([^"]+)"/);
                        if (match && match[1]) {
                          watchUrl = match[1].replace('/embed/', '/watch?v=');
                        }
                      } else {
                        watchUrl = selectedSpot.youtube_url.replace('/embed/', '/watch?v=');
                      }

                      return (
                        <div className="video-section">
                          <div className="video-label-bold" style={{ fontWeight: 'bold', fontSize: '11px', color: '#1e293b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Play className="w-3 h-3 text-red-500 fill-red-500" />
                            {selectedSpot.youtube_title || "🎥 関連映像"}
                          </div>
                          <div className="video-box" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden' }}>
                            {isIframe ? (
                              <div 
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                dangerouslySetInnerHTML={{ 
                                  __html: selectedSpot.youtube_url
                                    .replace(/width="\d+"/, 'width="100%"')
                                    .replace(/height="\d+"/, 'height="100%"')
                                    .replace(/style="[^"]*"/, '')
                                }} 
                              />
                            ) : (
                              <iframe 
                                width="100%" 
                                height="100%" 
                                src={`${selectedSpot.youtube_url}?modestbranding=1&rel=0`} 
                                title={selectedSpot.youtube_title || "YouTube video player"} 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                style={{ width: '100%', height: '100%', border: 'none' }}
                              ></iframe>
                            )}
                          </div>
                          {watchUrl && (
                            <a 
                              href={watchUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="video-link"
                            >
                              YouTubeアプリで視聴する
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    })()}

                    {/* 🗺️ Googleマップで経路案内ボタン */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.latitude},${selectedSpot.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pop-button google-map-route-btn animate-fade-in-up"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        backgroundColor: '#ffffff',
                        border: '2px solid #e2e8f0',
                        padding: '12px',
                        fontSize: '12px',
                        color: '#475569',
                        fontWeight: '800',
                        textDecoration: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
                        marginBottom: '12px',
                        transition: 'transform 0.2s'
                      }}
                    >
                      🗺️ Googleマップで経路案内
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* チェックイン＆Xシェアアクションエリア */}
                    <div className="checkin-action-area">
                      {isCheckinAnimating && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          zIndex: 50,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pointerEvents: 'none'
                        }}>
                          <div className="stamp-effect-big" style={{
                            fontWeight: 900,
                            fontSize: '14px',
                            color: '#ffffff',
                            letterSpacing: '0.1em',
                            background: 'linear-gradient(135deg, var(--color-equal-love) 0%, var(--color-joint) 100%)',
                            padding: '10px 20px',
                            borderRadius: '9999px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            border: '3px solid #ffffff'
                          }}>
                            💮 巡礼達成！ 💮
                          </div>
                        </div>
                      )}

                      {checkins.some(c => c.spot_id === selectedSpot.id) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button 
                            onClick={() => handleCheckin(selectedSpot)}
                            className="pop-button checked-in-btn font-black animate-fade-in-up"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            巡礼済み！（タップで取り消し）
                          </button>

                          {/* 【Xシェア機能】チェックイン成功時のみ出現 */}
                          <button 
                            onClick={() => handleXShare(selectedSpot)}
                            className="pop-button animate-fade-in-up"
                            style={{
                              width: '100%',
                              background: '#000000',
                              color: '#ffffff',
                              padding: '12px',
                              fontSize: '12px',
                              borderRadius: '16px',
                              fontWeight: '800',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              border: '2px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            <span style={{ fontFamily: 'system-ui', fontSize: '14px', marginRight: '4px', fontWeight: 'bold' }}>𝕏</span>
                            Xでポストする
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleCheckin(selectedSpot)}
                          disabled={isGpsLocating}
                          className="pop-button checkin-btn font-black"
                          style={{
                            cursor: isGpsLocating ? 'not-allowed' : 'pointer',
                            opacity: isGpsLocating ? 0.8 : 1
                          }}
                        >
                          <Compass className="w-4 h-4 text-white stroke-[2.5]" />
                          {isGpsLocating ? '位置情報を判定中... 📍' : 'ここに巡礼する（チェックイン）'}
                        </button>
                      )}

                      {/* 🏆 手動巡礼済みトグルボタン */}
                      <div style={{
                        marginTop: '16px',
                        paddingTop: '12px',
                        borderTop: '1px dashed #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          👑 遠隔地から手動で「行った！」にする
                        </span>
                        <button
                          onClick={() => {
                            // 未ログインガード
                            if (!authSession) {
                              setBlockMessage("聖地を手動チェックインして巡礼を記録するには、無料のアカウント登録が必要です🗺️✨");
                              setShowBlockModal(true);
                              return;
                            }
                            const isVisited = checkins.some(c => c.spot_id === selectedSpot.id);
                            const originalCheckins = [...checkins];
                            
                            if (isVisited) {
                              // 楽観的解除
                              setCheckins(checkins.filter(c => c.spot_id !== selectedSpot.id));
                              setTimeout(() => {
                                try { db.removeCheckIn(selectedSpot.id); } catch(e) { setCheckins(originalCheckins); }
                              }, 50);
                            } else {
                              // 楽観的追加
                              const newCheckIn: CheckIn = {
                                id: 'temp_' + Date.now(),
                                user_id: currentUser.id,
                                spot_id: selectedSpot.id,
                                visited_at: new Date().toISOString(),
                                is_manual: true
                              };
                              setCheckins([...checkins, newCheckIn]);
                              setIsCheckinAnimating(true);
                              setTimeout(() => {
                                setIsCheckinAnimating(false);
                              }, 1200);

                              setTimeout(() => {
                                try { db.addCheckIn(selectedSpot.id, true); } catch(e) { setCheckins(originalCheckins); }
                              }, 50);
                            }
                          }}
                          className="pop-button"
                          style={{
                            padding: '6px 14px',
                            fontSize: '11px',
                            borderRadius: '12px',
                            fontWeight: '900',
                            backgroundColor: checkins.some(c => c.spot_id === selectedSpot.id) ? '#fef08a' : '#f59e0b',
                            color: checkins.some(c => c.spot_id === selectedSpot.id) ? '#78350f' : '#ffffff',
                            border: '2px solid',
                            borderColor: checkins.some(c => c.spot_id === selectedSpot.id) ? '#fde047' : '#d97706',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}
                        >
                          {checkins.some(c => c.spot_id === selectedSpot.id) ? '✅ 巡礼済み' : '未巡礼'}
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* TAB 2: プロフィール & 履歴タイムライン */}
            {rightPanelTab === 'mypage' && (
              !authSession ? (
                <div className="info-scroll-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', padding: '30px', textAlign: 'center' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #fff5f8 0%, #ffeef2 100%)',
                    border: '2px dashed rgba(255,104,151,0.3)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                    maxWidth: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '32px' }}>🗺️✨</div>
                    <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>巡礼マイページ</h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                      あなただけの巡礼記録の保存、獲得称号の装備、推しの設定、グループ別巡礼統計グラフを利用するには無料のアカウント作成が必要です！
                    </p>
                    <button
                      onClick={() => {
                        setAuthMode('signup');
                        setShowAuthModal(true);
                      }}
                      className="pop-button font-black"
                      style={{
                        background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        boxShadow: '0 4px 12px rgba(255, 104, 151, 0.3)',
                        cursor: 'pointer',
                        marginTop: '8px'
                      }}
                    >
                      無料登録 / ログイン
                    </button>
                  </div>
                </div>
              ) : (
                <div className="info-scroll-area">
                
                {/* ぷっくりユーザーカード */}
                <div className="profile-edit-box pop-panel border-2 border-white">
                  <div className="profile-main-info">
                    <div className="profile-avatar-box">
                      <div className="profile-avatar-inner">
                        <UserIcon className="w-5 h-5 text-[#a78bfa]" />
                      </div>
                    </div>

                    <div>
                      <h3 className="profile-username">
                        {currentUser.username}
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        <span className="profile-oshi-badge" style={{ margin: 0 }}>
                          推し: {currentUser.oshi_group}
                        </span>
                        <span className="badge-pill" style={{
                          background: 'linear-gradient(135deg, #ffd60a 0%, #ff9f1c 100%)',
                          color: '#000000',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '8px',
                          fontWeight: '900',
                          boxShadow: '0 2px 5px rgba(255, 214, 10, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          👑 {currentUser.active_title || "新米巡礼者 🐣"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setEditUsername(currentUser.username);
                      setEditOshiGroup(currentUser.oshi_group);
                      setEditActiveTitle(currentUser.active_title || '');
                      setShowProfileEdit(!showProfileEdit);
                    }}
                    className="pop-button"
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '2px solid #e2e8f0',
                      padding: '8px 0',
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                    }}
                  >
                    {showProfileEdit ? '編集を閉じる' : 'プロフィールを編集する'}
                  </button>
                </div>

                {/* プロフィール編集フォーム */}
                {showProfileEdit && (
                  <div className="edit-form-panel pop-panel border-2 border-white">
                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label className="form-label">
                          ニックネーム
                        </label>
                        <input 
                          type="text" 
                          required
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="form-label">
                          推しグループ
                        </label>
                        <div className="oshi-buttons-grid">
                          {(['=LOVE', '≠ME', '≒JOY', '合同'] as GroupType[]).map(g => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setEditOshiGroup(g)}
                              className={`pop-button oshi-btn ${
                                editOshiGroup === g 
                                  ? 'active' 
                                  : 'inactive'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Award className="w-3.5 h-3.5 text-[#ff6897]" />
                          装備する称号
                        </label>
                        {(() => {
                          const allAcquired = Array.from(new Set([
                            ...(currentUser.acquired_titles || []),
                            ...(currentUser.titles || [])
                          ])).filter(Boolean);

                          if (allAcquired.length === 0) {
                            return (
                              <div style={{ fontSize: '10px', color: '#94a3b8', padding: '6px 0' }}>
                                ※獲得済みの称号がまだありません。聖地を巡って称号を解放しましょう！
                              </div>
                            );
                          }

                          return (
                            <select
                              value={editActiveTitle}
                              onChange={(e) => setEditActiveTitle(e.target.value)}
                              className="form-input search-select"
                              style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#ffffff', fontSize: '11px', fontWeight: '800' }}
                            >
                              <option value="">🐣 新米巡礼者 (称号なし)</option>
                              {allAcquired.map((title, idx) => (
                                <option key={idx} value={title}>
                                  👑 {title}
                                </option>
                              ))}
                            </select>
                          );
                        })()}
                      </div>

                      <button 
                        type="submit"
                        className="pop-button form-submit-btn font-black"
                      >
                        保存する
                      </button>
                    </form>
                  </div>
                )}

                {/* 📊 グループ別巡礼統計パネル */}
                {(() => {
                  const getStats = (group: string) => {
                    const groupSpots = spots.filter(s => s.group === group);
                    const checkedGroupSpots = checkins.filter(c => {
                      const spot = spots.find(s => s.id === c.spot_id);
                      return spot && spot.group === group;
                    });
                    const uniqueCheckedCount = new Set(checkedGroupSpots.map(c => c.spot_id)).size;
                    const total = groupSpots.length;
                    const percent = total > 0 ? Math.round((uniqueCheckedCount / total) * 100) : 0;
                    return { count: uniqueCheckedCount, total, percent };
                  };

                  const eqStats = getStats("=LOVE");
                  const meStats = getStats("≠ME");
                  const joyStats = getStats("≒JOY");
                  const jointStats = getStats("合同");

                  return (
                    <div className="pop-panel border-2 border-white" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        <Compass className="w-4.5 h-4.5 text-violet-500" />
                        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: 'var(--text-main)' }}>グループ別巡礼統計</h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {/* =LOVE Card */}
                        <div style={{
                          background: 'linear-gradient(135deg, #fff5f8 0%, #ffeef2 100%)',
                          border: '1px solid rgba(255,104,151,0.2)',
                          borderRadius: '12px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--color-equal-love)' }}>=LOVE (イコラブ)</span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)' }}>{eqStats.percent}%</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '800' }}>{eqStats.count} / {eqStats.total}</span>
                          </div>
                          <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: `${eqStats.percent}%`, height: '100%', backgroundColor: 'var(--color-equal-love)', borderRadius: '9999px' }}></div>
                          </div>
                        </div>

                        {/* ≠ME Card */}
                        <div style={{
                          background: 'linear-gradient(135deg, #e0fbfa 0%, #d0f7f5 100%)',
                          border: '1px solid rgba(0,210,221,0.2)',
                          borderRadius: '12px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--color-not-equal-me)' }}>≠ME (ノイミー)</span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)' }}>{meStats.percent}%</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '800' }}>{meStats.count} / {meStats.total}</span>
                          </div>
                          <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: `${meStats.percent}%`, height: '100%', backgroundColor: 'var(--color-not-equal-me)', borderRadius: '9999px' }}></div>
                          </div>
                        </div>

                        {/* ≒JOY Card */}
                        <div style={{
                          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                          border: '1px solid rgba(217,119,6,0.2)',
                          borderRadius: '12px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <span style={{ fontSize: '10px', fontWeight: '900', color: '#d97706' }}>≒JOY (ニアジョイ)</span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)' }}>{joyStats.percent}%</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '800' }}>{joyStats.count} / {joyStats.total}</span>
                          </div>
                          <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: `${joyStats.percent}%`, height: '100%', backgroundColor: '#d97706', borderRadius: '9999px' }}></div>
                          </div>
                        </div>

                        {/* 合同 Card */}
                        <div style={{
                          background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                          border: '1px solid rgba(167,139,250,0.2)',
                          borderRadius: '12px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--color-joint)' }}>合同/その他</span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)' }}>{jointStats.percent}%</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '800' }}>{jointStats.count} / {jointStats.total}</span>
                          </div>
                          <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: `${jointStats.percent}%`, height: '100%', backgroundColor: 'var(--color-joint)', borderRadius: '9999px' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 🎖️ 巡礼ミッション ＆ 獲得称号 */}
                <div className="mission-panel pop-panel border-2 border-white" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '8px' }}>
                  <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy className="w-5 h-5 text-[#ffd60a]" />
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: 'var(--text-main)' }}>イコノイジョイ栄誉ミッション</h4>
                  </div>

                  {/* ミッションカードリスト */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* 1. 『この空がトリガー』全聖地巡礼 */}
                    {(() => {
                      const triggerSpots = spots.filter(s => s.tags && s.tags.includes("トリガー巡礼"));
                      const checkedTriggerSpots = checkins.filter(c => {
                        const spot = spots.find(s => s.id === c.spot_id);
                        return spot && spot.tags && spot.tags.includes("トリガー巡礼");
                      });
                      const uniqueCheckedCount = new Set(checkedTriggerSpots.map(c => c.spot_id)).size;
                      const totalTriggerCount = triggerSpots.length || 12;
                      const percent = Math.min(100, Math.round((uniqueCheckedCount / totalTriggerCount) * 100));
                      const isCompleted = uniqueCheckedCount === totalTriggerCount;

                      return (
                        <div className="trigger-mission-card" style={{
                          background: 'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 100%)',
                          border: '1px solid #ddd6fe',
                          borderRadius: '12px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: '#6d28d9' }}>
                              『この空がトリガー』全聖地巡礼
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: '#ff6897' }}>
                              {uniqueCheckedCount} / {totalTriggerCount}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #ff6897 0%, #a78bfa 100%)', borderRadius: '9999px' }}></div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: isCompleted ? 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)' : '#e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Award className={`w-3 h-3 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <div style={{ fontSize: '9px', fontWeight: '800', color: isCompleted ? '#ff6897' : '#94a3b8' }}>
                                称号: 『この空がトリガー』完遂者
                              </div>
                              <div style={{ fontSize: '7.5px', color: '#94a3b8' }}>
                                {isCompleted ? '🎉 ミッション達成！バッジが解放されました！' : '全12箇所のトリガー聖地を巡って称号GET！'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 2. =LOVE全聖地巡礼 */}
                    {(() => {
                      const targetSpots = spots.filter(s => s.group === "=LOVE");
                      const checkedSpots = checkins.filter(c => {
                        const spot = spots.find(s => s.id === c.spot_id);
                        return spot && spot.group === "=LOVE";
                      });
                      const uniqueCheckedCount = new Set(checkedSpots.map(c => c.spot_id)).size;
                      const totalCount = targetSpots.length;
                      const percent = totalCount > 0 ? Math.round((uniqueCheckedCount / totalCount) * 100) : 0;
                      const isCompleted = uniqueCheckedCount === totalCount && totalCount > 0;
                      const rewardTitle = "イコラブの伝道師";

                      return (
                        <div style={{
                          background: 'linear-gradient(135deg, #fff5f8 0%, #ffeef2 100%)',
                          border: '1px solid rgba(255,104,151,0.2)',
                          borderRadius: '12px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--color-equal-love)' }}>
                              =LOVE 全聖地巡礼
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--color-equal-love)' }}>
                              {uniqueCheckedCount} / {totalCount}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', backgroundColor: 'var(--color-equal-love)', borderRadius: '9999px' }}></div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: isCompleted ? 'linear-gradient(135deg, #ff6897 0%, #f472b6 100%)' : '#e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Award className={`w-3 h-3 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <div style={{ fontSize: '9px', fontWeight: '800', color: isCompleted ? 'var(--color-equal-love)' : '#94a3b8' }}>
                                称号: {rewardTitle}
                              </div>
                              <div style={{ fontSize: '7.5px', color: '#94a3b8' }}>
                                {isCompleted ? '🎉 ミッション達成！バッジが解放されました！' : 'すべての=LOVE聖地を巡って称号GET！'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 3. ≠ME全聖地巡礼 */}
                    {(() => {
                      const targetSpots = spots.filter(s => s.group === "≠ME");
                      const checkedSpots = checkins.filter(c => {
                        const spot = spots.find(s => s.id === c.spot_id);
                        return spot && spot.group === "≠ME";
                      });
                      const uniqueCheckedCount = new Set(checkedSpots.map(c => c.spot_id)).size;
                      const totalCount = targetSpots.length;
                      const percent = totalCount > 0 ? Math.round((uniqueCheckedCount / totalCount) * 100) : 0;
                      const isCompleted = uniqueCheckedCount === totalCount && totalCount > 0;
                      const rewardTitle = "ノイミーの開拓者";

                      return (
                        <div style={{
                          background: 'linear-gradient(135deg, #e0fbfa 0%, #d0f7f5 100%)',
                          border: '1px solid rgba(0,210,221,0.2)',
                          borderRadius: '12px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--color-not-equal-me)' }}>
                              ≠ME 全聖地巡礼
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--color-not-equal-me)' }}>
                              {uniqueCheckedCount} / {totalCount}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', backgroundColor: 'var(--color-not-equal-me)', borderRadius: '9999px' }}></div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: isCompleted ? 'linear-gradient(135deg, #00d2dd 0%, #22d3ee 100%)' : '#e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Award className={`w-3 h-3 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <div style={{ fontSize: '9px', fontWeight: '800', color: isCompleted ? 'var(--color-not-equal-me)' : '#94a3b8' }}>
                                称号: {rewardTitle}
                              </div>
                              <div style={{ fontSize: '7.5px', color: '#94a3b8' }}>
                                {isCompleted ? '🎉 ミッション達成！バッジが解放されました！' : 'すべての≠ME聖地を巡って称号GET！'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 4. ≒JOY全聖地巡礼 */}
                    {(() => {
                      const targetSpots = spots.filter(s => s.group === "≒JOY");
                      const checkedSpots = checkins.filter(c => {
                        const spot = spots.find(s => s.id === c.spot_id);
                        return spot && spot.group === "≒JOY";
                      });
                      const uniqueCheckedCount = new Set(checkedSpots.map(c => c.spot_id)).size;
                      const totalCount = targetSpots.length;
                      const percent = totalCount > 0 ? Math.round((uniqueCheckedCount / totalCount) * 100) : 0;
                      const isCompleted = uniqueCheckedCount === totalCount && totalCount > 0;
                      const rewardTitle = "ニアジョイの先駆者";

                      return (
                        <div style={{
                          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                          border: '1px solid rgba(217,119,6,0.2)',
                          borderRadius: '12px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: '#d97706' }}>
                              ≒JOY 全聖地巡礼
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: '#d97706' }}>
                              {uniqueCheckedCount} / {totalCount}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#d97706', borderRadius: '9999px' }}></div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: isCompleted ? 'linear-gradient(135deg, #ffd60a 0%, #fbbf24 100%)' : '#e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Award className={`w-3 h-3 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <div style={{ fontSize: '9px', fontWeight: '800', color: isCompleted ? '#d97706' : '#94a3b8' }}>
                                称号: {rewardTitle}
                              </div>
                              <div style={{ fontSize: '7.5px', color: '#94a3b8' }}>
                                {isCompleted ? '🎉 ミッション達成！バッジが解放されました！' : 'すべての≒JOY聖地を巡って称号GET！'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 5. トリプルデートマスター */}
                    {(() => {
                      const uniqueCheckedCount = new Set(checkins.map(c => c.spot_id)).size;
                      const totalCount = spots.length;
                      const percent = totalCount > 0 ? Math.round((uniqueCheckedCount / totalCount) * 100) : 0;
                      const isCompleted = uniqueCheckedCount === totalCount && totalCount > 0;
                      const rewardTitle = "トリプルデートマスター";

                      return (
                        <div style={{
                          background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                          border: '1px solid rgba(167,139,250,0.2)',
                          borderRadius: '12px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--color-joint)' }}>
                              トリプルデートマスター (全50聖地巡礼)
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--color-joint)' }}>
                              {uniqueCheckedCount} / {totalCount}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', backgroundColor: 'var(--color-joint)', borderRadius: '9999px' }}></div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: isCompleted ? 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)' : '#e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Award className={`w-3 h-3 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <div style={{ fontSize: '9px', fontWeight: '800', color: isCompleted ? 'var(--color-joint)' : '#94a3b8' }}>
                                称号: {rewardTitle}
                              </div>
                              <div style={{ fontSize: '7.5px', color: '#94a3b8' }}>
                                {isCompleted ? '🎉 神の領域！全聖地をコンプリートしました！' : '全50箇所の聖地すべてを巡って究極の称号GET！'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 🔒 隠しミッションセクション */}
                  <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1.5px dashed #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <Sparkles className="w-4 h-4 text-[#ffd60a]" />
                      <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-main)' }}>🔒 隠しアワードミッション</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* 隠し1: トリプルアカデミア */}
                      {(() => {
                        const academyIds = ["spot-trigger-kait", "spot-trigger-tute", "spot-trigger-jissen"];
                        const checkedCount = academyIds.filter(id => checkins.some(c => c.spot_id === id)).length;
                        const isCompleted = checkedCount === academyIds.length;
                        const rewardTitle = "聖地のアカデミア";

                        return (
                          <div style={{
                            background: isCompleted ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' : '#f8fafc',
                            border: isCompleted ? '1px solid #fde047' : '1px dashed #cbd5e1',
                            borderRadius: '12px',
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '9.5px', fontWeight: '900', color: isCompleted ? '#b45309' : '#64748b' }}>
                                {isCompleted ? `🎉 達成！【${rewardTitle}】` : '❓ 隠しミッション：トリプルアカデミア'}
                              </span>
                              <span style={{ fontSize: '9px', fontWeight: '900', color: isCompleted ? '#b45309' : '#64748b' }}>
                                {checkedCount} / 3
                              </span>
                            </div>
                            <p style={{ fontSize: '8px', color: '#64748b', margin: '2px 0 0 0', lineHeight: '1.4' }}>
                              {isCompleted 
                                ? '『この空がトリガー』に登場する3つの主要大学キャンパス（KAIT、東京工科、実践女子）すべてを巡礼した証。' 
                                : '内容：イコノイジョイの聖地の中から、特定の3つの主要大学キャンパスを巡れ。'}
                            </p>
                            {isCompleted && (
                              <div style={{ fontSize: '8px', color: '#b45309', fontWeight: 'bold', marginTop: '2px' }}>
                                🔓 称号「聖地のアカデミア」をアンロックしました！
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* 隠し2: 失われた聖地の記憶 */}
                      {(() => {
                        const lostIds = ["spot-real-mitagawa-school", "spot-trigger-taimei"];
                        const checkedCount = lostIds.filter(id => checkins.some(c => c.spot_id === id)).length;
                        const isCompleted = checkedCount === lostIds.length;
                        const rewardTitle = "失われた聖地の修復者";

                        return (
                          <div style={{
                            background: isCompleted ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : '#f8fafc',
                            border: isCompleted ? '1px solid #86efac' : '1px dashed #cbd5e1',
                            borderRadius: '12px',
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '9.5px', fontWeight: '900', color: isCompleted ? '#166534' : '#64748b' }}>
                                {isCompleted ? `🎉 達成！【${rewardTitle}】` : '❓ 隠しミッション：失われた聖地の記憶'}
                              </span>
                              <span style={{ fontSize: '9px', fontWeight: '900', color: isCompleted ? '#166534' : '#64748b' }}>
                                {checkedCount} / 2
                              </span>
                            </div>
                            <p style={{ fontSize: '8px', color: '#64748b', margin: '2px 0 0 0', lineHeight: '1.4' }}>
                              {isCompleted 
                                ? '惜しまれつつ役目を終えた、廃校や旧施設などの哀愁漂う聖地（旧三田川中、みらい館大明）すべてを巡礼した証。' 
                                : '内容：旧跡地や廃校となったノスタルジックな聖地をすべて巡れ。'}
                            </p>
                            {isCompleted && (
                              <div style={{ fontSize: '8px', color: '#166534', fontWeight: 'bold', marginTop: '2px' }}>
                                🔓 称号「失われた聖地の修復者」をアンロックしました！
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* 隠し3: 聖地巡礼の鬼 */}
                      {(() => {
                        const uniqueCheckedCount = new Set(checkins.map(c => c.spot_id)).size;
                        const isCompleted = uniqueCheckedCount >= 20;
                        const rewardTitle = "聖地巡礼の鬼";

                        return (
                          <div style={{
                            background: isCompleted ? 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)' : '#f8fafc',
                            border: isCompleted ? '1px solid #fbcfe8' : '1px dashed #cbd5e1',
                            borderRadius: '12px',
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '9.5px', fontWeight: '900', color: isCompleted ? '#9d174d' : '#64748b' }}>
                                {isCompleted ? `🎉 達成！【${rewardTitle}】` : '❓ 隠しミッション：聖地巡礼の鬼'}
                              </span>
                              <span style={{ fontSize: '9px', fontWeight: '900', color: isCompleted ? '#9d174d' : '#64748b' }}>
                                {uniqueCheckedCount} / 20
                              </span>
                            </div>
                            <p style={{ fontSize: '8px', color: '#64748b', margin: '2px 0 0 0', lineHeight: '1.4' }}>
                              {isCompleted 
                                ? '合計20箇所以上の膨大な聖地を巡り、驚異的なフットワークを見せた熱狂的な巡礼者に与えられる栄誉。' 
                                : '内容：驚異的なフットワークで数多の聖地を巡り、鬼の称号を手に入れよ。'}
                            </p>
                            {isCompleted && (
                              <div style={{ fontSize: '8px', color: '#9d174d', fontWeight: 'bold', marginTop: '2px' }}>
                                🔓 称号「聖地巡礼の鬼」をアンロックしました！
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 獲得称号バッジ */}
                  {(() => {
                    const allAcquired = Array.from(new Set([
                      ...(currentUser.acquired_titles || []),
                      ...(currentUser.titles || [])
                    ])).filter(Boolean);

                    return allAcquired.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)' }}>解放済みの称号バッジ:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {allAcquired.map((t, idx) => (
                            <div key={idx} className="badge-pill" style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: t === currentUser.active_title 
                                ? 'linear-gradient(135deg, #ffd60a 0%, #ff9f1c 100%)' 
                                : 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)',
                              color: t === currentUser.active_title ? '#000000' : 'white',
                              padding: '4px 8px',
                              borderRadius: '9999px',
                              fontSize: '9px',
                              fontWeight: '900',
                              boxShadow: t === currentUser.active_title
                                ? '0 2px 6px rgba(255, 214, 10, 0.4)'
                                : '0 2px 4px rgba(167, 139, 250, 0.3)',
                              animation: t === currentUser.active_title ? 'pulse 2s infinite' : 'none'
                            }}>
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>{t}</span>
                              {t === currentUser.active_title && (
                                <span style={{ fontSize: '8px', opacity: 0.8, marginLeft: '2px' }}>[装備中]</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '9px', color: '#94a3b8', textAlign: 'center', padding: '8px 0', border: '1px dashed #cbd5e1', borderRadius: '8px', marginTop: '8px' }}>
                        獲得済みの称号はまだありません。巡礼ミッションを進めましょう！
                      </div>
                    );
                  })()}
                </div>

                {/* タイムライン履歴 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 className="timeline-section-title">
                    <Calendar className="w-3.5 h-3.5 text-[#ff6897]" />
                    チェックインタイムライン ({checkins.length})
                  </h4>

                  {checkins.length === 0 ? (
                    <div className="pop-panel" style={{
                      padding: '24px',
                      textAlign: 'center',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      borderStyle: 'dashed',
                      borderWidth: '2px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Compass className="w-6 h-6 text-slate-300" />
                      <span style={{ fontWeight: '800' }}>まだスタンプがありません。</span>
                      <span style={{ fontSize: '9px', lineHeight: '1.4' }}>
                        マップ上のピンをタップして<br/>「ここにチェックイン！」を押してみましょう！
                      </span>
                    </div>
                  ) : (
                    <div className="timeline-list">
                      {[...checkins].sort((a,b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime()).map(c => {
                        const spot = spots.find(s => s.id === c.spot_id);
                        if (!spot) return null;

                        let groupColor = 'bg-[#a78bfa]';
                        if (spot.group === '=LOVE') groupColor = '#ff6897';
                        else if (spot.group === '≠ME') groupColor = '#00d2dd';
                        else if (spot.group === '≒JOY') groupColor = '#ffd60a';

                        return (
                          <div key={c.id} className="timeline-item">
                            <div className="timeline-dot" style={{ backgroundColor: groupColor }}></div>
                            
                            <div 
                              onClick={() => handleFocusSpotOnMap(spot)}
                              className="timeline-card pop-panel"
                            >
                              <div className="timeline-card-left">
                                <div className="timeline-card-meta">
                                  <span className="timeline-card-group" style={{ color: groupColor }}>
                                    {spot.group}
                                  </span>
                                  <span className="timeline-card-time">
                                    {new Date(c.visited_at).toLocaleString('ja-JP', { 
                                      month: 'numeric', 
                                      day: 'numeric', 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                                <h4 className="timeline-card-title">
                                  {spot.name}
                                </h4>
                              </div>
                              
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" style={{ flexShrink: 0 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* リセットボタン */}
                {import.meta.env.DEV && (
                  <div className="reset-btn-container">
                    <button 
                      onClick={() => {
                        if (confirm('すべての巡礼スタンプとプロフィール設定をリセットしますか？')) {
                          db.resetAll();
                          alert('データを初期状態にリセットしました！');
                          window.location.reload();
                        }
                      }}
                      className="text-red-400 hover:text-red-600 font-bold hover:underline"
                      style={{ fontSize: '9px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      データを初期状態にリセットする
                    </button>
                  </div>
                )}

              </div>
            )
          )}

          </div>

          {/* Info Panelの下部固定進捗アワード (常に視界に入ってモチベ向上) */}
          <div className="award-panel">
            <div className="award-header">
              <span>{currentUser.username} の巡礼進捗</span>
              <span style={{ color: 'var(--color-equal-love)' }}>{checkins.length} / {spots.length} 個</span>
            </div>
            <div className="award-progress-bar">
              <div 
                className="award-progress-inner"
                style={{ width: `${(checkins.length / spots.length) * 100}%` }}
              ></div>
            </div>
            <div className="award-rank-box">
              <Award className="w-3.5 h-3.5 text-[#ffd60a] stroke-[2.5]" />
              称号: <span className={fanRank.color} style={{ fontWeight: '900' }}>{fanRank.title}</span>
            </div>

            {/* 🛠️ 開発用テストバイパストグル (500m判定無効化スイッチ) */}
            {import.meta.env.DEV && (
              <div style={{
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1.5px dashed #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'between',
                gap: '12px'
              }}>
                <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', flex: 1 }}>
                  🛠️ GPSテスト用: 500m制限を無視 (開発者用)
                </span>
                <input 
                  type="checkbox" 
                  checked={gpsBypass}
                  onChange={(e) => setGpsBypass(e.target.checked)}
                  style={{
                    width: '14px',
                    height: '14px',
                    accentColor: 'var(--color-equal-love)',
                    cursor: 'pointer'
                  }}
                />
              </div>
            )}

            {/* 📜 フッターリンク (利用規約・プライバシーポリシー・お問い合わせ) */}
            <div style={{
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1.5px dashed #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                {/* 📜 利用規約リンク (将来的に個別ページ /terms に書き換える場合はここを a タグに置き換え) */}
                <button
                  type="button"
                  onClick={() => {
                    setShowTermsModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    fontWeight: '900',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  利用規約
                </button>
                <span style={{ fontSize: '8px', color: '#cbd5e1' }}>•</span>
                {/* 📄 プライバシーポリシーリンク */}
                <button
                  type="button"
                  onClick={navigateToPrivacy}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    fontWeight: '900',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  プライバシーポリシー
                </button>
                <span style={{ fontSize: '8px', color: '#cbd5e1' }}>•</span>
                {/* ✉️ お問い合わせリンク */}
                <a
                  href="https://discord.gg/QBhyDJ5hF"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    fontWeight: '900',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  お問い合わせ (Discord)
                </a>
              </div>
              <span style={{ fontSize: '8.5px', color: '#94a3b8', fontWeight: 'bold' }}>
                本サービスは非公式ファンサービスです
              </span>
            </div>

          </div>

        </aside>

      </div>

      {/* 🔐 BaaS 認証ダイアログ（ログイン ＆ サインアップ） */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
          animation: 'fade-in 0.25s ease-out'
        }}>
          <div className="pop-panel border-2 border-white" style={{
            width: '100%',
            maxWidth: '380px',
            background: '#ffffff',
            padding: '24px',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative'
          }}>
            {/* 閉じるボタン */}
            <button
              onClick={() => {
                setShowAuthModal(false);
                setAuthError('');
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: 'var(--text-muted)',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>

            {/* ログイン・登録のタブ切り替え */}
            <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', gap: '16px', paddingBottom: '2px' }}>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '900',
                  color: authMode === 'signin' ? '#ff6897' : 'var(--text-muted)',
                  borderBottom: authMode === 'signin' ? '3px solid #ff6897' : '3px solid transparent',
                  paddingBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ログイン
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '900',
                  color: authMode === 'signup' ? '#ff6897' : 'var(--text-muted)',
                  borderBottom: authMode === 'signup' ? '3px solid #ff6897' : '3px solid transparent',
                  paddingBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                新規アカウント登録
              </button>
            </div>

            {authError && (
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <ShieldAlert size={14} style={{ flexShrink: 0 }} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              setAuthError('');
              if (authMode === 'signup' && !agreeTermsSignup) {
                setAuthError("新規登録するには利用規約・免責事項への同意が必要です。");
                return;
              }
              setIsAuthLoading(true);
              try {
                if (authMode === 'signin') {
                  const res = await authService.signIn(authEmail, authPassword);
                  if (res.success) {
                    setShowAuthModal(false);
                    setAuthEmail('');
                    setAuthPassword('');
                    alert("🎉 ログインに成功しました！巡礼の旅へようこそ！");
                  } else {
                    setAuthError(res.error || 'エラーが発生しました。');
                  }
                } else {
                  if (authUsername.trim().length === 0) {
                    setAuthError("ニックネームを入力してください。");
                    setIsAuthLoading(false);
                    return;
                  }
                  const res = await authService.signUp(authEmail, authPassword, authUsername, authOshiGroup);
                  if (res.success) {
                    setShowAuthModal(false);
                    setAuthEmail('');
                    setAuthPassword('');
                    setAuthUsername('');
                    alert("✨ アカウントの作成に成功し、ログインしました！");
                  } else {
                    setAuthError(res.error || '新規登録に失敗しました。');
                  }
                }
              } catch (err) {
                setAuthError("サーバー接続に失敗しました。時間をおいてやり直してください。");
              } finally {
                setIsAuthLoading(false);
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* 新規登録時のみ表示する追加項目 */}
              {authMode === 'signup' && (
                <>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                      ニックネーム
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="例：イコラブ推しカメコ"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 12px',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        fontSize: '11px',
                        fontWeight: '800'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                      推しグループ
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {(['=LOVE', '≠ME', '≒JOY', '合同'] as GroupType[]).map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setAuthOshiGroup(g)}
                          style={{
                            padding: '8px 0',
                            fontSize: '10px',
                            borderRadius: '12px',
                            fontWeight: '900',
                            border: '2px solid',
                            borderColor: authOshiGroup === g ? '#ff6897' : '#e2e8f0',
                            backgroundColor: authOshiGroup === g ? '#fff5f8' : '#ffffff',
                            color: authOshiGroup === g ? '#ff6897' : 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  メールアドレス
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '11px',
                    fontWeight: '800'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  パスワード
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '11px',
                    fontWeight: '800'
                  }}
                />
              </div>

              {/* 新規登録時のみ表示する規約埋め込みボックス */}
              {authMode === 'signup' && (
                <div>
                  <label style={{ fontSize: '9.5px', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    📖 コミュニティ利用規約と免責事項 (スクロールして確認)
                  </label>
                  <div style={{
                    width: '100%',
                    height: '100px',
                    overflowY: 'auto',
                    padding: '10px',
                    background: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '9px',
                    color: '#475569',
                    lineHeight: '1.5',
                    textAlign: 'left',
                    whiteSpace: 'pre-wrap'
                  }}>
                    <strong style={{ color: 'var(--text-main)' }}>■ トリプルデートマップ 利用規約・免責事項</strong>{"\n\n"}
                    {"本アプリは、ファンがグループの歴史を追体験し、推し活文化を長期的に共同保存するための非公式コミュニティインフラです。すべてのユーザーがモラルを守り、安全に楽しむために、以下の規約への同意をお願いいたします。\n\n"}
                    <strong>1. 非公式ファンアプリについて</strong>{"\n"}
                    {"本アプリは個人が開発した非公式のファンアプリであり、対象グループ（=LOVE、≠ME、≒JOY）、所属事務所、所属レーベル、運営会社、および関係各社とは一切関係がありません。本アプリに関するお問い合わせや要望などを, 公式の窓口や関係先へ行うことは絶対におやめください。\n\n"}
                    <strong>2. 位置情報（GPS）の利用</strong>{"\n"}
                    {"本アプリは、現地での聖地チェックイン判定を行うため、端末のGPS（位置情報）機能を利用します。取得した位置情報は、その場での距離判定にのみ使用され、ユーザーの移動履歴を不当に追跡・保存したり、第三者に公開することはいたしません。\n\n"}
                    <strong>3. 現地ルールの遵守と立入禁止エリアへの侵入禁止</strong>{"\n"}
                    {"聖地を訪問する際は、現地の交通ルール、公共のマナー、各自治体や店舗・施設の利用ルールを必ず遵守してください。\n私有地、立入禁止エリア、撮影禁止区域、および夜間立ち入りが制限されている場所への侵入や、近隣住民・営業中の店舗への迷惑行為は固く禁じます。万が一、現地の状況に変更（閉店・立入禁止化など）があった場合は、速やかにアプリ内から修正提案を行ってください。\n\n"}
                    <strong>4. ユーザー生成コンテンツ（UGC）と投稿責任</strong>{"\n"}
                    {"将来的な機能を含む、アプリ内での聖地情報の追加・修正提案、コメントなどの投稿内容に関する一切の責任は、投稿したユーザー本人に帰属します。他者を誹謗中傷する内容、虚偽の情報、権利を侵害するデータの投稿は禁止します。\n\n"}
                    <strong>5. 免責事項</strong>{"\n"}
                    {"本アプリの利用、または本アプリの情報に基づいた聖地への訪問（巡礼）によって発生したあらゆるトラブル、事故、怪我、紛失、損害、およびユーザー間の紛争について、開発者および運営側は一切の責任を負いません。すべてユーザーご自身の自己責任においてご利用ください。"}
                  </div>
                </div>
              )}

              {/* 利用規約 ＆ プライバシーポリシー 同意チェックボックス (ログイン・登録共通) */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                textAlign: 'left',
                background: '#f8fafc',
                padding: '10px 12px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginTop: '4px'
              }}>
                <input 
                  type="checkbox" 
                  id="terms-agree-signup"
                  checked={agreeTermsSignup}
                  onChange={(e) => setAgreeTermsSignup(e.target.checked)}
                  style={{
                    marginTop: '2px',
                    width: '14px',
                    height: '14px',
                    accentColor: 'var(--color-equal-love)',
                    cursor: 'pointer'
                  }}
                />
                <label htmlFor="terms-agree-signup" style={{ fontSize: '9.5px', fontWeight: '800', color: 'var(--text-main)', cursor: 'pointer', lineHeight: '1.4' }}>
                  <span onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} style={{ color: '#ff6897', textDecoration: 'underline', cursor: 'pointer' }}>利用規約 ＆ プライバシーポリシー</span>
                  に同意して、コミュニティのモラルを遵守します。
                </label>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading || !agreeTermsSignup}
                className="pop-button font-black"
                style={{
                  background: (!agreeTermsSignup) 
                    ? '#cbd5e1' 
                    : 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '14px',
                  fontSize: '12px',
                  cursor: (isAuthLoading || !agreeTermsSignup) ? 'not-allowed' : 'pointer',
                  opacity: (isAuthLoading || !agreeTermsSignup) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: (!agreeTermsSignup) ? 'none' : '0 8px 20px rgba(255, 104, 151, 0.3)',
                  marginTop: '6px'
                }}
              >
                {isAuthLoading ? (
                  <span>処理中... 🌀</span>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>{authMode === 'signin' ? 'ログインする' : '無料でアカウント作成'}</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
              <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '900' }}>または</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
            </div>

            {/* Googleログインシミュレートボタン (利用規約に同意していない場合は非活性化) */}
            <button
              disabled={isAuthLoading || !agreeTermsSignup}
              onClick={async () => {
                setAuthError('');
                setIsAuthLoading(true);
                try {
                  const res = await authService.signInWithGoogle();
                  if (res.success) {
                    setShowAuthModal(false);
                    alert("🎉 Googleアカウントでの認証に成功しました！");
                  }
                } catch (err) {
                  setAuthError("Google認証に失敗しました。");
                } finally {
                  setIsAuthLoading(false);
                }
              }}
              className="pop-button"
              style={{
                width: '100%',
                backgroundColor: (!agreeTermsSignup) ? '#f8fafc' : '#ffffff',
                border: '2px solid',
                borderColor: (!agreeTermsSignup) ? '#e2e8f0' : '#cbd5e1',
                padding: '10px',
                borderRadius: '14px',
                fontSize: '11px',
                fontWeight: '900',
                color: (!agreeTermsSignup) ? '#94a3b8' : 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: (isAuthLoading || !agreeTermsSignup) ? 'not-allowed' : 'pointer',
                opacity: (!agreeTermsSignup) ? 0.5 : 1,
                boxShadow: 'none',
                transition: 'all 0.25s'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" style={{ flexShrink: 0, filter: (!agreeTermsSignup) ? 'grayscale(1)' : 'none', opacity: (!agreeTermsSignup) ? 0.5 : 1 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Googleアカウントでログイン
            </button>
          </div>
        </div>
      )}

      {/* ⚠️ ログイン誘導ブロックダイアログ */}
      {showBlockModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
          animation: 'fade-in 0.25s ease-out'
        }}>
          <div className="pop-panel border-2 border-white" style={{
            width: '100%',
            maxWidth: '360px',
            background: '#ffffff',
            padding: '24px',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px'
          }}>
            <div style={{ fontSize: '40px' }}>🗺️✨</div>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
              アカウント登録（無料）が必要です
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
              {blockMessage || "巡礼の記録（チェックイン）をデータベースに保存して、特別な称号を獲得するには無料のログインが必要です。"}
            </p>

            {/* 📜 利用規約と免責事項チェックボックス (BlockModal用) */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              textAlign: 'left',
              width: '100%',
              background: '#f8fafc',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginTop: '4px'
            }}>
              <input 
                type="checkbox" 
                id="terms-agree-block"
                checked={agreeTermsBlock}
                onChange={(e) => setAgreeTermsBlock(e.target.checked)}
                style={{
                  marginTop: '2px',
                  width: '14px',
                  height: '14px',
                  accentColor: 'var(--color-equal-love)',
                  cursor: 'pointer'
                }}
              />
              <label htmlFor="terms-agree-block" style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-main)', cursor: 'pointer', lineHeight: '1.4' }}>
                <span onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} style={{ color: '#ff6897', textDecoration: 'underline', cursor: 'pointer' }}>利用規約・免責事項</span>
                に同意して、コミュニティのモラルを遵守します。
              </label>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '4px' }}>
              <button
                disabled={!agreeTermsBlock}
                onClick={() => {
                  setShowBlockModal(false);
                  setAuthMode('signup');
                  setAgreeTermsSignup(true); // 同意を引き継ぐ
                  setShowAuthModal(true);
                }}
                className="pop-button font-black"
                style={{
                  background: !agreeTermsBlock 
                    ? '#cbd5e1' 
                    : 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '14px',
                  fontSize: '12px',
                  cursor: !agreeTermsBlock ? 'not-allowed' : 'pointer',
                  opacity: !agreeTermsBlock ? 0.6 : 1,
                  boxShadow: !agreeTermsBlock ? 'none' : '0 8px 20px rgba(255, 104, 151, 0.3)'
                }}
              >
                無料で新規登録 / ログイン
              </button>
              <button
                onClick={() => setShowBlockModal(false)}
                className="pop-button"
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  color: 'var(--text-muted)',
                  padding: '10px',
                  borderRadius: '14px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                今はまだ閲覧だけにする
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 スマホ用スライド式ボトムシート (モバイル限定、スポット選択時に下から出現) */}
      {/* 📱 スマホ用スライド式ボトムシート (モバイル限定、スポット選択時に下から出現) */}
      {isMobile && (
        <div className={`mobile-bottom-sheet ${selectedSpot ? 'open' : ''}`}>
          
          {/* 上部のつまみバー (ドラッグできそうな引き手のノッチ) */}
          <div className="bottom-sheet-handle" onClick={() => setSelectedSpot(null)}></div>
          
          {/* ボトムシート専用ヘッダー（✕閉じるボタンも完備） */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            borderBottom: '1px solid #f1f5f9',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🗺️ 聖地詳細
            </span>
            <button
              onClick={() => setSelectedSpot(null)}
              style={{
                background: '#f1f5f9',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* スポット情報コンテンツ表示 (スクロール可能) */}
          {selectedSpot && (
            <div className="info-scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px 20px' }}>
              
              {/* カテゴリ ＆ 日付ヘッダー */}
              <div className="detail-header">
                <div className="detail-badges">
                  <span className="spot-group-badge" style={{
                    backgroundColor: selectedSpot.group === '=LOVE' ? '#fff5f8' :
                                     selectedSpot.group === '≠ME' ? '#e0fbfa' :
                                     selectedSpot.group === '≒JOY' ? '#fffbeb' : '#f5f3ff',
                    color: selectedSpot.group === '=LOVE' ? 'var(--color-equal-love)' :
                           selectedSpot.group === '≠ME' ? 'var(--color-not-equal-me)' :
                           selectedSpot.group === '≒JOY' ? '#d97706' : 'var(--color-joint)',
                    borderColor: selectedSpot.group === '=LOVE' ? 'rgba(255, 104, 151, 0.2)' :
                                 selectedSpot.group === '≠ME' ? 'rgba(0, 210, 221, 0.2)' :
                                 selectedSpot.group === '≒JOY' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(167, 139, 250, 0.2)'
                  }}>
                    {selectedSpot.group}
                  </span>
                  <span className="spot-cat-badge">
                    {selectedSpot.category}
                  </span>
                </div>
                <span className="spot-date-text">
                  {selectedSpot.event_date.replace(/-/g, '/')}
                </span>
              </div>

              {/* スポットタイトル */}
              <div className="detail-title-section" style={{ marginTop: '12px' }}>
                <span className="detail-meta-label">SPOT NAME</span>
                <h2 className="detail-title">{selectedSpot.name}</h2>
              </div>

              {/* 誕生年月（MEMORIAL DAY） */}
              <div className="detail-time-box" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar className="w-4 h-4 text-[#a78bfa]" />
                <div className="detail-time-text">
                  <span style={{ fontWeight: '800', color: 'var(--color-equal-love)', marginRight: '6px', letterSpacing: '0.05em', fontSize: '11px' }}>MEMORIAL DAY:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '900', fontSize: '11px' }}>
                    {selectedSpot.event_date.split('-').map((v, i) => v + ['年', '月', '日'][i]).join('')}
                  </span>
                </div>
              </div>

              {/* 聖地エピソード */}
              <div className="episode-container animate-fade-in-up" style={{ marginTop: '16px' }}>
                <h4 className="detail-meta-label">聖地のエピソード</h4>
                <p className="episode-text" style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                  {selectedSpot.description}
                </p>
              </div>

              {/* YouTube動画自動埋め込み (完全再現) */}
              {selectedSpot.youtube_url && (() => {
                const isIframe = selectedSpot.youtube_url.includes('<iframe');
                let watchUrl = "";
                
                if (isIframe) {
                  const match = selectedSpot.youtube_url.match(/src="([^"]+)"/);
                  if (match && match[1]) {
                    watchUrl = match[1].replace('/embed/', '/watch?v=');
                  }
                } else {
                  watchUrl = selectedSpot.youtube_url.replace('/embed/', '/watch?v=');
                }

                return (
                  <div className="video-section" style={{ marginTop: '16px' }}>
                    <div className="video-label-bold" style={{ fontWeight: 'bold', fontSize: '11px', color: '#1e293b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Play className="w-3 h-3 text-red-500 fill-red-500" />
                      {selectedSpot.youtube_title || "🎥 関連映像"}
                    </div>
                    <div className="video-box" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden' }}>
                      {isIframe ? (
                        <div 
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          dangerouslySetInnerHTML={{ 
                            __html: selectedSpot.youtube_url
                              .replace(/width="\d+"/, 'width="100%"')
                              .replace(/height="\d+"/, 'height="100%"')
                              .replace(/style="[^"]*"/, '')
                          }} 
                        />
                      ) : (
                        <iframe 
                          width="100%" 
                          height="100%" 
                          src={`${selectedSpot.youtube_url}?modestbranding=1&rel=0`} 
                          title={selectedSpot.youtube_title || "YouTube video player"} 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                          style={{ width: '100%', height: '100%', border: 'none' }}
                        ></iframe>
                      )}
                    </div>
                    {watchUrl && (
                      <a 
                        href={watchUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="video-link"
                        style={{ marginTop: '6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        YouTubeアプリで視聴する
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                );
              })()}

              {/* 🗺️ Googleマップで経路案内ボタン */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.latitude},${selectedSpot.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pop-button google-map-route-btn animate-fade-in-up"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '2px solid #e2e8f0',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#475569',
                  fontWeight: '800',
                  textDecoration: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
                  marginTop: '16px',
                  transition: 'transform 0.2s'
                }}
              >
                🗺️ Googleマップで経路案内
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* チェックイン＆Xシェアアクションエリア */}
              <div className="checkin-action-area" style={{ marginTop: '20px', position: 'relative' }}>
                {isCheckinAnimating && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                  }}>
                    <div className="stamp-effect-big" style={{
                      fontWeight: 900,
                      fontSize: '14px',
                      color: '#ffffff',
                      letterSpacing: '0.1em',
                      background: 'linear-gradient(135deg, var(--color-equal-love) 0%, var(--color-joint) 100%)',
                      padding: '10px 20px',
                      borderRadius: '9999px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                      border: '3px solid #ffffff'
                    }}>
                      💮 巡礼達成！ 💮
                    </div>
                  </div>
                )}

                {checkins.some(c => c.spot_id === selectedSpot.id) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button 
                      onClick={() => handleCheckin(selectedSpot)}
                      className="pop-button checked-in-btn font-black animate-fade-in-up"
                      style={{ width: '100%', borderRadius: '16px' }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      巡礼済み！（タップで取り消し）
                    </button>

                    {/* 【Xシェア機能】 */}
                    <button 
                      onClick={() => handleXShare(selectedSpot)}
                      className="pop-button animate-fade-in-up"
                      style={{
                        width: '100%',
                        background: '#000000',
                        color: '#ffffff',
                        padding: '12px',
                        fontSize: '12px',
                        borderRadius: '16px',
                        fontWeight: '800',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: '2px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <span style={{ fontFamily: 'system-ui', fontSize: '14px', marginRight: '4px', fontWeight: 'bold' }}>𝕏</span>
                      Xでポストする
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleCheckin(selectedSpot)}
                    disabled={isGpsLocating}
                    className="pop-button checkin-btn font-black"
                    style={{
                      width: '100%',
                      borderRadius: '16px',
                      cursor: isGpsLocating ? 'not-allowed' : 'pointer',
                      opacity: isGpsLocating ? 0.8 : 1
                    }}
                  >
                    <Compass className="w-4 h-4 text-white stroke-[2.5]" />
                    {isGpsLocating ? '位置情報を判定中... 📍' : 'ここに巡礼する（チェックイン）'}
                  </button>
                )}

                {/* 🏆 手動巡礼済みトグルボタン */}
                <div style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px dashed #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    👑 遠隔から手動で「行った！」にする
                  </span>
                  <button
                    onClick={() => {
                      if (!authSession) {
                        setBlockMessage("聖地を手動チェックインして巡礼を記録するには、無料のアカウント登録が必要です🗺️✨");
                        setShowBlockModal(true);
                        return;
                      }
                      const isVisited = checkins.some(c => c.spot_id === selectedSpot.id);
                      const originalCheckins = [...checkins];
                      
                      if (isVisited) {
                        setCheckins(checkins.filter(c => c.spot_id !== selectedSpot.id));
                        setTimeout(() => {
                          try { db.removeCheckIn(selectedSpot.id); } catch(e) { setCheckins(originalCheckins); }
                        }, 50);
                      } else {
                        const newCheckIn: CheckIn = {
                          id: 'temp_' + Date.now(),
                          user_id: currentUser.id,
                          spot_id: selectedSpot.id,
                          visited_at: new Date().toISOString(),
                          is_manual: true
                        };
                        setCheckins([...checkins, newCheckIn]);
                        setIsCheckinAnimating(true);
                        setTimeout(() => {
                          setIsCheckinAnimating(false);
                        }, 1200);

                        setTimeout(() => {
                          try { db.addCheckIn(selectedSpot.id, true); } catch(e) { setCheckins(originalCheckins); }
                        }, 50);
                      }
                    }}
                    className="pop-button"
                    style={{
                      padding: '6px 14px',
                      fontSize: '11px',
                      borderRadius: '12px',
                      fontWeight: '900',
                      backgroundColor: checkins.some(c => c.spot_id === selectedSpot.id) ? '#fef08a' : '#f59e0b',
                      color: checkins.some(c => c.spot_id === selectedSpot.id) ? '#78350f' : '#ffffff',
                      border: '2px solid',
                      borderColor: checkins.some(c => c.spot_id === selectedSpot.id) ? '#fde047' : '#d97706',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                  >
                    {checkins.some(c => c.spot_id === selectedSpot.id) ? '行った済みの取り消し' : '行った！'}
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* 📜 利用規約・免責事項モーダル */}
      {showTermsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px',
          animation: 'fade-in 0.25s ease-out'
        }}>
          <div className="pop-panel border-2 border-white" style={{
            width: '100%',
            maxWidth: '520px',
            background: '#ffffff',
            padding: '24px',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative',
            maxHeight: '85vh',
            textAlign: 'left'
          }}>
            {/* 閉じるボタン */}
            <button
              type="button"
              onClick={() => setShowTermsModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: 'var(--text-muted)',
                fontWeight: 'bold',
                zIndex: 10
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>📜</span>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
                利用規約 ＆ プライバシーポリシー
              </h3>
            </div>

            {/* スクロール可能な本文領域 */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              fontSize: '11px',
              color: '#334155',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              maxHeight: '50vh'
            }}>
              <p style={{ fontWeight: '900', fontSize: '12px', color: 'var(--text-main)', marginTop: 0, marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px' }}>
                ■ トリプルデートマップ 利用規約 ＆ プライバシーポリシー
              </p>
              {"本アプリは、ファンがグループの歴史を追体験し、推し活文化を長期的に共同保存するための非公式コミュニティインフラです。すべてのユーザーがモラルを守り、安全に楽しむために、以下の規約・ポリシーへの同意をお願いいたします。\n\n"}
              
              <strong>1. 非公式ファンアプリの宣言</strong>{"\n"}
              {"本アプリは個人が開発した非公式のファンアプリであり、対象グループ（=LOVE、≠ME、≒JOY）、所属事務所、所属レーベル、運営会社、および関係各社とは一切関係がありません。本アプリに関するお問い合わせや要望などを、公式の窓口や関係各社へ送ることは絶対におやめください。\n\n"}

              <strong>2. 位置情報（GPS）の取り扱い（プライバシーポリシー）</strong>{"\n"}
              {"本アプリは、現地での聖地チェックイン判定（スポットと現在地との距離計算）を行うため、ブラウザ経由で端末のGPS（位置情報）を使用します。\n取得した現在地の緯度・経度データは、ブラウザ内のローカル（JavaScript）上で距離を計算するためだけに一時的に使用され、当サーバーや第三者のサーバーへ移動履歴、ルートログ、現在地座標などを送信・保存・蓄積することは100%一切ございません。ユーザーの移動が外部に追跡されるリスクはございませんのでご安心ください。\n\n"}

              <strong>3. 個人情報の取得と保護方針（Googleログインなど）</strong>{"\n"}
              {"Googleアカウントによるログイン（ソーシャル認証）を使用する際、本アプリは安全な認証連携システムを介して、ユーザーの公開プロフィール情報（ユーザーID、表示名、プロフィール画像URLのみ）を取得します。\n取得したデータは、アカウントの識別、チェックイン履歴の紐付け、およびアプリ内ニックネームの設定のためにのみ使用し、メールアドレスの悪用、パスワードなどの機密情報の収集、および第三者へのデータの提供・売買は一切行いません。\n\n"}

              <strong>4. 現地ルールの遵守と立入禁止エリアへの侵入禁止</strong>{"\n"}
              {"聖地を訪問する際は、現地の交通ルール、公共のマナー、各自治体や店舗・施設の利用ルールを必ず遵守してください。\n私有地、立入禁止エリア、撮影禁止区域、および夜間立ち入りが制限されている場所への侵入や、近隣住民・営業中の店舗への迷惑行為は固く禁じます。万が一、現地の状況に変更（閉店・立入禁止化など）があった場合は、速やかにアプリ内から修正提案を行ってください。\n\n"}

              <strong>5. 免責事項</strong>{"\n"}
              {"本アプリの利用、または本アプリの情報に基づいた聖地への訪問（巡礼）によって発生したあらゆるトラブル、事故、怪我、紛失、損害（現地での不法侵入等を含む）、およびユーザー間の紛争について、開発者および運営側は一切の責任を負いません。すべてユーザーご自身の自己責任において安全にご利用ください。"}
            </div>

            <button
              type="button"
              onClick={() => setShowTermsModal(false)}
              className="pop-button font-black"
              style={{
                background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '14px',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(255, 104, 151, 0.2)'
              }}
            >
              内容を理解し同意しました
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
