import React, { useState, useEffect, useRef } from 'react';
import { db } from '../db';
import { OFFICIAL_VIDEOS, OfficialVideo } from '../officialVideos';
import { 
  Play, 
  Pause, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  ExternalLink, 
  Search, 
  Filter,
  Film,
  RotateCcw,
  Clock
} from 'lucide-react';


declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export type AuditResultType = '正常' | '動画不存在・非公開の疑い' | '埋め込み不可' | '要確認' | '形式エラー' | '未検査';

export interface VideoAuditItem {
  workKey: string;
  workName: string;
  group: string;
  currentYoutubeId: string;
  watchUrl: string;
  embedUrl: string;
  spotCount: number;
  spotIds: string[];
  spotNames: string[];
  
  // 新記録フィールド
  auditExecuted: boolean;
  auditedAt: string | null;
  playerState: 'PLAYING' | 'ERROR' | 'TIMEOUT' | 'NOT_TESTED';
  playerErrorCode: number | null;
  actualPlaybackConfirmed: boolean;

  // oEmbed 結果
  oembedStatus: 'success' | 'failed' | 'pending';
  youtubeTitle: string;
  channelName: string;
  thumbnailUrl: string;

  // 総合判定
  auditResult: AuditResultType;
  correctYoutubeId?: string;
  correctOfficialUrl?: string;
  notes: string;
}

const LOCAL_STORAGE_KEY = 'tdm_youtube_audit_state_v2';

