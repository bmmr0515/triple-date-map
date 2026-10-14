/**
 * 旅行・宿泊系アフィリエイト設定マネージャー
 * - 将来的にじゃらんnet、楽天トラベル、Agoda、A8.net等の提携リンクを安全に一元管理します。
 * - 提携URLが未発行（空文字またはundefined）の場合は自動的に非表示となり、
 *   架空のリンクやダミー広告が公開画面に出力されることはありません。
 */

export interface AffiliateLinkItem {
  id: string;
  serviceName: 'じゃらんnet' | '楽天トラベル' | 'Agoda' | 'A8.net' | 'その他';
  title: string;
  description: string;
  url: string; // ASP発行の正式アフィリエイトURL（未設定時は空文字）
  badgeText?: string;
  targetArea?: string; // 対象エリア（例: "秩父", "湘南・鎌倉", "渋谷・原宿", "全国"）
  relatedCourseSlugs?: string[]; // 関連モデルコースのslug（空の場合はエリア一致または共通）
  isEnabled: boolean; // 有効化フラグ
}

export interface AffiliateConfig {
  disclaimerText: string;
  links: AffiliateLinkItem[];
}

/**
 * アフィリエイト案件マスター設定
 * ※ASPとの提携完了後、各案件の url を設定し isEnabled を true に切り替えることで安全に配信開始できます。
 */
export const AFFILIATE_CONFIG: AffiliateConfig = {
  disclaimerText: '※当サイトはアフィリエイト広告（提携プログラム）を利用しておすすめの宿泊・交通サービスをご紹介しています。',
  links: [
    {
      id: 'jalan-chichibu',
      serviceName: 'じゃらんnet',
      title: '秩父エリアのおすすめ宿泊プラン・温泉宿を探す',
      description: 'サマーツインテール聖地巡礼の前泊・後泊に！西武秩父駅周辺や温泉宿の予約に便利です。',
      url: '', // 正式提携後にURLを設定
      badgeText: '宿泊予約',
      targetArea: '秩父',
      relatedCourseSlugs: ['chichibu-summer-twintail'],
      isEnabled: false
    },
    {
      id: 'rakuten-kamakura',
      serviceName: '楽天トラベル',
      title: '鎌倉・湘南・江ノ島エリアの人気ホテル＆旅館',
      description: '材木座海岸や江ノ島をのんびり巡る聖地旅に。楽天ポイントが貯まる宿泊プラン。',
      url: '', // 正式提携後にURLを設定
      badgeText: '宿泊予約',
      targetArea: '湘南・鎌倉',
      relatedCourseSlugs: ['shonan-kamakura-zaimokuza'],
      isEnabled: false
    },
    {
      id: 'jalan-kyoto',
      serviceName: 'じゃらんnet',
      title: '京都・祇園〜清水寺周辺のホテル・町家ステイ',
      description: 'イコノイジョイchロケ地めぐりを満喫する京都観光の拠点に。',
      url: '', // 正式提携後にURLを設定
      badgeText: '宿泊予約',
      targetArea: '京都',
      relatedCourseSlugs: ['kyoto-gion-kiyomizu', 'kyoto-nishiki-gourmet'],
      isEnabled: false
    },
    {
      id: 'rakuten-okinawa',
      serviceName: '楽天トラベル',
      title: '沖縄・やんばるリゾート＆レンタカー予約',
      description: '『My Voice Is For You』ロケ地やオクマ周辺を快適にドライブ巡礼！',
      url: '', // 正式提携後にURLを設定
      badgeText: 'レンタカー・宿泊',
      targetArea: '沖縄',
      relatedCourseSlugs: ['okinawa-yanbaru-voice'],
      isEnabled: false
    }
  ]
};

/**
 * 指定されたモデルコースやエリアに対応する有効なアフィリエイトリンクを取得
 * - 有効なURL（http://またはhttps://）が設定され、かつ isEnabled が true のものだけを抽出
 */
export const getActiveAffiliateLinks = (courseSlug?: string, area?: string): AffiliateLinkItem[] => {
  return AFFILIATE_CONFIG.links.filter(link => {
    // 1. 有効フラグおよびURLの存在チェック
    if (!link.isEnabled || !link.url || link.url.trim() === '') {
      return false;
    }
    // URLが正規の形式か確認
    if (!link.url.startsWith('https://') && !link.url.startsWith('http://')) {
      return false;
    }

    // 2. コースslugが一致するか
    if (courseSlug && link.relatedCourseSlugs && link.relatedCourseSlugs.includes(courseSlug)) {
      return true;
    }

    // 3. エリアが一致するか
    if (area && link.targetArea && (area.includes(link.targetArea) || link.targetArea.includes(area))) {
      return true;
    }

    // 4. 全体共通案件の場合
    if (link.targetArea === '全国') {
      return true;
    }

    return false;
  });
};
