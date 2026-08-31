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

// 監査状態機械の定義
export type AuditMachineState = 
  | 'IDLE'
  | 'PREPARING'
  | 'LOADING'
  | 'WAITING_FOR_PLAYER'
  | 'PLAYING_CONFIRMED'
  | 'ERROR_CONFIRMED'
  | 'TIMEOUT_CONFIRMED'
  | 'FINALIZING'
  | 'ADVANCING'
  | 'COMPLETED'
  | 'CANCELLED';

export type AuditResultType = '正常' | '動画不存在・非公開の疑い' | '埋め込み不可' | '要確認' | '形式エラー' | '未検査';

export interface VideoAuditItem {
  auditItemId: string; // 一意キー `${queueIndex}:${group}:${workName}:${youtubeId}`
  queueIndex: number;
  workKey: string;
  workName: string;
  group: string;
  currentYoutubeId: string;
  watchUrl: string;
  embedUrl: string;
  spotCount: number;
  spotIds: string[];
  spotNames: string[];
  
  // 記録フィールド
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

const LOCAL_STORAGE_KEY = 'tdm_youtube_audit_state_v3';

export const AdminYouTubeAudit: React.FC = () => {
  // 画面表示用 State (表示専用)
  const [displayItems, setDisplayItems] = useState<VideoAuditItem[]>([]);
  const [filterResult, setFilterResult] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // デバッグ表示用 State
  const [debugState, setDebugState] = useState<{
    runId: string;
    machineState: AuditMachineState;
    currentIndex: number;
    currentAuditItemId: string;
    currentWorkName: string;
    completedCount: number;
    batchProcessedCount: number;
    playerCount: number;
    timerCount: number;
    lastTransition: string;
  }>({
    runId: 'none',
    machineState: 'IDLE',
    currentIndex: 0,
    currentAuditItemId: 'none',
    currentWorkName: 'なし',
    completedCount: 0,
    batchProcessedCount: 0,
    playerCount: 0,
    timerCount: 0,
    lastTransition: 'IDLE'
  });

  // 非同期排他制御の正本 Ref
  const queueRef = useRef<VideoAuditItem[]>([]);
  const currentIndexRef = useRef<number>(0);
  const currentItemRef = useRef<VideoAuditItem | null>(null);
  const playerRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);
  const isRunningRef = useRef<boolean>(false);
  const isFinalizingRef = useRef<boolean>(false);
  const completedItemIdsRef = useRef<Set<string>>(new Set());
  const cancelledRef = useRef<boolean>(false);
  const runIdRef = useRef<string>('');
  const machineStateRef = useRef<AuditMachineState>('IDLE');
  const batchTargetCountRef = useRef<number | null>(null);
  const batchStartCountRef = useRef<number>(0);
  const lastStartedItemIdRef = useRef<string>('');

  // 状態機械の安全な遷移制御
  const transitionTo = (newState: AuditMachineState, reason: string = '') => {
    const prevState = machineStateRef.current;
    
    // 状態遷移許可マップ
    const allowedTransitions: Record<AuditMachineState, AuditMachineState[]> = {
      IDLE: ['PREPARING', 'CANCELLED'],
      PREPARING: ['LOADING', 'CANCELLED', 'COMPLETED'],
      LOADING: ['WAITING_FOR_PLAYER', 'ERROR_CONFIRMED', 'TIMEOUT_CONFIRMED', 'FINALIZING', 'CANCELLED'],
      WAITING_FOR_PLAYER: ['PLAYING_CONFIRMED', 'ERROR_CONFIRMED', 'TIMEOUT_CONFIRMED', 'FINALIZING', 'CANCELLED'],
      PLAYING_CONFIRMED: ['FINALIZING', 'CANCELLED'],
      ERROR_CONFIRMED: ['FINALIZING', 'CANCELLED'],
      TIMEOUT_CONFIRMED: ['FINALIZING', 'CANCELLED'],
      FINALIZING: ['ADVANCING', 'CANCELLED'],
      ADVANCING: ['LOADING', 'COMPLETED', 'CANCELLED'],
      COMPLETED: ['IDLE', 'PREPARING'],
      CANCELLED: ['IDLE', 'PREPARING']
    };

    if (allowedTransitions[prevState] && !allowedTransitions[prevState].includes(newState)) {
      console.warn(`[STATE_MACHINE] Blocked invalid transition: ${prevState} -> ${newState} (${reason})`);
      return false;
    }

    machineStateRef.current = newState;
    console.log(`[STATE_MACHINE] ${prevState} -> ${newState} (${reason})`);

    // UIデバッグ同期
    setDebugState(prev => ({
      ...prev,
      machineState: newState,
      runId: runIdRef.current || 'none',
      currentIndex: currentIndexRef.current,
      currentAuditItemId: currentItemRef.current?.auditItemId || 'none',
      currentWorkName: currentItemRef.current?.workName || 'なし',
      completedCount: completedItemIdsRef.current.size,
      batchProcessedCount: Math.max(0, completedItemIdsRef.current.size - batchStartCountRef.current),
      playerCount: playerRef.current ? 1 : 0,
      timerCount: timeoutRef.current ? 1 : 0,
      lastTransition: `${prevState} -> ${newState} (${reason})`
    }));

    return true;
  };

