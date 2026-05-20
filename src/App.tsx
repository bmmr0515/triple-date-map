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
  X,
  Bell,
  Search
} from 'lucide-react';
import { db, Spot, User, CheckIn, GroupType } from './db';
import { authService, AuthSession } from './auth';

// 🔔 アプリ内新着お知らせのインターフェースとデータ定義
export interface Notice {
  id: string;
  date: string;
  title: string;
  content: string;
  type: 'update' | 'event' | 'system';
}

export const APP_NOTICES: Notice[] = [
  {
    id: 'notice-20260520-byun-mission',
    date: '2026/05/20',
    title: '✈️ 【新ミッション】順次解放型ミッション『ビュン、と飛んだ日』公開＆聖地大量追加！',
    content: '【新規スポット追加のお知らせ】\n≒JOYの『お姫様の作り方』『超孤独ライオン』『スイートシックスティーン』『その先はイグザルト』から計5箇所の聖地を新たに追加しました！\n\n【順次解放型ミッションが公開！】\nさらに、『大空、ビュンと』に関連する7箇所のスポットを使用した新しいミッション『ビュン、と飛んだ日』がスタートしました！\n\n・ミッションルール：最初の目的地（茨城空港 国際線チェックインカウンター前）にチェックインすると、次の目的地がマップ上に解放されます。順番にスポットを巡り、最終目的地を目指しましょう！\n・クリア報酬：称号「大空を駆ける者」\n\nぜひ新しい聖地巡礼をお楽しみください！',
    type: 'update'
  },
  {
    id: 'notice-20260520-shokorisanpo',
    date: '2026/05/20',
    title: '🌸 【新ミッション】ルート解放型ミッション『しょこりさんぽ』が追加されました！',
    content: '【新ミッション＆聖地追加のお知らせ】\n=LOVEの瀧脇笙古さん・音嶋莉沙さんのコンビ「しょこりさ」のお散歩ルートを辿る、新しい「ルート解放型ミッション」が追加されました！\n\n・ミッション：『鯉さん元気！？しょこりさんぽ』\n　├ スタート地点：東京駅八重洲南口 グランルーフ 歩行者デッキ\n　└ 報酬称号：しょこりさ推し！\n\n【ルート解放型とは？】\nミッションを開始するまで、ゴール地点はマップ上に表示されません。ミッション詳細画面から「ミッション開始」ボタンを押して隠された目的地を解放し、ゴールを目指してチェックインしましょう！',
    type: 'update'
  },
  {
    id: 'notice-20260520-fighter-kyunkawa',
    date: '2026/05/20',
    title: '🎉 【新ミッション】「排他的ファイター」「きゅんかわ人生」巡礼ミッションが同時開放！',
    content: '【新ミッション＆聖地追加のお知らせ】\n≠MEおよび≒JOYの人気楽曲から、計8箇所の新規スポットデータが追加され、2つの巡礼ミッションが同時始動しました！\n\n・ミッションA：『輝け、僕の世界。』 (排彼のファイター)\n　├ 対象スポット：芸能花伝舎、GOBLIN. 海岸HALL店、スカパー東京メディアセンター\n　└ 報酬称号：孤高のファイター\n・ミッションB：『きゅんかわアイドルどこですか!?』 (きゅんかわ人生)\n　├ 対象スポット：パティオス18番街、パティオス12番街、打瀬３丁目公園、エムベイポイント幕張 25階円卓会議室\n　└ 報酬称号：きゅんかわマスター\n\nさらに、『はんぶんこクリスマス』MV撮影地の「Studio vence BAYSIDE」（新木場）も新規登録！\nぜひチェックインして限定称号を獲得しましょう！',
    type: 'update'
  },
  {
    id: 'notice-20260520-noimie-school-quest',
    date: '2026/05/20',
    title: '🎉 【新ミッション】ノイミー学園クエストシリーズ始動！ハワイアンズ＆北海道の聖地5箇所を追加！',
    content: '【ノイミー学園クエストシリーズ始動！】\n≠MEの特典映像「ノイミー学園」の舞台となったハワイアンズ（福島県）と北海道（千歳・札幌）の聖地計5箇所が新たに追加され、2つの巡礼ミッションが開放されました！\n\n・ミッションA：『ハワイアーンなリゾート地！』\n　├ 対象：スパリゾートハワイアンズ (福島県)\n　└ 報酬称号：常夏のハワイアンズ\n・ミッションB：『超特Qな雪遊び！？』\n　├ 対象：IORI、国営滝野すずらん丘陵公園 滝野スノーワールド、アシリベツの滝、かに源 (計4箇所)\n　└ 報酬称号：超特Qなクイズ王\n\n各スポットを訪れてGPSチェックインを記録し、ノイミー学園の特別なプレミアム称号を解放しましょう！',
    type: 'update'
  },
  {
    id: 'notice-20260520-kiraku-closed',
    date: '2026/05/20',
    title: '⚠️ 【聖地削除】中華料理 喜楽（大森）の閉店に伴うデータ更新のお知らせ',
    content: '【聖地削除のご案内】\n『この空がトリガー』のMVロケ地として登録されておりました「中華料理 喜楽（大森）」につきまして、店舗の閉店情報を確認いたしましたため、マップおよび聖地一覧リストよりデータを削除いたしました。\n\nこれまでファンの方々へ美味しい思い出を提供してくださった店舗様へ、深く感謝申し上げます。\n\n※近隣の聖地「Bar VEILLE（大森）」などは引き続き掲載されております。',
    type: 'system'
  },
  {
    id: 'notice-20260520-sorting-filter',
    date: '2026/05/20',
    title: '📍 聖地リストの都道府県絞り込み＆ソート機能・お知らせ通知UIをリリース！',
    content: '【聖地リストがさらに便利に！】\n・都道府県/エリア別フィルター：東京都、神奈川県、千葉県など、聖地が存在するエリアで絞り込みができるようになりました！\n・便利な並び替え（ソート）：五十音順（曲名順）やカレンダー順（新しい順/古い順）の並び替えに対応！目的の聖地がスムーズに見つかります。\n\n【お知らせ通知UIの導入】\n・新着情報がある場合、モバイルメニューやフッターに「赤い通知バッジ」が表示されるようになりました！お知らせを開く（モーダル表示）と自動的に既読になりバッジが消去されます。',
    type: 'update'
  },
  {
    id: 'notice-20260520-recipe',
    date: '2026/05/20',
    title: '🎉 11箇所の新スポットと「笑顔のレシピ」巡礼ミッションが追加されました！',
    content: '【新スポット追加】\n・スタジオゼロノアール (千葉県木更津市)\n・ロックハート城 (群馬県)\n・東京ドーム / メッセモール等 『笑顔のレシピ』関連聖地6箇所\n・サンタモニカクレープ原宿店 / MIYASHITA PARK等 『絶対アイドル辞めないで』ジャケット撮影地\n・その他、多数のMV撮影地が追加されました！\n\n【笑顔のレシピ 巡礼ミッション始動！】\n指定 of 聖地を巡ってチェックインを記録すると、限定の称号「笑顔のレシピ料理人」が獲得できます！ぜひ挑戦してみてください！',
    type: 'update'
  },
  {
    id: 'notice-20260519-x-login',
    date: '2026/05/19',
    title: '🔒 X (Twitter) アカウントによる公式認証ログインに対応しました！',
    content: 'ログイン画面でXアカウントを使ったソーシャルログイン（OAuth 2.0認証）が利用可能になりました。\n\nワンタップで簡単にアカウント登録・サインインができ、ご自身の巡礼記録やチェックイン履歴が安全に引き継がれます。ファンの方々の利便性向上のためにぜひご利用ください！',
    type: 'system'
  }
];

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
  const [recipeMissionExpanded, setRecipeMissionExpanded] = useState<boolean>(true);
  const [hawaiiansMissionExpanded, setHawaiiansMissionExpanded] = useState<boolean>(true);
  const [hokkaidoMissionExpanded, setHokkaidoMissionExpanded] = useState<boolean>(true);
  const [fighterMissionExpanded, setFighterMissionExpanded] = useState<boolean>(true);
  const [kyunkawaMissionExpanded, setKyunkawaMissionExpanded] = useState<boolean>(true);
  const [shokoriMissionExpanded, setShokoriMissionExpanded] = useState<boolean>(true);
  const [byunMissionExpanded, setByunMissionExpanded] = useState<boolean>(true);

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

  // 📋 聖地一覧リスト ＆ 🔔 新着お知らせ用ステート
  const [activeView, setActiveView] = useState<'map' | 'list'>('map');
  const [showWelcomeNoticeModal, setShowWelcomeNoticeModal] = useState<boolean>(false);
  const [welcomeNotice, setWelcomeNotice] = useState<Notice | null>(null);
  const [hasUnreadNotices, setHasUnreadNotices] = useState<boolean>(false);
  const [showNoticeHistoryModal, setShowNoticeHistoryModal] = useState<boolean>(false);
  const [listSearchKeyword, setListSearchKeyword] = useState<string>('');
  const [listSearchGroup, setListSearchGroup] = useState<string>('すべて');
  const [listLimit, setListLimit] = useState<number>(20);
  const [listSelectedArea, setListSelectedArea] = useState<string>('すべて');
  const [listSelectedMission, setListSelectedMission] = useState<string>('すべて');
  const [listSortKey, setListSortKey] = useState<'default' | 'song-asc' | 'date-desc' | 'date-asc'>('default');
  const [shokoriMissionStarted, setShokoriMissionStarted] = useState<boolean>(
    localStorage.getItem('tdm_shokori_started') === 'true'
  );

  // 🚀 新着お知らせの既読未読＆自動ポップアップ判定
  useEffect(() => {
    const lastReadId = localStorage.getItem('tdm_last_read_notice');
    const latestNotice = APP_NOTICES[0];
    
    if (latestNotice && lastReadId !== latestNotice.id) {
      setHasUnreadNotices(true);
      setWelcomeNotice(latestNotice);
      setShowWelcomeNoticeModal(true);
    }
  }, []);

  // 新着お知らせのポップアップを閉じる際の既読処理ヘルパー
  const handleCloseWelcomeNotice = () => {
    setShowWelcomeNoticeModal(false);
    setHasUnreadNotices(false);
    if (welcomeNotice) {
      localStorage.setItem('tdm_last_read_notice', welcomeNotice.id);
    }
  };

  // 📋 リストから「地図で見る」を押した際のアクション
  const handleViewOnMap = (spot: Spot) => {
    setSelectedSpot(spot);
    setRightPanelTab('detail');
    setActiveView('map'); // この状態切り替えが useEffect 側での invalidateSize & setView の連動処理を安全にトリガーします
  };

  // 🗺️ ビュー切り替え（非表示から表示）の際、Leafletの描画サイズを強制的に再計算（invalidateSize）して真っ白化バグを完全に解消するエフェクト
  // 🌟 依存配列から selectedSpot を削除することで、マップ上でピンをクリックした際の二重発火によるズームアウトバグを根絶します！
  useEffect(() => {
    if (activeView === 'map' && mapRef.current) {
      const timer = setTimeout(() => {
        if (mapRef.current) {
          console.log("Map resized and visible size recalculated securely.");
          mapRef.current.invalidateSize();
          
          // 選択中のスポットがあれば、その座標へ滑らかにアニメーションズーム移動します
          if (selectedSpot) {
            const currentZoom = mapRef.current.getZoom();
            // すでに詳細ズームしていればその倍率を維持し、最低でもズームレベル16を保証
            mapRef.current.setView([selectedSpot.latitude, selectedSpot.longitude], Math.max(currentZoom, 16), { animate: true });
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeView]);

  // 📋 聖地リスト用フィルタリング（都道府県の動的抽出と多重ソートを適用）
  // 📍 聖地データの都道府県（日本の47都道府県名）の動的抽出ヘルパー
  const extractArea = (spot: Spot): string => {
    // 日本の47都道府県名のみを厳密にマッチング
    const areaMatch = spot.description.match(/(東京都|北海道|京都府|大阪府|神奈川県|千葉県|埼玉県|愛知県|兵庫県|福岡県|静岡県|茨城県|広島県|宮城県|新潟県|長野県|栃木県|群馬県|熊本県|岡山県|三重県|鹿児島県|山口県|愛媛県|福島県|滋賀県|青森県|山形県|石川県|秋田県|香川県|和歌山県|宮崎県|富山県|佐賀県|鳥取県|徳島県|高知県|島根県|岩手県|山梨県|長崎県|大分県|沖縄県|奈良県|福井県|岐阜県)/);
    return areaMatch ? areaMatch[0] : '';
  };

  // データベース上の登録聖地から、存在する都道府県のみを動的に抽出
  const availableAreas = Array.from(new Set(spots.map(extractArea))).filter(a => a !== '');

  // 📋 聖地リスト用フィルターリング＆並べ替えソート処理
  const filteredListSpots = spots.filter(spot => {
    // ルート解放型ミッションの未解放ゴール地点は非表示
    if (!shokoriMissionStarted && spot.id === 'spot-shokori-goal') {
      return false;
    }

    // 大空、ビュンと 順次解放ロジック
    const byunSpotsOrder = [
      "spot-joy-byun1", "spot-joy-byun2", "spot-joy-byun3", 
      "spot-joy-byun4", "spot-joy-byun5", "spot-joy-byun6", "spot-joy-byun7"
    ];
    const spotByunIndex = byunSpotsOrder.indexOf(spot.id);
    if (spotByunIndex > 0) {
      // 直前のスポットがチェックインされているか確認
      const prevSpotId = byunSpotsOrder[spotByunIndex - 1];
      const isPrevChecked = checkins.some(c => c.spot_id === prevSpotId);
      // 直前のスポットがチェックインされていなければ、このスポットは非表示（未解放）
      if (!isPrevChecked) {
        return false;
      }
    }

    // グループ別
    if (listSearchGroup !== 'すべて' && spot.group !== listSearchGroup) {
      return false;
    }
    
    // 都道府県/エリア別
    if (listSelectedArea !== 'すべて') {
      const spotArea = extractArea(spot);
      if (spotArea !== listSelectedArea) {
        return false;
      }
    }

    // ミッション別
    if (listSelectedMission !== 'すべて') {
      const hasMission = spot.tags && spot.tags.some(tag => {
        if (listSelectedMission === 'trigger') return tag.includes('トリガー巡礼');
        if (listSelectedMission === 'recipe') return tag.includes('笑顔のレシピ巡礼');
        if (listSelectedMission === 'hawaiians') return tag.includes('ハワイアンズ巡礼');
        if (listSelectedMission === 'hokkaido') return tag.includes('超特Q北海道巡礼');
        if (listSelectedMission === 'fighter') return tag.includes('排他的ファイター巡礼') || tag.includes('排彼のファイター巡礼');
        if (listSelectedMission === 'kyunkawa') return tag.includes('きゅんかわ人生巡礼');
        if (listSelectedMission === 'shokori') return tag.includes('しょこりさんぽ巡礼');
        if (listSelectedMission === 'byun') return tag.includes('大空、ビュンと巡礼');
        return false;
      });
      if (!hasMission) {
        return false;
      }
    }
    
    // キーワード検索（名称、説明、カテゴリ、タグ、関連曲）
    if (listSearchKeyword.trim()) {
      const keyword = listSearchKeyword.toLowerCase();
      const nameMatch = spot.name.toLowerCase().includes(keyword);
      const descMatch = spot.description.toLowerCase().includes(keyword);
      const categoryMatch = spot.category.toLowerCase().includes(keyword);
      const rewardMatch = spot.reward_title?.toLowerCase().includes(keyword) || false;
      const tagMatch = spot.tags?.some(t => t.toLowerCase().includes(keyword)) || false;
      
      if (!nameMatch && !descMatch && !categoryMatch && !rewardMatch && !tagMatch) {
        return false;
      }
    }
    return true;
  });

  // ソートロジックの適用
  const sortedListSpots = [...filteredListSpots].sort((a, b) => {
    if (listSortKey === 'song-asc') {
      const titleA = a.reward_title || '';
      const titleB = b.reward_title || '';
      return titleA.localeCompare(titleB, 'ja');
    }
    if (listSortKey === 'date-desc') {
      const dateA = a.memorial_date ? new Date(a.memorial_date).getTime() : 0;
      const dateB = b.memorial_date ? new Date(b.memorial_date).getTime() : 0;
      return dateB - dateA; // 新しい順
    }
    if (listSortKey === 'date-asc') {
      const dateA = a.memorial_date ? new Date(a.memorial_date).getTime() : 0;
      const dateB = b.memorial_date ? new Date(b.memorial_date).getTime() : 0;
      return dateA - dateB; // 古い順
    }
    return 0; // デフォルト（登録順）
  });

  const visibleSpots = sortedListSpots.slice(0, listLimit);
  
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
        // ログイン完了時
        db.setCurrentUser(session.user);
        setCurrentUser(session.user);
        setEditUsername(session.user.username);
        setEditOshiGroup(session.user.oshi_group);
        setEditActiveTitle(session.user.active_title || '');
        
        // 🌟 新しいユーザーの ID に基づいて最新の記録を再フェッチし画面を更新する
        setCheckins(db.getCheckIns(session.user.id));
      } else {
        // ログアウト時 / 未ログイン時
        const guestUser: User = {
          id: "guest",
          username: "未ログインの巡礼者",
          oshi_group: "合同",
          titles: [],
          acquired_titles: []
        };
        db.setCurrentUser(guestUser);
        setCurrentUser(guestUser);
        setEditUsername(guestUser.username);
        setEditOshiGroup(guestUser.oshi_group);
        setEditActiveTitle(guestUser.active_title || '');
        
        // 🌟 ステート・キャッシュの完全初期化: 巡礼記録を即座に空にする
        setCheckins([]);
        sessionStorage.clear();
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

    // 6. 笑顔のレシピ料理人 (6箇所)
    const recipeSpots = spots.filter(s => s.tags && s.tags.includes("笑顔のレシピ巡礼"));
    const recipeTitle = "笑顔のレシピ料理人";
    if (recipeSpots.length > 0 && isAllChecked(recipeSpots)) {
      if (!currentAcquired.includes(recipeTitle) && !newlyEarnedTitles.includes(recipeTitle)) {
        newlyEarnedTitles.push(recipeTitle);
      }
    }

    // 7. 常夏のハワイアンズ (1箇所)
    const hawaiiansSpots = spots.filter(s => s.tags && s.tags.includes("ハワイアンズ巡礼"));
    const hawaiiansTitle = "常夏のハワイアンズ";
    if (hawaiiansSpots.length > 0 && isAllChecked(hawaiiansSpots)) {
      if (!currentAcquired.includes(hawaiiansTitle) && !newlyEarnedTitles.includes(hawaiiansTitle)) {
        newlyEarnedTitles.push(hawaiiansTitle);
      }
    }

    // 8. 超特Qなクイズ王 (4箇所)
    const hokkaidoSpots = spots.filter(s => s.tags && s.tags.includes("超特Q北海道巡礼"));
    const hokkaidoTitle = "超特Qなクイズ王";
    if (hokkaidoSpots.length > 0 && isAllChecked(hokkaidoSpots)) {
      if (!currentAcquired.includes(hokkaidoTitle) && !newlyEarnedTitles.includes(hokkaidoTitle)) {
        newlyEarnedTitles.push(hokkaidoTitle);
      }
    }

    // 9. 孤高のファイター (3箇所)
    const fighterSpots = spots.filter(s => s.tags && (s.tags.includes("排彼のファイター巡礼") || s.tags.includes("排彼のファイター巡礼") || s.tags.includes("排彼のファイター巡礼") || s.tags.includes("排他的ファイター巡礼")));
    const fighterTitle = "孤高のファイター";
    if (fighterSpots.length > 0 && isAllChecked(fighterSpots)) {
      if (!currentAcquired.includes(fighterTitle) && !newlyEarnedTitles.includes(fighterTitle)) {
        newlyEarnedTitles.push(fighterTitle);
      }
    }

    // 10. きゅんかわマスター (4箇所)
    const kyunkawaSpots = spots.filter(s => s.tags && s.tags.includes("きゅんかわ人生巡礼"));
    const kyunkawaTitle = "きゅんかわマスター";
    if (kyunkawaSpots.length > 0 && isAllChecked(kyunkawaSpots)) {
      if (!currentAcquired.includes(kyunkawaTitle) && !newlyEarnedTitles.includes(kyunkawaTitle)) {
        newlyEarnedTitles.push(kyunkawaTitle);
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

    // 10. しょこりさ推し！ (しょこりさんぽゴールチェックイン時)
    const shokoriTitle = "しょこりさ推し！";
    if (checkedSpotIds.has("spot-shokori-goal")) {
      if (!currentAcquired.includes(shokoriTitle) && !newlyEarnedTitles.includes(shokoriTitle)) {
        newlyEarnedTitles.push(shokoriTitle);
      }
    }

    // 11. 大空を駆ける者 (大空、ビュンと巡礼ゴールチェックイン時)
    const byunTitle = "大空を駆ける者";
    if (checkedSpotIds.has("spot-joy-byun7")) {
      if (!currentAcquired.includes(byunTitle) && !newlyEarnedTitles.includes(byunTitle)) {
        newlyEarnedTitles.push(byunTitle);
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
    // 0. ルート解放型ミッションの未解放ゴール地点は非表示
    if (!shokoriMissionStarted && spot.id === 'spot-shokori-goal') {
      return false;
    }

    // 0.5. 大空、ビュンと 順次解放ロジック
    const byunSpotsOrder = [
      "spot-joy-byun1", "spot-joy-byun2", "spot-joy-byun3", 
      "spot-joy-byun4", "spot-joy-byun5", "spot-joy-byun6", "spot-joy-byun7"
    ];
    const spotByunIndex = byunSpotsOrder.indexOf(spot.id);
    if (spotByunIndex > 0) {
      const prevSpotId = byunSpotsOrder[spotByunIndex - 1];
      const isPrevChecked = checkins.some(c => c.spot_id === prevSpotId);
      if (!isPrevChecked) {
        return false;
      }
    }

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
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: false // 🌟 デフォルトの自動ズームクリックを完全に無効化し、競合を完全に根絶します
    }) : null;

    if (clusterGroup) {
      clusterGroupRef.current = clusterGroup;
      
      // 🌟 クラスタクリック時にズームインさせる処理を明示的にバインドし、縮小・ズームアウトバグを根絶します
      clusterGroup.on('clusterclick', (a: any) => {
        const bounds = a.layer.getBounds();
        const currentZoom = map.getZoom();
        
        // Leafletが算出したターゲットズームレベルを事前取得
        const targetZoom = map.getBoundsZoom(bounds);
        
        // 算出されたズームが現在のズームレベル以下（＝縮小されてしまう場合）は、
        // fitBoundsをバイパスし、強制的に「現在のズームレベル + 2」または最低16へズームインさせます！
        if (targetZoom <= currentZoom) {
          const nextZoom = Math.min(Math.max(currentZoom + 2, 16), 18); // 最大18まで段階的に拡大
          map.setView(a.latlng, nextZoom, { animate: true });
        } else {
          // 拡大方向の移動であれば、通常の境界フィットを実行します
          map.fitBounds(bounds, {
            maxZoom: Math.max(currentZoom, 16),
            animate: true,
            padding: [30, 30]
          });
        }
      });
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
          
          // 既にズームイン（16以上）している状態でピンを押しても、ズームレベルを下げず（動かさず）に滑らかに中央移動のみ行います
          const currentZoom = map.getZoom();
          map.setView([spot.latitude, spot.longitude], Math.max(currentZoom, 16), { animate: true });
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
        const currentZoom = mapRef.current.getZoom();
        mapRef.current.setView([spot.latitude, spot.longitude], Math.max(currentZoom, 16), { animate: true }); // 既にズームインしていればそのまま維持
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
        height: '100vh',
        overflowY: 'auto',
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
                      本サービスはX（Twitter）のOAuth認証を利用しています。ログイン時にプラットフォームから提供される「メールアドレス」「氏名（表示名）」「プロフィール画像」のみを取得します。※ユーザーのパスワードは本サービスでは一切保持・管理いたしません。
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
          
          {/* 📋 ビュー切り替えトグル ＆ 🔔 通知ベル */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* 切り替えセグメンテッドトグル */}
            <div style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0'
            }}>
              <button
                onClick={() => setActiveView('map')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeView === 'map' ? '#ffffff' : 'transparent',
                  color: activeView === 'map' ? 'var(--text-main)' : '#64748b',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: activeView === 'map' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                🗺️ マップ
              </button>
              <button
                onClick={() => setActiveView('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeView === 'list' ? '#ffffff' : 'transparent',
                  color: activeView === 'list' ? 'var(--text-main)' : '#64748b',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: activeView === 'list' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                📋 リスト
              </button>
            </div>

            {/* 通知ベルボタン */}
            <button
              onClick={() => {
                setShowNoticeHistoryModal(true);
                setHasUnreadNotices(false);
              }}
              style={{
                position: 'relative',
                background: '#ffffff',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                transition: 'all 0.2s'
              }}
              className="pop-button"
              title="お知らせ・更新履歴"
            >
              <Bell size={16} />
              {hasUnreadNotices && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: '2px solid #ffffff'
                }}></span>
              )}
            </button>
          </div>

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
              gap: '6px',
              position: 'relative'
            }}
          >
            <Menu size={18} />
            {hasUnreadNotices && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid #ffffff',
                boxShadow: '0 0 6px rgba(239,68,68,0.4)'
              }}></span>
            )}
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
        
        {/* 左側: 地図領域 (マップとリストが干渉せず共存し、高速に切り替わる display:none 方式を採用) */}
        <div className="left-area" style={{ position: 'relative', height: '100%' }}>
          
          {/* 地図エリア (中央のメインエリア) */}
          <div 
            className="map-container" 
            style={{ 
              position: 'relative',
              height: '100%',
              display: activeView === 'map' ? 'block' : 'none'
            }}
          >
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
          {/* 📋 聖地一覧リストUI (Lazy Load & 検索 & 絞り込み搭載) */}
          <div 
            className="spots-list-container" 
            style={{
              height: '100%',
              display: activeView === 'list' ? 'flex' : 'none',
              flexDirection: 'column',
              background: '#f8fafc',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
              {/* リストヘッダー（検索・絞り込みフィルター） */}
              <div className="list-filters-box" style={{
                padding: '20px',
                background: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📋 聖地一覧リスト <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '8px' }}>{filteredListSpots.length} 件</span>
                  </h2>
                </div>
                
                {/* 検索入力欄 */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="スポット名、関連曲、住所、キーワードで検索..."
                    value={listSearchKeyword}
                    onChange={(e) => {
                      setListSearchKeyword(e.target.value);
                      setListLimit(20);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '12px',
                      border: '2px solid #e2e8f0',
                      outline: 'none',
                      fontSize: '12px',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                  />
                  {listSearchKeyword && (
                    <button
                      onClick={() => {
                        setListSearchKeyword('');
                        setListLimit(20);
                      }}
                      style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* 📍 都道府県・ミッションフィルター ＆ 📋 ソート並べ替え */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* ミッションセレクト */}
                  <div style={{ position: 'relative' }}>
                    <select
                      value={listSelectedMission}
                      onChange={(e) => {
                        setListSelectedMission(e.target.value);
                        setListLimit(20);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 24px 8px 10px',
                        borderRadius: '10px',
                        border: '2px solid #e2e8f0',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#475569',
                        outline: 'none',
                        background: '#ffffff',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none'
                      }}
                    >
                      <option value="すべて">🏅 すべてのミッション・タグ</option>
                      <option value="trigger">☁️ この空がトリガー (全12箇所)</option>
                      <option value="recipe">🍳 笑顔のレシピ (全6箇所)</option>
                      <option value="hawaiians">🌺 常夏のハワイアンズ (全1箇所)</option>
                      <option value="hokkaido">🚄 超特Q北海道 (全4箇所)</option>
                      <option value="fighter">🥊 排他的ファイター (全3箇所)</option>
                      <option value="kyunkawa">🎀 きゅんかわ人生 (全4箇所)</option>
                      <option value="shokori">🌸 しょこりさんぽ (全2箇所)</option>
                      <option value="byun">✈️ 大空、ビュンと (全7箇所)</option>
                    </select>
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '9px', color: '#94a3b8' }}>▼</div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* 都道府県セレクト */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    <select
                      value={listSelectedArea}
                      onChange={(e) => {
                        setListSelectedArea(e.target.value);
                        setListLimit(20);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 24px 8px 10px',
                        borderRadius: '10px',
                        border: '2px solid #e2e8f0',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#475569',
                        outline: 'none',
                        background: '#ffffff',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none'
                      }}
                    >
                      <option value="すべて">📍 すべてのエリア</option>
                      {availableAreas.map(area => (
                        <option key={area} value={area}>📍 {area}</option>
                      ))}
                    </select>
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '9px', color: '#94a3b8' }}>▼</div>
                  </div>

                  {/* ソートセレクト */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    <select
                      value={listSortKey}
                      onChange={(e) => {
                        setListSortKey(e.target.value as any);
                        setListLimit(20);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 24px 8px 10px',
                        borderRadius: '10px',
                        border: '2px solid #e2e8f0',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#475569',
                        outline: 'none',
                        background: '#ffffff',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none'
                      }}
                    >
                      <option value="default">✨ デフォルト順</option>
                      <option value="song-asc">🎵 曲名五十音順</option>
                      <option value="date-desc">📅 新しい順 (降順)</option>
                      <option value="date-asc">📅 古い順 (昇順)</option>
                    </select>
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '9px', color: '#94a3b8' }}>▼</div>
                  </div>
                </div>
                </div>

                {/* グループ別フィルタータブ */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }} className="no-scrollbar">
                  {(['すべて', '=LOVE', '≠ME', '≒JOY', '合同'] as const).map((group) => {
                    const isSelected = listSearchGroup === group;
                    let activeBg = 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)';
                    let activeColor = '#ffffff';
                    if (group === '=LOVE') activeBg = 'var(--color-equal-love)';
                    else if (group === '≠ME') activeBg = 'var(--color-not-equal-me)';
                    else if (group === '≒JOY') activeBg = 'var(--color-nearly-joy)';
                    else if (group === '合同') activeBg = 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)';

                    return (
                      <button
                        key={group}
                        onClick={() => {
                          setListSearchGroup(group);
                          setListLimit(20);
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: isSelected ? 'none' : '1px solid #e2e8f0',
                          background: isSelected ? activeBg : '#ffffff',
                          color: isSelected ? activeColor : '#64748b',
                          fontSize: '11px',
                          fontWeight: 'black',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 4px 8px rgba(0,0,0,0.06)' : 'none'
                        }}
                      >
                        {group}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* スポットカードリスト */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }} className="custom-scrollbar">
                {visibleSpots.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    <span style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</span>
                    <span style={{ fontWeight: 'bold', fontSize: '13px' }}>該当する聖地が見つかりませんでした。</span>
                  </div>
                ) : (
                  <>
                    {visibleSpots.map((spot) => {
                      let groupColor = '#64748b';
                      let groupBg = '#f1f5f9';
                      if (spot.group === '=LOVE') { groupColor = '#ff6897'; groupBg = '#ffeef2'; }
                      else if (spot.group === '≠ME') { groupColor = '#06b6d4'; groupBg = '#ecfeff'; }
                      else if (spot.group === '≒JOY') { groupColor = '#eab308'; groupBg = '#fef9c3'; }
                      else if (spot.group === '合同') { groupColor = '#6366f1'; groupBg = '#e0e7ff'; }

                      const isVisited = checkins.some(c => c.spot_id === spot.id);
                      
                      // 都道府県等の大まかなエリアを説明文や住所から動的に抽出
                      let area = 'その他';
                      const areaMatch = spot.description.match(/(東京都|神奈川県|千葉県|埼玉県|群馬県|栃木県|茨城県|山梨県|静岡県|沖縄県|高知県|福島県|山口県|セブ島|韓国)/);
                      if (areaMatch) {
                        area = areaMatch[0];
                      } else if (spot.name.includes('（')) {
                        const innerMatch = spot.name.match(/（(.*?)）/);
                        if (innerMatch) area = innerMatch[1];
                      }

                      return (
                        <div
                          key={spot.id}
                          style={{
                            background: '#ffffff',
                            border: isVisited ? '2px solid #bef264' : '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            transition: 'all 0.2s',
                            position: 'relative',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                          }}
                          className="list-spot-card"
                        >
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '9px',
                              fontWeight: '950',
                              color: groupColor,
                              background: groupBg,
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              {spot.group}
                            </span>
                            
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 'bold',
                              color: '#64748b',
                              background: '#f1f5f9',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              📍 {area}
                            </span>

                            <span style={{
                              fontSize: '9px',
                              fontWeight: 'bold',
                              color: '#a855f7',
                              background: '#f3e8ff',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              🏷️ {spot.category}
                            </span>

                            {isVisited ? (
                              <span style={{
                                marginLeft: 'auto',
                                fontSize: '9px',
                                fontWeight: 'bold',
                                color: '#65a30d',
                                background: '#ecfccb',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}>
                                ✅ 巡礼完了
                              </span>
                            ) : (
                              <span style={{
                                marginLeft: 'auto',
                                fontSize: '9px',
                                fontWeight: 'bold',
                                color: '#94a3b8',
                                background: '#f8fafc',
                                padding: '2px 8px',
                                borderRadius: '6px'
                              }}>
                                未訪問
                              </span>
                            )}
                          </div>

                          <h3 style={{
                            fontSize: '14px',
                            fontWeight: 900,
                            color: 'var(--text-main)',
                            margin: 0,
                            lineHeight: 1.4
                          }}>
                            {spot.name}
                          </h3>

                          {spot.reward_title && (
                            <div style={{
                              fontSize: '10px',
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#f8fafc',
                              padding: '5px 8px',
                              borderRadius: '6px'
                            }}>
                              🎵 <span style={{ fontWeight: 'bold' }}>{spot.reward_title.replace("の証言者", "").replace("の約束人", "").replace("の旅人", "").replace("の恋人", "").replace("の漂流者", "").replace("の語り部", "").replace("のダンサー", "").replace("の走者", "").replace("の虜", "")}</span> 関連
                            </div>
                          )}

                          <p style={{
                            fontSize: '11px',
                            color: '#64748b',
                            margin: 0,
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {spot.description}
                          </p>

                          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                            <button
                              onClick={() => handleViewOnMap(spot)}
                              style={{
                                flex: 1,
                                background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '10px',
                                fontWeight: 'black',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                transition: 'all 0.2s'
                              }}
                              className="pop-button"
                            >
                              🗺️ 地図で見る
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedSpot(spot);
                                setRightPanelTab('detail');
                              }}
                              style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                            >
                              詳細 ➔
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {filteredListSpots.length > listLimit && (
                      <button
                        onClick={() => setListLimit(prev => prev + 20)}
                        style={{
                          padding: '10px',
                          background: '#ffffff',
                          border: '2px dashed #cbd5e1',
                          borderRadius: '12px',
                          color: '#475569',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          marginTop: '4px'
                        }}
                        className="pop-button"
                      >
                        ➕ さらに読み込む (残り {filteredListSpots.length - listLimit} 件)
                      </button>
                    )}
                  </>
                )}
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {/* 🏷️ メインタイトル（小見出し）：バッジ風装飾 */}
                            <span style={{
                              alignSelf: 'flex-start',
                              fontSize: '9px',
                              fontWeight: '900',
                              color: '#6d28d9',
                              background: '#f3e8ff',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              letterSpacing: '0.02em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              🏷️ この空がトリガー 巡礼ミッション
                            </span>
                            {/* 👑 サブタイトル（大見出し）：目を引くエモいタイトル */}
                            <span style={{
                              fontSize: '15px',
                              fontWeight: '900',
                              color: '#1e293b',
                              letterSpacing: '-0.02em',
                              lineHeight: '1.2',
                              marginTop: '2px'
                            }}>
                              青い空を見上げた日
                            </span>
                            {/* 📊 進行状況 */}
                            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '800', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              🧭 進行状況: {uniqueCheckedCount} / {totalTriggerCount} 箇所 ({percent}%)
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

                  {/* 🌟 笑顔のレシピ巡礼ミッションの進捗カード */}
                  {(() => {
                    const recipeSpots = spots.filter(s => s.tags && s.tags.includes("笑顔のレシピ巡礼"));
                    const checkedRecipeSpots = checkins.filter(c => {
                      const spot = spots.find(s => s.id === c.spot_id);
                      return spot && spot.tags && spot.tags.includes("笑顔のレシピ巡礼");
                    });
                    const uniqueCheckedCount = new Set(checkedRecipeSpots.map(c => c.spot_id)).size;
                    const totalRecipeCount = recipeSpots.length || 6;
                    const percent = Math.min(100, Math.round((uniqueCheckedCount / totalRecipeCount) * 100));
                    const isCompleted = uniqueCheckedCount === totalRecipeCount;

                    return (
                      <div className="pop-panel" style={{
                        borderRadius: '16px',
                        border: '2px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-panel)',
                        marginTop: '16px'
                      }}>
                        {/* アコーディオンヘッダー */}
                        <div 
                          onClick={() => setRecipeMissionExpanded(!recipeMissionExpanded)}
                          style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', // 爽やかなグリーン系グラデーション
                            borderBottom: '1px solid #e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {/* 🏷️ メインタイトル（小見出し）：バッジ風装飾 */}
                            <span style={{
                              alignSelf: 'flex-start',
                              fontSize: '9px',
                              fontWeight: '900',
                              color: '#16a34a',
                              background: '#dcfce7',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              letterSpacing: '0.02em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              🏷️ 笑顔のレシピ 巡礼ミッション
                            </span>
                            {/* 👑 サブタイトル（大見出し）：目を引くエモいタイトル */}
                            <span style={{
                              fontSize: '15px',
                              fontWeight: '900',
                              color: '#1e293b',
                              letterSpacing: '-0.02em',
                              lineHeight: '1.2',
                              marginTop: '2px'
                            }}>
                              みんなで作る最高のレシピ
                            </span>
                            {/* 📊 進行状況 */}
                            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '800', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              🧭 進行状況: {uniqueCheckedCount} / {totalRecipeCount} 箇所 ({percent}%)
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isCompleted ? (
                              <span style={{ fontSize: '10px', fontWeight: '900', color: '#16a34a', background: '#ffffff', padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(22,163,74,0.2)' }}>達成！</span>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" style={{ transform: recipeMissionExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                            )}
                          </div>
                        </div>

                        {/* アコーディオンの中身（6箇所の聖地リスト） */}
                        {recipeMissionExpanded && (
                          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#ffffff' }}>
                            
                            {/* プログレスバー */}
                            <div style={{ padding: '4px 6px 10px 6px' }}>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #4ade80 0%, #2dd4bf 100%)', transition: 'width 0.4s ease-out' }}></div>
                              </div>
                            </div>

                            {/* 6箇所のリスト */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {recipeSpots.map(spot => {
                                const isSpotChecked = checkins.some(c => c.spot_id === spot.id);
                                return (
                                  <div 
                                    key={spot.id} 
                                    onClick={() => {
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
                                      background: isSpotChecked ? '#f0fdf4' : '#f8fafc',
                                      border: isSpotChecked ? '1px solid rgba(22, 163, 74, 0.2)' : '1px solid #e2e8f0',
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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#ffffff', color: '#16a34a', padding: '2px 8px', borderRadius: '9999px', fontSize: '9px', fontWeight: '900', border: '1px solid rgba(22,163,74,0.2)' }}>
                                          <CheckCircle2 className="w-3 h-3 text-[#16a34a]" />
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
                              background: isCompleted ? 'linear-gradient(135deg, rgba(74,222,128,0.06) 0%, rgba(45,212,191,0.06) 100%)' : '#f8fafc',
                              border: isCompleted ? '1px dashed #2dd4bf' : '1px dashed #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isCompleted ? 'linear-gradient(135deg, #4ade80 0%, #2dd4bf 100%)' : '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <Award className="w-4 h-4 text-white" />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '10px', fontWeight: '900', color: isCompleted ? '#16a34a' : '#64748b' }}>称号報酬: 笑顔のレシピ料理人</span>
                                <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                  {isCompleted ? '🎉 笑顔のレシピ料理人の称号を獲得！マイページでバッジが輝いています。' : '笑顔のレシピの聖地6箇所すべてを巡ると「笑顔のレシピ料理人」の称号が解放されます。'}
                                </span>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 🌟 ノイミー学園クエストシリーズ：ミッションA (ハワイアンズ) */}
                  {(() => {
                    const hawaiianSpots = spots.filter(s => s.tags && s.tags.includes("ハワイアンズ巡礼"));
                    const checkedHawaiianSpots = checkins.filter(c => {
                      const spot = spots.find(s => s.id === c.spot_id);
                      return spot && spot.tags && spot.tags.includes("ハワイアンズ巡礼");
                    });
                    const uniqueCheckedCount = new Set(checkedHawaiianSpots.map(c => c.spot_id)).size;
                    const totalCount = hawaiianSpots.length || 1;
                    const percent = Math.min(100, Math.round((uniqueCheckedCount / totalCount) * 100));
                    const isCompleted = uniqueCheckedCount === totalCount;

                    return (
                      <div className="pop-panel" style={{
                        borderRadius: '16px',
                        border: '2px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-panel)',
                        marginTop: '16px'
                      }}>
                        {/* アコーディオンヘッダー */}
                        <div 
                          onClick={() => setHawaiiansMissionExpanded(!hawaiiansMissionExpanded)}
                          style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', // 爽やかなブルー系グラデーション
                            borderBottom: '1px solid #e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {/* 🏷️ メインタイトル（小見出し）：バッジ風装飾 */}
                            <span style={{
                              alignSelf: 'flex-start',
                              fontSize: '9px',
                              fontWeight: '900',
                              color: '#3b82f6',
                              background: '#dbeafe',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              letterSpacing: '0.02em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              🏷️ ノイミー学園クエストシリーズ
                            </span>
                            {/* 👑 サブタイトル（大見出し）：エモいタイトル */}
                            <span style={{
                              fontSize: '15px',
                              fontWeight: '900',
                              color: '#1e293b',
                              letterSpacing: '-0.02em',
                              lineHeight: '1.2',
                              marginTop: '2px'
                            }}>
                              『ハワイアーンなリゾート地！』
                            </span>
                            {/* 📊 進行状況 */}
                            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '800', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              🧭 進行状況: {uniqueCheckedCount} / {totalCount} 箇所 ({percent}%)
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isCompleted ? (
                              <span style={{ fontSize: '10px', fontWeight: '900', color: '#3b82f6', background: '#ffffff', padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(59,130,246,0.2)' }}>達成！</span>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" style={{ transform: hawaiiansMissionExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                            )}
                          </div>
                        </div>

                        {/* アコーディオンの中身 */}
                        {hawaiiansMissionExpanded && (
                          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#ffffff' }}>
                            {/* プログレスバー */}
                            <div style={{ padding: '4px 6px 10px 6px' }}>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)', transition: 'width 0.4s ease-out' }}></div>
                              </div>
                            </div>

                            {/* スポットリスト */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {hawaiianSpots.map(spot => {
                                const isSpotChecked = checkins.some(c => c.spot_id === spot.id);
                                return (
                                  <div 
                                    key={spot.id} 
                                    onClick={() => {
                                      handleFocusSpotOnMap(spot);
                                      setSelectedSpot(spot);
                                      setRightPanelTab('detail');
                                    }}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 10px',
                                      borderRadius: '10px',
                                      background: isSpotChecked ? '#f0fdf4' : '#f8fafc',
                                      border: isSpotChecked ? '1px solid rgba(74,222,128,0.2)' : '1px solid #f1f5f9',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '800', color: isSpotChecked ? '#16a34a' : '#334155' }}>
                                        {spot.name}
                                      </span>
                                      <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                        📍 福島県いわき市
                                      </span>
                                    </div>
                                    <div>
                                      {isSpotChecked ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '9999px', fontSize: '9px', fontWeight: '900' }}>
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
                              background: isCompleted ? 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(37,99,235,0.06) 100%)' : '#f8fafc',
                              border: isCompleted ? '1px dashed #3b82f6' : '1px dashed #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isCompleted ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' : '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <Award className="w-4 h-4 text-white" />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '10px', fontWeight: '900', color: isCompleted ? '#2563eb' : '#64748b' }}>称号報酬: 常夏のハワイアンズ</span>
                                <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                  {isCompleted ? '🎉 常夏のハワイアンズの称号を獲得！マイページでバッジが輝いています。' : 'スパリゾートハワイアンズを訪れてチェックインすると「常夏のハワイアンズ」の称号が解放されます。'}
                                </span>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 🌟 ノイミー学園クエストシリーズ：ミッションB (超特Q北海道) */}
                  {(() => {
                    const hokkaidoSpots = spots.filter(s => s.tags && s.tags.includes("超特Q北海道巡礼"));
                    const checkedHokkaidoSpots = checkins.filter(c => {
                      const spot = spots.find(s => s.id === c.spot_id);
                      return spot && spot.tags && spot.tags.includes("超特Q北海道巡礼");
                    });
                    const uniqueCheckedCount = new Set(checkedHokkaidoSpots.map(c => c.spot_id)).size;
                    const totalCount = hokkaidoSpots.length || 4;
                    const percent = Math.min(100, Math.round((uniqueCheckedCount / totalCount) * 100));
                    const isCompleted = uniqueCheckedCount === totalCount;

                    return (
                      <div className="pop-panel" style={{
                        borderRadius: '16px',
                        border: '2px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-panel)',
                        marginTop: '16px'
                      }}>
                        {/* アコーディオンヘッダー */}
                        <div 
                          onClick={() => setHokkaidoMissionExpanded(!hokkaidoMissionExpanded)}
                          style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', // 爽やかなパープル系グラデーション
                            borderBottom: '1px solid #e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {/* 🏷️ メインタイトル（小見出し）：バッジ風装飾 */}
                            <span style={{
                              alignSelf: 'flex-start',
                              fontSize: '9px',
                              fontWeight: '900',
                              color: '#7c3aed',
                              background: '#ede9fe',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              letterSpacing: '0.02em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              🏷️ ノイミー学園クエストシリーズ
                            </span>
                            {/* 👑 サブタイトル（大見出し）：エモいタイトル */}
                            <span style={{
                              fontSize: '15px',
                              fontWeight: '900',
                              color: '#1e293b',
                              letterSpacing: '-0.02em',
                              lineHeight: '1.2',
                              marginTop: '2px'
                            }}>
                              『超特Qな雪遊び！？』
                            </span>
                            {/* 📊 進行状況 */}
                            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '800', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              🧭 進行状況: {uniqueCheckedCount} / {totalCount} 箇所 ({percent}%)
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isCompleted ? (
                              <span style={{ fontSize: '10px', fontWeight: '900', color: '#7c3aed', background: '#ffffff', padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(124,58,237,0.2)' }}>達成！</span>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" style={{ transform: hokkaidoMissionExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                            )}
                          </div>
                        </div>

                        {/* アコーディオンの中身 */}
                        {hokkaidoMissionExpanded && (
                          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#ffffff' }}>
                            {/* プログレスバー */}
                            <div style={{ padding: '4px 6px 10px 6px' }}>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)', transition: 'width 0.4s ease-out' }}></div>
                              </div>
                            </div>

                            {/* スポットリスト */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {hokkaidoSpots.map(spot => {
                                const isSpotChecked = checkins.some(c => c.spot_id === spot.id);
                                return (
                                  <div 
                                    key={spot.id} 
                                    onClick={() => {
                                      handleFocusSpotOnMap(spot);
                                      setSelectedSpot(spot);
                                      setRightPanelTab('detail');
                                    }}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 10px',
                                      borderRadius: '10px',
                                      background: isSpotChecked ? '#f0fdf4' : '#f8fafc',
                                      border: isSpotChecked ? '1px solid rgba(74,222,128,0.2)' : '1px solid #f1f5f9',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '800', color: isSpotChecked ? '#16a34a' : '#334155' }}>
                                        {spot.name}
                                      </span>
                                      <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                        {spot.name === 'IORI' ? '📍 北海道千歳市' : '📍 北海道札幌市'}
                                      </span>
                                    </div>
                                    <div>
                                      {isSpotChecked ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '9999px', fontSize: '9px', fontWeight: '900' }}>
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
                              background: isCompleted ? 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(109,40,217,0.06) 100%)' : '#f8fafc',
                              border: isCompleted ? '1px dashed #7c3aed' : '1px dashed #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isCompleted ? 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)' : '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <Award className="w-4 h-4 text-white" />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '10px', fontWeight: '900', color: isCompleted ? '#6d28d9' : '#64748b' }}>称号報酬: 超特Qなクイズ王</span>
                                <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                  {isCompleted ? '🎉 超特Qなクイズ王の称号を獲得！マイページでバッジが輝いています。' : '「超特Q 北海道行き」の聖地4箇所すべてを巡ると「超特Qなクイズ王」の称号が解放されます。'}
                                </span>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 🌟 排他的ファイター 巡礼ミッション */}
                  {(() => {
                    const fighterSpots = spots.filter(s => s.tags && (s.tags.includes("排彼のファイター巡礼") || s.tags.includes("排彼のファイター巡礼") || s.tags.includes("排彼のファイター巡礼") || s.tags.includes("排他的ファイター巡礼")));
                    const checkedFighterSpots = checkins.filter(c => {
                      const spot = spots.find(s => s.id === c.spot_id);
                      return spot && spot.tags && (spot.tags.includes("排彼のファイター巡礼") || spot.tags.includes("排他的ファイター巡礼"));
                    });
                    const uniqueCheckedCount = new Set(checkedFighterSpots.map(c => c.spot_id)).size;
                    const totalCount = fighterSpots.length || 3;
                    const percent = Math.min(100, Math.round((uniqueCheckedCount / totalCount) * 100));
                    const isCompleted = uniqueCheckedCount === totalCount;

                    return (
                      <div className="pop-panel" style={{
                        borderRadius: '16px',
                        border: '2px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-panel)',
                        marginTop: '16px'
                      }}>
                        {/* アコーディオンヘッダー */}
                        <div 
                          onClick={() => setFighterMissionExpanded(!fighterMissionExpanded)}
                          style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', // クールで少し熱いピンク・レッド系グラデーション
                            borderBottom: '1px solid #e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {/* 🏷️ メインタイトル（小見出し）：バッジ風装飾 */}
                            <span style={{
                              alignSelf: 'flex-start',
                              fontSize: '9px',
                              fontWeight: '900',
                              color: '#e11d48',
                              background: '#ffe4e6',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              letterSpacing: '0.02em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              🏷️ 排他的ファイター 巡礼ミッション
                            </span>
                            {/* 👑 サブタイトル（大見出し）：エモいタイトル */}
                            <span style={{
                              fontSize: '15px',
                              fontWeight: '900',
                              color: '#1e293b',
                              letterSpacing: '-0.02em',
                              lineHeight: '1.2',
                              marginTop: '2px'
                            }}>
                              『輝け、僕の世界。』
                            </span>
                            {/* 📊 進行状況 */}
                            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '800', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              🧭 進行状況: {uniqueCheckedCount} / {totalCount} 箇所 ({percent}%)
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isCompleted ? (
                              <span style={{ fontSize: '10px', fontWeight: '900', color: '#e11d48', background: '#ffffff', padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(225,29,72,0.2)' }}>達成！</span>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" style={{ transform: fighterMissionExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                            )}
                          </div>
                        </div>

                        {/* アコーディオンの中身 */}
                        {fighterMissionExpanded && (
                          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#ffffff' }}>
                            {/* プログレスバー */}
                            <div style={{ padding: '4px 6px 10px 6px' }}>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #fda4af 0%, #f43f5e 100%)', transition: 'width 0.4s ease-out' }}></div>
                              </div>
                            </div>

                            {/* スポットリスト */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {fighterSpots.map(spot => {
                                const isSpotChecked = checkins.some(c => c.spot_id === spot.id);
                                return (
                                  <div 
                                    key={spot.id} 
                                    onClick={() => {
                                      handleFocusSpotOnMap(spot);
                                      setSelectedSpot(spot);
                                      setRightPanelTab('detail');
                                    }}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 10px',
                                      borderRadius: '10px',
                                      background: isSpotChecked ? '#f0fdf4' : '#f8fafc',
                                      border: isSpotChecked ? '1px solid rgba(74,222,128,0.2)' : '1px solid #f1f5f9',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '800', color: isSpotChecked ? '#16a34a' : '#334155' }}>
                                        {spot.name}
                                      </span>
                                      <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                        {spot.name === '芸能花伝舎' ? '📍 東京都新宿区' : spot.name === 'GOBLIN. 海岸HALL店' ? '📍 東京都港区' : '📍 東京都江東区'}
                                      </span>
                                    </div>
                                    <div>
                                      {isSpotChecked ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '9999px', fontSize: '9px', fontWeight: '900' }}>
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
                              background: isCompleted ? 'linear-gradient(135deg, rgba(244,63,94,0.06) 0%, rgba(225,29,72,0.06) 100%)' : '#f8fafc',
                              border: isCompleted ? '1px dashed #f43f5e' : '1px dashed #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isCompleted ? 'linear-gradient(135deg, #fda4af 0%, #f43f5e 100%)' : '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <Award className="w-4 h-4 text-white" />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '10px', fontWeight: '900', color: isCompleted ? '#e11d48' : '#64748b' }}>称号報酬: 孤高のファイター</span>
                                <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                  {isCompleted ? '🎉 孤高のファイターの称号を獲得！マイページでバッジが輝いています。' : '「排他的ファイター」の聖地3箇所すべてを巡ると「孤高のファイター」の称号が解放されます。'}
                                </span>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 🌟 きゅんかわ人生 巡礼ミッション */}
                  {(() => {
                    const kyunkawaSpots = spots.filter(s => s.tags && s.tags.includes("きゅんかわ人生巡礼"));
                    const checkedKyunkawaSpots = checkins.filter(c => {
                      const spot = spots.find(s => s.id === c.spot_id);
                      return spot && spot.tags && spot.tags.includes("きゅんかわ人生巡礼");
                    });
                    const uniqueCheckedCount = new Set(checkedKyunkawaSpots.map(c => c.spot_id)).size;
                    const totalCount = kyunkawaSpots.length || 4;
                    const percent = Math.min(100, Math.round((uniqueCheckedCount / totalCount) * 100));
                    const isCompleted = uniqueCheckedCount === totalCount;

                    return (
                      <div className="pop-panel" style={{
                        borderRadius: '16px',
                        border: '2px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-panel)',
                        marginTop: '16px'
                      }}>
                        {/* アコーディオンヘッダー */}
                        <div 
                          onClick={() => setKyunkawaMissionExpanded(!kyunkawaMissionExpanded)}
                          style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', // ≒JOYのイメージカラーでもある、爽やかで明るい黄緑・グリーン系グラデーション
                            borderBottom: '1px solid #e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {/* 🏷️ メインタイトル（小見出し）：バッジ風装飾 */}
                            <span style={{
                              alignSelf: 'flex-start',
                              fontSize: '9px',
                              fontWeight: '900',
                              color: '#16a34a',
                              background: '#dcfce7',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              letterSpacing: '0.02em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              🏷️ きゅんかわ人生 巡礼ミッション
                            </span>
                            {/* 👑 サブタイトル（大見出し）：エモいタイトル */}
                            <span style={{
                              fontSize: '15px',
                              fontWeight: '900',
                              color: '#1e293b',
                              letterSpacing: '-0.02em',
                              lineHeight: '1.2',
                              marginTop: '2px'
                            }}>
                              『きゅんかわアイドルどこですか!?』
                            </span>
                            {/* 📊 進行状況 */}
                            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '800', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              🧭 進行状況: {uniqueCheckedCount} / {totalCount} 箇所 ({percent}%)
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isCompleted ? (
                              <span style={{ fontSize: '10px', fontWeight: '900', color: '#16a34a', background: '#ffffff', padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(22,163,74,0.2)' }}>達成！</span>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" style={{ transform: kyunkawaMissionExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                            )}
                          </div>
                        </div>

                        {/* アコーディオンの中身 */}
                        {kyunkawaMissionExpanded && (
                          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#ffffff' }}>
                            {/* プログレスバー */}
                            <div style={{ padding: '4px 6px 10px 6px' }}>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #4ade80 0%, #16a34a 100%)', transition: 'width 0.4s ease-out' }}></div>
                              </div>
                            </div>

                            {/* スポットリスト */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {kyunkawaSpots.map(spot => {
                                const isSpotChecked = checkins.some(c => c.spot_id === spot.id);
                                return (
                                  <div 
                                    key={spot.id} 
                                    onClick={() => {
                                      handleFocusSpotOnMap(spot);
                                      setSelectedSpot(spot);
                                      setRightPanelTab('detail');
                                    }}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 10px',
                                      borderRadius: '10px',
                                      background: isSpotChecked ? '#f0fdf4' : '#f8fafc',
                                      border: isSpotChecked ? '1px solid rgba(74,222,128,0.2)' : '1px solid #f1f5f9',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '800', color: isSpotChecked ? '#16a34a' : '#334155' }}>
                                        {spot.name}
                                      </span>
                                      <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                        📍 千葉県千葉市美浜区
                                      </span>
                                    </div>
                                    <div>
                                      {isSpotChecked ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '9999px', fontSize: '9px', fontWeight: '900' }}>
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
                              background: isCompleted ? 'linear-gradient(135deg, rgba(74,222,128,0.06) 0%, rgba(22,163,74,0.06) 100%)' : '#f8fafc',
                              border: isCompleted ? '1px dashed #16a34a' : '1px dashed #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isCompleted ? 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)' : '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <Award className="w-4 h-4 text-white" />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '10px', fontWeight: '900', color: isCompleted ? '#16a34a' : '#64748b' }}>称号報酬: きゅんかわマスター</span>
                                <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                  {isCompleted ? '🎉 きゅんかわマスターの称号を獲得！マイページでバッジが輝いています。' : '「きゅんかわ人生」の聖地4箇所すべてを巡ると「きゅんかわマスター」の称号が解放されます。'}
                                </span>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 🌟 しょこりさんぽ 巡礼ミッション (ルート解放型) */}
                  {(() => {
                    const shokoriSpots = spots.filter(s => s.tags && s.tags.includes("しょこりさんぽ巡礼"));
                    // ゴール地点の判定
                    const checkedShokoriSpots = checkins.filter(c => c.spot_id === "spot-shokori-goal");
                    const isCompleted = checkedShokoriSpots.length > 0;
                    const percent = isCompleted ? 100 : (shokoriMissionStarted ? 50 : 0);

                    return (
                      <div className="pop-panel" style={{
                        borderRadius: '16px',
                        border: '2px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-panel)',
                        marginTop: '16px'
                      }}>
                        {/* アコーディオンヘッダー */}
                        <div 
                          onClick={() => setShokoriMissionExpanded(!shokoriMissionExpanded)}
                          style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', // ピンク系
                            borderBottom: '1px solid #e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {/* 🏷️ メインタイトル */}
                            <span style={{
                              alignSelf: 'flex-start',
                              fontSize: '9px',
                              fontWeight: '900',
                              color: '#db2777',
                              background: '#fbcfe8',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              letterSpacing: '0.02em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              🏷️ しょこりさんぽ 巡礼ミッション
                            </span>
                            {/* 👑 サブタイトル */}
                            <span style={{
                              fontSize: '15px',
                              fontWeight: '900',
                              color: '#1e293b',
                              letterSpacing: '-0.02em',
                              lineHeight: '1.2',
                              marginTop: '2px'
                            }}>
                              『鯉さん元気！？しょこりさんぽ』
                            </span>
                            {/* 📊 進行状況 */}
                            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '800', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              🧭 進行状況: {isCompleted ? 'クリア！' : (shokoriMissionStarted ? '探索中...' : '未開始')}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isCompleted ? (
                              <span style={{ fontSize: '10px', fontWeight: '900', color: '#db2777', background: '#ffffff', padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(219,39,119,0.2)' }}>達成！</span>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" style={{ transform: shokoriMissionExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                            )}
                          </div>
                        </div>

                        {/* アコーディオンの中身 */}
                        {shokoriMissionExpanded && (
                          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#ffffff' }}>
                            {/* ルート解放ボタン */}
                            {!shokoriMissionStarted && (
                              <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>
                                  しょこりさの思い出のルートを辿ろう！<br/>ミッションを開始すると、隠されたゴール地点がマップ上に解放されます。
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShokoriMissionStarted(true);
                                    localStorage.setItem('tdm_shokori_started', 'true');
                                  }}
                                  style={{
                                    background: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    padding: '8px 16px',
                                    borderRadius: '9999px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 10px rgba(219, 39, 119, 0.3)'
                                  }}
                                >
                                  ▶️ ミッション開始
                                </button>
                              </div>
                            )}

                            {/* プログレスバー */}
                            {shokoriMissionStarted && (
                              <div style={{ padding: '4px 6px 10px 6px' }}>
                                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                                  <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #f472b6 0%, #db2777 100%)', transition: 'width 0.4s ease-out' }}></div>
                                </div>
                              </div>
                            )}

                            {/* スポットリスト */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {shokoriSpots.map(spot => {
                                // ミッション未開始の場合はゴールを表示しない
                                if (!shokoriMissionStarted && spot.id === 'spot-shokori-goal') return null;

                                const isSpotChecked = checkins.some(c => c.spot_id === spot.id);
                                return (
                                  <div 
                                    key={spot.id} 
                                    onClick={() => {
                                      handleFocusSpotOnMap(spot);
                                      setSelectedSpot(spot);
                                      setRightPanelTab('detail');
                                    }}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 10px',
                                      borderRadius: '10px',
                                      background: isSpotChecked ? '#fdf2f8' : '#f8fafc',
                                      border: isSpotChecked ? '1px solid rgba(244,114,182,0.2)' : '1px solid #f1f5f9',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '800', color: isSpotChecked ? '#db2777' : '#334155' }}>
                                        {spot.name === '東京駅八重洲南口 グランルーフ 歩行者デッキ' ? '🏁 スタート: 東京駅' : '🎯 ゴール: 錦鯉の泳ぐ池'}
                                      </span>
                                      <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                        📍 東京都千代田区
                                      </span>
                                    </div>
                                    <div>
                                      {isSpotChecked ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#fce7f3', color: '#db2777', padding: '2px 8px', borderRadius: '9999px', fontSize: '9px', fontWeight: '900' }}>
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
                              background: isCompleted ? 'linear-gradient(135deg, rgba(244,114,182,0.06) 0%, rgba(219,39,119,0.06) 100%)' : '#f8fafc',
                              border: isCompleted ? '1px dashed #db2777' : '1px dashed #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isCompleted ? 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)' : '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <Award className="w-4 h-4 text-white" />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '10px', fontWeight: '900', color: isCompleted ? '#db2777' : '#64748b' }}>称号報酬: しょこりさ推し！</span>
                                <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                  {isCompleted ? '🎉 しょこりさ推し！の称号を獲得！マイページでバッジが輝いています。' : 'ミッションを開始し、隠されたゴール地点にチェックインすると「しょこりさ推し！」の称号が解放されます。'}
                                </span>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 🌟 大空、ビュンと 巡礼ミッション (順次解放型) */}
                  {(() => {
                    const byunSpotsOrder = [
                      "spot-joy-byun1", "spot-joy-byun2", "spot-joy-byun3", 
                      "spot-joy-byun4", "spot-joy-byun5", "spot-joy-byun6", "spot-joy-byun7"
                    ];
                    const byunSpots = byunSpotsOrder.map(id => spots.find(s => s.id === id)).filter(Boolean) as Spot[];
                    let unlockedCount = 1;
                    for (let i = 0; i < byunSpotsOrder.length; i++) {
                      if (checkins.some(c => c.spot_id === byunSpotsOrder[i])) {
                        unlockedCount = i + 2; // 次のスポットまで解放
                      } else {
                        break;
                      }
                    }
                    if (unlockedCount > byunSpotsOrder.length) unlockedCount = byunSpotsOrder.length;
                    
                    const checkedCount = byunSpotsOrder.filter(id => checkins.some(c => c.spot_id === id)).length;
                    const isCompleted = checkedCount === byunSpotsOrder.length;
                    const percent = Math.round((checkedCount / byunSpotsOrder.length) * 100);

                    return (
                      <div className="pop-panel" style={{
                        borderRadius: '16px',
                        border: '2px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-panel)',
                        marginTop: '16px'
                      }}>
                        {/* アコーディオンヘッダー */}
                        <div 
                          onClick={() => setByunMissionExpanded(!byunMissionExpanded)}
                          style={{
                            padding: '16px',
                            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', // 空色グラデーション
                            borderBottom: '1px solid #e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {/* 🏷️ メインタイトル */}
                            <span style={{
                              alignSelf: 'flex-start',
                              fontSize: '9px',
                              fontWeight: '900',
                              color: '#0284c7',
                              background: '#e0f2fe',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              letterSpacing: '0.02em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              🏷️ 大空、ビュンと 巡礼ミッション
                            </span>
                            {/* 👑 サブタイトル */}
                            <span style={{
                              fontSize: '15px',
                              fontWeight: '900',
                              color: '#1e293b',
                              letterSpacing: '-0.02em',
                              lineHeight: '1.2',
                              marginTop: '2px'
                            }}>
                              『ビュン、と飛んだ日』
                            </span>
                            {/* 📊 進行状況 */}
                            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: '800', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              🧭 進行状況: {checkedCount} / {byunSpotsOrder.length} 箇所 ({percent}%)
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isCompleted ? (
                              <span style={{ fontSize: '10px', fontWeight: '900', color: '#0284c7', background: '#ffffff', padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(2,132,199,0.2)' }}>達成！</span>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" style={{ transform: byunMissionExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                            )}
                          </div>
                        </div>

                        {/* アコーディオンの中身 */}
                        {byunMissionExpanded && (
                          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#ffffff' }}>
                            {/* プログレスバー */}
                            <div style={{ padding: '4px 6px 10px 6px' }}>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)', transition: 'width 0.4s ease-out' }}></div>
                              </div>
                            </div>

                            {/* スポットリスト */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {byunSpots.map((spot, index) => {
                                // 未解放スポットは非表示
                                if (index >= unlockedCount) return null;

                                const isSpotChecked = checkins.some(c => c.spot_id === spot.id);
                                return (
                                  <div 
                                    key={spot.id} 
                                    onClick={() => {
                                      handleFocusSpotOnMap(spot);
                                      setSelectedSpot(spot);
                                      setRightPanelTab('detail');
                                    }}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 10px',
                                      borderRadius: '10px',
                                      background: isSpotChecked ? '#f0f9ff' : '#f8fafc',
                                      border: isSpotChecked ? '1px solid rgba(56,189,248,0.2)' : '1px solid #f1f5f9',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '800', color: isSpotChecked ? '#0284c7' : '#334155' }}>
                                        {index + 1}. {spot.name}
                                      </span>
                                      <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                        📍 {spot.name.includes('茨城') ? '茨城県小美玉市' : '東京都'}
                                      </span>
                                    </div>
                                    <div>
                                      {isSpotChecked ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '9999px', fontSize: '9px', fontWeight: '900' }}>
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
                              background: isCompleted ? 'linear-gradient(135deg, rgba(56,189,248,0.06) 0%, rgba(2,132,199,0.06) 100%)' : '#f8fafc',
                              border: isCompleted ? '1px dashed #0284c7' : '1px dashed #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isCompleted ? 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)' : '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <Award className="w-4 h-4 text-white" />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '10px', fontWeight: '900', color: isCompleted ? '#0284c7' : '#64748b' }}>称号報酬: 大空を駆ける者</span>
                                <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                                  {isCompleted ? '🎉 大空を駆ける者の称号を獲得！マイページでバッジが輝いています。' : 'チェックインごとに新しいスポットが解放されます。最後まで到達すると「大空を駆ける者」の称号が解放されます。'}
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
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '4px'
              }}>
                {/* 🔔 アプリお知らせ・更新情報リンク */}
                <button
                  type="button"
                  onClick={() => {
                    setShowNoticeHistoryModal(true);
                    setHasUnreadNotices(false);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '9px',
                    color: 'var(--text-main)',
                    fontWeight: '900',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    backgroundColor: hasUnreadNotices ? '#fee2e2' : '#f1f5f9',
                    boxShadow: hasUnreadNotices ? '0 0 6px rgba(239,68,68,0.2)' : 'none',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <span>🔔 お知らせ・更新情報</span>
                  {hasUnreadNotices && (
                    <span style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      display: 'inline-block'
                    }}></span>
                  )}
                </button>
              </div>

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
      {/* 🔔 更新情報・お知らせ履歴モーダル */}
      {showNoticeHistoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(6px)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }} onClick={() => setShowNoticeHistoryModal(false)}>
          <div style={{
            width: '100%',
            maxWidth: '560px',
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '85vh'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* モーダルヘッダー */}
            <div style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg, #ffeef2 0%, #e0e7ff 100%)',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔔 トリプルデートマップ お知らせ履歴
              </h2>
              <button
                onClick={() => setShowNoticeHistoryModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: 'none',
                  color: '#64748b',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                ✕
              </button>
            </div>

            {/* お知らせのタイムラインリスト */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }} className="custom-scrollbar">
              {APP_NOTICES.map((notice, idx) => {
                let badgeBg = '#f1f5f9';
                let badgeColor = '#475569';
                let badgeLabel = 'お知らせ';
                if (notice.type === 'update') {
                  badgeBg = '#ecfccb';
                  badgeColor = '#65a30d';
                  badgeLabel = 'データ更新';
                } else if (notice.type === 'system') {
                  badgeBg = '#e0e7ff';
                  badgeColor = '#4f46e5';
                  badgeLabel = '機能追加';
                }

                return (
                  <div key={notice.id} style={{
                    display: 'flex',
                    gap: '16px',
                    position: 'relative'
                  }}>
                    {/* タイムラインの縦線 */}
                    {idx !== APP_NOTICES.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: '19px',
                        top: '40px',
                        bottom: '-30px',
                        width: '2px',
                        background: '#e2e8f0'
                      }}></div>
                    )}

                    {/* 左側タイムラインノード */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: notice.type === 'update' ? '#d9f99d' : '#c7d2fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      zIndex: 2,
                      flexShrink: 0
                    }}>
                      {notice.type === 'update' ? '🗺️' : '🔒'}
                    </div>

                    {/* 右側お知らせ本文 */}
                    <div style={{
                      flex: 1,
                      background: '#f8fafc',
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8' }}>
                          {notice.date}
                        </span>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: '900',
                          background: badgeBg,
                          color: badgeColor,
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {badgeLabel}
                        </span>
                      </div>
                      
                      <h4 style={{
                        fontSize: '13px',
                        fontWeight: 900,
                        color: 'var(--text-main)',
                        margin: 0,
                        lineHeight: 1.4
                      }}>
                        {notice.title}
                      </h4>
                      
                      <p style={{
                        fontSize: '11px',
                        color: '#475569',
                        margin: 0,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-line'
                      }}>
                        {notice.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🚀 アプリ起動時新着お知らせウェルカムモーダル */}
      {showWelcomeNoticeModal && welcomeNotice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }} onClick={handleCloseWelcomeNotice}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* 可愛いグラデーションヘッダー */}
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)',
              color: '#ffffff',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px', fontWeight: 'bold' }}>✨ WHAT'S NEW ✨</div>
              <h3 style={{ fontSize: '15px', fontWeight: 900, margin: 0, lineHeight: 1.4 }}>
                アップデート情報！
              </h3>
              <button
                onClick={handleCloseWelcomeNotice}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* お知らせ内容 */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{
                  fontSize: '9px',
                  fontWeight: '950',
                  background: '#ecfccb',
                  color: '#65a30d',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  データ更新
                </span>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8' }}>
                  {welcomeNotice.date}
                </span>
              </div>

              <h4 style={{
                fontSize: '13px',
                fontWeight: 900,
                color: 'var(--text-main)',
                margin: 0,
                lineHeight: 1.4
              }}>
                {welcomeNotice.title}
              </h4>

              <div style={{
                background: '#f8fafc',
                borderRadius: '16px',
                padding: '16px',
                maxHeight: '180px',
                overflowY: 'auto',
                fontSize: '11px',
                color: '#475569',
                lineHeight: 1.6,
                whiteSpace: 'pre-line'
              }} className="custom-scrollbar">
                {welcomeNotice.content}
              </div>

              <button
                onClick={handleCloseWelcomeNotice}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '12px',
                  fontWeight: 'black',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 104, 151, 0.25)',
                  transition: 'transform 0.1s'
                }}
                className="pop-button"
              >
                わかった！さっそく遊ぶ 🗺️
              </button>
            </div>
          </div>
        </div>
      )}

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



            {/* X (Twitter) ログインシミュレートボタン (一番上に配置して目立たせる) */}
            <button
              disabled={isAuthLoading || !agreeTermsSignup}
              onClick={async () => {
                setAuthError('');
                setIsAuthLoading(true);
                try {
                  const res = await authService.signInWithX();
                  if (!res.success) {
                    console.error("X Auth Error Details:", res.error);
                    setAuthError(res.error || "X認証に失敗しました。");
                  }
                  // 成功時は何のアラートも出さず、シームレスにXの公式OAuth認証画面へとブラウザを遷移させます。
                } catch (err: any) {
                  console.error("X Auth Exception:", err);
                  setAuthError(err.message || "X認証中にエラーが発生しました。");
                } finally {
                  setIsAuthLoading(false);
                }
              }}
              className="pop-button"
              style={{
                width: '100%',
                backgroundColor: (!agreeTermsSignup) ? '#f8fafc' : '#0f1419', // クールで目立つXブラック
                border: '2px solid',
                borderColor: (!agreeTermsSignup) ? '#e2e8f0' : '#0f1419',
                padding: '11px',
                borderRadius: '14px',
                fontSize: '11.5px',
                fontWeight: '900',
                color: (!agreeTermsSignup) ? '#94a3b8' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: (isAuthLoading || !agreeTermsSignup) ? 'not-allowed' : 'pointer',
                opacity: (!agreeTermsSignup) ? 0.5 : 1,
                boxShadow: (!agreeTermsSignup) ? 'none' : '0 4px 14px rgba(15, 20, 25, 0.18)',
                transition: 'all 0.25s',
                marginBottom: '0px'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" style={{ flexShrink: 0, fill: (!agreeTermsSignup) ? '#94a3b8' : '#ffffff' }}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Xアカウントでログイン
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

              <strong>3. 個人情報の取得と保護方針（X（Twitter）ログインなど）</strong>{"\n"}
              {"X（Twitter）アカウントによるログイン（ソーシャル認証）を使用する際、本アプリは安全な認証連携システムを介して、ユーザーの公開プロフィール情報（ユーザーID、表示名、プロフィール画像URLのみ）を取得します。\n取得したデータは、アカウントの識別、チェックイン履歴の紐付け、およびアプリ内ニックネームの設定のためにのみ使用し、メールアドレスの悪用、パスワードなどの機密情報の収集、および第三者へのデータの提供・売買は一切行いません。\n\n"}

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
