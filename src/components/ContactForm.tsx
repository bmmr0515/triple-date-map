import React, { useState, useEffect } from 'react';
import { supabase } from '../auth';
import { ShieldCheck } from 'lucide-react';

interface ContactFormProps {
  onNavigate: (path: string) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('掲載情報の修正');
  const [targetUrl, setTargetUrl] = useState('');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // URLパラメータから自動補正
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    const subjectParam = params.get('subject');
    
    if (urlParam) {
      setTargetUrl(decodeURIComponent(urlParam));
    }
    if (subjectParam) {
      const decodedSubject = decodeURIComponent(subjectParam);
      if (decodedSubject.includes('修正')) {
        setType('掲載情報の修正');
      } else if (decodedSubject.includes('提供')) {
        setType('スポット情報の提供');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert('プライバシーポリシーへの同意が必要です。');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    const inquiryData = {
      name,
      email,
      inquiry_type: type,
      target_url: targetUrl,
      message,
      created_at: new Date().toISOString()
    };

    // 1. Supabase送信を試みる
    if (supabase) {
      try {
        const { error } = await supabase
          .from('contact_inquiries')
          .insert([inquiryData]);
        
        if (!error) {
          setStatus('success');
          return;
        }
        console.warn('Failed to save in Supabase, falling back to mail client:', error);
      } catch (err: any) {
        console.warn('Supabase insert error, falling back to mail client:', err);
      }
    }

    // 2. フォールバック: メールクライアントの起動
    try {
      const mailtoUrl = `mailto:support@tripledatemap.com?subject=${encodeURIComponent(`[問い合わせ] ${type}`)}&body=${encodeURIComponent(
        `お名前: ${name}\nメールアドレス: ${email}\n対象ページURL: ${targetUrl}\n\n【お問い合わせ内容】\n${message}`
      )}`;
      window.location.href = mailtoUrl;
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage('送信処理中にエラーが発生しました。大変お手数ですが、直接 support@tripledatemap.com までメールをお送りください。');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '32px 24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>✉️</span>
        <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '12px' }}>お問い合わせを受け付けました</h1>
        <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '24px' }}>
          お問い合わせいただきありがとうございます。<br />
          内容を確認の上、必要に応じて折り返しご連絡いたします。<br />
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>（※メーラーが起動した場合は、内容を確認のうえ送信ボタンを押してください）</span>
        </p>
        <button onClick={() => onNavigate('/')} style={{ background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>トップに戻る</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', borderBottom: '3px solid #ff6897', paddingBottom: '10px' }}>✉️ お問い合わせ</h1>
      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
        掲載情報の誤りの修正、削除依頼、新規スポットのご提供などはこちらのフォームからご連絡ください。
      </p>

      {status === 'error' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px 16px', borderRadius: '10px', color: '#b91c1c', fontSize: '13px', marginBottom: '20px' }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#475569' }}>お名前 <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：山田 太郎"
            style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#475569' }}>メールアドレス <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="例：taro@example.com"
            style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#475569' }}>お問い合わせ種別 <span style={{ color: '#ef4444' }}>*</span></label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', background: '#fff' }}
          >
            <option>掲載情報の修正</option>
            <option>掲載情報の削除</option>
            <option>スポット情報の提供</option>
            <option>その他</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#475569' }}>対象ページURL</label>
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="例：https://tripledatemap.com/spots/yoyogi-ani"
            style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#475569' }}>お問い合わせ内容 <span style={{ color: '#ef4444' }}>*</span></label>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="詳細をご記入ください。"
            style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '10px 0' }}>
          <input
            type="checkbox"
            id="agree-checkbox"
            required
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ marginTop: '3px', width: '16px', height: '16px' }}
          />
          <label htmlFor="agree-checkbox" style={{ fontSize: '12.5px', color: '#475569', cursor: 'pointer', lineHeight: '1.4' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('/privacy'); }} style={{ color: '#ff6897', textDecoration: 'underline' }}>プライバシーポリシー</a> に同意する
          </label>
        </div>

        <button
          type="submit"
          disabled={status === 'submitting'}
          style={{ background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px', opacity: status === 'submitting' ? 0.7 : 1 }}
        >
          {status === 'submitting' ? '送信中...' : 'お問い合わせを送信'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '10px' }}>
          <ShieldCheck size={14} /> 送信された個人情報は安全に処理され、公開されることはありません。
        </div>
      </form>
    </div>
  );
};