  // UI描画の同期更新関数
  const syncUIDisplay = () => {
    setDisplayItems([...queueRef.current]);
  };

  // 1. 初期化・キュー構築 & localStorage 復元
  useEffect(() => {
    const spots = db.getSpots();
    const items: VideoAuditItem[] = [];
    const completedIds = new Set<string>();

    const masterVideos = Object.values(OFFICIAL_VIDEOS);
    masterVideos.forEach((video: OfficialVideo, index: number) => {
      const relatedSpots = spots.filter(s => s.workKey === video.workKey || s.youtubeId === video.youtubeId);
      const spotIds = relatedSpots.map(s => s.id);
      const spotNames = relatedSpots.map(s => s.name);

      const auditItemId = `${index}:${video.group}:${video.title}:${video.youtubeId}`;
      let isFormatError = false;
      if (!video.youtubeId || video.youtubeId.length !== 11 || video.youtubeId.includes('<') || video.youtubeId.includes('/')) {
        isFormatError = true;
      }

      items.push({
        auditItemId,
        queueIndex: index,
        workKey: video.workKey,
        workName: video.title,
        group: video.group,
        currentYoutubeId: video.youtubeId,
        watchUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
        embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
        spotCount: relatedSpots.length,
        spotIds,
        spotNames,
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

    // localStorage 復元
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: VideoAuditItem[] = JSON.parse(saved);
        parsed.forEach(savedItem => {
          const idx = items.findIndex(i => i.auditItemId === savedItem.auditItemId);
          if (idx >= 0) {
            items[idx] = { ...items[idx], ...savedItem };
            if (savedItem.auditExecuted || savedItem.auditResult !== '未検査') {
              completedIds.add(savedItem.auditItemId);
            }
          }
        });
      } catch (e) {
        console.warn('Failed to parse localStorage:', e);
      }
    }

    queueRef.current = items;
    completedItemIdsRef.current = completedIds;
    syncUIDisplay();

    // oEmbed バックグラウンド補完
    fetchOembedInfo(items);
  }, []);

  // oEmbed API 情報取得
  const fetchOembedInfo = async (items: VideoAuditItem[]) => {
    let changed = false;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.oembedStatus !== 'pending') continue;

      try {
        const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${item.currentYoutubeId}&format=json`);
        if (res.ok) {
          const data = await res.json();
          item.oembedStatus = 'success';
          item.youtubeTitle = data.title || item.youtubeTitle;
          item.channelName = data.author_name || item.channelName;
          if (data.thumbnail_url) item.thumbnailUrl = data.thumbnail_url;
          changed = true;
        } else {
          item.oembedStatus = 'failed';
        }
      } catch (e) {
        item.oembedStatus = 'failed';
      }
    }

    if (changed) {
      syncUIDisplay();
      saveToLocalStorage();
    }
  };

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(queueRef.current));
    } catch (e) {
      console.warn('Failed to save audit state:', e);
    }
  };

  // YouTube IFrame Player API スクリプト読み込み
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // リソースクリアヘルパー (Player & Timer)
  const cleanupResources = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch (e) {}
      playerRef.current = null;
    }
  };

  // 単一集約確定関数 finalizeItem()
  const finalizeItem = (
    resultType: AuditResultType,
    playerState: 'PLAYING' | 'ERROR' | 'TIMEOUT' | 'NOT_TESTED',
    errorCode: number | null,
    notes: string,
    callbackRunId: string,
    callbackItemId: string
  ) => {
    // 厳格排他ガード
    if (callbackRunId !== runIdRef.current) {
      console.warn(`[FINALIZE] Ignored stale runId: ${callbackRunId} !== ${runIdRef.current}`);
      return;
    }
    if (!isRunningRef.current) {
      console.warn(`[FINALIZE] Ignored because audit is not running`);
      return;
    }
    if (isFinalizingRef.current) {
      console.warn(`[FINALIZE] Ignored concurrent finalize call for ${callbackItemId}`);
      return;
    }
    if (!currentItemRef.current || currentItemRef.current.auditItemId !== callbackItemId) {
      console.warn(`[FINALIZE] Ignored mismatched item: ${callbackItemId} !== ${currentItemRef.current?.auditItemId}`);
      return;
    }
    if (completedItemIdsRef.current.has(callbackItemId)) {
      console.warn(`[FINALIZE] Item already finalized: ${callbackItemId}`);
      return;
    }

    isFinalizingRef.current = true;
    transitionTo('FINALIZING', `Result: ${resultType}`);

    const item = currentItemRef.current;
    item.auditExecuted = true;
    item.auditedAt = new Date().toISOString();
    item.playerState = playerState;
    item.playerErrorCode = errorCode;
    item.actualPlaybackConfirmed = (playerState === 'PLAYING');
    item.auditResult = resultType;
    item.notes = notes;

    completedItemIdsRef.current.add(callbackItemId);
    saveToLocalStorage();
    syncUIDisplay();

    cleanupResources();

    // 確定後にインデックスを進める
    currentIndexRef.current += 1;
    isFinalizingRef.current = false;

    // 次項目へ進む
    if (transitionTo('ADVANCING', 'Moving to next item')) {
      advanceQueue();
    }
  };

  // キュー進行関数
  const advanceQueue = () => {
    if (!isRunningRef.current || cancelledRef.current) {
      transitionTo('CANCELLED', 'Audit cancelled or stopped');
      return;
    }

    const queue = queueRef.current;
    let idx = currentIndexRef.current;

    // 20本分割判定
    if (batchTargetCountRef.current !== null) {
      const processedInBatch = completedItemIdsRef.current.size - batchStartCountRef.current;
      if (processedInBatch >= batchTargetCountRef.current) {
        console.log(`[ADVANCE] Reached batch limit of ${batchTargetCountRef.current} items`);
        stopAudit('Batch limit reached');
        return;
      }
    }

    // 未検査項目を検索
    while (idx < queue.length) {
      const item = queue[idx];
      if (!completedItemIdsRef.current.has(item.auditItemId) && item.auditResult !== '形式エラー') {
        break;
      }
      // 形式エラーまたは確定済みは通過
      if (item.auditResult === '形式エラー' && !completedItemIdsRef.current.has(item.auditItemId)) {
        completedItemIdsRef.current.add(item.auditItemId);
      }
      idx++;
    }

    currentIndexRef.current = idx;

    // キュー末尾へ到達した場合
    if (idx >= queue.length) {
      transitionTo('COMPLETED', 'Reached end of queue');
      isRunningRef.current = false;
      cleanupResources();
      console.log('🎉 [QUEUE] 全キューの監査が正常に完了いたしました！');
      return;
    }

    // 次の項目を開始
    processItem(queue[idx]);
  };

  // 各項目の処理開始ルーチン
  const processItem = (item: VideoAuditItem) => {
    // 重複開始判定チェック (進行制御エラーの検知)
    if (lastStartedItemIdRef.current === item.auditItemId && isRunningRef.current) {
      console.error(`[CONTROL_ERROR] Detected consecutive start for item: ${item.auditItemId}`);
      stopAudit('進行制御エラー: 同一項目が連続開始されました');
      alert(`[進行制御エラー] 同一項目(${item.workName})が連続して開始されました。安全のため監査を停止します。`);
      return;
    }
    lastStartedItemIdRef.current = item.auditItemId;

    currentItemRef.current = item;
    transitionTo('LOADING', `Loading ${item.workName}`);

    const currentRunId = runIdRef.current;
    cleanupResources();

    // 不正または空の youtubeId チェック
    if (!item.currentYoutubeId || item.currentYoutubeId.length !== 11) {
      transitionTo('ERROR_CONFIRMED', 'Invalid YouTube ID');
      finalizeItem('形式エラー', 'ERROR', 2, '不正な11桁でないYouTube ID', currentRunId, item.auditItemId);
      return;
    }

    // 10秒タイマー設定
    timeoutRef.current = setTimeout(() => {
      if (currentRunId !== runIdRef.current || !isRunningRef.current) return;
      console.warn(`[TIMEOUT] 10s timeout reached for ${item.workName}`);
      transitionTo('TIMEOUT_CONFIRMED', '10s Timeout');
      finalizeItem('要確認', 'TIMEOUT', null, '10秒タイムアウト (要判定確認)', currentRunId, item.auditItemId);
    }, 10000);

    transitionTo('WAITING_FOR_PLAYER', 'Waiting for Player API events');

    // DOM コンテナ作成 ＆ Player 生成
    const containerId = `audit-player-${currentRunId}-${item.auditItemId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const playerContainerHost = document.getElementById('audit-player-container-host');

    if (playerContainerHost) {
      playerContainerHost.innerHTML = `<div id="${containerId}"></div>`;
    } else {
      transitionTo('ERROR_CONFIRMED', 'DOM container missing');
      finalizeItem('要確認', 'ERROR', null, '対象DOM生成失敗', currentRunId, item.auditItemId);
      return;
    }

    try {
      playerRef.current = new window.YT.Player(containerId, {
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
            if (currentRunId !== runIdRef.current || !isRunningRef.current) return;
            try {
              event.target.mute();
              event.target.playVideo();
            } catch (e) {}
          },
          onStateChange: (event: any) => {
            if (currentRunId !== runIdRef.current || !isRunningRef.current) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              transitionTo('PLAYING_CONFIRMED', 'PLAYING detected');
              finalizeItem('正常', 'PLAYING', null, 'PLAYING確認完了 (実地検証正常)', currentRunId, item.auditItemId);
            }
          },
          onError: (event: any) => {
            if (currentRunId !== runIdRef.current || !isRunningRef.current) return;
            const errCode = event.data;
            transitionTo('ERROR_CONFIRMED', `Error ${errCode}`);

            let resType: AuditResultType = '要確認';
            let noteStr = `Playerエラー (${errCode})`;

            if (errCode === 100) {
              resType = '動画不存在・非公開の疑い';
              noteStr = 'エラー100 (動画不存在・非公開の疑い)';
            } else if (errCode === 101 || errCode === 150) {
              resType = '埋め込み不可';
              noteStr = `エラー${errCode} (埋め込み拒否)`;
            }

            finalizeItem(resType, 'ERROR', errCode, noteStr, currentRunId, item.auditItemId);
          }
        }
      });
    } catch (e: any) {
      if (currentRunId !== runIdRef.current) return;
      console.error('[PLAYER_EXCEPTION]', e);
      transitionTo('ERROR_CONFIRMED', 'Player initialization exception');
      finalizeItem('要確認', 'ERROR', null, `Player例外 (${e.message || '初期化失敗'})`, currentRunId, item.auditItemId);
    }
  };

