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

export default function MessageGallery() {
  const [messages, setMessages] = useState<StadiumMessage[]>([]);
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
      } catch (e) {
        console.error('Failed to load stadium messages:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  // フィルタリングされたメッセージ
  const filteredMessages = selectedColor === 'all'
    ? messages
    : messages.filter(m => m.color === selectedColor);

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
      background: '#0f172a', // 深みのあるダークブルーグレー背景
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '60px'
    }}>
      {/* 美しいプレミアムグラデーションヘッダー */}
      <header style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.9) 100%)',
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
        boxSizing: 'border-box'
      }}>
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
            <style>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
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
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {filteredMessages.map((msg, index) => {
              const contrastText = getContrastTextColor(msg.color);
              const targetMember = MEMBER_COLORS.find(c => c.hex === msg.color);
              
              return (
                <div
                  key={msg.id}
                  onClick={() => setActiveModalIndex(index)}
                  style={{
                    backgroundColor: msg.color,
                    color: contrastText,
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                    border: '1.5px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '160px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  className="gallery-card"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
                  }}
                >
                  {/* カードの右上部のちょっとしたデザイン要素 */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    pointerEvents: 'none'
                  }} />

                  {/* メッセージ内容 */}
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

                  {/* メタデータ */}
                  <div style={{
                    borderTop: '1px solid currentColor',
                    paddingTop: '12px',
                    opacity: 0.9,
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
                        backgroundColor: contrastText
                      }} />
                      {msg.name || '匿名オタク'}
                    </span>
                    <span style={{ fontSize: '10px' }}>
                      To: {targetMember ? targetMember.name.split(' ')[0] : 'メンバー'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* カルーセルモーダル (全画面表示) */}
      {activeModalIndex !== null && filteredMessages[activeModalIndex] && (() => {
        const msg = filteredMessages[activeModalIndex];
        const contrastText = getContrastTextColor(msg.color);
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
                  backgroundColor: msg.color,
                  color: contrastText,
                  borderRadius: '32px',
                  padding: '40px 32px',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
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
                  background: 'rgba(255, 255, 255, 0.08)',
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
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                      To: {targetMember ? targetMember.name : 'メンバー'}
                    </span>
                    <span style={{
                      opacity: 0.8
                    }}>
                      Card {activeModalIndex + 1} / {filteredMessages.length}
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
                  borderTop: '1px solid currentColor',
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
                      backgroundColor: contrastText
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