export const AdminYouTubeAudit: React.FC = () => {
  const [auditItems, setAuditItems] = useState<VideoAuditItem[]>([]);
  const [filterResult, setFilterResult] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [currentTestingWorkName, setCurrentTestingWorkName] = useState<string>('');


  const playerRef = useRef<any>(null);
  const isAuditingRef = useRef<boolean>(false);
  const auditTimeoutRef = useRef<any>(null);

  // 1. 初期化・localStorage からの進行状態復元
  useEffect(() => {
    const spots = db.getSpots();
    const workMap = new Map<string, VideoAuditItem>();

    // OFFICIAL_VIDEOS からベース作成
    Object.values(OFFICIAL_VIDEOS).forEach((video: OfficialVideo) => {
      const relatedSpots = spots.filter(s => s.workKey === video.workKey || s.youtubeId === video.youtubeId);
      const spotIds = relatedSpots.map(s => s.id);
      const spotNames = relatedSpots.map(s => s.name);

      let isFormatError = false;
      if (!video.youtubeId || video.youtubeId.length !== 11 || video.youtubeId.includes('<') || video.youtubeId.includes('/')) {
        isFormatError = true;
      }

      workMap.set(video.workKey, {
        workKey: video.workKey,
        workName: video.title,
        group: video.group,
        currentYoutubeId: video.youtubeId,
        watchUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
        embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
        spotCount: relatedSpots.length,
        spotIds: spotIds,
        spotNames: spotNames,
        auditExecuted: false,
        auditedAt: null,
        playerState: 'NOT_TESTED',
        playerErrorCode: null,
        actualPlaybackConfirmed: false,
        oembedStatus: 'pending',
        youtubeTitle: '未取得',
        channelName: '未取得',
        thumbnailUrl: `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`,
        auditResult: isFormatError ? '形式エラー' : '未検査',
        correctYoutubeId: video.workKey === 'kitto-aoi' ? 'gQ81Vl0OBlQ' : undefined,
        correctOfficialUrl: video.workKey === 'kitto-aoi' ? 'https://www.youtube.com/watch?v=gQ81Vl0OBlQ' : undefined,
        notes: isFormatError ? '11桁のYouTube ID形式ではありません' : '未検査'
      });
    });

    // localStorage 復元チェック
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed: VideoAuditItem[] = JSON.parse(savedState);
        parsed.forEach(savedItem => {
          if (workMap.has(savedItem.workKey)) {
            workMap.set(savedItem.workKey, { ...workMap.get(savedItem.workKey)!, ...savedItem });
          }
        });
        console.log('✅ localStorage から以前の監査状態を復元しました');
      } catch (e) {
        console.warn('Failed to parse localStorage audit state:', e);
      }
    }

    const items = Array.from(workMap.values());
    setAuditItems(items);

    // oEmbed バックグラウンド補完
    fetchOembedInfo(items);
  }, []);

  // 進行状態の localStorage 自動保存
  const saveItemsToLocalStorage = (items: VideoAuditItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save audit state to localStorage:', e);
    }
  };

  // 2. oEmbed API による情報補完
  const fetchOembedInfo = async (items: VideoAuditItem[]) => {
    const updatedItems = [...items];
    let changed = false;

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      if (item.oembedStatus !== 'pending') continue;

      try {
        const oembedEndpoint = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${item.currentYoutubeId}&format=json`;
        const res = await fetch(oembedEndpoint);
        if (res.ok) {
          const data = await res.json();
          item.oembedStatus = 'success';
          item.youtubeTitle = data.title || '取得完了';
          item.channelName = data.author_name || '取得完了';
          if (data.thumbnail_url) item.thumbnailUrl = data.thumbnail_url;
          changed = true;
        } else {
          item.oembedStatus = 'failed';
        }
      } catch (err) {
        item.oembedStatus = 'failed';
      }
    }

    if (changed) {
      setAuditItems([...updatedItems]);
      saveItemsToLocalStorage(updatedItems);
    }
  };

  // 3. YouTube IFrame Player API スクリプト準備
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // 4. 監査開始 (20本単位・未検査のみ・全件対応)
  const startAudit = (maxBatchCount: number | null = null) => {
    if (isAuditing || auditItems.length === 0) return;

    // 未検査または再検査が必要なインデックスを見つける
    const firstUntestedIndex = auditItems.findIndex(item => !item.auditExecuted && item.auditResult !== '形式エラー');
    const startIdx = firstUntestedIndex >= 0 ? firstUntestedIndex : 0;

    setIsAuditing(true);
    isAuditingRef.current = true;
    testNextVideo(startIdx, maxBatchCount ? startIdx + maxBatchCount : null);
  };

  const stopAudit = () => {
    setIsAuditing(false);
    isAuditingRef.current = false;
    setCurrentTestingWorkName('');
    if (auditTimeoutRef.current) clearTimeout(auditTimeoutRef.current);
    if (playerRef.current) {
      try { playerRef.current.stopVideo(); } catch (e) {}
    }
  };

  const resetAuditState = () => {
    if (window.confirm('監査記録をクリアして最初から再検査しますか？')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload();
    }
  };

  // 単一プレーヤーによる実地再生検証ルーチン
  const testNextVideo = (index: number, limitIndex: number | null) => {
    if (!isAuditingRef.current || index >= auditItems.length || (limitIndex !== null && index >= limitIndex)) {
      setIsAuditing(false);
      isAuditingRef.current = false;
      setCurrentTestingWorkName('');
      console.log('🎉 監査バッチが正常に完了いたしました！');
      return;
    }

    const item = auditItems[index];
    setCurrentTestingWorkName(item.workName);

    if (item.auditResult === '形式エラー') {
      testNextVideo(index + 1, limitIndex);
      return;
    }

    if (auditTimeoutRef.current) clearTimeout(auditTimeoutRef.current);

    // 10秒タイムアウト設定 (タイムアウトは要確認判定)
    auditTimeoutRef.current = setTimeout(() => {
      console.warn(`[AUDIT] 10s Timeout for ${item.workName} (${item.currentYoutubeId})`);
      setAuditItems(prev => {
        const list = [...prev];
        list[index].auditExecuted = true;
        list[index].auditedAt = new Date().toISOString();
        list[index].playerState = 'TIMEOUT';
        list[index].actualPlaybackConfirmed = false;
        list[index].auditResult = '要確認';
        list[index].notes = '10秒タイムアウト (要判定確認)';
        saveItemsToLocalStorage(list);
        return list;
      });
      testNextVideo(index + 1, limitIndex);
    }, 10000);

    const initOrLoadPlayer = () => {
      if (!playerRef.current) {
        playerRef.current = new window.YT.Player('audit-hidden-player', {
          width: '320',
          height: '180',
          videoId: item.currentYoutubeId,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            rel: 0,
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              try {
                event.target.mute();
                event.target.playVideo();
              } catch (e) {}
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                if (auditTimeoutRef.current) clearTimeout(auditTimeoutRef.current);
                try { event.target.stopVideo(); } catch (e) {}

                setAuditItems(prev => {
                  const list = [...prev];
                  list[index].auditExecuted = true;
                  list[index].auditedAt = new Date().toISOString();
                  list[index].playerState = 'PLAYING';
                  list[index].actualPlaybackConfirmed = true;
                  list[index].auditResult = '正常';
                  list[index].notes = 'PLAYING確認完了 (実地検証正常)';
                  saveItemsToLocalStorage(list);
                  return list;
                });

                setTimeout(() => testNextVideo(index + 1, limitIndex), 300);
              }
            },
            onError: (event: any) => {
              if (auditTimeoutRef.current) clearTimeout(auditTimeoutRef.current);
              const errCode = event.data;

              setAuditItems(prev => {
                const list = [...prev];
                list[index].auditExecuted = true;
                list[index].auditedAt = new Date().toISOString();
                list[index].playerState = 'ERROR';
                list[index].playerErrorCode = errCode;
                list[index].actualPlaybackConfirmed = false;

                if (errCode === 100) {
                  list[index].auditResult = '動画不存在・非公開の疑い';
                  list[index].notes = 'エラー100 (動画不存在・非公開の疑い)';
                } else if (errCode === 101 || errCode === 150) {
                  list[index].auditResult = '埋め込み不可';
                  list[index].notes = `エラー${errCode} (埋め込み拒否)`;
                } else {
                  list[index].auditResult = '要確認';
                  list[index].notes = `Playerエラー (${errCode})`;
                }
                saveItemsToLocalStorage(list);
                return list;
              });

              setTimeout(() => testNextVideo(index + 1, limitIndex), 300);
            }
          }
        });
      } else {
        try {
          playerRef.current.mute();
          playerRef.current.loadVideoById({
            videoId: item.currentYoutubeId,
            startSeconds: 0
          });
        } catch (e) {
          console.warn('[AUDIT] Failed to loadVideoById:', e);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initOrLoadPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => initOrLoadPlayer();
    }
  };

  // 5. CSV ダウンロード機能 (全件 または エラーのみ抽出)
  const downloadCSV = (onlyErrors: boolean = false) => {
    const itemsToExport = onlyErrors 
      ? auditItems.filter(item => item.auditResult !== '正常')
      : auditItems;

    let csv = 'group,workName,currentYoutubeId,youtubeTitle,channelName,watchUrl,embedUrl,spotCount,spotIds,auditExecuted,auditedAt,playerState,playerErrorCode,actualPlaybackConfirmed,auditResult,correctYoutubeId,correctOfficialUrl,notes\n';

    itemsToExport.forEach(item => {
      const row = [
        item.group,
        `"${item.workName.replace(/"/g, '""')}"`,
        item.currentYoutubeId,
        `"${item.youtubeTitle.replace(/"/g, '""')}"`,
        `"${item.channelName.replace(/"/g, '""')}"`,
        item.watchUrl,
        item.embedUrl,
        item.spotCount,
        `"${item.spotIds.join(';')}"`,
        item.auditExecuted ? 'true' : 'false',
        item.auditedAt || '',
        item.playerState,
        item.playerErrorCode || '',
        item.actualPlaybackConfirmed ? 'true' : 'false',
        item.auditResult,
        item.correctYoutubeId || '',
        item.correctOfficialUrl || '',
        `"${item.notes.replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\n';
    });

    const filename = onlyErrors ? 'youtube-audit-errors.csv' : 'youtube-audit.csv';
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // サマリー計算
  const totalCount = auditItems.length;
  const testedCount = auditItems.filter(i => i.auditExecuted).length;
  const normalCount = auditItems.filter(i => i.auditResult === '正常').length;
  const errorCount = auditItems.filter(i => i.auditResult === '動画不存在・非公開の疑い' || i.auditResult === '形式エラー').length;
  const blockedCount = auditItems.filter(i => i.auditResult === '埋め込み不可').length;
  const reviewCount = auditItems.filter(i => i.auditResult === '要確認').length;
  const untestedCount = auditItems.filter(i => i.auditResult === '未検査').length;

  // フィルター
  const filteredItems = auditItems.filter(item => {
    if (filterResult !== 'ALL' && item.auditResult !== filterResult) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.workName.toLowerCase().includes(q) || 
             item.currentYoutubeId.toLowerCase().includes(q) || 
             item.group.toLowerCase().includes(q);
    }
    return true;
  });

  const getResultBadge = (result: AuditResultType) => {

    switch (result) {
      case '正常':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 正常 (再生確認済)</span>;
      case '動画不存在・非公開の疑い':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> 動画不存在・非公開</span>;
      case '埋め込み不可':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> 埋め込み不可 (拒否)</span>;
      case '要確認':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> 要確認</span>;
      case '形式エラー':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> 形式エラー</span>;
      case '未検査':
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 未検査</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* 隠し検証プレイヤー */}
      <div className="fixed bottom-4 right-4 opacity-30 pointer-events-none z-50 rounded-xl overflow-hidden border border-slate-700 bg-black">
        <div id="audit-hidden-player" />
      </div>

      {/* ヘッダー */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Film className="w-7 h-7 text-rose-500" />
            全YouTube動画 厳格実地監査システム
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            `PLAYING` 状態を実際に検知した動画のみ「正常」認定。進捗自動保存・20本分割対応
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isAuditing ? (
            <>
              <button
                onClick={() => startAudit(null)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                全件自動監査開始
              </button>
              <button
                onClick={() => startAudit(20)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                20本ずつ監査
              </button>
            </>
          ) : (
            <button
              onClick={stopAudit}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
            >
              <Pause className="w-4 h-4" />
              一時停止
            </button>
          )}

          <button
            onClick={() => downloadCSV(false)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            youtube-audit.csv
          </button>

          <button
            onClick={() => downloadCSV(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
            title="正常以外の動画のみ抽出"
          >
            <Download className="w-4 h-4" />
            youtube-audit-errors.csv
          </button>

          <button
            onClick={resetAuditState}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
            title="進行状態クリア"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 現在検査中のステータス表示 */}
      {isAuditing && (
        <div className="max-w-7xl mx-auto mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <div className="text-xs font-bold text-rose-300">
              現在実地検査中: <span className="text-white text-sm font-black ml-1">{currentTestingWorkName}</span>
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-rose-400">
            {testedCount} / {totalCount} 完了
          </div>
        </div>
      )}

      {/* サマリーカード (指定の6指標) */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-bold">全作品数</div>
          <div className="text-xl font-black text-white mt-0.5">{totalCount} 本</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-indigo-500/30">
          <div className="text-[11px] text-indigo-400 font-bold">検査済み数</div>
          <div className="text-xl font-black text-indigo-400 mt-0.5">{testedCount} 本</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
          <div className="text-[11px] text-emerald-400 font-bold">正常 (PLAYING)</div>
          <div className="text-xl font-black text-emerald-400 mt-0.5">{normalCount} 本</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-rose-500/30">
          <div className="text-[11px] text-rose-400 font-bold">エラー / 不解</div>
          <div className="text-xl font-black text-rose-400 mt-0.5">{errorCount} 本</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-sky-500/30">
          <div className="text-[11px] text-sky-400 font-bold">要確認 / 拒否</div>
          <div className="text-xl font-black text-sky-400 mt-0.5">{reviewCount + blockedCount} 本</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700">
          <div className="text-[11px] text-slate-400 font-bold">未検査数</div>
          <div className="text-xl font-black text-slate-400 mt-0.5">{untestedCount} 本</div>
        </div>
      </div>

      {/* フィルター ＆ 検索バー */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {[
            { id: 'ALL', label: 'すべて' },
            { id: '正常', label: '正常' },
            { id: '動画不存在・非公開の疑い', label: '動画不存在・非公開' },
            { id: '埋め込み不可', label: '埋め込み不可' },
            { id: '要確認', label: '要確認' },
            { id: '未検査', label: '未検査' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterResult(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterResult === f.id ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="作品名・ID・グループで検索..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 text-xs border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* 監査メインテーブル */}
      <div className="max-w-7xl mx-auto overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">作品名 / グループ</th>
              <th className="px-4 py-3">登録ID</th>
              <th className="px-4 py-3">YouTube上タイトル / チャンネル</th>
              <th className="px-4 py-3">聖地数</th>
              <th className="px-4 py-3">Playerステータス</th>
              <th className="px-4 py-3">総合判定</th>
              <th className="px-4 py-3">備考 / 修正候補ID</th>
              <th className="px-4 py-3 text-right">アクション</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredItems.map((item) => (
              <tr key={item.workKey} className={currentTestingWorkName === item.workName ? 'bg-rose-500/15' : 'hover:bg-slate-800/40 transition-colors'}>
                <td className="px-4 py-3.5">
                  <div className="font-bold text-white text-sm">{item.workName}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.group}</div>
                </td>
                <td className="px-4 py-3.5 font-mono text-slate-200">
                  <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">{item.currentYoutubeId}</span>
                </td>
                <td className="px-4 py-3.5 max-w-xs">
                  <div className="truncate font-semibold text-slate-200" title={item.youtubeTitle}>{item.youtubeTitle}</div>
                  <div className="text-[11px] text-slate-400 truncate">{item.channelName}</div>
                </td>
                <td className="px-4 py-3.5 font-bold text-slate-200">
                  {item.spotCount} 箇所
                </td>
                <td className="px-4 py-3.5 font-bold">
                  {currentTestingWorkName === item.workName ? (
                    <span className="text-amber-400 animate-pulse">⏳ 検証中...</span>
                  ) : item.playerState === 'PLAYING' ? (
                    <span className="text-emerald-400">🟢 PLAYING</span>
                  ) : item.playerState === 'ERROR' ? (
                    <span className="text-rose-400">❌ Error {item.playerErrorCode}</span>
                  ) : item.playerState === 'TIMEOUT' ? (
                    <span className="text-sky-400">⏱️ Timeout</span>
                  ) : (
                    <span className="text-slate-500">未検査</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  {getResultBadge(item.auditResult)}
                </td>

                <td className="px-4 py-3.5">
                  <div className="text-slate-300">{item.notes}</div>
                  {item.correctYoutubeId && (
                    <div className="text-emerald-400 font-mono text-[11px] mt-0.5">
                      推奨正解ID: {item.correctYoutubeId}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right space-x-2">
                  <a
                    href={item.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-[11px] transition-all border border-slate-700"
                  >
                    YouTube <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminYouTubeAudit;