  // 監査開始 (全件 / 20本分割)
  const startAudit = (maxBatchCount: number | null = null) => {
    if (isRunningRef.current) return;

    const newRunId = crypto.randomUUID();
    runIdRef.current = newRunId;
    isRunningRef.current = true;
    cancelledRef.current = false;
    isFinalizingRef.current = false;
    lastStartedItemIdRef.current = '';

    batchTargetCountRef.current = maxBatchCount;
    batchStartCountRef.current = completedItemIdsRef.current.size;

    console.log(`🚀 [AUDIT_ENGINE] Started audit run: ${newRunId} (Max batch: ${maxBatchCount || 'ALL'})`);

    if (transitionTo('PREPARING', 'Starting audit run')) {
      advanceQueue();
    }
  };

  // 監査停止
  const stopAudit = (reason: string = 'User stopped') => {
    isRunningRef.current = false;
    cancelledRef.current = true;
    runIdRef.current = crypto.randomUUID(); // 古いイベントを無効化
    cleanupResources();
    transitionTo('CANCELLED', reason);
    console.log(`🛑 [AUDIT_ENGINE] Stopped audit run (${reason})`);
  };

  // 監査リセット
  const resetAuditState = () => {
    if (window.confirm('監査記録を完全にクリアして最初からやり直しますか？')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload();
    }
  };

