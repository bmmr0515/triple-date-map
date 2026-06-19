import React, { useState, useEffect, useRef } from 'react';
import { db, StadiumMessage } from '../db';
import { ArrowLeft, ChevronLeft, ChevronRight, X, LayoutGrid } from 'lucide-react';

const MEMBER_COLORS = [
  { name: '全員', label: 'ALL', hex: 'all' },
  { name: '大谷 映美里', label: '薄紫', hex: '#e9d5ff' },
  { name: '大場 花菜', label: 'オレンジ', hex: '#f97316' },
  { name: '音嶋 莉沙', label: '水色', hex: '#38bdf8' },
  { name: '齋藤 樹愛羅', label: '薄ピンク', hex: '#fbcfe8' },
  { name: '佐々木 舞香', label: '白', hex: '#ffffff' },
  { name: '髙松 瞳', label: '赤', hex: '#ef4444' },
  { name: '瀧脇 笙古', label: '黄色', hex: '#facc15' },
  { name: '野口 衣織', label: '紫', hex: '#a855f7' },
  { name: '諸橋 沙夏', label: '黄緑', hex: '#84cc16' },
  { name: '山本 杏奈', label: '青', hex: '#3b82f6' }
];

// 背景色からコントラストの高いテキスト色(黒または白)を自動判定するヘルパー
const getContrastTextColor = (hexColor: string): string => {
  const hex = hexColor.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16);
    g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
    b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return '#1e293b';
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? '#1e293b' : '#ffffff';
};

