import React, { useEffect, useRef } from 'react';

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

export const AdBanner: React.FC<AdBannerProps> = React.memo(({ 
  slot = 'XXXXXXXXXXXXXXXX',
  format = 'auto',
  responsive = true
}) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    try {
      const container = adContainerRef.current;
      if (!container) return;

      // ReactのDOM Diffエラー（removeChild例外）を防ぐため、
      // 広告用 <ins> タグをReactツリー外のピュアDOMとして動的生成して注入する。
      if (container.children.length === 0) {
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.style.width = '100%';
        ins.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXX');
        ins.setAttribute('data-ad-slot', slot);
        ins.setAttribute('data-ad-format', format);
        ins.setAttribute('data-full-width-responsive', responsive ? "true" : "false");
        
        container.appendChild(ins);

        if (typeof window !== 'undefined') {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      }
    } catch (err: any) {
      console.warn('AdSense error:', err.message);
    }
  }, [slot, format, responsive]);

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
        minHeight: '50px' // CLS対策
      }}
    />
  );
});
