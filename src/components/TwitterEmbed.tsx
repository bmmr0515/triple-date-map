import React, { useEffect, useRef } from 'react';

interface TwitterEmbedProps {
  url: string;
}

export const TwitterEmbed: React.FC<TwitterEmbedProps> = ({ url }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTwitterWidget = () => {
      // @ts-ignore
      if (window.twttr && window.twttr.widgets) {
        // @ts-ignore
        window.twttr.widgets.load(containerRef.current);
      } else {
        const existingScript = document.getElementById('twitter-wjs');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'twitter-wjs';
          script.setAttribute('src', 'https://platform.twitter.com/widgets.js');
          script.setAttribute('charset', 'utf-8');
          script.setAttribute('async', 'true');
          document.body.appendChild(script);

          script.onload = () => {
            // @ts-ignore
            if (window.twttr && window.twttr.widgets) {
              // @ts-ignore
              window.twttr.widgets.load(containerRef.current);
            }
          };
        } else {
          // すでにスクリプトタグが存在するが、グローバルオブジェクトがまだロードしきっていない場合
          const interval = setInterval(() => {
            // @ts-ignore
            if (window.twttr && window.twttr.widgets) {
              // @ts-ignore
              window.twttr.widgets.load(containerRef.current);
              clearInterval(interval);
            }
          }, 100);
          setTimeout(() => clearInterval(interval), 3000);
        }
      }
    };

    loadTwitterWidget();
  }, [url]);

  return (
    <div 
      ref={containerRef} 
      className="twitter-embed-container" 
      style={{ 
        margin: '16px 0', 
        minHeight: '150px', 
        display: 'flex', 
        justifyContent: 'center',
        width: '100%'
      }}
    >
      <blockquote className="twitter-tweet" data-lang="ja" data-theme="light" style={{ width: '100%', maxWidth: '550px' }}>
        <a href={url}>{url}</a>
      </blockquote>
    </div>
  );
};
