import React, { useState, useEffect, useRef } from 'react';
import { SkipForward, SkipBack, X, Film, Monitor, List } from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface HistoryChapter {

  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  group: "=LOVE" | "≠ME" | "≒JOY" | "合同";
  videoId: string;
  startSeconds: number;
  description: string;
}

export const DEFAULT_HISTORY_CHAPTERS: HistoryChapter[] = [
  {
    id: "chap-01",
    chapterNumber: 1,
    title: "CHAPTER 01: TRAINING & LESSONS",
    subtitle: "結成と血の滲むようなレッスン練習の日々",
    group: "=LOVE",
    videoId: "ZROuG57QGls",
    startSeconds: 756,
    description: "グループ初期の厳しいトレーニングと試練のレッスン期間。メンバーの葛藤と結束が芽生える運命の章。"
  },
  {
    id: "chap-02",
    chapterNumber: 2,
    title: "CHAPTER 02: FIRST CENTER",
    subtitle: "初センター誕生と重圧を乗り越えた瞬間",
    group: "=LOVE",
    videoId: "Q1-yYjZqk7o",
    startSeconds: 1065,
    description: "初めての大舞台でセンターとして立った瞬間の裏側と、仲間たちの支えが紡いだ感動のストーリー。"
  },
  {
    id: "chap-03",
    chapterNumber: 3,
    title: "CHAPTER 03: INTERVIEW & REVEAL",
    subtitle: "本音の独白インタビューと新たな誓い",
    group: "≠ME",
    videoId: "aXp14lrdymc",
    startSeconds: 1678,
    description: "カメラの前で初めて語られた涙と決意の本音ロングインタビュー。"
  },
  {
    id: "chap-04",
    chapterNumber: 4,
    title: "CHAPTER 04: FIRST LIVE & STAGE",
    subtitle: "歓喜の初ワンマンライブとステージの記憶",
    group: "≠ME",
    videoId: "bCvjbkE3iMI",
    startSeconds: 2150,
    description: "ファンと初めてひとつになった歴史的単独ライブの熱気と感動。"
  },
  {
    id: "chap-05",
    chapterNumber: 5,
    title: "CHAPTER 05: RECORDING & BACKSTAGE",
    subtitle: "スタジオレコーディングと裏側の真実",
    group: "≒JOY",
    videoId: "kDgadIAsQf4",
    startSeconds: 2840,
    description: "名曲が生まれた緊張のレコーディング風景と舞台裏の素顔。"
  },
  {
    id: "chap-06",
    chapterNumber: 6,
    title: "CHAPTER 06: SPECIAL PERFORMANCE",
    subtitle: "圧巻のスペシャルステージと合同フェス",
    group: "≒JOY",
    videoId: "G11fOq-eKj4",
    startSeconds: 3420,
    description: "3グループが結集した大迫力の合同パフォーマンスと絆の物語。"
  },
  {
    id: "chap-07",
    chapterNumber: 7,
    title: "CHAPTER 07: BUDOKAN & DOMES",
    subtitle: "武道館・憧れの夢舞台へ",
    group: "合同",
    videoId: "t5r0rNwjXQU",
    startSeconds: 4100,
    description: "夢にまで見た日本武道館のステージに立った歴史的モーメント。"
  },
  {
    id: "chap-08",
    chapterNumber: 8,
    title: "CHAPTER 08: FUTURE & BEYOND",
    subtitle: "未来へ続くストーリーと次なる挑戦",
    group: "合同",
    videoId: "8id6i_QeNJM",
    startSeconds: 4890,
    description: "どこまでも高く羽ばたく3グループの未来へのメッセージ。"
  }
];

interface HistoryTheaterProps {
  isOpen: boolean;
  onClose: () => void;
  chapters?: HistoryChapter[];
  initialChapterIndex?: number;
}

