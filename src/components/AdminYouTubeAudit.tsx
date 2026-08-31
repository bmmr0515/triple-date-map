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
  Film
} from 'lucide-react';


declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export type AuditResultType = 'OK' | 'ID_ERROR' | 'EMBED_BLOCKED' | 'NEED_REVIEW' | 'FORMAT_ERROR';

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
  // oEmbed 結果
  oembedStatus: 'success' | 'failed' | 'pending';
  youtubeTitle: string;
  channelName: string;
  thumbnailUrl: string;
  // Player API 結果
  playerStatus: 'untested' | 'testing' | 'playing' | 'error' | 'timeout';
  playerErrorCode: number | null;
  // 総合判定
  auditResult: AuditResultType;
  correctYoutubeId?: string;
  correctOfficialUrl?: string;
  notes: string;
}

export const AdminYouTubeAudit: React.FC = () => {
  const [auditItems, setAuditItems] = useState<VideoAuditItem[]>([]);
  const [filterResult, setFilterResult] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [auditProgress, setAuditProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  const playerRef = useRef<any>(null);
  const isAuditingRef = useRef<boolean>(false);
  const auditTimeoutRef = useRef<any>(null);

  // 1. スポットデータ ＆ OFFICIAL_VIDEOS から監査アイテム一覧の初期構築
  useEffect(() => {
    const spots = db.getSpots();
    const workMap = new Map<string, VideoAuditItem>();

    // OFFICIAL_VIDEOS のエントリからベース作成
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
        oembedStatus: 'pending',
        youtubeTitle: '未取得',
        channelName: '未取得',
        thumbnailUrl: `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`,
        playerStatus: 'untested',
        playerErrorCode: null,
        auditResult: isFormatError ? 'FORMAT_ERROR' : 'NEED_REVIEW',
        correctYoutubeId: video.workKey === 'kitto-aoi' ? 'gQ81Vl0OBlQ' : undefined,
        correctOfficialUrl: video.workKey === 'kitto-aoi' ? 'https://www.youtube.com/watch?v=gQ81Vl0OBlQ' : undefined,
        notes: isFormatError ? '11桁のYouTube ID形式ではありません' : '検査待ち'
      });
    });

    const items = Array.from(workMap.values());
    setAuditItems(items);
    setAuditProgress({ current: 0, total: items.length });

    // 初期 oEmbed 一括並行チェック
    fetchOembedInfo(items);
  }, []);

  // 2. oEmbed API によるタイトル＆チャンネル名の取得
  const fetchOembedInfo = async (items: VideoAuditItem[]) => {
    const updatedItems = [...items];

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      if (item.auditResult === 'FORMAT_ERROR') continue;

      try {
        const oembedEndpoint = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${item.currentYoutubeId}&format=json`;
        const res = await fetch(oembedEndpoint);
        if (res.ok) {
          const data = await res.json();
          item.oembedStatus = 'success';
          item.youtubeTitle = data.title || '取得完了';
          item.channelName = data.author_name || '取得完了';
          if (data.thumbnail_url) item.thumbnailUrl = data.thumbnail_url;

          // タイトル照合 ＆ 公式チャンネルチェック
          const isOfficialChannel = data.author_name?.includes('＝LOVE') || 
                                    data.author_name?.includes('NOT EQUAL ME') || 
                                    data.author_name?.includes('NEARLY EQUAL JOY') ||
                                    data.author_name?.includes('イコールラブ') ||
                                    data.author_name?.includes('ノットイコールミー') ||
                                    data.author_name?.includes('ニアリーイコールジョイ');

          if (!isOfficialChannel) {
            item.notes = `公式外チャンネル (${data.author_name || '不明'})`;
            item.auditResult = 'ID_ERROR';
          }
        } else {
          item.oembedStatus = 'failed';
          item.notes = `oEmbed応答エラー (${res.status})`;
        }
      } catch (err) {
        item.oembedStatus = 'failed';
        item.notes = 'oEmbed通信失敗';
      }
    }

    setAuditItems([...updatedItems]);
  };

  // 3. YouTube IFrame Player API のスクリプト準備
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // 4. 監査開始ボタン処理（動画を1本ずつ再生検査）
  const startAudit = () => {
    if (isAuditing || auditItems.length === 0) return;
    setIsAuditing(true);
    isAuditingRef.current = true;
    setCurrentIndex(0);
    testNextVideo(0);
  };

  const stopAudit = () => {
    setIsAuditing(false);
    isAuditingRef.current = false;
    if (auditTimeoutRef.current) clearTimeout(auditTimeoutRef.current);
    if (playerRef.current) {
      try { playerRef.current.stopVideo(); } catch (e) {}
    }
  };

  // 単一プレイヤーで1本ずつ音無し検証
  const testNextVideo = (index: number) => {
    if (!isAuditingRef.current || index >= auditItems.length) {
      setIsAuditing(false);
      isAuditingRef.current = false;
      setCurrentIndex(-1);
      console.log('🎉 全動画の Player API 監査が完了しました！');
      return;
    }

    setCurrentIndex(index);
    setAuditProgress(prev => ({ ...prev, current: index + 1 }));

    const item = auditItems[index];

    // 形式エラーはスキップして次へ
    if (item.auditResult === 'FORMAT_ERROR') {
      testNextVideo(index + 1);
      return;
    }

    // playerStatus を testing へ
    setAuditItems(prev => {
      const list = [...prev];
      list[index].playerStatus = 'testing';
      return list;
    });

    if (auditTimeoutRef.current) clearTimeout(auditTimeoutRef.current);

    // 10秒タイムアウト設定
    auditTimeoutRef.current = setTimeout(() => {
      console.warn(`[AUDIT] Timeout for ${item.workName} (${item.currentYoutubeId})`);
      setAuditItems(prev => {
        const list = [...prev];
        if (list[index].playerStatus === 'testing') {
          list[index].playerStatus = 'timeout';
          list[index].auditResult = 'NEED_REVIEW';
          list[index].notes = '10秒タイムアウト (要手動確認)';
        }
        return list;
      });
      testNextVideo(index + 1);
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
                  list[index].playerStatus = 'playing';
                  if (list[index].auditResult !== 'ID_ERROR') {
                    list[index].auditResult = 'OK';
                    list[index].notes = '埋め込み再生正常 (PLAYING確認)';
                  }
                  return list;
                });

                setTimeout(() => testNextVideo(index + 1), 300);
              }
            },
            onError: (event: any) => {
              if (auditTimeoutRef.current) clearTimeout(auditTimeoutRef.current);
              const errCode = event.data;

              setAuditItems(prev => {
                const list = [...prev];
                list[index].playerStatus = 'error';
                list[index].playerErrorCode = errCode;

                if (errCode === 101 || errCode === 150) {
                  list[index].auditResult = 'EMBED_BLOCKED';
                  list[index].notes = `埋め込み拒否 (エラー ${errCode})`;
                } else if (errCode === 100) {
                  list[index].auditResult = 'ID_ERROR';
                  list[index].notes = '動画非公開または存在しません (エラー 100)';
                } else {
                  list[index].auditResult = 'NEED_REVIEW';
                  list[index].notes = `Playerエラー (${errCode})`;
                }
                return list;
              });

              setTimeout(() => testNextVideo(index + 1), 300);
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

  // 5. CSV ダウンロード機能 (指定された16列)
  const downloadCSV = () => {
    let csv = 'group,workName,currentYoutubeId,youtubeTitle,channelName,watchUrl,embedUrl,spotCount,spotIds,oembedStatus,playerStatus,playerErrorCode,auditResult,correctYoutubeId,correctOfficialUrl,notes\n';

    auditItems.forEach(item => {
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
        item.oembedStatus,
        item.playerStatus,
        item.playerErrorCode || '',
        item.auditResult,
        item.correctYoutubeId || '',
        item.correctOfficialUrl || '',
        `"${item.notes.replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `youtube-audit-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // フィルター ＆ 検索
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
      case 'OK':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> OK (正常)</span>;
      case 'ID_ERROR':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> ID誤り</span>;
      case 'EMBED_BLOCKED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> 埋め込み不可</span>;
      case 'NEED_REVIEW':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> 要確認</span>;
      case 'FORMAT_ERROR':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> 形式エラー</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* 隠し検証プレイヤー (ミュート自動再生でテスト) */}
      <div className="fixed bottom-4 right-4 opacity-30 pointer-events-none z-50 rounded-xl overflow-hidden border border-slate-700 bg-black">
        <div id="audit-hidden-player" />
      </div>

      {/* ヘッダー */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Film className="w-7 h-7 text-rose-500" />
            全YouTube動画 総合リアルタイム監査ダッシュボード
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            全 {auditItems.length} 作品 / 283スポットの動画ID・oEmbed応答・IFrame Player API再生ステータスを一括検証
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isAuditing ? (
            <button
              onClick={startAudit}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Player API 自動監査開始
            </button>
          ) : (
            <button
              onClick={stopAudit}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
            >
              <Pause className="w-4 h-4" />
              監査一時停止 ({auditProgress.current}/{auditProgress.total})
            </button>
          )}

          <button
            onClick={downloadCSV}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            CSVダウンロード (16列)
          </button>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-bold">全作品数</div>
          <div className="text-2xl font-black text-white mt-1">{auditItems.length} 本</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
          <div className="text-xs text-emerald-400 font-bold">正常 (OK)</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {auditItems.filter(i => i.auditResult === 'OK').length} 本
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30">
          <div className="text-xs text-rose-400 font-bold">ID誤り</div>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {auditItems.filter(i => i.auditResult === 'ID_ERROR').length} 本
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30">
          <div className="text-xs text-amber-400 font-bold">埋め込み不可</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {auditItems.filter(i => i.auditResult === 'EMBED_BLOCKED').length} 本
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-sky-500/30">
          <div className="text-xs text-sky-400 font-bold">要確認 / 形式エラー</div>
          <div className="text-2xl font-black text-sky-400 mt-1">
            {auditItems.filter(i => i.auditResult === 'NEED_REVIEW' || i.auditResult === 'FORMAT_ERROR').length} 本
          </div>
        </div>
      </div>

      {/* フィルター ＆ 検索バー */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['ALL', 'OK', 'ID_ERROR', 'EMBED_BLOCKED', 'NEED_REVIEW', 'FORMAT_ERROR'].map(res => (
            <button
              key={res}
              onClick={() => setFilterResult(res)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterResult === res ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {res === 'ALL' ? 'すべて' : res}
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
            {filteredItems.map((item, idx) => (
              <tr key={item.workKey} className={currentIndex === idx ? 'bg-rose-500/10' : 'hover:bg-slate-800/40 transition-colors'}>
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
                <td className="px-4 py-3.5">
                  {item.playerStatus === 'testing' && <span className="text-amber-400 font-bold animate-pulse">⏳ 検証中...</span>}
                  {item.playerStatus === 'playing' && <span className="text-emerald-400 font-bold">🟢 PLAYING</span>}
                  {item.playerStatus === 'error' && <span className="text-rose-400 font-bold">❌ Error {item.playerErrorCode}</span>}
                  {item.playerStatus === 'timeout' && <span className="text-sky-400 font-bold">⏱️ Timeout</span>}
                  {item.playerStatus === 'untested' && <span className="text-slate-500">未検証</span>}
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
