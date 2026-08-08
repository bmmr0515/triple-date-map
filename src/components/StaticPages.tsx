import React from 'react';
import { Map, Search, MapPin, Trophy, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

interface PageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<PageProps> = ({ onNavigate }) => {
  return (
    <div className="static-page-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', borderBottom: '3px solid #ff6897', paddingBottom: '10px' }}>🗺️ このサイトについて</h1>
      <div style={{ lineHeight: '1.8', color: '#334155', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p>「トリプルデートマップ」は、=LOVE（イコラブ）、≠ME（ノイミー）、≒JOY（ニアジョイ）のメンバーが訪れたロケ地や聖地を検索・共有できる非公式の聖地巡礼メディアサイトです。</p>
        
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '16px' }}>📌 サイトの目的</h2>
        <p>当サイトは、ファン同士の交流や聖地巡礼文化の活性化を目的として運営されています。公式の情報や映像をもとに、ファン目線での詳細な解説や巡礼の際の注意点を提供し、安心・安全で楽しい巡礼ライフをサポートします。</p>

        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '16px' }}>📌 掲載情報の確認方針</h2>
        <p>掲載されている聖地情報は、公式YouTube動画、公式SNS、および当サイト運営者や有志のファンによる現地確認情報をもとに作成しています。情報は可能な限り正確に保つよう努めておりますが、店舗の移転・閉店や施設の状況変化により、最新の情報と異なる場合があります。訪問の際は事前にお調べいただくようお願いいたします。</p>

        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '16px' }}>⚠️ 非公式ファンサイトであることの明記</h2>
        <p>当サイトは個人が運営する<strong>非公式のファンサイト</strong>であり、各グループの所属事務所、関連レコード会社、および各自治体・施設運営者とは一切関係がありません。お問い合わせは当サイトの窓口へお願いいたします。</p>
      </div>
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button onClick={() => onNavigate('/')} style={{ background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>マップへ戻る</button>
      </div>
    </div>
  );
};

export const ProfilePage: React.FC<PageProps> = ({ onNavigate }) => {
  return (
    <div className="static-page-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', borderBottom: '3px solid #ff6897', paddingBottom: '10px' }}>👤 運営者情報</h1>
      <div style={{ lineHeight: '1.8', color: '#334155', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontWeight: 'bold', width: '30%' }}>運営者名</td>
              <td style={{ padding: '12px' }}>トリプルデートマップ運営事務局（管理人：しょこわき）</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>サイト運営の目的</td>
              <td style={{ padding: '12px' }}>=LOVE, ≠ME, ≒JOYの魅力をより多くの人に広め、聖地巡礼を楽しむファンを増やすこと。</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>管理人連絡先 (SNS)</td>
              <td style={{ padding: '12px' }}>
                <a href="https://x.com/shoko_wakichan" target="_blank" rel="noopener noreferrer" style={{ color: '#ff6897', textDecoration: 'underline', fontWeight: 'bold' }}>@shoko_wakichan (X)</a>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>更新方針</td>
              <td style={{ padding: '12px' }}>新曲のMVロケ地が公開された際や、番組等で新しい聖地が判明した際に随時更新を行います。また、ユーザーの皆様からの情報提供や修正依頼に基づき、定期的にメンテナンスを行っています。</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>お問い合わせ先</td>
              <td style={{ padding: '12px' }}>お気づきの点や修正依頼がございましたら、<a href="#" onClick={(e) => { e.preventDefault(); onNavigate('/contact'); }} style={{ color: '#ff6897', textDecoration: 'underline' }}>お問い合わせフォーム</a>よりご連絡ください。</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button onClick={() => onNavigate('/')} style={{ background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>マップへ戻る</button>
      </div>
    </div>
  );
};

export const DisclaimerPage: React.FC<PageProps> = ({ onNavigate }) => {
  return (
    <div className="static-page-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', borderBottom: '3px solid #ff6897', paddingBottom: '10px' }}>⚖️ 免責事項</h1>
      <div style={{ lineHeight: '1.8', color: '#334155', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p>当サイトをご利用いただくにあたり、以下の事項についてあらかじめご了承ください。</p>
        
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '16px' }}>1. 情報の正確性について</h2>
        <p>当サイトに掲載されている情報（スポットの位置情報、営業時間、解説等）は、個人が独自に調査したものであり、その完全性や正確性を永久に保証するものではありません。施設の移転や営業状況の変更などにより、実際の情報と異なる場合があります。</p>

        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '16px' }}>2. 公式情報の確認</h2>
        <p>紹介している店舗や施設の営業時間、定休日、入場制限等は、予告なく変更される場合があります。実際に現地を訪れる際には、必ず事前に店舗や施設の公式サイト、公式SNSアカウント等の最新情報をご確認ください。</p>

        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '16px' }}>3. トラブル・損害への責任</h2>
        <p>当サイトの利用、または当サイトが紹介するスポットへの訪問に関連して発生したあらゆるトラブル、損害（事故、盗難、第三者との紛争等）について、当サイト運営者は一切の責任を負いかねます。</p>

        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '16px' }}>4. 迷惑行為の禁止</h2>
        <p>ロケ地や聖地には、公共の場所、住宅街、現役の学校、営業中の店舗などが含まれます。近隣住民への迷惑行為、私有地への無断立ち入り、大声で騒ぐ行為、施設の営業を妨げる行為などは絶対にやめてください。各自がファンとしてのマナーを厳守するようお願い申し上げます。</p>
      </div>
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button onClick={() => onNavigate('/')} style={{ background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>マップへ戻る</button>
      </div>
    </div>
  );
};

