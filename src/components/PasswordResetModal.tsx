import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { authService, PasswordRecoveryState } from '../auth';

interface PasswordResetModalProps {
  state: PasswordRecoveryState;
  onClose: () => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ state, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(state.error || '');
  const [isSuccess, setIsSuccess] = useState(false);

  // 期限切れ時の再送用ステート
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const isExpired = Boolean(state.error || errorMessage.includes('有効期限') || errorMessage.includes('expired'));

  // パスワード強度の計算
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // 強度スコア (0〜3)
  const strengthScore = [hasMinLength, hasLetter, hasNumber].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // バリデーション
    if (!hasMinLength) {
      setErrorMessage('パスワードは8文字以上で入力してください。');
      return;
    }
    if (!hasLetter || !hasNumber) {
      setErrorMessage('安全性のため、半角英字と数字の両方を含めてください。');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('新しいパスワードと確認用パスワードが一致しません。');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.updatePassword(newPassword);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || 'パスワードの更新に失敗しました。');
      }
    } catch (err: any) {
      setErrorMessage(err.message || '更新処理中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      setErrorMessage('メールアドレスを入力してください。');
      return;
    }

    setIsResending(true);
    setResendMessage('');
    try {
      const res = await authService.resetPasswordForEmail(resendEmail.trim());
      if (res.success) {
        setResendMessage('📩 パスワード再設定メールを送信しました。受信トレイをご確認ください。');
      } else {
        setErrorMessage(res.error || '再送に失敗しました。');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'エラーが発生しました。');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && (isSuccess || isExpired)) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '440px',
          padding: '32px 28px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          border: '1.5px solid #f1f5f9'
        }}
      >
        {/* 右上の閉じるボタン */}
        <button
          onClick={onClose}
          aria-label="閉じる"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f8fafc',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <X size={18} />
        </button>

        {/* 1. 完了画面 */}
        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>
              パスワードを更新しました
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '28px' }}>
              新しいパスワードの設定が正常に完了しました。<br />
              ログイン状態が維持されていますので、そのまま聖地巡礼マップをお楽しみいただけます！
            </p>
            <button
              onClick={onClose}
              className="pop-button"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '14px',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>マップへ戻る</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : isExpired ? (
          /* 2. 有効期限切れ・無効リンク画面 */
          <div style={{ padding: '8px 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}
            >
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', textAlign: 'center', marginBottom: '8px' }}>
              リンクの有効期限が切れています
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', lineHeight: '1.6', marginBottom: '24px' }}>
              セキュリティ保護のため、パスワード再設定リンクは発行から一定時間で無効となります。お手数ですが、再度メールアドレスを入力して再設定リンクを発行してください。
            </p>

            {resendMessage ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>
                {resendMessage}
              </div>
            ) : (
              <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="email"
                  required
                  placeholder="ご登録メールアドレス"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={isResending}
                  className="pop-button"
                  style={{
                    background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    cursor: isResending ? 'not-allowed' : 'pointer',
                    opacity: isResending ? 0.7 : 1
                  }}
                >
                  {isResending ? '送信中...' : '再設定メールを再送する'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* 3. 新しいパスワード入力画面 */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Lock size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                  新しいパスワードの設定
                </h2>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                  新環境で利用する新しいパスワードを入力してください
                </p>
              </div>
            </div>

            {errorMessage && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#ef4444',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* 新しいパスワード */}
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                  新しいパスワード <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="8文字以上の半角英数字"
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示する'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* パスワード強度インジケーター */}
              {newPassword.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: strengthScore >= 1 ? '#f59e0b' : '#e2e8f0' }} />
                    <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: strengthScore >= 2 ? '#10b981' : '#e2e8f0' }} />
                    <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: strengthScore === 3 ? '#059669' : '#e2e8f0' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', color: '#64748b' }}>
                    <span style={{ color: hasMinLength ? '#10b981' : '#94a3b8', fontWeight: hasMinLength ? 'bold' : 'normal' }}>
                      {hasMinLength ? '✓' : '○'} 8文字以上
                    </span>
                    <span style={{ color: (hasLetter && hasNumber) ? '#10b981' : '#94a3b8', fontWeight: (hasLetter && hasNumber) ? 'bold' : 'normal' }}>
                      {(hasLetter && hasNumber) ? '✓' : '○'} 半角英字と数字の両方を含む
                    </span>
                  </div>
                </div>
              )}

              {/* 確認用パスワード */}
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                  新しいパスワード（確認用） <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="もう一度同じパスワードを入力"
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 14px',
                      borderRadius: '12px',
                      border: isMatch
                        ? '1.5px solid #10b981'
                        : confirmPassword.length > 0 && !isMatch
                        ? '1.5px solid #ef4444'
                        : '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'パスワードを隠す' : 'パスワードを表示する'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <span style={{ fontSize: '11px', color: isMatch ? '#10b981' : '#ef4444', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>
                    {isMatch ? '✓ パスワードが一致しています' : '× パスワードが一致していません'}
                  </span>
                )}
              </div>

              {/* 変更実行ボタン */}
              <button
                type="submit"
                disabled={isLoading || !hasMinLength || !isMatch}
                className="pop-button"
                style={{
                  background: (!hasMinLength || !isMatch)
                    ? '#cbd5e1'
                    : 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '13px',
                  borderRadius: '14px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: (isLoading || !hasMinLength || !isMatch) ? 'not-allowed' : 'pointer',
                  opacity: (isLoading || !hasMinLength || !isMatch) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: (hasMinLength && isMatch) ? '0 8px 20px rgba(255, 104, 151, 0.3)' : 'none',
                  marginTop: '8px'
                }}
              >
                {isLoading ? (
                  <span>更新処理中... 🌀</span>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>パスワードを変更する</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordResetModal;
