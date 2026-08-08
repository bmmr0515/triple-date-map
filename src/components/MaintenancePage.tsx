import { Wrench, Sparkles, MapPin } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="maintenance-wrapper">
      {/* 🌌 動的な背景グラデーション光 */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      <div className="glow-orb orb-3"></div>

      <div className="maintenance-card">
        {/* 🗺️ マップを象徴するピンとスパナの3D風アニメーションアイコン */}
        <div className="icon-container">
          <div className="map-pin-back anim-float">
            <MapPin className="icon-map-pin" size={64} />
          </div>
          <div className="wrench-overlay anim-rotate">
            <Wrench className="icon-wrench" size={32} />
          </div>
          <div className="sparkle-orb anim-pulse">
            <Sparkles className="icon-sparkles" size={24} />
          </div>
        </div>

        <h1 className="maintenance-title">SYSTEM MAINTENANCE</h1>
        <div className="divider"></div>
        
        <p className="maintenance-message">
          現在、大型アップデートに伴うシステムメンテナンスを実施しています。終了までしばらくお待ちください。
        </p>

        <div className="status-badge">
          <span className="badge-dot"></span>
          <span className="badge-text">DATABASE & MAP SYSTEM UPGRADING</span>
        </div>

        <footer className="maintenance-footer">
          <p className="copyright">&copy; {new Date().getFullYear()} トリプルデート・マップ | イコノイジョイ聖地巡礼</p>
        </footer>
      </div>

      <style>{`
        .maintenance-wrapper {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #060913;
          font-family: 'Outfit', 'Noto Sans JP', sans-serif;
          color: #f8fafc;
          overflow: hidden;
          z-index: 9999999;
          padding: 20px;
        }

        /* 🌌 背景の有機的なグロー発光 */
        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          pointer-events: none;
          z-index: 1;
        }
        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #ff6897 0%, transparent 70%);
          top: -10%;
          left: -10%;
          animation: orbFloat 15s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #7c3aed 0%, transparent 70%);
          bottom: -15%;
          right: -10%;
          animation: orbFloat 20s ease-in-out infinite alternate-reverse;
        }
        .orb-3 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: orbFloat 18s ease-in-out infinite alternate;
        }

        @keyframes orbFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, 40px) scale(1.1); }
        }

        /* 🪟 グラスモフィズムカード */
        .maintenance-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          background: rgba(15, 23, 42, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 48px 32px 32px 32px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          animation: cardSlideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardSlideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 📍 アイコンエリア */
        .icon-container {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto 28px auto;
        }

        .map-pin-back {
          position: absolute;
          top: 10px;
          left: 18px;
          color: #ff6897;
          filter: drop-shadow(0 0 15px rgba(255, 104, 151, 0.6));
        }

        .wrench-overlay {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: #7c3aed;
          color: #fff;
          border-radius: 50%;
          padding: 6px;
          border: 2px solid #060913;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        .sparkle-orb {
          position: absolute;
          top: -2px;
          right: 18px;
          color: #22d3ee;
          filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.8));
        }

        /* アニメーション */
        .anim-float {
          animation: floatY 3s ease-in-out infinite alternate;
        }
        .anim-rotate {
          animation: wrenchRotate 4s cubic-bezier(0.77, 0, 0.175, 1) infinite;
        }
        .anim-pulse {
          animation: pulseGlow 2s ease-in-out infinite alternate;
        }

        @keyframes floatY {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }

        @keyframes wrenchRotate {
          0%, 100% { transform: rotate(0deg); }
          40%, 60% { transform: rotate(45deg); }
          50% { transform: rotate(-15deg); }
        }

        @keyframes pulseGlow {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1.1); opacity: 1; }
        }

        /* 📋 テキストスタイル */
        .maintenance-title {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 0.25em;
          background: linear-gradient(135deg, #fff 30%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 16px;
        }

        .divider {
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, #ff6897, #7c3aed);
          margin: 0 auto 24px auto;
          border-radius: 2px;
        }

        .maintenance-message {
          font-size: 15px;
          line-height: 1.8;
          color: #94a3b8;
          font-weight: 500;
          margin-bottom: 32px;
          text-align: justify;
          text-justify: inter-character;
          word-break: break-all;
        }

        /* 🏷️ ステータスバッジ */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 8px 16px;
          border-radius: 100px;
          margin-bottom: 16px;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background-color: #ff6897;
          border-radius: 50%;
          box-shadow: 0 0 10px #ff6897;
          animation: blink 1.5s infinite ease-in-out;
        }

        .badge-text {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #cbd5e1;
        }

        @keyframes blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        /* 👤 フッター */
        .maintenance-footer {
          margin-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 24px;
        }

        .copyright {
          font-size: 11px;
          color: #475569;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
