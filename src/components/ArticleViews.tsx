import React from 'react';
import { Article } from '../articles';
import { Spot } from '../db';
import { Breadcrumb } from './ListViews';
import { AdPlaceholder } from './AdPlaceholder';
import { Calendar, Tag, ArrowRight, BookOpen, Quote, MapPin, Eye } from 'lucide-react';

interface ArticlesListProps {
  articles: Article[];
  onNavigate: (path: string) => void;
}

interface ArticleDetailProps {
  article: Article;
  allSpots: Spot[];
  onNavigate: (path: string) => void;
  onViewOnMap: (spot: Spot) => void;
}

// 簡易テキストパーサー (マークダウンの見出しと引用ブロックをパースして React 要素にする)
const parseContentToReact = (content: string): React.ReactNode => {
  const paragraphs = content.split('\n\n');
  
  return paragraphs.map((para, pIdx) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    // 1. 見出しの処理 (###, #### 等)
    if (trimmed.startsWith('####')) {
      const text = trimmed.replace(/^####\s*/, '');
      return (
        <h4 key={pIdx} style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginTop: '24px', marginBottom: '8px', borderLeft: '3px solid #ff6897', paddingLeft: '8px' }} dangerouslySetInnerHTML={{ __html: text }} />
      );
    }
    if (trimmed.startsWith('###')) {
      const text = trimmed.replace(/^###\s*/, '');
      return (
        <h3 key={pIdx} style={{ fontSize: '17px', fontWeight: '900', color: '#0f172a', marginTop: '28px', marginBottom: '12px', background: 'linear-gradient(120deg, #fff5f5 0%, #fff 100%)', borderLeft: '4px solid #ff6897', padding: '6px 12px', borderRadius: '4px' }} dangerouslySetInnerHTML={{ __html: text }} />
      );
    }
    if (trimmed.startsWith('##')) {
      const text = trimmed.replace(/^##\s*/, '');
      return (
        <h2 key={pIdx} style={{ fontSize: '19px', fontWeight: '900', color: '#0f172a', marginTop: '32px', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }} dangerouslySetInnerHTML={{ __html: text }} />
      );
    }

    // 2. 引用ブロックの処理 (>)
    if (trimmed.startsWith('>')) {
      const quoteHtml = trimmed.split('\n').map(line => line.replace(/^>\s*/, '')).join('<br />');
      return (
        <blockquote key={pIdx} style={{ margin: '20px 0', padding: '16px 20px', background: '#f8fafc', borderLeft: '4px solid #a78bfa', borderRadius: '0 12px 12px 0', fontStyle: 'italic', color: '#475569', display: 'flex', gap: '8px' }}>
          <Quote size={20} style={{ color: '#a78bfa', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13.5px', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: quoteHtml }} />
        </blockquote>
      );
    }

    // 3. 通常の段落 (複数行含む改行を考慮)
    const paragraphHtml = trimmed.replace(/\n/g, '<br />');
    return (
      <p key={pIdx} style={{ fontSize: '14.5px', lineHeight: '1.9', color: '#334155', margin: '0 0 16px 0', textJustify: 'inter-character', textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: paragraphHtml }} />
    );
  });
};

// 1. コラム・レポート一覧ページ
export const ArticlesListPage: React.FC<ArticlesListProps> = ({ articles, onNavigate }) => {
  return (
    <div style={{ maxWidth: '850px', margin: '40px auto', padding: '24px' }}>
      <Breadcrumb items={[{ name: '巡礼コラム・レポート' }]} onNavigate={onNavigate} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', borderBottom: '3.5px solid #ff6897', paddingBottom: '12px' }}>
        <BookOpen size={26} style={{ color: '#ff6897' }} />
        <h1 style={{ fontSize: '24px', fontWeight: '950', color: '#0f172a', margin: 0 }}>
          📚 聖地巡礼コラム・レポート
        </h1>
      </div>

      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
        イコノイジョイのミュージックビデオ撮影地や、ライブ会場などの聖地巡礼をもっと楽しむための、詳細レポートや背景解説コラム集です。AdSense広告や独自の取材をもとに随時更新中！
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {articles.map(article => (
          <article 
            key={article.slug} 
            className="article-card" 
            style={{ 
              background: '#fff', 
              padding: '24px', 
              borderRadius: '20px', 
              border: '1px solid #f1f5f9', 
              boxShadow: '0 4px 15px rgba(15, 23, 42, 0.02)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 'bold', 
                color: article.category === 'レポート' ? '#0284c7' : article.category === '聖地解説' ? '#7c3aed' : '#d97706', 
                background: article.category === 'レポート' ? '#e0f2fe' : article.category === '聖地解説' ? '#f3e8ff' : '#fef3c7', 
                padding: '4px 10px', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Tag size={12} /> {article.category}
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> {article.publishedAt}
              </span>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '4px 0 0 0', lineHeight: '1.4' }}>
              <a 
                href={`/articles/${article.slug}`} 
                onClick={(e) => { e.preventDefault(); onNavigate(`/articles/${article.slug}`); }}
                style={{ color: '#0f172a', textDecoration: 'none', transition: 'color 0.2s' }}
              >
                {article.title}
              </a>
            </h2>

            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {article.excerpt}
            </p>

            <a 
              href={`/articles/${article.slug}`} 
              onClick={(e) => { e.preventDefault(); onNavigate(`/articles/${article.slug}`); }}
              style={{ 
                alignSelf: 'flex-end', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px', 
                textDecoration: 'none', 
                background: '#f1f5f9', 
                color: '#0f172a', 
                padding: '8px 16px', 
                borderRadius: '10px', 
                fontSize: '12px', 
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              記事を読む <ArrowRight size={14} />
            </a>
          </article>
        ))}
      </div>
    </div>
  );
};

// 2. コラム詳細ページ
export const ArticleDetailView: React.FC<ArticleDetailProps> = ({ article, allSpots, onNavigate, onViewOnMap }) => {
  // 関連スポットの取得
  const relatedSpots = allSpots.filter(s => article.relatedSpotIds?.includes(s.id) && s.status === 'published');

  // 記事本文の分割（広告の中間挿入用）
  const renderArticleBodyWithAds = () => {
    const rawParagraphs = article.content.split('\n\n');
    const halfIndex = Math.ceil(rawParagraphs.length / 2);
    
    const firstHalf = rawParagraphs.slice(0, halfIndex).join('\n\n');
    const secondHalf = rawParagraphs.slice(halfIndex).join('\n\n');

    return (
      <>
        {/* 前半本文 */}
        {parseContentToReact(firstHalf)}
        
        {/* 記事中間部の広告プレースホルダー */}
        <AdPlaceholder />

        {/* 後半本文 */}
        {parseContentToReact(secondHalf)}
      </>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.03)', border: '1px solid #f1f5f9' }}>
      <Breadcrumb 
        items={[
          { name: '巡礼コラム・レポート', path: '/articles' },
          { name: article.title }
        ]} 
        onNavigate={onNavigate} 
      />

      {/* メタ情報 */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 'bold', 
          color: article.category === 'レポート' ? '#0284c7' : article.category === '聖地解説' ? '#7c3aed' : '#d97706', 
          background: article.category === 'レポート' ? '#e0f2fe' : article.category === '聖地解説' ? '#f3e8ff' : '#fef3c7', 
          padding: '4px 10px', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Tag size={12} /> {article.category}
        </span>
        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={12} /> {article.publishedAt}
        </span>
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: '950', color: '#0f172a', margin: '0 0 24px 0', lineHeight: '1.4', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
        {article.title}
      </h1>

      {/* 記事本文 (広告を中間に挿入してパース) */}
      <div className="article-body" style={{ margin: '24px 0' }}>
        {renderArticleBodyWithAds()}
      </div>

      {/* 記事下部の広告プレースホルダー */}
      <div style={{ margin: '32px 0' }}>
        <AdPlaceholder />
      </div>

      {/* 🔗 関連聖地スポットリンク */}
      {relatedSpots.length > 0 && (
        <div style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: '28px', marginTop: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={18} style={{ color: '#ff6897' }} /> 🚶 この記事に関連する聖地スポット
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {relatedSpots.map(s => (
              <div 
                key={s.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: '16px', 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '16px',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{s.name}</h4>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: s.group === '=LOVE' ? '#ff6897' : s.group === '≠ME' ? '#58ccff' : '#f59e0b', background: '#fff', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                    {s.group}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {s.description.split('⚠️')[0]}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <a 
                    href={`/spots/${s.slug}`} 
                    onClick={(e) => { e.preventDefault(); onNavigate(`/spots/${s.slug}`); }}
                    style={{ flexGrow: 1, textDecoration: 'none', background: '#fff', border: '1.5px solid #cbd5e1', color: '#475569', fontSize: '11px', padding: '6px 0', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <Eye size={12} /> 詳細を見る
                  </a>
                  <button 
                    onClick={() => onViewOnMap(s)}
                    style={{ background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', border: 'none', fontSize: '11px', padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <MapPin size={12} /> 地図
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button 
          onClick={() => onNavigate('/articles')} 
          style={{ background: '#f1f5f9', color: '#0f172a', border: 'none', padding: '12px 28px', borderRadius: '24px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          コラム一覧に戻る
        </button>
      </div>
    </div>
  );
};
