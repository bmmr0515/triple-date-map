import React, { useEffect, useRef } from 'react';

// AdSenseの型定義
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  slot = 'XXXXXXXXXXXXXXXX', // ※後で設定
  format = 'auto',
  responsive = true
}) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    try {
      // 開発環境ではエラーを防ぐため実行しない場合もあるが、Viteで安全に処理する
      const isAdLoaded = adContainerRef.current?.querySelector('iframe');
      
      if (!isAdLoaded && typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err: any) {
      console.warn('AdSense error:', err.message);
    }
  }, []);

  return (
    <div 
      className="ad-container" 
      ref={adContainerRef}
      style={{ 
        width: '100%', 
        overflow: 'hidden', 
        display: 'flex', 
        justifyContent: 'center',
        margin: '16px 0',
        minHeight: '50px' // CLS（Cumulative Layout Shift）対策: 最低限の高さを確保
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};