// 配列をシャッフルするヘルパー関数
const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function MessageGallery() {
  const [messages, setMessages] = useState<StadiumMessage[]>([]);
  const [displayMessages, setDisplayMessages] = useState<StadiumMessage[]>([]);
  const [sortType, setSortType] = useState<'shuffle' | 'latest'>('shuffle');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  
  // モーダル・カルーセルの状態
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  
  // スワイプ用座標
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const msgs = await db.getStadiumMessages();
        setMessages(msgs);
        setDisplayMessages(shuffleArray(msgs));
      } catch (e) {
        console.error('Failed to load stadium messages:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    // bodyのスクロール禁止設定を一時的に解除
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;
    const originalHeight = document.body.style.height;

    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.body.style.width = 'auto';
    document.body.style.height = 'auto';

    return () => {
      // 元の設定に戻す
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
      document.body.style.height = originalHeight;
    };
  }, []);



  const handleSortChange = (type: 'shuffle' | 'latest') => {
    setSortType(type);
    if (type === 'latest') {
      setDisplayMessages([...messages]);
    } else {
      setDisplayMessages(shuffleArray(messages));
    }
  };

  // フィルタリングされたメッセージ
  const filteredMessages = selectedColor === 'all'
    ? displayMessages
    : displayMessages.filter(m => m.color === selectedColor);

  // カルーセル用切り替え
  const handlePrev = () => {
    if (activeModalIndex === null || filteredMessages.length <= 1) return;
    setActiveModalIndex(prev => (prev !== null && prev > 0) ? prev - 1 : filteredMessages.length - 1);
  };

  const handleNext = () => {
    if (activeModalIndex === null || filteredMessages.length <= 1) return;
    setActiveModalIndex(prev => (prev !== null && prev < filteredMessages.length - 1) ? prev + 1 : 0);
  };

  // キーボード操作のリスナー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModalIndex === null) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setActiveModalIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalIndex, filteredMessages]);

  // タッチスワイプ操作のリスナー
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diffX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // スワイプと判定する最小距離

    if (Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        // 左スワイプ（次へ）
        handleNext();
      } else {
        // 右スワイプ（前へ）
        handlePrev();
      }
    }
  };

  const handleBackToMap = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('pushstate'));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at bottom, #0d0f1a 0%, #030408 100%)', // 深みのある夜のライブ会場
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '60px',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* ライブ会場背景演出用のCSSスタイル */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes float1 {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(0.8deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float2 {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(-0.8deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float3 {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-9px) rotate(0.4deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes orb-move {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.15); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.12;
          pointer-events: none;
          mix-blend-mode: screen;
          animation: orb-move 25s infinite ease-in-out;
        }
        .gallery-card {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s !important;
        }
      `}</style>

      {/* 背景のペンライト光の演出（オーブ） */}
      <div className="bg-orb" style={{
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(0,0,0,0) 70%)',
        top: '10%',
        left: '5%',
        animationDelay: '0s'
      }} />
      <div className="bg-orb" style={{
        width: '550px',
        height: '550px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(0,0,0,0) 70%)',
        bottom: '20%',
        right: '5%',
        animationDelay: '-5s'
      }} />
      <div className="bg-orb" style={{
        width: '380px',
        height: '380px',
        background: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(0,0,0,0) 70%)',
        top: '50%',
        left: '40%',
        animationDelay: '-10s'
      }} />

      {/* 美しいプレミアムグラデーションヘッダー */}
      <header style={{
        background: 'linear-gradient(135deg, rgba(9, 13, 22, 0.95) 0%, rgba(20, 15, 40, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <button
            onClick={handleBackToMap}
            className="pop-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: '800',
              color: '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={16} />
            地図に戻る
          </button>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1 style={{
              fontSize: '18px',
              fontWeight: '950',
              margin: 0,
              background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 50%, #db2777 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.05em'
            }}>
              🏟️ 寄せ書きメッセージギャラリー
            </h1>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0', fontWeight: '700' }}>
              ファンの皆様から寄せられた熱いメッセージカード
            </p>
          </div>

          <div style={{ width: '100px', display: 'flex', justifyContent: 'flex-end' }}>
            <LayoutGrid size={20} color="#94a3b8" />
          </div>
        </div>
      </header>

      {/* メインエリア */}
      <main style={{
        maxWidth: '1200px',
        margin: '24px auto 0 auto',
        padding: '0 24px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 総投稿数 ＆ ソート順トグルの表示コンテナ */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* 総投稿数（プレミアムバッジ） */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '9999px',
            padding: '8px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '800' }}>
              ✨ 総メッセージ数: <span style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #db2777 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px',
                fontWeight: '950'
              }}>{messages.length}</span> 件
            </span>
          </div>

          {/* 表示順切替トグル */}
          <div style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '9999px',
            padding: '4px',
            border: '1.5px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <button
              onClick={() => handleSortChange('shuffle')}
              style={{
                padding: '6px 18px',
                borderRadius: '9999px',
                fontSize: '11.5px',
                fontWeight: '900',
                cursor: 'pointer',
                border: 'none',
                background: sortType === 'shuffle' ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)' : 'transparent',
                color: sortType === 'shuffle' ? '#ffffff' : '#64748b',
                boxShadow: sortType === 'shuffle' ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🎲 ランダム (ペンライトの海)
            </button>
            <button
              onClick={() => handleSortChange('latest')}
              style={{
                padding: '6px 18px',
                borderRadius: '9999px',
                fontSize: '11.5px',
                fontWeight: '900',
                cursor: 'pointer',
                border: 'none',
                background: sortType === 'latest' ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)' : 'transparent',
                color: sortType === 'latest' ? '#ffffff' : '#64748b',
                boxShadow: sortType === 'latest' ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🕒 新着順
            </button>
          </div>
        </div>

        {/* メンバーカラーフィルター（横スクロール対応） */}
        <div style={{
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '12px',
            fontWeight: '900',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            メンバーカラーで絞り込む
          </h2>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            padding: '4px 4px 12px 4px',
            scrollbarWidth: 'none',
            justifyContent: 'flex-start',
            alignItems: 'center',
            WebkitOverflowScrolling: 'touch'
          }} className="hide-scrollbar">
            {MEMBER_COLORS.map((item) => {
              const isSelected = selectedColor === item.hex;
              const isAll = item.hex === 'all';
              
              return (
                <button
                  key={item.name}
                  onClick={() => setSelectedColor(item.hex)}
                  className="pop-button"
                  style={{
                    flexShrink: 0,
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: isSelected ? '2px solid #ffffff' : '1.5px solid rgba(255,255,255,0.08)',
                    background: isSelected 
                      ? (isAll ? 'linear-gradient(135deg, #ffd700 0%, #db2777 100%)' : item.hex)
                      : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected 
                      ? (isAll ? '#ffffff' : getContrastTextColor(item.hex))
                      : '#94a3b8',
                    boxShadow: isSelected ? '0 4px 15px rgba(255, 255, 255, 0.1)' : 'none',
                    transform: isSelected ? 'scale(1.03)' : 'scale(1)'
                  }}
                >
                  {!isAll && (
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: item.hex,
                      border: '1px solid rgba(255,255,255,0.3)',
                      display: 'inline-block'
                    }} />
                  )}
                  {item.name} {item.label !== 'ALL' ? `(${item.label})` : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* ✉️ メッセージカードエリア */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          marginTop: '24px'
        }}>
          {/* ギャラリーグリッド */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>
              <div style={{ fontSize: '15px', fontWeight: '800' }}>メッセージを読み込んでいます...</div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '100px 24px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '24px',
              border: '1px dashed rgba(255,255,255,0.1)'
            }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '16px' }}>✉️</span>
              <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#64748b', margin: 0 }}>
                該当するメッセージカードはまだありません。
              </h3>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                マップの国立競技場ピンから最初のメッセージを書いてみましょう！
              </p>
            </div>
          ) : (() => {
            const isFewMessages = selectedColor !== 'all' && filteredMessages.length <= 3;
            
            if (isFewMessages) {
              return (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '55vh',
                  padding: '40px 0',
                  position: 'relative',
                  width: '100%'
                }}>
                  {/* メンバーカラーのぼかした大きな発光背景 */}
                  <div style={{
                    position: 'absolute',
                    width: '350px',
                    height: '350px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${selectedColor}22 0%, rgba(0,0,0,0) 70%)`,
                    filter: 'blur(60px)',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 0
                  }} />

                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '32px',
                    width: '100%',
                    maxWidth: '1000px',
                    zIndex: 1
                  }}>
                    {filteredMessages.map((msg, index) => {
                      const targetMember = MEMBER_COLORS.find(c => c.hex === msg.color);
                      const floatAnim = `float${(index % 3) + 1}`;
                      
                      return (
                        <div
                          key={msg.id}
                          onClick={() => setActiveModalIndex(index)}
                          style={{
                            backgroundColor: 'rgba(15, 23, 42, 0.75)',
                            color: '#ffffff',
                            borderRadius: '28px',
                            padding: '32px 28px',
                            boxShadow: `0 0 18px ${msg.color}35, inset 0 0 10px ${msg.color}15`,
                            border: `2px solid ${msg.color}`,
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '180px',
                            maxWidth: '400px',
                            width: '100%',
                            position: 'relative',
                            overflow: 'hidden',
                            animation: `${floatAnim} ${6 + index * 1.5}s ease-in-out infinite`
                          }}
                          className="gallery-card"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)';
                            e.currentTarget.style.boxShadow = `0 0 25px ${msg.color}a0, 0 0 50px ${msg.color}40, inset 0 0 15px ${msg.color}30`;
                            e.currentTarget.style.animationPlayState = 'paused';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = '';
                            e.currentTarget.style.boxShadow = `0 0 18px ${msg.color}35, inset 0 0 10px ${msg.color}15`;
                            e.currentTarget.style.animationPlayState = 'running';
                          }}
                        >
                          {/* カード右上部の装飾 */}
                          <div style={{
                            position: 'absolute',
                            top: '-15px',
                            right: '-15px',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: `${msg.color}10`,
                            pointerEvents: 'none'
                          }} />

                          {/* 本文 */}
                          <p style={{
                            fontSize: '14px',
                            fontWeight: '800',
                            margin: '0 0 24px 0',
                            lineHeight: '1.65',
                            whiteSpace: 'pre-wrap',
                            display: '-webkit-box',
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {msg.message}
                          </p>

                          {/* フッター */}
                          <div style={{
                            borderTop: `1px solid ${msg.color}30`,
                            paddingTop: '14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '11.5px',
                            fontWeight: '700'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: msg.color,
                                boxShadow: `0 0 8px ${msg.color}`
                              }} />
                              {msg.name || '匿名オタク'}
                            </span>
                            <span style={{ 
                              fontSize: '10.5px',
                              color: msg.color,
                              textShadow: `0 0 5px ${msg.color}60`
                            }}>
                              To: {targetMember ? targetMember.name.split(' ')[0] : 'メンバー'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // 通常のグリッド表示
            return (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {filteredMessages.map((msg, index) => {
                  const targetMember = MEMBER_COLORS.find(c => c.hex === msg.color);
                  
                  return (
                    <div
                      key={msg.id}
                      onClick={() => setActiveModalIndex(index)}
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        color: '#ffffff',
                        borderRadius: '24px',
                        padding: '24px',
                        boxShadow: `0 0 15px ${msg.color}30, inset 0 0 10px ${msg.color}15`,
                        border: `2px solid ${msg.color}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '160px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      className="gallery-card"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)';
                        e.currentTarget.style.boxShadow = `0 0 25px ${msg.color}a0, 0 0 50px ${msg.color}40, inset 0 0 15px ${msg.color}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = `0 0 15px ${msg.color}30, inset 0 0 10px ${msg.color}15`;
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: `${msg.color}08`,
                        pointerEvents: 'none'
                      }} />

                      <p style={{
                        fontSize: '13.5px',
                        fontWeight: '800',
                        margin: '0 0 20px 0',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {msg.message}
                      </p>

                      <div style={{
                        borderTop: `1px solid ${msg.color}30`,
                        paddingTop: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: msg.color,
                            boxShadow: `0 0 8px ${msg.color}`
                          }} />
                          {msg.name || '匿名オタク'}
                        </span>
                        <span style={{ 
                          fontSize: '10px',
                          color: msg.color,
                          textShadow: `0 0 5px ${msg.color}60`
                        }}>
                          To: {targetMember ? targetMember.name.split(' ')[0] : 'メンバー'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </main>

      {/* カルーセルモーダル (全画面表示) */}
      {activeModalIndex !== null && filteredMessages[activeModalIndex] && (() => {
        const msg = filteredMessages[activeModalIndex];
        const targetMember = MEMBER_COLORS.find(c => c.hex === msg.color);
        
        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.92)', // 深みのあるモーダル背景
              backdropFilter: 'blur(20px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              animation: 'fade-in 0.25s ease-out'
            }}
            onClick={() => setActiveModalIndex(null)}
          >
            {/* 閉じるボタン */}
            <button
              onClick={() => setActiveModalIndex(null)}
              className="pop-button"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                transition: 'all 0.2s',
                zIndex: 10
              }}
            >
              <X size={20} />
            </button>

            {/* カルーセルコンテナ */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                maxWidth: '750px',
                gap: '24px',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()} // モーダル背景クリックでの閉じを防止
            >
              {/* 左矢印 */}
              <button
                onClick={handlePrev}
                className="pop-button"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
              >
                <ChevronLeft size={24} />
              </button>

              {/* メインメッセージカード */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(20px)',
                  color: '#ffffff',
                  borderRadius: '32px',
                  padding: '40px 32px',
                  boxShadow: `0 0 30px ${msg.color}50, inset 0 0 15px ${msg.color}20`,
                  border: `2.5px solid ${msg.color}`,
                  minHeight: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: 'scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: `${msg.color}10`,
                  pointerEvents: 'none'
                }} />

                <div>
                  {/* カードのヘッダー情報 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '28px',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    opacity: 0.95
                  }}>
                    <span style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.15)',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      border: `1.5px solid ${msg.color}50`,
                      color: msg.color,
                      textShadow: `0 0 4px ${msg.color}40`
                    }}>
                      To: {targetMember ? targetMember.name : 'メンバー'}
                    </span>
                    <span style={{
                      opacity: 0.8
                    }}>
                      {selectedColor === 'all' 
                        ? `Card ${activeModalIndex + 1} / ${messages.length}` 
                        : `Card ${activeModalIndex + 1}`
                      }
                    </span>
                  </div>

                  {/* 本文 */}
                  <p style={{
                    fontSize: '18px',
                    fontWeight: '900',
                    lineHeight: '1.7',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}>
                    {msg.message}
                  </p>
                </div>

                {/* フッター */}
                <div style={{
                  borderTop: `1px solid ${msg.color}30`,
                  paddingTop: '20px',
                  marginTop: '32px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px',
                  fontWeight: '800',
                  opacity: 0.95
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: msg.color,
                      boxShadow: `0 0 10px ${msg.color}`
                    }} />
                    {msg.name || '匿名オタク'}
                  </span>
                  
                  <span style={{ opacity: 0.7, fontSize: '11px', fontFamily: 'Outfit' }}>
                    {new Date(msg.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>

              {/* 右矢印 */}
              <button
                onClick={handleNext}
                className="pop-button"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
              >
                <ChevronRight size={24} />
              </button>
            </div>
            
            {/* モバイル用スワイプ操作ガイダンス */}
            <div style={{
              position: 'absolute',
              bottom: '40px',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '12px',
              fontWeight: '800',
              pointerEvents: 'none'
            }}>
              左右スワイプまたは矢印キーで切り替え
            </div>
          </div>
        );
      })()}
    </div>
  );
}
