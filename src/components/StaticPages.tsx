import React from 'react';
import { Map, Search, MapPin, Trophy, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

interface PageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<PageProps> = ({ onNavigate }) => {
  return (
    <div className="static-page-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', borderBottom: '3px solid #ff6897', paddingBottom: '10px' }}>🗺️ このサイトについて</h1>
      <div style={{ lineHeight: '1.8', color: '#334155', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p>「トリプルデートマップ」は、指原莉乃プロデュースのアイドルグループ「＝LOVE（イコラブ）」「≠ME（ノイミー）」「≒JOY（ニアジョイ）」のメンバーが訪れたミュージックビデオ（MV）ロケ地、イベント会場、番組ロケ地等の聖地を検索・記録できる非公式の聖地巡礼ファンメディアです。</p>
        
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>📌 サイトの目的</h2>
          <p>当サイトは、イコノイジョイの楽曲や映像作品の魅力をより深く体験し、ファン同士が安全かつマナーを守って聖地巡礼を楽しめる文化の活性化を目的として運営されています。作品の背景や現地の見どころ、アクセス、訪問時のマナーを分かりやすく整理・提供します。</p>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>👤 運営者情報</h2>
          <p>当サイトは、個人のファン・開発者である<strong>「れつぴ」</strong>（運営事務局）によって企画・開発・運営されています。<br/>
          連絡先SNS：<a href="https://x.com/ikonoijoy_tools" target="_blank" rel="noopener noreferrer" style={{ color: '#ff6897', textDecoration: 'underline', fontWeight: 'bold' }}>@ikonoijoy_tools (X)</a></p>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>⚠️ 非公式ファンサイトであることの明記</h2>
          <p>当サイトは個人が運営する<strong>非公式ファンサイト</strong>であり、各グループの所属事務所（代々木アニメーション学院等）、所属レコード会社（ソニー・ミュージックエンタテインメント、キングレコード等）、および各自治体・施設・店舗の運営元とは一切関係ありません。</p>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>📋 情報収集と掲載方針（公式情報と独自調査の区別）</h2>
          <p>当サイトでは、公式YouTube動画、公式SNS、CDブックレット等の公表資料を最優先の根拠とし、管理者が現地景観や施設公式情報と照合する「独自調査」を行ってロケ地を特定・掲載しています。個人のSNSやブログのみの噂情報は掲載せず、特定根拠が不十分な場所は確認待ちとしています。詳細は<a href="#" onClick={(e) => { e.preventDefault(); onNavigate('/editorial-policy'); }} style={{ color: '#ff6897', textDecoration: 'underline', fontWeight: 'bold' }}>編集方針ページ</a>をご覧ください。</p>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>🔄 誤情報の修正と更新方針</h2>
          <p>ロケ地情報や施設情報（営業時間、利用可否、移転等）は定期的に見直しを行っています。万が一掲載内容に誤りがある場合や施設の営業状況に変更が生じた場合は、ユーザー様からのご指摘を受け付け、速やかに調査・修正履歴の更新を行います。<a href="#" onClick={(e) => { e.preventDefault(); onNavigate('/contact'); }} style={{ color: '#ff6897', textDecoration: 'underline', fontWeight: 'bold' }}>お問い合わせフォーム</a>よりご連絡ください。</p>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>📰 広告掲載方針</h2>
          <p>当サイトはサーバー維持費および現地調査・取材等の運営費用の一部を補うため、Google AdSenseをはじめとする第三者配信広告を掲載する場合があります。コンテンツの閲覧性を損なわない適切な配置に努め、薄いページや規約上不適切なページには広告を配信しません。</p>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>🛡️ 権利者様からの連絡窓口</h2>
          <p>当サイトは著作権および肖像権の尊重を徹底しております。掲載内容（文章・画像・リンク等）に関して権利者様より削除・修正のご要望がございましたら、権利関係を確認の上、速やかに対応いたします。<a href="#" onClick={(e) => { e.preventDefault(); onNavigate('/contact'); }} style={{ color: '#ff6897', textDecoration: 'underline', fontWeight: 'bold' }}>お問い合わせ窓口</a>よりご連絡いただけますようお願い申し上げます。</p>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '30px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={() => onNavigate('/editorial-policy')} style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>編集方針を見る</button>
        <button onClick={() => onNavigate('/')} style={{ background: 'linear-gradient(135deg, #ff6897 0%, #a78bfa 100%)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>マップへ戻る</button>
      </div>
    </div>
  );
};

export const EditorialPolicyPage: React.FC<PageProps> = ({ onNavigate }) => {
  return (
    <div className="static-page-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', borderBottom: '3px solid #ff6897', paddingBottom: '10px' }}>📜 編集方針・ファクトチェック指針</h1>
      <div style={{ lineHeight: '1.8', color: '#334155', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p>「トリプルデートマップ」では、正確で信頼性の高い聖地巡礼情報を提供し、ファンが安心して訪問できるようにするため、以下の編集方針・検証基準を厳格に定めて運営しています。</p>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>1. 公式情報および施設公式情報の優先</h2>
          <p>作品に紐づく聖地の特定においては、各グループの公式YouTube動画、公式SNS、公式ファンクラブ等の一次情報を最優先の調査元とします。また、施設名や所在地、利用条件の確認には、自治体や施設・店舗の公式サイト・公式発表資料を用います。</p>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>2. 個人ブログやSNSの噂のみを根拠にしない</h2>
          <p>個人のブログ、掲示板、SNSの投稿のみを根拠としてスポットを「確定聖地」として登録することはありません。必ず公式MVや動画の映像シーンと、国土地理院地図・ストリートビュー・自治体資料・現地写真等の客観的特徴を多角的に比較照合した上で登録します。</p>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>3. 場所を特定できない情報は「確認待ち」とする</h2>
          <p>映像に登場しても、具体的な施設名や公道上の位置が特定できない場合、または類似の風景が多く確証が得られない場所は登録せず、十分な照合情報が揃うまで「確認待ち」として扱います。推測や未確認情報を事実であるかのように掲載することはありません。</p>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>4. 住所・座標・施設名を公開前に多重照合</h2>
          <p>すべてのスポットは、公開前に正式な施設名称、正確な所在地住所（郵便番号・都道府県・市区町村）、および地図座標（緯度・経度）を公的データベースや自治体情報と照合して設定しています。私有地や立ち入り禁止区域にピンが置かれないよう配慮しています。</p>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>5. 誤りが判明した場合は速やかに修正履歴を反映</h2>
          <p>店舗の閉店、建物の解体、施設の利用規則変更、または特定箇所の誤りが判明した場合は、速やかにデータベースを修正し、必要に応じて更新日や注意事項を更新します。</p>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>6. 画像・動画の著作権・権利関係の尊重</h2>
          <p>公式MVの紹介にはYouTube公式の標準埋め込みプレイヤーを使用し、公式動画の再生数が正当にカウントされる仕様を遵守しています。私有地や撮影専用スタジオ等の掲載にあたっては、敷地外からの見学マナーや注意事項を明記し、権利者・近隣住民への迷惑防止を徹底します。</p>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '30px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={() => onNavigate('/about')} style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>このサイトについてへ</button>
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
              <td style={{ padding: '12px' }}>トリプルデートマップ運営事務局（管理人：れつぴ）</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>サイト運営の目的</td>
              <td style={{ padding: '12px' }}>=LOVE, ≠ME, ≒JOYの魅力をより多くの人に広め、聖地巡礼を楽しむファンを増やすこと。</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>管理人連絡先 (SNS)</td>
              <td style={{ padding: '12px' }}>
                <a href="https://x.com/ikonoijoy_tools" target="_blank" rel="noopener noreferrer" style={{ color: '#ff6897', textDecoration: 'underline', fontWeight: 'bold' }}>@ikonoijoy_tools (X)</a>
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

        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '10px 0 0 0' }}>4. 広告の配信およびCookie（クッキー）について</h2>
        <ul style={{ margin: '0 0 0 20px', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li>当サービスは、第三者配信の広告サービス（Google AdSense等）を利用しています。</li>
          <li>Googleなどの広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookie（クッキー）を使用することがあります。ユーザーは<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#ff6897' }}>Googleの広告設定</a>でパーソナライズ広告を無効に設定できます。</li>
          <li>当サービスではトラフィックデータの収集のためにアクセス解析ツール（Google Analytics、Vercel Analytics等）を使用しています。これらはCookieを使用しますが、データは匿名で収集されており、個人を特定するものではありません。</li>
        </ul>

        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: '10px 0 0 0' }}>5. アフィリエイトプログラムに関する表記</h2>
        <ul style={{ margin: '0 0 0 20px', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li>当サービスは、各種アフィリエイトプログラム（じゃらんnet、楽天トラベル、A8.net等のアフィリエイトサービスプロバイダ）に参加しています。</li>
          <li>当サイトで紹介する一部のリンクを経由して宿泊予約や旅行商品の申し込みが行われた場合、当サービスに紹介料が支払われることがあります。</li>
          <li>提携リンクを含むコンテンツにおいては、利用者の皆様への透明性を確保するため「PR」「プロモーション」等の表記を行い、適切な属性（rel="sponsored"）を設定しています。</li>
          <li>紹介している宿泊施設・交通機関・旅行プラン等の契約・購入および利用に関しては、各提携先事業者の利用規約およびプライバシーポリシーが適用されます。</li>
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