export const HistoryTheater: React.FC<HistoryTheaterProps> = ({
  isOpen,
  onClose,
  chapters = DEFAULT_HISTORY_CHAPTERS,
  initialChapterIndex = 0
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(initialChapterIndex);
  const [viewMode, setViewMode] = useState<'theater' | 'film' | 'chapter'>('theater');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [overlayActive, setOverlayActive] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const transitionRef = useRef<number>(0);
  const timersRef = useRef<any[]>([]);


  // 全タイマーの一括クリア関数
  const clearAllTimers = () => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  };

  // YouTube Iframe API の準備確認
  useEffect(() => {
    if (!isOpen) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, [isOpen]);

  // モーダルオープン時の単一 Player インスタンスの初期化
  useEffect(() => {
    if (!isOpen) {
      if (playerRef.current) {
        try {
          playerRef.current.stopVideo();
          playerRef.current.destroy();
        } catch (e) {
          console.warn('[HISTORY] Player cleanup warning:', e);
        }
        playerRef.current = null;
      }
      clearAllTimers();
      return;
    }

    const targetChapter = chapters[currentChapterIndex] || chapters[0];

    const initPlayer = () => {
      if (playerRef.current) return;

      console.log('[HISTORY] Initializing Single YT.Player Instance');
      playerRef.current = new window.YT.Player('history-single-youtube-player', {
        width: '100%',
        height: '100%',
        videoId: targetChapter.videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          start: targetChapter.startSeconds,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            console.log('[HISTORY] Single Player Ready');
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            const state = event.data;
            let stateName = 'UNKNOWN';
            if (window.YT) {
              switch (state) {
                case window.YT.PlayerState.UNSTARTED: stateName = 'UNSTARTED'; break;
                case window.YT.PlayerState.ENDED: stateName = 'ENDED'; break;
                case window.YT.PlayerState.PLAYING: stateName = 'PLAYING'; break;
                case window.YT.PlayerState.PAUSED: stateName = 'PAUSED'; break;
                case window.YT.PlayerState.BUFFERING: stateName = 'BUFFERING'; break;
                case window.YT.PlayerState.CUED: stateName = 'CUED'; break;
              }
            }
            console.log('[HISTORY] player state', stateName);

            if (state === window.YT.PlayerState.PLAYING) {
              setOverlayActive(false);
              setIsTransitioning(false);
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }
  }, [isOpen]);

  // 🌟【黄金ルール 1〜9】一元化チャプタースキップ共通処理関数 `goToChapter`
  const goToChapter = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= chapters.length) return;
    if (isTransitioning) {
      console.warn('[HISTORY] Transition in progress. Action blocked.');
      return;
    }

    const currentIdx = currentChapterIndex;
    const targetChapter = chapters[targetIndex];
    const transitionId = ++transitionRef.current;

    console.log('[HISTORY] goToChapter', {
      from: currentIdx,
      to: targetIndex,
      videoId: targetChapter.videoId,
      startSeconds: targetChapter.startSeconds,
      transitionId
    });

    // 1. トランジションフラグ ＆ 黒オーバーレイのアクティブ化
    setIsTransitioning(true);
    setOverlayActive(true);

    // 2. 稼働中タイマーの全消去
    clearAllTimers();

    // 3. 旧動画の即時停止 (音声残存防止)
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.stopVideo === 'function') {
          playerRef.current.stopVideo();
        } else if (typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
      } catch (err) {
        console.warn('[HISTORY] Error stopping old video:', err);
      }
    }

    // 4. 新しい動画のロード ＆ 再生開始 (loadVideoById)
    const loadTimer = setTimeout(() => {
      if (transitionId !== transitionRef.current) return;

      // 新チャプターの UI state を更新
      setCurrentChapterIndex(targetIndex);

      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById({
          videoId: targetChapter.videoId,
          startSeconds: targetChapter.startSeconds ?? 0
        });

        if (typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      }

      // フォールバック安全タイムアウト
      const safetyTimer = setTimeout(() => {
        if (transitionId !== transitionRef.current) return;
        console.log('[HISTORY] transition complete (safety timeout)', transitionId);
        setOverlayActive(false);
        setIsTransitioning(false);
      }, 1500);

      timersRef.current.push(safetyTimer);
    }, 150);

    timersRef.current.push(loadTimer);
  };

  if (!isOpen) return null;

  const currentChapter = chapters[currentChapterIndex] || chapters[0];

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col bg-slate-950/95 backdrop-blur-xl text-white transition-opacity duration-300"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      {/* 頂部ナビゲーションヘッダー */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
              イコノイジョイ HISTORY FILM THEATER
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-normal border border-rose-500/30">
                OFFICIAL
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              全 {chapters.length} チャプター ・ 3グループの歩みと未公開映像
            </p>
          </div>
        </div>

        {/* 表示モード切り替えタブ */}
        <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700/60">
          <button
            onClick={() => setViewMode('theater')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'theater' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            THEATER
          </button>
          <button
            onClick={() => setViewMode('film')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'film' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            FILM
          </button>
          <button
            onClick={() => setViewMode('chapter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'chapter' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            CHAPTERS
          </button>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700"
          title="閉じる"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* メインエリア (プレーヤー + チャプターリスト) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* 左側: 単一 YouTube Player コンテナ */}
        <div className={`flex-1 flex flex-col bg-black relative justify-center items-center ${viewMode === 'chapter' ? 'hidden md:flex' : ''}`}>
          
          {/* レスポンシブ 16:9 枠 */}
          <div className="w-full max-w-5xl aspect-video relative bg-slate-900 shadow-2xl rounded-2xl overflow-hidden border border-slate-800">
            
            {/* 🌟 唯一無二の単一 YT.Player 描画ターゲット */}
            <div id="history-single-youtube-player" className="w-full h-full" />

            {/* 黒フェードトランジション・オーバーレイ */}
            <div 
              className={`absolute inset-0 bg-black flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 z-20 ${
                overlayActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
              <div className="text-sm font-bold text-slate-200">チャプターを読込中...</div>
              <div className="text-xs text-slate-400 mt-1">{currentChapter.title}</div>
            </div>
          </div>

          {/* 下部コントローラーバー */}
          <div className="w-full max-w-5xl px-4 py-3 flex items-center justify-between gap-4 mt-2">
            <button
              onClick={() => goToChapter(currentChapterIndex - 1)}
              disabled={currentChapterIndex === 0 || isTransitioning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition-all"
            >
              <SkipBack className="w-4 h-4" />
              PREVIOUS
            </button>

            <div className="text-center">
              <div className="text-xs font-bold text-rose-400 tracking-wider">
                {currentChapter.group} OFFICIAL
              </div>
              <div className="text-sm font-extrabold text-white">
                {currentChapter.title}
              </div>
            </div>

            <button
              onClick={() => goToChapter(currentChapterIndex + 1)}
              disabled={currentChapterIndex === chapters.length - 1 || isTransitioning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-rose-600/30 transition-all"
            >
              NEXT
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 右側: チャプター全景グリッド＆リストパネル */}
        <div className={`w-full md:w-96 bg-slate-900/90 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto p-4 gap-3 ${viewMode === 'chapter' ? 'flex-1' : ''}`}>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            CHAPTER SELECT ({chapters.length})
          </div>

          <div className="flex flex-col gap-2">
            {chapters.map((chap, idx) => {
              const isSelected = idx === currentChapterIndex;
              const thumbnailUrl = `https://i.ytimg.com/vi/${chap.videoId}/hqdefault.jpg`;

              return (
                <button
                  key={chap.id}
                  onClick={() => goToChapter(idx)}
                  disabled={isTransitioning}
                  className={`flex gap-3 p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'bg-rose-500/15 border-rose-500/60 shadow-lg shadow-rose-500/10'
                      : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                  } ${isTransitioning ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {/* サムネイル画像 */}
                  <div className="w-24 h-14 rounded-lg bg-slate-950 overflow-hidden relative shrink-0 border border-slate-700/60">
                    <img
                      src={thumbnailUrl}
                      alt={chap.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-slate-300">
                      {Math.floor(chap.startSeconds / 60)}:{(chap.startSeconds % 60).toString().padStart(2, '0')}
                    </div>
                  </div>

                  {/* チャプタータイトル ＆ 詳細 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
                      }`}>
                        CH {chap.chapterNumber.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {chap.group}
                      </span>
                    </div>

                    <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {chap.title}
                    </div>

                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {chap.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryTheater;