export const CopyrightPage: React.FC<PageProps> = ({ onNavigate }) => {
  return (
    <div className="static-page-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', borderBottom: '3px solid #ff6897', paddingBottom: '10px' }}>🛡️ 著作権・権利者への配慮</h1>
      <div style={{ lineHeight: '1.8', color: '#334155', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p>当サイトは、著作権や肖像権などの知的財産権の尊重を第一に考えて運営されています。</p>
        
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '16px' }}>1. 非公式ファンサイトの立ち位置</h2>
        <p>当サイトは非公式のファンサイトであり、=LOVE、≠ME、≒JOY、所属事務所（代々木アニメーション学院等）、およびレコード会社、各施設関係者とは一切関係がありません。掲載されている解説文章や独自アセットの権利は当サイトに帰属します。</p>

        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '16px' }}>2. 権利物の使用と尊重</h2>
        <p>当サイト内のYouTube動画埋め込みは、YouTube公式が提供する共有・埋め込み機能を利用しており、元のコンテンツ制作者（公式チャンネル）の権利を害することなく、再生数を適切に反映する形で掲載されています。また、紹介している画像の権利は各権利所有者に帰属します。権利を侵害する意図は一切ございません。</p>

        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '16px' }}>3. 修正・削除の依頼について</h2>
        <p>掲載されているテキスト、データ、画像等において、事実と異なる記述や権利上の問題がございましたら、速やかに対応（修正または削除）させていただきます。大変お手数ですが、<a href="#" onClick={(e) => { e.preventDefault(); onNavigate('/contact'); }} style={{ color: '#ff6897', textDecoration: 'underline' }}>お問い合わせフォーム</a>より詳細（対象URL、権利を証明するもの等）をご連絡ください。</p>
      </div>
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button onClick={() => onNavigate('/')} style={{ background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>マップへ戻る</button>
      </div>
    </div>
  );
};