  // CSV ダウンロード機能 (全件 または エラーのみ抽出)
  const downloadCSV = (onlyErrors: boolean = false) => {
    const itemsToExport = onlyErrors 
      ? queueRef.current.filter(item => item.auditResult !== '正常')
      : queueRef.current;

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
  const totalCount = queueRef.current.length;
  const testedCount = queueRef.current.filter(i => i.auditExecuted).length;
  const normalCount = queueRef.current.filter(i => i.auditResult === '正常').length;
  const errorCount = queueRef.current.filter(i => i.auditResult === '動画不存在・非公開の疑い' || i.auditResult === '形式エラー').length;
  const blockedCount = queueRef.current.filter(i => i.auditResult === '埋め込み不可').length;
  const reviewCount = queueRef.current.filter(i => i.auditResult === '要確認').length;
  const untestedCount = queueRef.current.filter(i => i.auditResult === '未検査').length;

  // フィルター
  const filteredItems = displayItems.filter(item => {
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
      {/* 動的一意DOMコンテナホスト */}
      <div id="audit-player-container-host" className="fixed bottom-4 right-4 opacity-30 pointer-events-none z-50 rounded-xl overflow-hidden border border-slate-700 bg-black" />

      {/* ヘッダー */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Film className="w-7 h-7 text-rose-500" />
            全YouTube動画 状態機械型堅牢自動監査システム
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            単一Player & 排他状態機械による非停止キューエンジン (全 {totalCount} 作品 / 283スポット)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isRunningRef.current ? (
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
              onClick={() => stopAudit('User clicked stop')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
            >
              <Pause className="w-4 h-4" />
              監査停止
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
          >
            <Download className="w-4 h-4" />
            youtube-audit-errors.csv
          </button>

          <button
            onClick={resetAuditState}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
            title="記録クリア"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* デバッグ表示パネル */}
      <div className="max-w-7xl mx-auto mb-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-[11px]">
        <div>
          <span className="text-slate-500 font-bold block">runId</span>
          <span className="text-rose-400 truncate block" title={debugState.runId}>{debugState.runId.slice(0, 13)}...</span>
        </div>
        <div>
          <span className="text-slate-500 font-bold block">監査状態 (MachineState)</span>
          <span className="text-amber-300 font-bold block">{debugState.machineState}</span>
        </div>
        <div>
          <span className="text-slate-500 font-bold block">現在Index / ItemId</span>
          <span className="text-slate-200 truncate block" title={debugState.currentAuditItemId}>
            [{debugState.currentIndex}] {debugState.currentWorkName}
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-bold block">処理数 / 今回件数</span>
          <span className="text-emerald-400 font-bold block">
            {debugState.completedCount} / {debugState.batchProcessedCount} 件
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-bold block">Player数 / Timer数</span>
          <span className="text-sky-400 font-bold block">
            Player: {debugState.playerCount} | Timer: {debugState.timerCount}
          </span>
        </div>
        <div className="col-span-2 md:col-span-5 text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 mt-1">
          直近状態遷移: <span className="text-slate-200">{debugState.lastTransition}</span>
        </div>
      </div>

      {/* サマリーカード */}
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
          <div className="text-[11px] text-rose-400 font-bold">エラー / 不存在</div>
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
              <tr key={item.auditItemId} className={debugState.currentAuditItemId === item.auditItemId ? 'bg-rose-500/15' : 'hover:bg-slate-800/40 transition-colors'}>
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
                  {debugState.currentAuditItemId === item.auditItemId ? (
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