export const GuidePage: React.FC<PageProps> = ({ onNavigate }) => {
  return (
    <div className="static-page-container" style={{ maxWidth: '850px', margin: '40px auto', padding: '32px 24px', background: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)', border: '1px solid #f1f5f9' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '950', color: '#0f172a', marginBottom: '24px', borderBottom: '3.5px solid #ff6897', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🔰 初めての方向けガイド
      </h1>
      
      <div style={{ lineHeight: '1.8', color: '#334155', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <p style={{ fontSize: '14.5px', color: '#475569', margin: 0 }}>
          「トリプルデートマップ」をご利用いただきありがとうございます！当サイトは、イコノイジョイ（=LOVE、≠ME、≒JOY）のメンバーが活動の軌跡を残した聖地やロケ地を楽しく巡るための非公式ファンコミュニティサイトです。
        </p>
        
        {/* 🗺️ 機能カードグリッド */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✨ 主な機能と楽しみ方
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            
            {/* カード1: マップ */}
            <div style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#ffe4e6', color: '#ff6897', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                  <Map size={20} />
                </div>
                <strong style={{ fontSize: '14.5px', color: '#0f172a', fontWeight: 'bold' }}>聖地マップの活用</strong>
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                地図上で視覚的に聖地を探すことができます。ピンをタップすると詳細画面が表示され、関連MVをその場で再生できます。
              </p>
            </div>

            {/* カード2: 検索 */}
            <div style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                  <Search size={20} />
                </div>
                <strong style={{ fontSize: '14.5px', color: '#0f172a', fontWeight: 'bold' }}>スポット検索と絞り込み</strong>
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                スポット名だけでなく、関連する楽曲や作品名、エリア（都道府県）で聖地を絞り込んで効率よく探せます。
              </p>
            </div>

            {/* カード3: チェックイン */}
            <div style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#f3e8ff', color: '#7c3aed', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                  <MapPin size={20} />
                </div>
                <strong style={{ fontSize: '14.5px', color: '#0f172a', fontWeight: 'bold' }}>GPSチェックイン</strong>
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                聖地を実際に訪れた際、スマートフォンなどのGPSを使って「チェックイン」を行い、自分の訪問履歴を記録できます。
              </p>
            </div>

            {/* カード4: 称号 */}
            <div style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#fef3c7', color: '#d97706', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                  <Trophy size={20} />
                </div>
                <strong style={{ fontSize: '14.5px', color: '#0f172a', fontWeight: 'bold' }}>称号コレクション</strong>
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                特定のミッション（例：「この空がトリガー」の聖地巡礼）をクリアすると、プロフィールに設定できるユニークな「称号」を獲得できます！
              </p>
            </div>

          </div>
        </div>

        {/* 🚨 聖地巡礼のマナー（アラート風ボックス） */}
        <div style={{ background: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '20px', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '900', color: '#b45309', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={22} style={{ color: '#d97706' }} /> 🚨 聖地巡礼のマナー（必ずお読みください）
          </h2>
          <p style={{ fontSize: '13px', color: '#78350f', margin: 0, lineHeight: '1.7' }}>
            多くの聖地は一般の住民の方が暮らしている地域や、学校、他のお客様が利用される商業施設です。トラブルを起こさず、巡礼を長く楽しむために以下のルールを守りましょう。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
              <XCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#991b1b', display: 'block' }}>私有地や学校へ無断で立ち入らない</strong>
                <span style={{ color: '#78350f' }}>撮影スタジオや現役の学校など、見学不可の場所は敷地外からそっと眺めるだけにしましょう。</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
              <XCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#991b1b', display: 'block' }}>一般の方の写り込みに配慮する</strong>
                <span style={{ color: '#78350f' }}>現地で写真を撮影する際は、通行人や他の利用者の顔が映らないよう配慮し、モザイク処理等を施してください。</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
              <XCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#991b1b', display: 'block' }}>大声での会話や長時間の占有を避ける</strong>
                <span style={{ color: '#78350f' }}>改札付近や狭い生活道路などでは、一般の方の通行の妨げにならないよう短時間で譲り合って撮影を済ませましょう。</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
              <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#065f46', display: 'block' }}>ゴミは必ず持ち帰る・現地の店舗を利用する（恩返し巡礼）</strong>
                <span style={{ color: '#78350f' }}>現地の発展のためにも、カフェや飲食店が聖地の場合はマナーよく注文し、お金を落とす巡礼を心がけましょう。</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '36px' }}>
        <button onClick={() => onNavigate('/')} style={{ background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '24px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,104,151,0.2)', transition: 'transform 0.2s' }}>
          マップを始める！
        </button>
      </div>
    </div>
  );
};

export const PrivacyPageContent: React.FC<PageProps> = ({ onNavigate }) => {
  return (
    <div className="static-page-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', borderBottom: '3px solid #ff6897', paddingBottom: '10px' }}>📜 プライバシーポリシー</h1>
      
      <div style={{ fontSize: '11.5px', color: '#9f1239', lineHeight: '1.7', background: '#fff1f2', padding: '18px', borderRadius: '16px', border: '1.5px solid #ffe4e6', fontWeight: '900', marginBottom: '28px' }}>
        💡 免責事項（非公式宣言）<br />
        本サービス「トリプルデートマップ」（以下「本サービス」）は、=LOVE / ≠ME / ≒JOY（以下「イコノイジョイ」）および各公式運営・所属事務所・権利者とは一切関係のない非公式サービスです。ファン有志によって提供されています。
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '13px', color: '#334155', lineHeight: '1.8' }}>
        <p>『トリプルデートマップ』は、ユーザーの個人情報の取扱いおよびセキュリティについて、以下のとおり定めます。</p>

        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '10px 0 0 0' }}>1. 収集する情報</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <strong style={{ color: '#0f172a', display: 'block' }}>● メール/パスワード登録時に収集する情報：</strong>
            <span>アカウント登録時にご入力いただいた以下の情報を収集します。これらの情報は認証サービス「Supabase」（米国）のクラウドサーバーに保存されます。</span>
            <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
              <li>メールアドレス</li>
              <li>ニックネーム（表示名）</li>
              <li>推しグループ（=LOVE / ≠ME / ≒JOY / 合同）</li>
              <li>獲得称号・設定中の称号</li>
            </ul>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>※パスワードはSupabase側でハッシュ化（暗号化）されており、本サービス運営者が平文で参照することはできません。</span>
          </div>
          <div>
            <strong style={{ color: '#0f172a', display: 'block' }}>● X（Twitter）ログイン時に収集する情報：</strong>
            <span>XのOAuth 2.0認証を経由してログインした場合、Xプラットフォームから提供される「メールアドレス」「表示名」のみを取得します。</span>
          </div>
          <div>
            <strong style={{ color: '#0f172a', display: 'block' }}>● 位置情報（GPSデータ）：</strong>
            <span>「チェックイン機能」を利用する際、ユーザーの現在地情報を一時的に取得します。この情報は距離判定にのみ使用され、移動履歴としてサーバーに保存・追跡されることはありません。</span>
          </div>
          <div>
            <strong style={{ color: '#0f172a', display: 'block' }}>● チェックイン記録・利用データ：</strong>
            <span>チェックイン履歴（巡礼記録）は<strong>お使いの端末のブラウザ内（localStorage）にのみ保存</strong>されます。クラウドサーバーへの送信は行っておりません。</span>
          </div>
        </div>

        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '10px 0 0 0' }}>2. 利用目的</h2>
        <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
          <li>本サービスの提供・維持、およびアカウント認証（ログイン）管理のため</li>
          <li>GPSを利用した距離判定、およびチェックイン機能の提供のため</li>
          <li>ユーザーサポートおよびお問い合わせ対応のため</li>
          <li>サービスの利用状況分析および機能改善のため</li>
        </ul>

        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '10px 0 0 0' }}>3. 情報の管理と外部サービスの利用</h2>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', fontSize: '12px' }}>
          <strong style={{ display: 'block', marginBottom: '4px' }}>🔐 認証サービス：Supabase（Supabase Inc. / 米国）</strong>
          <ul style={{ margin: '4px 0 0 16px', padding: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <li>アカウント登録・ログイン認証の管理に使用しています。</li>
            <li>Supabaseのプライバシーポリシー：<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#ff6897' }}>https://supabase.com/privacy</a></li>
          </ul>
        </div>

        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '10px 0 0 0' }}>4. 広告・アクセス解析ツールの利用について</h2>
        <ul style={{ margin: '0 0 0 20px', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li>当サービスは、第三者配信の広告サービス（Google AdSense）を利用しています。</li>
          <li>Googleなどの広告配信事業者は、Cookie（クッキー）を使用して、ユーザーが当サイトや他のウェブサイトに過去にアクセスした際の情報に基づき、適切な広告を配信します。ユーザーはGoogleの広告設定でパーソナライズ広告を無効にできます。</li>
          <li>当サービスではトラフィックデータの収集のためにアクセス解析ツール（Google Analytics、Vercel Analytics等）を使用しています。これらはCookieを使用しますが、データは匿名で収集されており、個人を特定するものではありません。</li>
        </ul>
      </div>
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button onClick={() => onNavigate('/')} style={{ background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>マップへ戻る</button>
      </div>
    </div>
  );
};

export const TermsPageContent: React.FC<PageProps> = ({ onNavigate }) => {
  return (
    <div className="static-page-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', borderBottom: '3px solid #ff6897', paddingBottom: '10px' }}>⚖️ 利用規約</h1>
      
      <div style={{ fontSize: '11.5px', color: '#9f1239', lineHeight: '1.7', background: '#fff1f2', padding: '18px', borderRadius: '16px', border: '1.5px solid #ffe4e6', fontWeight: '900', marginBottom: '28px' }}>
        💡 重要（免責事項）<br />
        本サービス「トリプルデートマップ」（以下「本サービス」）は、=LOVE / ≠ME / ≒JOY（以下「イコノイジョイ」）および各公式運営・所属事務所・権利者とは一切関係のない非公式ファンサービスです。
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '13px', color: '#334155', lineHeight: '1.8' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>第1条（規約の適用）</h3>
          <p style={{ margin: 0 }}>本規約は、本サービスを利用するすべてのユーザーに適用されます。ユーザーは、本サービスを利用することにより、本規約に同意したものとみなされます。</p>
        </div>

        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>第2条（位置情報（GPS）及びチェックイン）</h3>
          <p style={{ margin: 0 }}>本サービスは、GPS機能を利用した聖地へのチェックイン機能を提供します。GPSの精度や通信環境等により、正しく行えない場合があります。これにより発生した不都合や損害について、本サービスは一切の責任を負いません。</p>
        </div>

        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>第3条（聖地巡礼のマナーと自己責任）</h3>
          <p style={{ margin: 0 }}>聖地巡礼にあたっては、近隣住人への配慮、ルール遵守、公共マナーを厳守してください。トラブルが発生した場合、本サービスおよび運営者は一切の責任を負いません。すべて自己責任での行動をお願いいたします。</p>
        </div>

        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>第4条（サービス内容の変更・終了）</h3>
          <p style={{ margin: 0 }}>本サービスはファン有志により運営されており、事前通告なしに内容を変更、一時中断、または終了することがあります。これによって生じたユーザーの損害について、一切の補償や責任を負いかねます。</p>
        </div>

        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>第5条（データの保存について）</h3>
          <p style={{ margin: 0 }}>ユーザーのチェックイン履歴は、お使いの端末ブラウザ内（localStorage）にのみ保存されます。キャッシュクリア等によるデータの消失について、本サービスは復旧等の対応を行えません。</p>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button onClick={() => onNavigate('/')} style={{ background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>利用規約に同意して戻る</button>
      </div>
    </div>
  );
};
