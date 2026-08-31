import { supabase } from './auth';

export interface StadiumMessage {
  id: string;
  name: string;
  message: string;
  color: string;
  device_id: string;
  created_at: string;
}

// 🛡️ 不適切なメッセージを検知して弾くバリデーションヘルパー
export const validateStadiumMessage = (message: string): string | null => {
  const trimmed = message.trim();

  // 最低文字数制限および最大文字数制限
  if (trimmed.length < 3) {
    return 'メッセージは3文字以上で入力してください。';
  }
  if (trimmed.length > 100) {
    return 'メッセージは100文字以内で入力してください。';
  }

  // URL・ドメインの検知（スパムリンク排除）
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-zA-Z0-9.-]+\.(com|net|org|jp|info|biz|cc|tv|xyz|icu|top|gq|cf|ml|tk|ga|club|online|site|store)\b)/gi;
  if (urlPattern.test(trimmed)) {
    return 'URLやドメインを含むメッセージは送信できません。';
  }

  // 同一文字の連続（例: 「あああああ」など5文字以上の連続）
  const repeatPattern = /(.)\1{4,}/;
  if (repeatPattern.test(trimmed)) {
    return '同じ文字が過度に繰り返されているメッセージは送信できません。';
  }

  // 空白や改行が多すぎる不自然な投稿
  const spaceCount = (trimmed.match(/[\s　]/g) || []).length;
  if (spaceCount > trimmed.length * 0.6) {
    return '空白や改行が多すぎるメッセージは送信できません。';
  }

  // 不適切なワード（NGワード）のフィルタリング
  const NG_WORDS = [
    '死ね', 'ころす', '殺す', 'キチガイ', 'ガイジ', '糞', 'クソ', 'ばか', 'バカ', '馬鹿', 
    'アホ', '間抜け', '消えろ', 'ゴミ', 'ブス', 'デブ', 'ハゲ', 'カス', 'ちんこ', 'まんこ', 
    'セックス', 'sex', '淫乱', '売春', 'キモい', 'きもい', '害悪', '死んで', '地獄に落ちろ',
    '基地外', '白痴', '低能', '知的障害', 'キチ外', '死ねばいい', 'クタバレ', 'くたばれ'
  ];
  
  for (const word of NG_WORDS) {
    if (trimmed.includes(word)) {
      return '不適切な表現が含まれているため送信できません。';
    }
  }

  return null;
};

export interface SpotImage {
  url: string;
  caption?: string;
  photographer?: string; // 撮影者
  source?: string; // 出典
  permission?: string; // 使用許可
  shooting_date?: string; // 撮影日
  copyright_status?: 'owner' | 'permitted' | 'unknown' | 'web_unauthorized'; // 権利状態
}

export interface Spot {
  id: string;
  name: string;
  group: "=LOVE" | "≠ME" | "≒JOY" | "合同";
  category: "MVロケ地" | "ライブ会場" | "聖地店舗" | "飲食店・その他" | "ジャケット・アーティスト写真撮影地";
  description: string;
  latitude: number;
  longitude: number;
  event_date: string;
  youtube_title?: string;
  youtube_url?: string;
  youtubeId?: string;
  workKey?: string;

  tags?: string[];
  reward_title?: string;
  memorial_date?: string;
  commentary?: string;
  
  // 🆕 今回の改修で追加するフィールド
  slug?: string;
  status?: 'published' | 'draft';
  address?: string;
  nearest_station?: string;
  walk_time?: string;
  scene?: string;
  check_points?: string[];
  visitor_notes?: string;
  last_confirmed_date?: string;
  images?: SpotImage[];
  twitter_url?: string;
  verification_status?: string;
  holy_point?: string;
  coordinateAccuracy?: 'exact' | 'facility' | 'approximate' | 'scene-area';
  accuracyReason?: string;
  primarySourceUrl?: string;
}

export interface User {
  id: string;
  username: string;
  oshi_group: "=LOVE" | "≠ME" | "≒JOY" | "合同";
  titles?: string[];
  acquired_titles?: string[];
  active_title?: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  spot_id: string;
  visited_at: string;
  is_manual?: boolean;
}

export type GroupType = "=LOVE" | "≠ME" | "≒JOY" | "合同";

// UUID生成ユーティリティ（簡単な実装）
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 初期リアル聖地データ（イコノイジョイ歴史） - 完全なHTML埋め込みコード（エスケープ済みiframeタグ）で完全上書き！
const INITIAL_SPOTS: Spot[] = [
    {
        "id": "spot-real-yoyogi-ani",
        "name": "代々木アニメーション学院 東京校",
        "group": "合同",
        "category": "飲食店・その他",
        "latitude": 35.7011,
        "longitude": 139.7531,
        "event_date": "2017-04-29",
        "youtube_title": "🎥 関連映像: Documentary of =LOVE -Episode0-",
        "youtube_url": "https://www.youtube.com/embed/zXR_xhihDOQ",
        "reward_title": "すべての始まりの目撃者",
        "address": "東京都",
        "description": "イコノイジョイ全グループのオーディション、初期の合宿やレッスンの舞台となったすべての始まりの場所。指原莉乃プロデューサーとメンバーの絆が生まれた絶対的聖地。\n\n⚠️聖地巡礼に関する重要なお願い\n現役の専門学校です。学生の迷惑になるため、校舎内への無断立ち入りや出入り待ちなどの行為は絶対にやめましょう。外観を眺めるのみにしてください。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "zXR_xhihDOQ",
        "workKey": "documentary-of-love-episode0"
    },
    {
        "id": "spot-real-tsunoshima",
        "name": "角島大橋（山口県）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.3512,
        "longitude": 130.8876,
        "event_date": "2020-11-25",
        "youtube_title": "🎥 関連映像: 『青春“サブリミナル”』公式MV",
        "youtube_url": "https://www.youtube.com/embed/8id6i_QeNJM",
        "reward_title": "青サビの約束を交わした者",
        "address": "山口県",
        "description": "休養から復帰した髙松瞳をセンターに据えた、王道アイドルソング of 最高峰『青春“サブリミナル”』のロケ地。エメラルドグリーンの海と青空の下、この美しい橋を駆け抜けるシーンはまさに「青春」そのもの。山口県という遠方のため巡礼ハードルは高いが、景色を見た瞬間にイントロが脳内再生される、イコラブオタクなら一生に一度は訪れたい約束の地。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "8id6i_QeNJM",
        "workKey": "work-8id6i_QeNJM"
    },
    {
        "id": "spot-real-futtsu-stadium",
        "name": "富津臨海陸上競技場（千葉県）",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.3279,
        "longitude": 139.8427,
        "event_date": "2019-08-04",
        "youtube_title": "🎥 関連映像: 『≠ME』公式MV",
        "youtube_url": "https://www.youtube.com/embed/wsKSUGDKRpQ",
        "reward_title": "ノイミー原点の走者",
        "address": "千葉県",
        "description": "記念すべきノイミー最初のオリジナル曲『≠ME』のMV撮影地。青空の下、トラックでメンバーが全力で踊り、走り抜けるシーンは「泥臭い青春感」の原点。真夏に訪れれば、彼女たちの眩しい笑顔と青春のエネルギーがフラッシュバックすること間違いなし。\n\n⚠️聖地巡礼に関する重要なお願い\n公共のスポーツ施設です。大会や貸切利用時は一般の立ち入りやトラック内への入場が制限される場合があります。ルールを守って見学しましょう。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "wsKSUGDKRpQ",
        "workKey": "me"
    },
    {
        "id": "spot-real-crystal-hotel",
        "name": "湘南鎌倉クリスタルホテル",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.3364,
        "longitude": 139.4883,
        "event_date": "2022-02-16",
        "youtube_title": "🎥 関連映像: 『チョコレートメランコリー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/rDVWtyXTuoU",
        "reward_title": "チョコメラの虜",
        "address": "神奈川県",
        "description": "≠ME 3rdシングル『チョコレートメランコリー』のロケ地。普段の爽やかなノイミーから一転、ゴシックでダークな世界観を見せつけた衝撃作。修道女風の衣装で踊った荘厳なチャペルや、狂気を感じさせるお茶会のシーンが撮影された。オタクたちの間で「推しにチョコで閉じ込められたい」という謎の願望を生み出した、美しくも恐ろしい狂気の館。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "rDVWtyXTuoU",
        "workKey": "work-rDVWtyXTuoU"
    },
    {
        "id": "spot-real-enoshima-daiteibo",
        "name": "江ノ島湘南大堤防（神奈川県藤沢市）",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.29955,
        "longitude": 139.48835,
        "event_date": "2021-04-07",
        "youtube_title": "🎥 関連映像: 『虹が架かる瞬間』公式MV",
        "youtube_url": "https://www.youtube.com/embed/DJdpqIGp1XA",
        "reward_title": "大堤防に架かる虹を見た者",
        "description": "『虹が架かる瞬間』の撮影地. メンバーがそれぞれの場所から集まり、海と夕焼けをバックに歌い踊るエモさ1000%のMV。オーディションからの軌跡を描いた歌詞と相まって、ファンの涙腺を崩壊させた聖地。\n\n⚠️聖地巡礼に関する重要なお願い\n釣り人や観光客が多い公共エリアです。堤防の先端など足元の悪い場所もあるため安全に注意して巡礼してください。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "DJdpqIGp1XA",
        "workKey": "work-DJdpqIGp1XA"
    },
    {
        "id": "spot-real-budokan",
        "name": "日本武道館",
        "group": "=LOVE",
        "category": "ライブ会場",
        "latitude": 35.6933,
        "longitude": 139.75,
        "event_date": "2021-01-16",
        "youtube_title": "🎥 関連映像: 日本武道館ライブ『青春“サブリミナル”』",
        "youtube_url": "https://www.youtube.com/embed/bCvjbkE3iMI",
        "reward_title": "日本武道館の証言者",
        "address": "東京都",
        "description": "デビューから約3年半の月日を経て辿り着いた悲願の日本武道館公演「You all are \"My ideal\"」の会場。コロナ禍の困難を乗り越え、休養中のメンバーを待ち続け、ついに全員で立った夢のステージ。「次に会えた時は 何を話そうかな」という歌詞が現実に重なり、会場中のペンライトとオタクの涙が交差した、歴史に残る伝説の一夜。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "bCvjbkE3iMI",
        "workKey": "work-bCvjbkE3iMI"
    },
    {
        "id": "spot-real-conifer",
        "name": "富士急ハイランド コニファーフォレスト",
        "group": "合同",
        "category": "ライブ会場",
        "latitude": 35.4869,
        "longitude": 138.7806,
        "event_date": "2021-10-09",
        "youtube_title": "🎥 関連映像: イコノイジョイ合同曲『トリプルデート』",
        "youtube_url": "https://www.youtube.com/embed/gkabNNfTjX4",
        "reward_title": "放水祭りのサバイバー",
        "address": "山梨県",
        "description": "「イコノイフェス」や「イコノイジョイ」の舞台。夏の野外合同フェスといえば絶対にここ！大量 of 放水祭りでオタクもメンバーもずぶ濡れになりながら、グループの垣根を越えたバチバチのパフォーマンスと最高の笑顔が交差する。日が落ちてからのエモーショナルな演出と花火は、毎年の夏を締めくくる最高の思い出になる最強の聖地。\n\n⚠️聖地巡礼に関する重要なお願い\n富士急ハイランド自体は入園無料ですが、コニファーフォレスト内部はイベント時以外は基本的に立ち入ることができません。遊園地のアトラクション等を楽しむ場合は別途料金が必要です。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "gkabNNfTjX4",
        "workKey": "work-gkabNNfTjX4"
    },
    {
        "id": "spot-real-asaka-school",
        "name": "旧福島県尋常中学校本館（安積歴史博物館）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 37.3916,
        "longitude": 140.3546,
        "event_date": "2019-04-24",
        "youtube_title": "🎥 関連映像: 『探せ ダイヤモンドリリー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/t5r0rNwjXQU",
        "reward_title": "ダイヤモンドリリーの語り部",
        "address": "福島県郡山市開成5-22-1",
        "description": "『探せ ダイヤモンドリリー』のロケ地。趣のあるレトロな木造校舎で、別れと旅立ちの切ない青春ストーリーが描かれたエモい聖地。\n\n⚠️聖地巡礼に関する重要なお願い\n博物館として一般公開されており、入館料（大人300円等）を払えば内部の見学が可能です。館内での撮影ルール（動画NGなど）に従ってオタ活を楽しみましょう。",
        "coordinateAccuracy": "facility",
        "youtubeId": "t5r0rNwjXQU",
        "workKey": "sagase-diamond-lily"
    },
    {
        "id": "spot-real-oya-museum",
        "name": "大谷資料館（栃木県宇都宮市）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 36.6,
        "longitude": 139.8248,
        "event_date": "2022-05-25",
        "youtube_title": "🎥 関連映像: 『あの子コンプレックス』公式MV",
        "youtube_url": "https://www.youtube.com/embed/ShbfYtAPXuI",
        "reward_title": "大谷資料館の目撃者",
        "address": "栃木県",
        "description": "『あの子コンプレックス』のロケ地。佐々木舞香センターの儚く美しい世界観を見事に表現した広大な地下採石場跡。ミステリアスさ溢れる聖地。\n\n⚠️聖地巡礼に関する重要なお願い\n入場料（大人800円等）が必要です。地下空間は夏でも非常に寒いため上着の持参をおすすめします。また暗いため足元に注意してください。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "ShbfYtAPXuI",
        "workKey": "work-ShbfYtAPXuI"
    },
    {
        "id": "spot-real-cebu",
        "name": "セブ島（フィリピン）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 10.3157,
        "longitude": 123.8854,
        "event_date": "2023-07-19",
        "youtube_title": "🎥 関連映像: 『ナツマトペ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Y1Bboo5KXL4",
        "reward_title": "ナツマトペの漂流者",
        "description": "『ナツマトペ』のMVロケ地。イコラブの夏曲といえばここ！透き通るような青い海とリゾート感全開 of ロケーションで、メンバーたちの最高に弾けた笑顔が撮影された。海外遠征となるため巡礼ハードルは最強クラスだが、マップ上にピンがあるだけでも「ナツマトペ」の多幸感が蘇る。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "Y1Bboo5KXL4",
        "workKey": "work-Y1Bboo5KXL4"
    },
    {
        "id": "spot-real-seoul",
        "name": "韓国・ソウル",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 37.5636,
        "longitude": 126.9832,
        "event_date": "2022-09-28",
        "youtube_title": "🎥 関連映像: 『Be Selfish』公式MV",
        "youtube_url": "https://www.youtube.com/embed/suf7S4AKdmY",
        "reward_title": "Be Selfishの体現者",
        "description": "『Be Selfish』でイコラブが初めて海外MV撮影を敢行した場所。K-POPライクなバキバキのダンスと野口衣織の圧倒的センターオーラが炸裂した記念碑的作品。自己肯定感を爆上げしてくれる、都会的で洗練された空気感を感じられるグローバルな聖地。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "suf7S4AKdmY",
        "workKey": "be-selfish"
    },
    {
        "id": "spot-real-fuchukeiba-seimon",
        "name": "京王競馬場線 府中競馬正門前駅",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6681,
        "longitude": 139.4846,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『ズルいよ ズルいね』公式MV",
        "youtube_url": "https://www.youtube.com/embed/J5eTB_0SEeg",
        "reward_title": "ズルいよ駅の雨宿り人",
        "address": "東京都",
        "description": "齊藤なぎさ初センター曲『ズルいよ ズルいね』の印象的なシーンが撮影された駅。雨降る誰もいないホームや改札前で、メンバーたちが魅せた本気の泣き演技と切ない表情が胸を締め付ける。オタクなら雨の日に訪れて、傘を差しながらMVの失恋 of 痛みに浸りたくなるエモさ満点の聖地。\n\n⚠️聖地巡礼に関する重要なお願い\n現在も営業している駅施設です。ホームや改札付近での長時間の滞留、一般の乗客の通行の妨げになる撮影、三脚の使用などは厳禁です。乗客としてのマナーを守り、周囲への配慮を徹底してください。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "J5eTB_0SEeg",
        "workKey": "work-J5eTB_0SEeg"
    },
    {
        "id": "spot-real-mika-school",
        "name": "アトリエミカミ 学校スタジオ（茨城県）",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 36.31295,
        "longitude": 140.09115,
        "event_date": "2021-04-07",
        "youtube_title": "🎥 関連映像: 『秘密インシデント』公式MV",
        "youtube_url": "https://www.youtube.com/embed/dpSgsHxhWbA",
        "reward_title": "秘密インシデントの当事者",
        "address": "茨城県",
        "description": "メジャーデビュー曲『秘密インシデント』の撮影が行われた学校スタジオ。屋上での爽やかなダンスシーンや、誰もが経験した「青春のきらめき」をギュッと詰め込んだようなロケーション。ノイミーの「青さ」を象徴する重要スポット。\n\n⚠️聖地巡礼に関する重要なお願い\n撮影・ハウススタジオとして運営されているため、一般のオタクが許可なく敷地内に入ることは厳禁です。周辺道路からの見学も近隣 of 迷惑になる場合があるため、巡礼時は十分に配慮してください。",
        "coordinateAccuracy": "facility",
        "youtubeId": "dpSgsHxhWbA",
        "workKey": "work-dpSgsHxhWbA"
    },
    {
        "id": "spot-real-ashizuri",
        "name": "足摺岬（高知県）",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 32.72385,
        "longitude": 133.02355,
        "event_date": "2024-08-28",
        "youtube_title": "🎥 関連映像: 『夏が来たから』公式MV",
        "youtube_url": "https://www.youtube.com/embed/OGb7M9nvBHE",
        "reward_title": "足摺岬で風を浴びた者",
        "description": "『夏が来たから』のMVロケ地。果てしなく広がる青空と太平洋をバックに、冨田菜々風がエモーショナルに歌い上げる姿が印象的な絶景スポット。壮大な自然の中で、ノイミーのエモい夏曲のエネルギーを全身で浴びることができる、究極の浄化系聖地。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "OGb7M9nvBHE",
        "workKey": "work-OGb7M9nvBHE"
    },
    {
        "id": "spot-real-ogawa-school",
        "name": "越後屋東小川小学校スタジオ（埼玉県）",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 36.04692,
        "longitude": 139.23125,
        "event_date": "2024-06-12",
        "youtube_title": "🎥 関連映像: 『体育館ディスコ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/pwT02lNsloU",
        "reward_title": "体育館ディスコのダンサー",
        "address": "埼玉県",
        "description": "1stシングル『体育館ディスコ』の舞台となった廃校スタジオ。ニアジョイカラーの黄色に装飾された体育館で、フレッシュなエネルギーを爆発させて踊るメンバーの姿が焼き付いている。ニアジョイのハッピーオーラを感じられる場所。\n\n⚠️聖地巡礼に関する重要なお願い\n撮影・ハウススタジオとして運営されているため、予約利用者以外の敷地内への無断立ち入りや見学は固く禁止されています。外観を遠くから眺めるのみにしてください。",
        "coordinateAccuracy": "facility",
        "youtubeId": "pwT02lNsloU",
        "workKey": "work-pwT02lNsloU"
    },
    {
        "id": "spot-real-lockhart",
        "name": "ロックハート城（群馬県）",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 36.5925,
        "longitude": 138.9328,
        "event_date": "2022-02-16",
        "youtube_title": "🎥 関連映像: 『チョコレートメランコリー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/rDVWtyXTuoU",
        "reward_title": "古城に閉じ込められし者",
        "address": "群馬県",
        "description": "『チョコレートメランコリー』のジャケット撮影などでも使用された、中世ヨーロッパの古城を移築したテーマパーク。ゴシックでダークな世界観のノイミーを堪能できる場所であり、推しに閉じ込められる妄想を捗らせるには完璧すぎるシチュエーション。オタクの厨二心をくすぐる魅惑の聖地。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "rDVWtyXTuoU",
        "workKey": "work-rDVWtyXTuoU"
    },
    {
        "id": "spot-real-anniversaire-omiya",
        "name": "アニヴェルセル大宮（埼玉県）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.9258,
        "longitude": 139.5969,
        "event_date": "2021-12-15",
        "youtube_title": "🎥 関連映像: 『The 5th』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Q1-yYjZqk7o",
        "reward_title": "制服クリスマスの約束人",
        "address": "埼玉県",
        "description": "『The 5th』のロケ地。きらびやかな冬のイルミネーションに包まれたクリスマスソングの舞台となった結婚式場。少し大人になったイコラブのメンバーたちが冬のラブソングを歌い上げた。クリスマスシーズンにここを歩けば、完全に「イコラブと過ごす特別な冬」の主人公になれる最強のデート気分聖地。\n\n⚠️聖地巡礼に関する重要なお願い\n現役の結婚式場（私有地）です。利用者以外の無断立ち入りや、営業の妨げになる敷地内での無断撮影は固く禁止されています。公道からの外観見学や、併設のカフェ等を利用する範囲でマナーを守って楽しみましょう。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "Q1-yYjZqk7o",
        "workKey": "the-5th"
    },
    {
        "id": "spot-real-fujikyu-land",
        "name": "富士急ハイランド（山梨県）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.4868,
        "longitude": 138.7806,
        "event_date": "2021-05-12",
        "youtube_title": "🎥 関連映像: 『Oh！Darling』公式MV",
        "youtube_url": "https://www.youtube.com/embed/E-mJ15dJ3Fg",
        "reward_title": "Oh! Darlingの恋人",
        "address": "山梨県",
        "description": "『Oh！Darling』のMV撮影地。メンバー全員が遊園地を全力で楽しみながら踊る姿が最高にハッピーな一曲。ライブでもタオルを振り回して爆上がりする定番曲やから、ここでアトラクションに乗りながら脳内再生すればテンションMAX間違いなし。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "E-mJ15dJ3Fg",
        "workKey": "oh-darling"
    },
    {
        "id": "spot-real-tokorozawa-shinmei",
        "name": "所澤神明社（埼玉県所沢市）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.7937,
        "longitude": 139.4637,
        "event_date": "2021-08-25",
        "youtube_title": "🎥 関連映像: 『夏祭り恋慕う』公式MV",
        "youtube_url": "https://www.youtube.com/embed/8VBDO8ZQyDo",
        "reward_title": "夏祭り恋慕うオタク",
        "address": "埼玉県",
        "description": "佐々木舞香センターの最強夏曲『夏祭り恋慕う』のロケ地となった由緒ある神社。浴衣姿 of メンバーたちが境内や石段で見せた儚くも美しい表情は、オタクの「ひと夏の恋」の記憶を完全に書き換えた。夏祭りの時期に絶対に訪れたいエモさ爆発の聖地。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "8VBDO8ZQyDo",
        "workKey": "work-8VBDO8ZQyDo"
    },
    {
        "id": "spot-real-fw-soga",
        "name": "フェスティバルウォーク蘇我（千葉県）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.5922,
        "longitude": 140.1182,
        "event_date": "2023-11-29",
        "youtube_title": "🎥 関連映像: 『ドライブ デート 都内』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Y3aRUM8ebKE",
        "reward_title": "ドライブデートのナビゲーター",
        "address": "千葉県",
        "description": "『ドライブ デート 都内』のMVで、メンバーと夜のドライブデートを楽しんでいるかのような彼氏ヅラ（彼女ヅラ）を極限まで味わえるロケーション。海沿いの開放的な施設で、MVのドライブ気分を味わいながら推しへの想いを馳せることができるスポット。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "Y3aRUM8ebKE",
        "workKey": "work-Y3aRUM8ebKE"
    },
    {
        "id": "spot-real-showanomori",
        "name": "昭和の森（千葉県千葉市）",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.52355,
        "longitude": 140.27455,
        "event_date": "2021-07-14",
        "youtube_title": "🎥 関連映像: 『君はこの夏、恋をする』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Y6uOJ_jw6cQ",
        "reward_title": "君夏に恋した者",
        "address": "千葉県",
        "description": "『君はこの夏、恋をする』のロケ地。広大な公園の緑やグラウンドで全力の恋心を歌う姿は疾走感の塊。学生時代の甘酸っぱい記憶が呼び起こされる、ノイミーオタクの魂の故郷。\n\n⚠️聖地巡礼に関する重要なお願い\n県内最大級の総合公園で一般開放されています。ピクニックや散策がてらの巡礼に最適ですが、休日は家族連れで混雑するため周囲への配慮をお願いします。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "Y6uOJ_jw6cQ",
        "workKey": "work-Y6uOJ_jw6cQ"
    },
    {
        "id": "spot-real-daikeien",
        "name": "大慶園（千葉県市川市）",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.7624,
        "longitude": 139.969,
        "event_date": "2023-04-12",
        "youtube_title": "🎥 関連映像: 『天使は何処へ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/PQb1ZMMV1h0",
        "reward_title": "大慶園のネオンダンサー",
        "address": "千葉県",
        "description": "『天使は何処へ』のMVロケ地。ネオン輝くアメリカンな巨大アミューズメントパークで, 過去最高難易度の激しいダンスを披露した。夜に訪れれば、MVの治安悪めなカッコいいノイミーの世界観にどっぷり浸れる映えスポット。\n\n⚠️聖地巡礼に関する重要なお願い\n24時間営業の施設のため、普通に遊びながらオタ活が可能です。ただし他のお客さんの迷惑になるような長時間の占有や本格的な撮影は控えましょう。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "PQb1ZMMV1h0",
        "workKey": "work-PQb1ZMMV1h0"
    },
    {
        "id": "spot-real-ooguronomori-school",
        "name": "流山市立おおぐろの森中学校（千葉県）",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.8751,
        "longitude": 139.9132,
        "event_date": "2024-03-20",
        "youtube_title": "🎥 関連映像: 『ラストチャンス、ラストダンス』公式MV",
        "youtube_url": "https://www.youtube.com/embed/TN--u8kgVM0",
        "reward_title": "ラスチャンの中学生",
        "address": "千葉県",
        "description": "『ラストチャンス、ラストダンス』のMV撮影地。美しい木造校舎を背景に、切ない恋の終わりと始まりを描いた青春の痛みと眩しさが詰まったエモすぎるロケ地。\n【⚠️重要な注意】現在も生徒が通う「現役の公立中学校」です。関係者以外の敷地内への無断立ち入り、生徒が映り込む形での撮影、不審に思われる長時間の滞在は絶対に禁止です！オタクのモラルとして、巡礼はごく遠巻きに外観を眺める程度に留めてください。",
        "coordinateAccuracy": "facility",
        "youtubeId": "TN--u8kgVM0",
        "workKey": "work-TN--u8kgVM0"
    },
    {
        "id": "spot-real-kotakizawa-camp",
        "name": "小滝沢キャンプ場（茨城県）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 36.7348,
        "longitude": 140.6151,
        "event_date": "2017-09-06",
        "youtube_title": "🎥 関連映像: 『=LOVE』公式MV",
        "youtube_url": "https://www.youtube.com/embed/xOAaBsPaPpY",
        "reward_title": "イコラブ原点のダブルピース",
        "address": "茨城県",
        "description": "記念すべきデビュー曲『=LOVE』のMVロケ地のひとつ。茨城県の花貫渓谷に位置する、大自然に囲まれた癒しの聖地。MV内でメンバーが笑顔で駆け回り、ダブルピースを決める印象的なシーンが撮影されており、多くのファンがそのポイントを特定して巡礼に訪れている。撮影時と同じ構図で写真を撮ったり、川のせせらぎなど自然音をBGMに散策したりと、オた活を満喫するには最高のロケーション。ただし、自然豊かな場所ゆえに雨の日などは足元が滑りやすいため、スニーカーなど歩きやすい靴で訪れるのがおすすめ。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "xOAaBsPaPpY",
        "workKey": "love"
    },
    {
        "id": "spot-real-unoshima-villa",
        "name": "うのしまヴィラ海岸（茨城県）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 36.6168,
        "longitude": 140.6811,
        "event_date": "2017-09-06",
        "youtube_title": "🎥 関連映像: 『=LOVE』公式MV",
        "youtube_url": "https://www.youtube.com/embed/xOAaBsPaPpY",
        "reward_title": "うのしま海岸の開拓者",
        "address": "茨城県",
        "description": "記念すべきデビュー曲『=LOVE』のもうひとつのMVロケ地。海辺のロケーションで初々しいメンバーたちの爽やかなダンスシーンが撮影された。ここからイコラブの歴史がスタートした、ファンにとっても特別な海辺の聖地。\n\n⚠️聖地巡礼に関する重要なお願い\n隣接する「うのしまヴィラ」は宿泊・飲食施設（私有地）です。海岸自体は公共の場所ですが、施設の駐車場への無断駐車や、宿泊客の迷惑になる騒音・長時間の占有は避け、節度あるオタ活を心がけてください。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "xOAaBsPaPpY",
        "workKey": "love"
    },
    {
        "id": "spot-real-kanto-gakuin",
        "name": "関東学院中学校・高等学校（神奈川県）",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.4373,
        "longitude": 139.6146,
        "event_date": "2022-09-28",
        "youtube_title": "🎥 関連映像: 『笑って フラジール』公式MV",
        "youtube_url": "https://www.youtube.com/embed/YCbV-2dCyiM",
        "reward_title": "笑ってフラジールの応援団",
        "address": "神奈川県",
        "description": "≒JOYの2ndソング『笑って フラジール』のロケ地。学校の屋上や体育館で、不器用ながらも前を向いて「笑って！」とエールを送る姿に、多くのファンが救われたニアジョイの応援歌としての原点。\n\n⚠️聖地巡礼に関する重要なお願い\n現在も生徒が通う現役の学校施設です。敷地内への無断立ち入りや、生徒が映り込む形での撮影、周辺での長時間の滞留は絶対に禁止です。巡礼の際は公道から静かに校舎を眺める程度に留めてください。",
        "coordinateAccuracy": "facility",
        "youtubeId": "YCbV-2dCyiM",
        "workKey": "work-YCbV-2dCyiM"
    },
    {
        "id": "spot-real-mitagawa-school",
        "name": "旧三田川中学校（埼玉県小鹿野町）",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 36.0125,
        "longitude": 138.988,
        "event_date": "2023-07-19",
        "youtube_title": "🎥 関連映像: 『今日も君の夢を見たんだ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/2ltZx6FkU4w",
        "reward_title": "君の夢を見た夢追い人",
        "address": "埼玉県",
        "description": "『今日も君の夢を見たんだ』のロケ地となった中学校跡地。自然豊かな環境の中で、メンバーたちが無邪気に笑い合う多幸感あふれる映像が撮影された、ピースフルな空間。\n\n⚠️聖地巡礼に関する重要なお願い\n現在は廃校となっており、自治体（フィルムコミッション）が管理していますが、当面の間は撮影受け入れ自体が休止されています。敷地内への無断立ち入りは厳禁です。周辺から雰囲気を味わう程度にしましょう。",
        "coordinateAccuracy": "facility",
        "youtubeId": "2ltZx6FkU4w",
        "workKey": "work-2ltZx6FkU4w"
    },
    {
        "id": "spot-real-kisarazu-warehouse",
        "name": "木更津市 木材港の大型倉庫（千葉県）",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.39055,
        "longitude": 139.91425,
        "event_date": "2024-01-17",
        "youtube_title": "🎥 関連映像: 『無謀人』公式MV",
        "youtube_url": "https://www.youtube.com/embed/qUzXtUsVgH8",
        "reward_title": "無謀なる港の開拓者",
        "address": "千葉県",
        "description": "『無謀人』のMV撮影地。炎が燃え盛る中でハードなラップと力強いダンスを見せつけ、ニアジョイの底知れぬポテンシャルと圧倒的な覇気を証明した、闘争 of 聖地。\n\n⚠️聖地巡礼に関する重要なお願い\n稼働中の港湾施設および私有地の大型倉庫エリアです。大型トラック of 出入りが多く非常に危険なため、関係者以外の立ち入りは厳しく禁止されています。公道からの遠巻きの巡礼に留め、絶対に敷地内には入らないでください。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "qUzXtUsVgH8",
        "workKey": "work-qUzXtUsVgH8"
    },
    {
        "id": "spot-real-ushiku-chateau",
        "name": "牛久シャトー (旧シャトーカミヤ)",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.9754,
        "longitude": 140.1481,
        "event_date": "2022-07-02",
        "youtube_title": "🎥 関連映像: 『≒JOY』公式MV",
        "youtube_url": "https://www.youtube.com/embed/2nOHrLolG08",
        "reward_title": "ニアジョイ始まりの乾杯者",
        "address": "茨城県",
        "description": "ニアジョイの始まりの曲『≒JOY』の撮影地のひとつ。レンガ造りの美しい洋館（歴史的建造物）をバックに、夢への第一歩を踏み出したフレッシュなメンバーたちの輝かしい姿が撮影された。ここから始まった快進撃に思いを馳せることができる癒やしの聖地。\n\n⚠️聖地巡礼に関する重要なお願い\n入場・見学は無料です。神谷傳兵衛記念館などの内部見学（10:00〜16:00）や敷地内の散策が可能です（年末年始などは休園）。一部立ち入れない建物もありますが、写真撮影も楽しめます。レストラン等も併設されているため、オタ活の拠点にも最適です。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "2nOHrLolG08",
        "workKey": "joy"
    },
    {
        "id": "spot-real-british-hills",
        "name": "ブリティッシュヒルズ（福島県）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 37.2345,
        "longitude": 140.0456,
        "event_date": "2021-08-25",
        "youtube_title": "🎥 関連映像: 『ウィークエンドシトロン』公式MV",
        "youtube_url": "https://www.youtube.com/embed/skgh3juWdFU",
        "reward_title": "ウィークエンドシトロンのお嬢様",
        "address": "福島県",
        "description": "夏曲『ウィークエンドシトロン』の舞台となった、中世英国の街並みを再現したリゾート施設。ひまわり畑や豪華な洋館で踊るメンバーのお嬢様感がたまらない。オタク仲間とシトロンイエローの服を着て訪れたい、最高に映える聖地。\n\n⚠️聖地巡礼に関する重要なお願い\n宿泊利用のほか、日帰りでも入場料（大人400円等）で利用可能です。MVで登場するマナーハウス（洋館）の見学は別途ツアー料金が必要です。マナーを守って英国とイコラブの世界観を楽しみましょう。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "skgh3juWdFU",
        "workKey": "work-skgh3juWdFU"
    },
    {
        "id": "spot-real-shutoken-water",
        "name": "首都圏外郭放水路（埼玉県）",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.9976,
        "longitude": 139.8115,
        "event_date": "2020-10-21",
        "youtube_title": "🎥 関連映像: 『P.I.C.』公式MV",
        "youtube_url": "https://www.youtube.com/embed/DJdpqIGp1XA",
        "reward_title": "地下神殿のステッキ使い",
        "address": "埼玉県",
        "description": "冨田菜々風がバチバチに決める『P.I.C.』の撮影地。巨大な柱が立ち並ぶ「地下神殿」は、ノイミーのパフォーマンスの迫力を最大限に引き出した伝説の空間。ステッキを持った振り付けを真似して写真を撮りたくなる, 圧倒的スケールのロケ地。\n\n⚠️聖地巡礼に関する重要なお願い\n一般見学が可能ですが、完全事前予約制です。地下神殿コース（1,000円〜）など見学料金が必要です。施設稼働時などは見学できない場合があるため、必ず公式サイトで確認・予約をしてから訪れてください。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "DJdpqIGp1XA",
        "workKey": "p-i-c"
    },
    {
        "id": "spot-real-italia-town",
        "name": "イタリア街（東京都港区）",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.6603,
        "longitude": 139.7569,
        "event_date": "2022-11-23",
        "youtube_title": "🎥 関連映像: 『はにかみショート』公式MV",
        "youtube_url": "https://www.youtube.com/embed/JXchs8DEDWk",
        "reward_title": "はにかみショートの主人公",
        "address": "東京都",
        "description": "冬の超王道アイドルソング『はにかみショート』のロケ地。まるでヨーロッパのようなオシャレな石畳とビルが立ち並ぶエリア。きらびやかな夜の街並みを背景に、メンバーがマフラー姿で歌い踊る姿がオタクの心に永遠に刻まれた。冬のデート気分を味わいながら映える写真を撮るならここ一択。\n\n⚠️聖地巡礼に関する重要なお願い\n公道ですので自由に散策・撮影が可能ですが、オフィスや商業施設が隣接するエリアです。一般の方の通行の妨げや、大声で騒ぐなどの行為は控え、マナーを守ってオタ活を楽しみましょう。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "JXchs8DEDWk",
        "workKey": "work-JXchs8DEDWk"
    },
    {
        "id": "spot-real-longwood",
        "name": "ロングウッドステーション（千葉県）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.4325,
        "longitude": 140.1873,
        "event_date": "2018-05-16",
        "youtube_title": "🎥 関連映像: 『手遅れcaution』公式MV",
        "youtube_url": "https://www.youtube.com/embed/w0N0TiOlAY0",
        "reward_title": "手遅れ警告の発令者",
        "address": "千葉県",
        "description": "イコラブのダークな魅力が爆発した3rdシングル『手遅れcaution』のロケ地。血まみれの制服や百合の愛憎劇という衝撃的な展開でオタクの心を鷲掴みにした。ここで「手遅れ」のイントロを流すだけで、あのヒリヒリした空気を味わえる。\n\n⚠️聖地巡礼に関する重要なお願い\n普段は大型の撮影スタジオおよびイベントスペースとして運営されています。イベント開催日など一般開放されている日を除き、敷地内への無断立ち入りは禁止されています。イベント等に参加して巡礼するか、外観を遠目に見る程度に留めてください。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "w0N0TiOlAY0",
        "workKey": "caution"
    },
    {
        "id": "spot-real-yamanashi-eiwa",
        "name": "山梨英和大学（山梨県甲府市）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6888,
        "longitude": 138.583,
        "event_date": "2017-12-06",
        "youtube_title": "🎥 関連映像: 『僕らの制服クリスマス』公式MV",
        "youtube_url": "https://www.youtube.com/embed/YIjPbF-dKQA",
        "reward_title": "僕らの制服クリスマスの学生",
        "address": "山梨県",
        "description": "冬の定番曲『僕らの制服クリスマス』のMV撮影地。大学院棟前の広場をはじめ、キャンパス全体を使ってマフラーを巻いたメンバーたちの甘酸っぱい青春ストーリーが撮影された。冬が来るたびに訪れたくなるエモすぎる学校ロケ地。\n\n⚠️聖地巡礼に関する重要なお願い\n現在も学生が通う現役の大学キャンパスです。関係者以外の無断立ち入りや、学生が映り込む撮影は厳禁です。大学祭など一般開放されている日を狙うか、外観を遠巻きに眺めるに留めてください。",
        "coordinateAccuracy": "facility",
        "youtubeId": "YIjPbF-dKQA",
        "workKey": "work-YIjPbF-dKQA"
    },
    {
        "id": "spot-real-kawaguchiko-music-forest",
        "name": "河口湖 音楽と森の美術館（山梨県）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.5222,
        "longitude": 138.7686,
        "event_date": "2023-11-29",
        "youtube_title": "🎥 関連映像: 『ラストノートしか知らない』公式MV",
        "youtube_url": "https://www.youtube.com/embed/C8WMX7dEH7Y",
        "reward_title": "ラストノートの調香師",
        "address": "山梨県",
        "description": "最年少・齋藤樹愛羅がセンターを務めた『ラストノートしか知らない』のMVロケ地。煌びやかなダンスオルガンが設置された「オルガンホール」で、美しくも切ないダンスシーンが撮影された。中世ヨーロッパのような館内は、イコラブの気品ある世界観に完全にマッチしている。\n\n⚠️聖地巡礼に関する重要なお願い\n美術館のため入館料（大人2,100円〜※季節変動あり）が必要です。館内は非常に美しく撮影も楽しめますが、他のお客さんの鑑賞の妨げにならないよう静かにオタ活を楽しみましょう。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "C8WMX7dEH7Y",
        "workKey": "work-C8WMX7dEH7Y"
    },
    {
        "id": "spot-real-ease-meguro",
        "name": "ウェディングファンタジア（静岡県沼津市）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.085277,
        "longitude": 138.859882,
        "event_date": "2018-10-17",
        "youtube_title": "🎥 関連映像: 『Want you! Want you!』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Bot92Nn-ozk",
        "reward_title": "Want you! のウェディングメイト",
        "address": "静岡県",
        "description": "イコラブのポップでキュートな楽曲『Want you! Want you!』のMVロケ地となった静岡県沼津市の結婚式場・フォトスタジオ。テーマパークのような広大で多彩なセットがあり、MV的で可愛い世界観そのままの雰囲気を味わえるロケーション。\n\n⚠️聖地巡礼に関する重要なお願い\n実際の結婚式場およびスタジオとして営業しているため、無断での立ち入りや撮影は厳禁です。見学や撮影利用を希望する場合は、必ず事前に施設へ問い合わせ、営業の迷惑にならないようルールを守ってオタ活を楽しみましょう。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "Bot92Nn-ozk",
        "workKey": "want-you-want-you"
    },
    {
        "id": "spot-real-dopo-ueno",
        "name": "不純喫茶ドープ 上野御徒町店（東京都台東区）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.707767,
        "longitude": 139.772591,
        "event_date": "2024-03-06",
        "youtube_title": "🎥 関連映像: 『呪って呪って』公式MV",
        "youtube_url": "https://www.youtube.com/embed/cyRZGtNx_a4",
        "reward_title": "不純喫茶の呪われし者",
        "address": "東京都",
        "description": "ダークで情熱的な表題曲『呪って呪って』のMV内で、瀧脇笙古がお店から出てくる印象的なシーンで使われたレトロ喫茶。昭和レトロなネオンやクリームソーダがオタク心をくすぐる。アクスタを置いてMVのダークな世界観を再現したくなる人気スポット。\n\n⚠️聖地巡礼に関する重要なお願い\n実際の飲食店として営業しています。普通に来店して飲食しながらオタ活が可能ですが、店内撮影の際は他のお客さんが映り込まないよう配慮し、混雑時は長居を避けましょう。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "cyRZGtNx_a4",
        "workKey": "work-cyRZGtNx_a4"
    },
    {
        "id": "spot-real-seibuen-yuenchi",
        "name": "西武園ゆうえんち（埼玉県所沢市）",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.7686,
        "longitude": 139.4447,
        "event_date": "2024-07-31",
        "youtube_title": "🎥 関連映像: 特典映像『イコラブ社員旅行 in 埼玉！』",
        "youtube_url": "https://www.youtube.com/embed/Rn0vbPbMGcQ",
        "reward_title": "昭和レトロの旅人",
        "address": "埼玉県",
        "description": "大ヒット曲『絶対アイドル辞めないで』のType Cに収録された特典映像『イコラブ社員旅行 in 埼玉！〜昭和レトロ編〜』のロケ地。大場花菜のプロデュースで、メンバーたちが昭和の街並みで大はしゃぎする姿が収められた。推しと同じアトラクションに乗って社員旅行気分を味わえる多幸感スポット。\n\n⚠️聖地巡礼に関する重要なお願い\n入園にはチケット（1日レヂャー切符など）が必要です。昭和の街並み（夕日の丘商店街）はフォトスポットとしても最高なので、推しのアクスタやグッズを持参して全力で満喫しましょう。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "Rn0vbPbMGcQ",
        "workKey": "in"
    },
    {
        "id": "spot-trigger-veille",
        "name": "Bar VEILLE（大森）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.5864,
        "longitude": 139.7296,
        "event_date": "2023-02-22",
        "youtube_title": "🎥 関連映像: 『この空がトリガー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/20QJax8CwQo",
        "reward_title": "大森VEILLEの大人",
        "tags": [
            "トリガー巡礼"
        ],
        "address": "東京都",
        "description": "諸橋沙夏が訪れた大人な雰囲気のバー。大森エリアの情緒ある路地に佇む名店。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "20QJax8CwQo",
        "workKey": "work-20QJax8CwQo"
    },
    {
        "id": "spot-trigger-spbs",
        "name": "Shibuya Publishing & Booksellers",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6631,
        "longitude": 139.6934,
        "event_date": "2023-02-22",
        "youtube_title": "🎥 関連映像: 『この空がトリガー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/20QJax8CwQo",
        "reward_title": "SPBSの本の虫",
        "tags": [
            "トリガー巡礼"
        ],
        "address": "東京都",
        "description": "音嶋莉沙が入ったオシャレな本屋さん。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "20QJax8CwQo",
        "workKey": "work-20QJax8CwQo"
    },
    {
        "id": "spot-trigger-1214",
        "name": "Hair Salon 1214（渋谷）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6565,
        "longitude": 139.7045,
        "event_date": "2023-02-22",
        "youtube_title": "🎥 関連映像: 『この空がトリガー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/20QJax8CwQo",
        "reward_title": "渋谷1214のヘアスタイリスト",
        "tags": [
            "トリガー巡礼"
        ],
        "address": "東京都",
        "description": "髙松瞳が髪を切っていた美容室。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "20QJax8CwQo",
        "workKey": "work-20QJax8CwQo"
    },
    {
        "id": "spot-trigger-airstream",
        "name": "the AIRSTREAM GARDEN",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6679,
        "longitude": 139.7088,
        "event_date": "2023-02-22",
        "youtube_title": "🎥 関連映像: 『この空がトリガー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/20QJax8CwQo",
        "reward_title": "表参道エアストリームの旅人",
        "tags": [
            "トリガー巡礼"
        ],
        "address": "東京都",
        "description": "山本杏奈が働いていたキッチンカー。表参道エリアのカフェスペース。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "20QJax8CwQo",
        "workKey": "work-20QJax8CwQo"
    },
    {
        "id": "spot-trigger-taimei",
        "name": "みらい館大明（池袋）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.7356,
        "longitude": 139.7018,
        "event_date": "2023-02-22",
        "youtube_title": "🎥 関連映像: 『この空がトリガー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/20QJax8CwQo",
        "reward_title": "みらい館大明の放課後メンバー",
        "tags": [
            "トリガー巡礼",
            "いらない ツインテール"
        ],
        "address": "東京都",
        "description": "屋上や教室、男の子が走っているシーンが撮影された廃校活用施設。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "20QJax8CwQo",
        "workKey": "work-20QJax8CwQo"
    },
    {
        "id": "spot-trigger-ladybugs",
        "name": "LadyBugs（神山町）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6628,
        "longitude": 139.6932,
        "event_date": "2023-02-22",
        "youtube_title": "🎥 関連映像: 『この空がトリガー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/20QJax8CwQo",
        "reward_title": "神山町LadyBugsの花屋",
        "tags": [
            "トリガー巡礼"
        ],
        "address": "東京都",
        "description": "大場花菜が働いていた花屋さん。本屋（SPBS）のすぐ近く。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "20QJax8CwQo",
        "workKey": "work-20QJax8CwQo"
    },
    {
        "id": "spot-trigger-toyosu",
        "name": "豊洲ぐるり公園",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6469,
        "longitude": 139.7891,
        "event_date": "2023-02-22",
        "youtube_title": "🎥 関連映像: 『この空がトリガー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/20QJax8CwQo",
        "reward_title": "豊洲水辺のランニングスター",
        "tags": [
            "トリガー巡礼",
            "ドライブ デート 都内",
            "だだだ、だって。"
        ],
        "address": "東京都",
        "description": "瀧脇笙古が走っていた公園。レインボーブリッジが見える水辺のランニングスポット。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "20QJax8CwQo",
        "workKey": "work-20QJax8CwQo"
    },
    {
        "id": "spot-trigger-kait",
        "name": "神奈川工科大学 KAIT広場",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.4831,
        "longitude": 139.3496,
        "event_date": "2023-02-22",
        "youtube_title": "🎥 関連映像: 『この空がトリガー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/20QJax8CwQo",
        "reward_title": "KAIT広場の芸術鑑賞家",
        "tags": [
            "トリガー巡礼"
        ],
        "address": "神奈川県",
        "description": "美しいダンスパートが撮影された特徴的な建築の広場。",
        "coordinateAccuracy": "facility",
        "youtubeId": "20QJax8CwQo",
        "workKey": "work-20QJax8CwQo"
    },
    {
        "id": "spot-trigger-tute",
        "name": "東京工科大学 八王子キャンパス",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6258,
        "longitude": 139.3387,
        "event_date": "2023-02-22",
        "youtube_title": "🎥 関連映像: 『この空がトリガー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/20QJax8CwQo",
        "reward_title": "八王子キャンパスの卒業生",
        "tags": [
            "トリガー巡礼"
        ],
        "address": "東京都",
        "description": "卒業式のキスシーンが撮影された場所。",
        "coordinateAccuracy": "facility",
        "youtubeId": "20QJax8CwQo",
        "workKey": "work-20QJax8CwQo"
    },
    {
        "id": "spot-trigger-jissen",
        "name": "実践女子大学 渋谷キャンパス",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6536,
        "longitude": 139.7077,
        "event_date": "2023-02-22",
        "youtube_title": "🎥 関連映像: 『この空がトリガー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/20QJax8CwQo",
        "reward_title": "渋谷キャンパス of 夢追い人",
        "tags": [
            "トリガー巡礼"
        ],
        "address": "東京都",
        "description": "佐々木舞香がビル街を見つめるシーンの撮影地。",
        "coordinateAccuracy": "facility",
        "youtubeId": "20QJax8CwQo",
        "workKey": "work-20QJax8CwQo"
    },
    {
        "id": "spot-trigger-mimosa",
        "name": "ミモザハウス（パスティスグループ）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6635,
        "longitude": 139.6935,
        "event_date": "2023-02-22",
        "youtube_title": "🎥 関連映像: 『この空がトリガー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/20QJax8CwQo",
        "reward_title": "ミモザハウスの相合傘メイト",
        "tags": [
            "トリガー巡礼"
        ],
        "address": "東京都",
        "description": "野口衣織が男の子と相合傘をするシーンが撮影されたハウススタジオ。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "20QJax8CwQo",
        "workKey": "work-20QJax8CwQo"
    },
    {
        "id": "spot-real-santamonica-crepe",
        "name": "サンタモニカクレープ原宿明治通り店",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.6706,
        "longitude": 139.7042,
        "event_date": "2024-06-22",
        "youtube_title": "🎥 関連映像: 『絶対アイドル辞めないで』公式MV",
        "youtube_url": "https://www.youtube.com/embed/17NBPoc78oM",
        "reward_title": "クレープの絶対アイドル",
        "address": "東京都",
        "description": "=LOVEの17thシングル『絶対アイドル辞めないで』Type A・B・Cのジャケット写真が撮影された場所です。ピンクのキュートな外観が目印！MIYASHITA PARKのロケ地とも近いので、一緒に巡るのがおすすめです。現地でクレープを食べながら、推しと同じポーズで写真を撮ってみてはいかがでしょうか？（※お店や他のお客様の迷惑にならないようご配慮をお願いします）",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "17NBPoc78oM",
        "workKey": "work-17NBPoc78oM"
    },
    {
        "id": "spot-real-miyashita-park",
        "name": "MIYASHITA PARK",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.6612,
        "longitude": 139.7017,
        "event_date": "2024-06-22",
        "youtube_title": "🎥 関連映像: 『絶対アイドル辞めないで』公式MV",
        "youtube_url": "https://www.youtube.com/embed/17NBPoc78oM",
        "reward_title": "MIYASHITAのアイドル",
        "address": "東京都",
        "description": "=LOVEの17thシングル『絶対アイドル辞めないで』Type D・Eのジャケット写真が撮影されたスポットです。原宿・渋谷エリアのシンボル的な施設。Type A〜Cのロケ地（サンタモニカクレープ）から歩いて行ける距離にあるので、同日の巡礼ルートにぴったりです！",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "17NBPoc78oM",
        "workKey": "work-17NBPoc78oM"
    },
    {
        "id": "spot-real-cameo-zeronoir",
        "name": "スタジオゼロノアール",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.3941,
        "longitude": 139.9576,
        "event_date": "2020-04-29",
        "youtube_title": "🎥 関連映像: 『CAMEO』公式MV",
        "youtube_url": "https://www.youtube.com/embed/iEYwHScdJFQ",
        "reward_title": "CAMEOのスパイス",
        "address": "千葉県",
        "description": "7thシングル『CAMEO』のジャケット写真撮影地です。独特な廃墟感・倉庫感のあるおしゃれなスタジオで、メンバーたちのエキゾチックでクールな衣装が非常に映えるビジュアルとなりました。\n【住所】千葉県木更津市中里2-1-14\n\n⚠️聖地巡礼に関する重要なお願い\n商業用の撮影スタジオ（私有地）です。一般の方の立ち入りや見学は一切禁止されています。オタクのモラルとして、巡礼は外観を遠目に見る程度に留め、近隣の迷惑になる行為は絶対にやめましょう。",
        "coordinateAccuracy": "facility",
        "youtubeId": "iEYwHScdJFQ",
        "workKey": "cameo"
    },
    {
        "id": "spot-real-lockhart-shukusai",
        "name": "ロックハート城（祝祭）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 36.6025,
        "longitude": 139.0068,
        "event_date": "2021-08-25",
        "youtube_title": "🎥 関連映像: 『祝祭』公式MV",
        "youtube_url": "https://www.youtube.com/embed/m8WtzVPXxwU",
        "reward_title": "祝祭の参列者",
        "address": "群馬県",
        "description": "9thシングルカップリング曲『祝祭』のMV撮影地です。重厚な洋館とアンティークな雰囲気を活かし、ミステリアスなダークファンタジー世界が繰り広げられました。執事や主人を演じるメンバーたちの格好良い姿が見どころです。\n【HP】https://lockheart.info/\n【住所】〒377-0702 群馬県吾妻郡高山村5583-1",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "m8WtzVPXxwU",
        "workKey": "work-m8WtzVPXxwU"
    },
    {
        "id": "spot-real-tokyodome-recipe",
        "name": "東京ドーム",
        "youtubeId": "LKwERkGBiog",
        "group": "=LOVE",
        "category": "ライブ会場",
        "latitude": 35.7055,
        "longitude": 139.7519,
        "event_date": "2022-05-25",
        "youtube_title": "🎥 関連映像: 『笑顔のレシピ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/LKwERkGBiog",
        "reward_title": "笑顔のレシピの夢追い人",
        "tags": [
            "笑顔のレシピ巡礼"
        ],
        "address": "東京都",
        "description": "『笑顔のレシピ』MVに登場する目標の地。イコラブメンバーとファンがいつか辿り着くことを誓った約束の最高峰ドーム。",
        "coordinateAccuracy": "facility",
        "workKey": "work-LKwERkGBiog"
    },
    {
        "id": "spot-real-messemall",
        "name": "メッセモール",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6508,
        "longitude": 140.0384,
        "event_date": "2022-05-25",
        "youtube_title": "🎥 関連映像: 『笑顔のレシピ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/LKwERkGBiog",
        "reward_title": "メッセモールの散歩者",
        "tags": [
            "笑顔のレシピ巡礼"
        ],
        "address": "千葉県",
        "description": "『笑顔のレシピ』MV撮影地。幕張メッセ近くの広大な公園スペースで、メンバーたちが笑顔で絆を深め合うシーンが撮影されました。\n【住所】〒261-0023 千葉県千葉市美浜区中瀬２丁目５",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "LKwERkGBiog",
        "workKey": "work-LKwERkGBiog"
    },
    {
        "id": "spot-real-messemall-hodoukyo",
        "name": "メッセモール交差点歩道橋付近",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.65139,
        "longitude": 140.03981,
        "event_date": "2022-05-25",
        "youtube_title": "🎥 関連映像: 『笑顔のレシピ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/LKwERkGBiog",
        "reward_title": "メッセモール交差点の夕陽人",
        "tags": [
            "笑顔のレシピ巡礼"
        ],
        "address": "千葉県",
        "description": "『笑顔のレシピ』MV撮影地。メッセモール交差点にかかる歩道橋周辺で、美しい夕陽や都会的な背景と共にメンバーが佇むエモーショナルなシーンが描かれています。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "LKwERkGBiog",
        "workKey": "work-LKwERkGBiog"
    },
    {
        "id": "spot-real-messemall-kita",
        "name": "メッセモール北側",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.651751,
        "longitude": 140.04027,
        "event_date": "2022-05-25",
        "youtube_title": "🎥 関連映像: 『笑顔のレシピ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/LKwERkGBiog",
        "reward_title": "メッセモール北側の開拓者",
        "tags": [
            "笑顔のレシピ巡礼"
        ],
        "address": "千葉県",
        "description": "『笑顔のレシピ』MV撮影地。メッセモールの北側エリアで撮影された印象的なシーンです。\n【住所】〒261-0023 千葉県千葉市美浜区中瀬１丁目１１３",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "LKwERkGBiog",
        "workKey": "work-LKwERkGBiog"
    },
    {
        "id": "spot-real-mbp-makuhari",
        "name": "エム・ベイポイント幕張ビル",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6496,
        "longitude": 140.0423,
        "event_date": "2022-05-25",
        "youtube_title": "🎥 関連映像: 『笑顔のレシピ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/LKwERkGBiog",
        "reward_title": "幕張オフィス街の観測者",
        "tags": [
            "笑顔のレシピ巡礼"
        ],
        "address": "千葉県",
        "description": "『笑顔のレシピ』MVに登場する特徴的なオフィスビル。近未来的なデザインのビル外観や周辺エリアが作品をモダンに彩ります。\n【住所】〒261-0023 千葉県千葉市美浜区中瀬１丁目６",
        "coordinateAccuracy": "facility",
        "youtubeId": "LKwERkGBiog",
        "workKey": "work-LKwERkGBiog"
    },
    {
        "id": "spot-real-business-hodoukyo",
        "name": "ビジネス通り交差点歩道橋",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.65225,
        "longitude": 140.03824,
        "event_date": "2022-05-25",
        "youtube_title": "🎥 関連映像: 『笑顔のレシピ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/LKwERkGBiog",
        "reward_title": "ビジネス通りを疾走せし者",
        "tags": [
            "笑顔のレシピ巡礼"
        ],
        "address": "千葉県",
        "description": "『笑顔のレシピ』MV撮影地。ビジネス通りと交差する歩道橋で、リーダーの山本杏奈を中心に、夢に向かって走るメンバーたちの強い意志が込められたシーンが描かれています。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "LKwERkGBiog",
        "workKey": "work-LKwERkGBiog"
    },
    {
        "id": "spot-real-mvify-okuma",
        "name": "オクマ プライベートビーチ&リゾート",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 26.7411,
        "longitude": 128.1633,
        "event_date": "2020-07-08",
        "youtube_title": "🎥 関連映像: 『My Voice Is For You』公式MV",
        "youtube_url": "https://www.youtube.com/embed/v3wVAbAWrE0",
        "reward_title": "オクマビーチの歌姫の伴奏者",
        "address": "沖縄県",
        "description": "諸橋沙夏の初ソロ曲『My Voice Is For You』のMVロケ地。沖縄の澄み切った青い海と真っ白な砂浜が広がるリゾートビーチで、彼女の圧倒的で美しい歌声が響き渡る爽快な映像が撮影されました。\n【住所】沖縄県国頭群国頭村奥間913",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "v3wVAbAWrE0",
        "workKey": "my-voice-is-for-you"
    },
    {
        "id": "spot-real-mvify-sekiseizan",
        "name": "大石林山",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 26.8506,
        "longitude": 128.2566,
        "event_date": "2020-07-08",
        "youtube_title": "🎥 関連映像: 『My Voice Is For You』公式MV",
        "youtube_url": "https://www.youtube.com/embed/v3wVAbAWrE0",
        "reward_title": "大石林山のこだま",
        "address": "沖縄県",
        "description": "諸橋沙夏のソロ曲『My Voice Is For You』のMVロケ地。沖縄本島北部のパワースポットとして有名な大石林山の雄大な岩山とガジュマルの森の中で、神秘的な歌唱シーンが撮影されました。\n【住所】沖縄県国頭郡国頭村宜名真1241",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "v3wVAbAWrE0",
        "workKey": "my-voice-is-for-you"
    },
    {
        "id": "spot-real-sweetest-atelier",
        "name": "L'atelier onze（ラトリエ オンズ）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.5413,
        "longitude": 140.3228,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『Sweetest girl』公式MV",
        "youtube_url": "https://www.youtube.com/embed/TA0oDNGCFHQ",
        "reward_title": "スウィーテストガールの親友",
        "address": "千葉県",
        "description": "6thシングルカップリング曲『Sweetest girl』のMV撮影地です。温かみのあるおしゃれで可愛い一軒家ハウススタジオで、メンバーたちのキュートでおめかしした日常シーンが描かれました。\n【HP】http://atelier-onze11.com/\n【住所】〒299-3241 千葉県大網白里市季美の森南2-28-24\n\n⚠️聖地巡礼に関する重要なお願い\n商業用のハウススタジオ（私有地）です。一般の方の立ち入りや見学は固く禁止されています。近隣住民の方のご迷惑にならないよう、配慮を徹底してください。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "TA0oDNGCFHQ",
        "workKey": "sweetest-girl"
    },
    {
        "id": "spot-me-hawaiians",
        "name": "スパリゾートハワイアンズ",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 36.993,
        "longitude": 140.8173,
        "event_date": "2022-08-03",
        "youtube_title": "🎥 関連映像: 『クルクルかき氷』特典手作りMV",
        "youtube_url": "https://www.youtube.com/embed/drmYqT-jlj4",
        "reward_title": "常夏のハワイアンズ",
        "tags": [
            "ハワイアンズ巡礼"
        ],
        "address": "福島県",
        "description": "4thシングル特典映像「ノイミー学園〜初夏の遠足 編〜」の舞台。メンバー自身がカメラを回して手作りした『クルクルかき氷』MVが撮影された東北の聖地です。\n【住所】福島県いわき市常磐藤原町蕨平50",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "drmYqT-jlj4",
        "workKey": "work-drmYqT-jlj4"
    },
    {
        "id": "spot-me-iori",
        "name": "IORI",
        "group": "≠ME",
        "category": "飲食店・その他",
        "latitude": 42.8258,
        "longitude": 141.6598,
        "event_date": "2024-03-20",
        "youtube_title": "🎥 関連映像: 『超特Q 北海道行き』特典映像",
        "youtube_url": "https://www.youtube.com/embed/guphoEWrNKs",
        "reward_title": "超特Qなクイズ王",
        "tags": [
            "超特Q北海道巡礼"
        ],
        "address": "北海道",
        "description": "特典映像「ノイミー学園 雪遊び＆グルメ満喫！超特Q 北海道行き」のロケ地。美味しいグルメを堪能したスポットです。\n【住所】〒066-0026 北海道千歳市住吉１丁目１２−２",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "guphoEWrNKs",
        "workKey": "q"
    },
    {
        "id": "spot-me-takino-snowworld",
        "name": "国営滝野すずらん丘陵公園 滝野スノーワールド",
        "group": "≠ME",
        "category": "飲食店・その他",
        "latitude": 42.91999,
        "longitude": 141.38203,
        "event_date": "2024-03-20",
        "youtube_title": "🎥 関連映像: 『超特Q 北海道行き』特典映像",
        "youtube_url": "https://www.youtube.com/embed/guphoEWrNKs",
        "reward_title": "超特Qなクイズ王",
        "tags": [
            "超特Q北海道巡礼"
        ],
        "address": "北海道",
        "description": "特典映像「ノイミー学園 雪遊び＆グルメ満喫！超特Q 北海道行き」にて、メンバーが雪遊びを満喫したスポットです。\n【住所】〒005-0862 北海道札幌市南区滝野２４７",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "guphoEWrNKs",
        "workKey": "q"
    },
    {
        "id": "spot-me-ashiribetsu",
        "name": "アシリベツの滝",
        "group": "≠ME",
        "category": "飲食店・その他",
        "latitude": 42.9102,
        "longitude": 141.3895,
        "event_date": "2024-03-20",
        "youtube_title": "🎥 関連映像: 『超特Q 北海道行き』特典映像",
        "youtube_url": "https://www.youtube.com/embed/guphoEWrNKs",
        "reward_title": "超特Qなクイズ王",
        "tags": [
            "超特Q北海道巡礼"
        ],
        "address": "北海道",
        "description": "特典映像「ノイミー学園 雪遊び＆グルメ満喫！超特Q 北海道行き」で訪れた、公園内にある美しい滝です。\n【住所】〒005-0862 北海道札幌市南区滝野２４７ 国営滝野すずらん丘陵公園内",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "guphoEWrNKs",
        "workKey": "q"
    },
    {
        "id": "spot-me-kanigen",
        "name": "かに源",
        "group": "≠ME",
        "category": "飲食店・その他",
        "latitude": 43.0538,
        "longitude": 141.3533,
        "event_date": "2024-03-20",
        "youtube_title": "🎥 関連映像: 『超特Q 北海道行き』特典映像",
        "youtube_url": "https://www.youtube.com/embed/guphoEWrNKs",
        "reward_title": "超特Qなクイズ王",
        "tags": [
            "超特Q北海道巡礼"
        ],
        "address": "北海道",
        "description": "特典映像「ノイミー学園 雪遊び＆グルメ満喫！超特Q 北海道行き」でメンバーが北海道グルメを堪能したスポットです。\n【住所】〒064-0806 北海道札幌市中央区南６条西４丁目１−３",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "guphoEWrNKs",
        "workKey": "q"
    },
    {
        "id": "spot-me-fighter-kaden",
        "name": "芸能花伝舎",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.6925,
        "longitude": 139.6896,
        "event_date": "2022-02-16",
        "youtube_title": "🎥 関連映像: 『排他的ファイター』公式MV",
        "youtube_url": "https://www.youtube.com/embed/aXp14lrdymc",
        "reward_title": "孤高のファイター",
        "tags": [
            "排他的ファイター巡礼",
            "排他的ファイター巡礼",
            "排他的ファイター巡礼",
            "排他的ファイター巡礼",
            "だだだ、だって。"
        ],
        "address": "東京都",
        "description": "11thシングル「排他的ファイター」表題曲のMV撮影地です。新宿西新宿にある廃校を再利用した芸能クリエイティブスペースで、メンバーたちが華麗で力強いダンスシーンを披露しました。\n【住所】〒160-0023 東京都新宿区西新宿６丁目１２−３０ A棟2階",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "aXp14lrdymc",
        "workKey": "haitateki-fighter"
    },
    {
        "id": "spot-me-fighter-goblin",
        "name": "GOBLIN. 海岸HALL店",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.6375,
        "longitude": 139.7547,
        "event_date": "2022-02-16",
        "youtube_title": "🎥 関連映像: 『排他的ファイター』公式MV",
        "youtube_url": "https://www.youtube.com/embed/aXp14lrdymc",
        "reward_title": "孤高のファイター",
        "tags": [
            "排他的ファイター巡礼",
            "排他的ファイター巡礼",
            "排他的ファイター巡礼",
            "排他的ファイター巡礼"
        ],
        "address": "東京都",
        "description": "『排他的ファイター』のMV撮影で使用されたスタジオです。港区海岸に位置する開放的で洗練されたマルチスペースで、MV内のスタイリッシュな個別カットやドラマパートが撮影されました。\n【住所】〒108-0022 東京都港区海岸３丁目５−１３ 五色橋ビル\n\n⚠️聖地巡礼に関する重要なお願い\n民間のレンタルスペース・スタジオ（私有地）です。予約利用者や関係者以外の無断立ち入りは禁止されています。巡礼時は外観を遠巻きに眺める程度に留めてください。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "aXp14lrdymc",
        "workKey": "haitateki-fighter"
    },
    {
        "id": "spot-me-fighter-sptv",
        "name": "スカパー東京メディアセンター",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.6669,
        "longitude": 139.8188,
        "event_date": "2022-02-16",
        "youtube_title": "🎥 関連映像: 『排他的ファイター』公式MV",
        "youtube_url": "https://www.youtube.com/embed/aXp14lrdymc",
        "reward_title": "孤高のファイター",
        "tags": [
            "排他的ファイター巡礼",
            "排他的ファイター巡礼",
            "排他的ファイター巡礼",
            "排他的ファイター巡礼",
            "排他的ファイター巡礼"
        ],
        "address": "東京都",
        "description": "『排他的ファイター』のMV内でも特に近未来的で特徴的なシーンが撮影された、江東区新砂にある大型メディア放送センターです。\n【住所】〒136-0075 東京都江東区新砂１丁目１−２",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "aXp14lrdymc",
        "workKey": "haitateki-fighter"
    },
    {
        "id": "spot-me-hanbunko-vence",
        "name": "Studio vence BAYSIDE",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.6268,
        "longitude": 139.8354,
        "event_date": "2020-12-18",
        "youtube_title": "🎥 関連映像: 『はんぶんこクリスマス』公式MV",
        "youtube_url": "https://www.youtube.com/embed/pZ03uFm0sSc",
        "reward_title": "はんぶんこクリスマスの恋人",
        "tags": [
            "はんぶんこクリスマス巡礼"
        ],
        "address": "東京都",
        "description": "超人気の切ないクリスマスバラード曲『はんぶんこクリスマス』のMV撮影地です。新木場のウォーターフロントに佇む、自然光が溢れるアンティーク調の大型ハウススタジオで、メンバーたちの胸がきゅんとするような切ない表情やクリスマスの物語が描かれました。\n【住所】〒136-0082 東京都江東区新木場３丁目４−１１",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "pZ03uFm0sSc",
        "workKey": "work-pZ03uFm0sSc"
    },
    {
        "id": "spot-joy-kyunkawa-patio18",
        "name": "パティオス18番街",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.6401,
        "longitude": 140.0468,
        "event_date": "2023-12-18",
        "youtube_title": "🎥 関連映像: 『きゅんかわ人生』公式MV",
        "youtube_url": "https://www.youtube.com/embed/F4Sg8Lshmks",
        "reward_title": "きゅんかわマスター",
        "tags": [
            "きゅんかわ人生巡礼"
        ],
        "address": "千葉県",
        "description": "≒JOYの胸きゅん王道アイドルソング『きゅんかわ人生』のMVロケ地です。幕張ベイタウンのカラフルでお洒落なヨーロッパ風の街並みを誇るパティオス18番街周辺で、メンバーたちの可愛い日常シーンやポップなダンスシーンが撮影されました。\n【住所】〒261-0013 千葉県千葉市美浜区打瀬３丁目",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "F4Sg8Lshmks",
        "workKey": "work-F4Sg8Lshmks"
    },
    {
        "id": "spot-joy-kyunkawa-patio12",
        "name": "パティオス12番街",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.6424,
        "longitude": 140.0456,
        "event_date": "2023-12-18",
        "youtube_title": "🎥 関連映像: 『きゅんかわ人生』公式MV",
        "youtube_url": "https://www.youtube.com/embed/F4Sg8Lshmks",
        "reward_title": "きゅんかわマスター",
        "tags": [
            "きゅんかわ人生巡礼"
        ],
        "address": "千葉県",
        "description": "『きゅんかわ人生』MV内で、メンバーたちが可愛らしく歩いたりコミカルな振付を見せたりする、パティオス12番街の美しい中庭や街路ロケ地です。\n【住所】〒261-0013 千葉県千葉市美浜区打瀬２丁目１２",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "F4Sg8Lshmks",
        "workKey": "work-F4Sg8Lshmks"
    },
    {
        "id": "spot-joy-kyunkawa-park",
        "name": "打瀬３丁目公園",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.6393,
        "longitude": 140.0475,
        "event_date": "2023-12-18",
        "youtube_title": "🎥 関連映像: 『きゅんかわ人生』公式MV",
        "youtube_url": "https://www.youtube.com/embed/F4Sg8Lshmks",
        "reward_title": "きゅんかわマスター",
        "tags": [
            "きゅんかわ人生巡礼"
        ],
        "address": "千葉県",
        "description": "『きゅんかわ人生』MVのシンボル的な場所で、芝生の上でメンバーたちが元気に「きゅんかわ」ポーズで踊るダンスシーンの主ロケ地となった開放的な緑豊かな公園です。\n【住所】〒261-0013 千葉県千葉市美浜区打瀬３丁目６",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "F4Sg8Lshmks",
        "workKey": "work-F4Sg8Lshmks"
    },
    {
        "id": "spot-joy-kyunkawa-mbpoint",
        "name": "エムベイポイント幕張 25階円卓会議室",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.6481,
        "longitude": 140.0384,
        "event_date": "2023-12-18",
        "youtube_title": "🎥 関連映像: 『きゅんかわ人生』公式MV",
        "youtube_url": "https://www.youtube.com/embed/F4Sg8Lshmks",
        "reward_title": "きゅんかわマスター",
        "tags": [
            "きゅんかわ人生巡礼"
        ],
        "address": "千葉県",
        "description": "『きゅんかわ人生』のMVで、メンバーたちが可愛すぎるスパイに扮して「きゅんかわ会議」を行う近未来的でパノラマビューの円卓会議室です。\n【住所】〒261-0023 千葉県千葉市美浜区中瀬１丁目６",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "F4Sg8Lshmks",
        "workKey": "work-F4Sg8Lshmks"
    },
    {
        "id": "spot-shokori-start",
        "name": "東京駅八重洲南口 グランルーフ 歩行者デッキ",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.6797,
        "longitude": 139.7684,
        "event_date": "2024-04-01",
        "youtube_title": "🎥 関連映像: しょこりさんぽ",
        "youtube_url": "https://www.youtube.com/embed/CEES6m9G268",
        "reward_title": "しょこりさ推し！",
        "tags": [
            "しょこりさんぽ巡礼"
        ],
        "address": "東京都",
        "description": "瀧脇笙古さんと音嶋莉沙さんの仲良しコンビ「しょこりさ」のお散歩スタート地点です。\n【住所】〒100-0005 東京都千代田区丸の内１丁目９−１",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "CEES6m9G268",
        "workKey": "work-CEES6m9G268"
    },
    {
        "id": "spot-shokori-goal",
        "name": "TOKYO TORCH Park 錦鯉の泳ぐ池",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.6841,
        "longitude": 139.7699,
        "event_date": "2024-04-01",
        "youtube_title": "🎥 関連映像: しょこりさんぽ",
        "youtube_url": "https://www.youtube.com/embed/CEES6m9G268",
        "reward_title": "しょこりさ推し！",
        "tags": [
            "しょこりさんぽ巡礼",
            "しょこりさんぽゴール"
        ],
        "address": "東京都",
        "description": "「鯉さん元気！？」でおなじみ、しょこりさんぽのゴール地点です。\n【住所】〒100-0004 東京都千代田区大手町２丁目６−４",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "CEES6m9G268",
        "workKey": "work-CEES6m9G268"
    },
    {
        "id": "spot-love-ohimesama",
        "name": "大宮アートグレイスウエディングシャトー シャトー・シャンパーニュ",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.9288,
        "longitude": 139.6276,
        "event_date": "2023-09-06",
        "youtube_url": "https://www.youtube.com/embed/2udLA8-QuD8",
        "address": "埼玉県",
        "description": "『お姫様の作り方』MV撮影地です。\n【住所】〒331-0813 埼玉県さいたま市北区植竹町１丁目８１６−７",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "2udLA8-QuD8",
        "workKey": "work-2udLA8-QuD8"
    },
    {
        "id": "spot-joy-lion1",
        "name": "株式会社 山勝 第三工場",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.4357,
        "longitude": 139.4278,
        "event_date": "2022-11-23",
        "youtube_url": "https://www.youtube.com/embed/Ry9UCc9H3nw",
        "address": "神奈川県",
        "description": "『超孤独ライオン』MVロケ地です。\n【住所】〒252-1125 神奈川県綾瀬市吉岡東２丁目７−２２",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "Ry9UCc9H3nw",
        "workKey": "work-Ry9UCc9H3nw"
    },
    {
        "id": "spot-joy-lion2",
        "name": "株式会社 山勝 第一工場",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.4358,
        "longitude": 139.4279,
        "event_date": "2022-11-23",
        "youtube_url": "https://www.youtube.com/embed/Ry9UCc9H3nw",
        "address": "神奈川県",
        "description": "『超孤独ライオン』MVロケ地です。\n【住所】〒252-1125 神奈川県綾瀬市吉岡東２丁目７−２２（同上）",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "Ry9UCc9H3nw",
        "workKey": "work-Ry9UCc9H3nw"
    },
    {
        "id": "spot-joy-sweet16",
        "name": "鴨川令徳高等学校",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.109,
        "longitude": 140.103,
        "event_date": "2023-02-22",
        "youtube_url": "https://www.youtube.com/embed/GuvkL9Gz9P0",
        "address": "千葉県",
        "description": "『スイートシックスティーン』MVロケ地です。\n【住所】〒296-0001 千葉県鴨川市横渚８１５",
        "coordinateAccuracy": "facility",
        "youtubeId": "GuvkL9Gz9P0",
        "workKey": "work-GuvkL9Gz9P0"
    },
    {
        "id": "spot-joy-byun1",
        "name": "茨城空港 国際線チェックインカウンター前",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 36.1825,
        "longitude": 140.4132,
        "event_date": "2023-07-19",
        "tags": [
            "大空、ビュンと巡礼"
        ],
        "address": "茨城県",
        "description": "『大空、ビュンと』巡礼スポット①。\n【住所】〒311-3416 茨城県小美玉市与沢１６０１−５５",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定"
    },
    {
        "id": "spot-joy-byun2",
        "name": "茨城空港 送迎デッキ側休憩スペース",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 36.1826,
        "longitude": 140.4131,
        "event_date": "2023-07-19",
        "tags": [
            "大空、ビュンと巡礼"
        ],
        "address": "茨城県",
        "description": "『大空、ビュンと』巡礼スポット②。\n【住所】〒311-3416 茨城県小美玉市与沢１６０１−５５",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定"
    },
    {
        "id": "spot-joy-byun3",
        "name": "茨城空港 駐車場側休憩スペース",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 36.1824,
        "longitude": 140.413,
        "event_date": "2023-07-19",
        "tags": [
            "大空、ビュンと巡礼"
        ],
        "address": "茨城県",
        "description": "『大空、ビュンと』巡礼スポット③。\n【住所】〒311-3416 茨城県小美玉市与沢１６０１−５５",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定"
    },
    {
        "id": "spot-joy-byun4",
        "name": "茨城空港 国際線出発口横エスカレーター前",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 36.1827,
        "longitude": 140.4133,
        "event_date": "2023-07-19",
        "tags": [
            "大空、ビュンと巡礼"
        ],
        "address": "茨城県",
        "description": "『大空、ビュンと』巡礼スポット④。\n【住所】〒311-3416 茨城県小美玉市与沢１６０１−５５",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定"
    },
    {
        "id": "spot-joy-byun5",
        "name": "渋谷スクランブル交差点",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.6595,
        "longitude": 139.7005,
        "event_date": "2023-07-19",
        "tags": [
            "大空、ビュンと巡礼"
        ],
        "address": "東京都",
        "description": "『大空、ビュンと』巡礼スポット⑤。\n【住所】〒150-0042 東京都渋谷区道玄坂２丁目２",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定"
    },
    {
        "id": "spot-joy-byun6",
        "name": "ぶたの旨味らーめん とんくる",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.6744,
        "longitude": 139.6644,
        "event_date": "2023-07-19",
        "tags": [
            "大空、ビュンと巡礼"
        ],
        "address": "東京都",
        "description": "『大空、ビュンと』巡礼スポット⑥。\n【住所】〒151-0073 東京都渋谷区笹塚２丁目１１−７ アーバンイマイII 102",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定"
    },
    {
        "id": "spot-joy-byun7",
        "name": "ノアスタジオ都立大 B1Cst",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.6179,
        "longitude": 139.6757,
        "event_date": "2023-07-19",
        "reward_title": "大空を駆ける者",
        "tags": [
            "大空、ビュンと巡礼",
            "大空、ビュンとゴール"
        ],
        "address": "東京都",
        "description": "『大空、ビュンと』巡礼スポット⑦（ゴール）。\n【住所】〒152-0031 東京都目黒区中根１丁目７−２３ ＳＴビル",
        "coordinateAccuracy": "facility"
    },
    {
        "id": "spot-joy-exult",
        "name": "相模大野立体駐車場",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.5312,
        "longitude": 139.4355,
        "event_date": "2023-09-06",
        "youtube_url": "https://www.youtube.com/embed/x68AnwPpT-s",
        "address": "神奈川県",
        "description": "『その先はイグザルト』MVロケ地です。\n【住所】〒252-0303 神奈川県相模原市南区相模大野4丁目4-2",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "x68AnwPpT-s",
        "workKey": "work-x68AnwPpT-s"
    },
    {
        "id": "spot-joy-denwabango1",
        "name": "静岡県立大学 草薙キャンパス",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 34.996,
        "longitude": 138.4454,
        "event_date": "2024-01-01",
        "youtube_title": "🎥 関連映像: 『電話番号教えて』公式MV",
        "youtube_url": "https://www.youtube.com/embed/KZ0_Q66AgLk",
        "reward_title": "電話番号を知っている者",
        "address": "静岡県",
        "description": "≒JOYの人気曲『電話番号教えて』のMVロケ地。広大な大学キャンパスを舞台に、ニアジョイメンバーたちの青春感あふれるシーンが撮影された。静岡屈指の国公立大学のキャンパスで、MVの爽やかな世界観が見事に表現されている。\n\n⚠️聖地巡礼に関する重要なお願い\n現在も学生が通う現役の大学キャンパスです。敷地内への無断立ち入りや、学生の迷惑になる長時間の滞留・撮影はご遠慮ください。\n【住所】〒422-8002 静岡県静岡市駿河区谷田52-1",
        "coordinateAccuracy": "facility",
        "youtubeId": "KZ0_Q66AgLk",
        "workKey": "work-KZ0_Q66AgLk"
    },
    {
        "id": "spot-joy-denwabango2",
        "name": "白鵬女子高等学校",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.51325,
        "longitude": 139.65825,
        "event_date": "2024-01-01",
        "youtube_title": "🎥 関連映像: 『電話番号教えて』公式MV",
        "youtube_url": "https://www.youtube.com/embed/KZ0_Q66AgLk",
        "reward_title": "電話番号を知っている者",
        "address": "神奈川県",
        "description": "≒JOYの人気曲『電話番号教えて』のMVロケ地。神奈川県横浜市鶴見区に位置する女子校で、制服姿のメンバーたちが青春ストーリーを繰り広げた。学校という舞台がMVの「好きな人に電話番号を聞けない」という切ない世界観にピッタリとはまった名ロケ地。\n\n⚠️聖地巡礼に関する重要なお願い\n現在も生徒が通う現役の高校です。敷地内への無断立ち入り、生徒が映り込む撮影、長時間の滞留は絶対に禁止です。公道から静かに外観を眺める程度に留めてください。\n【住所】〒230-0074 神奈川県横浜市鶴見区北寺尾4丁目10-13",
        "coordinateAccuracy": "facility",
        "youtubeId": "KZ0_Q66AgLk",
        "workKey": "work-KZ0_Q66AgLk"
    },
    {
        "id": "spot-joy-denwabango-dance",
        "name": "livedoor URBAN SPORTS PARK",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.6393,
        "longitude": 139.7878,
        "event_date": "2026-02-24",
        "youtube_title": "🎥 関連映像: 『電話番号教えて！』Special Dance ver.",
        "youtube_url": "https://www.youtube.com/embed/KZ0_Q66AgLk",
        "address": "東京都",
        "description": "『電話番号教えて！』Special Dance ver.の撮影が行われた聖地です。広大なアーバンスポーツパーク（有明アーバンスポーツパーク）を背景に、メンバーのキレのあるダンスが披露されました。スポーティで開放感のあるロケーションをぜひ現地で体感してください。\n【住所】〒135-0063 東京都江東区有明1-13-7",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "KZ0_Q66AgLk",
        "workKey": "work-KZ0_Q66AgLk"
    },
    {
        "id": "spot-joy-bluehawaii-1",
        "name": "ユクサおおすみ海の学校",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 31.3726,
        "longitude": 130.7793,
        "event_date": "2025-05-04",
        "youtube_title": "🎥 関連映像: 『ブルーハワイレモン』公式MV",
        "youtube_url": "https://www.youtube.com/embed/cBtqEehEKuQ",
        "address": "鹿児島県",
        "description": "『ブルーハワイレモン』MVのメイン舞台となる学校シーンや、エモーショナルなダンスシーン等が撮影されたロケ地です。青い海と空に囲まれた美しいノスタルジーを感じる場所で、MVの世界観にどっぷりと浸ることができます。\n【住所】〒891-2313 鹿児島県鹿屋市天神町3629-1",
        "coordinateAccuracy": "facility",
        "youtubeId": "cBtqEehEKuQ",
        "workKey": "work-cBtqEehEKuQ"
    },
    {
        "id": "spot-joy-bluehawaii-2",
        "name": "THOUSAND GARDEN TARUMIZU",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 31.4462,
        "longitude": 130.7715,
        "event_date": "2025-05-04",
        "youtube_title": "🎥 関連映像: 『ブルーハワイレモン』公式MV",
        "youtube_url": "https://www.youtube.com/embed/cBtqEehEKuQ",
        "address": "鹿児島県",
        "description": "『ブルーハワイレモン』MVの中で、メンバーが訪れるお洒落なお店シーン等の撮影地です。海沿いの風を感じながら、推したちが過ごしたひと夏のリゾート気分を味わえる最高のスポットです。\n【住所】〒891-2114 鹿児島県垂水市新城827-1",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "cBtqEehEKuQ",
        "workKey": "work-cBtqEehEKuQ"
    },
    {
        "id": "spot-joy-bluehawaii-3",
        "name": "鹿児島交通 一里山停留所",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 31.3911,
        "longitude": 130.799,
        "event_date": "2025-05-04",
        "youtube_title": "🎥 関連映像: 『ブルーハワイレモン』公式MV",
        "youtube_url": "https://www.youtube.com/embed/cBtqEehEKuQ",
        "address": "鹿児島県",
        "description": "『ブルーハワイレモン』MVにて、田舎の風景の中にぽつんと佇むバス停シーン等の撮影地です。ノスタルジックな夏の空気感がそのまま残っており、MVのワンシーンを再現しての記念撮影にぴったりです。\n【住所】鹿児島県鹿屋市白水町周辺",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "cBtqEehEKuQ",
        "workKey": "work-cBtqEehEKuQ"
    },
    {
        "id": "spot-joy-bluehawaii-4",
        "name": "垂水港西防波堤灯台",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 31.4844,
        "longitude": 130.6916,
        "event_date": "2025-05-04",
        "youtube_title": "🎥 関連映像: 『ブルーハワイレモン』公式MV",
        "youtube_url": "https://www.youtube.com/embed/cBtqEehEKuQ",
        "address": "鹿児島県",
        "description": "『ブルーハワイレモン』MVのイントロ部分で、怜音が防波堤を全力で走っている印象的なシーンの撮影地です。果てしなく続く海と灯台のコントラストが美しく、楽曲の爽快感を体感できる聖地です。\n【住所】鹿児島県垂水市 垂水港西防波堤外端",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "cBtqEehEKuQ",
        "workKey": "work-cBtqEehEKuQ"
    },
    {
        "id": "spot-joy-bluehawaii-jacket",
        "name": "とちぎ海浜自然の家",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 36.166,
        "longitude": 140.547,
        "event_date": "2025-05-04",
        "youtube_title": "🎥 関連映像: 『ブルーハワイレモン』ジャケット撮影メイキング",
        "youtube_url": "https://www.youtube.com/embed/gS5sfnSuS6g",
        "address": "茨城県",
        "description": "『ブルーハワイレモン』の全タイプ（Type A〜D）のジャケット写真が撮影された場所です。洗練された建築と自然の調和が美しく、メンバーたちの爽やかなビジュアルが最大限に引き出されたロケ地となっています。\n【住所】〒311-1412 茨城県鉾田市玉田336-2",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "gS5sfnSuS6g",
        "workKey": "work-gS5sfnSuS6g"
    },
    {
        "id": "spot-me-marshmallow-float",
        "name": "東京オペラシティ",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.6828,
        "longitude": 139.6881,
        "event_date": "2023-04-17",
        "youtube_title": "🎥 関連映像: 『マシュマロフロート』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Vn0CYp7_MNs",
        "address": "東京都",
        "description": "『マシュマロフロート』のMV内に登場する聖地です。2番のサビのダンスシーンや、MVの最後を飾る印象的なシーンの撮影が行われました。都会的で洗練されたロケーションの雰囲気を、ぜひ現地で体感しながらMVを振り返ってみてください。\n【住所】〒163-1403 東京都新宿区西新宿3-20-2",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "Vn0CYp7_MNs",
        "workKey": "work-Vn0CYp7_MNs"
    },
    {
        "id": "spot-osakakyoto-usj",
        "name": "ユニバーサル・スタジオ・ジャパン",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 34.6654,
        "longitude": 135.4323,
        "event_date": "2023-09-23",
        "youtube_title": "🎥 関連映像: メンバーだけで旅行に行ってきました！！！【大阪&京都旅】",
        "youtube_url": "https://www.youtube.com/embed/YgOd8ZpFaUU",
        "reward_title": "なにわのハリポタアイドル",
        "address": "大阪府",
        "description": "イコノイジョイ大運動会の優勝賞品として贈られた国内旅行で、メンバー全員で訪れた大人気テーマパークです。動画内では、みんなでカチューシャを選んだり、アトラクションを全力で楽しむ姿が見られました。メンバーたちが味わった興奮とハッピーな空間をぜひ現地で満喫してください！\n【住所】〒554-0031 大阪府大阪市此花区桜島２丁目１−３３",
        "coordinateAccuracy": "facility",
        "youtubeId": "YgOd8ZpFaUU",
        "workKey": "work-YgOd8ZpFaUU"
    },
    {
        "id": "spot-osakakyoto-okabeya",
        "name": "清水順正 おかべ家",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 34.996,
        "longitude": 135.7811,
        "event_date": "2023-09-23",
        "youtube_title": "🎥 関連映像: メンバーだけで旅行に行ってきました！！！【大阪&京都旅】",
        "youtube_url": "https://www.youtube.com/embed/YgOd8ZpFaUU",
        "reward_title": "京都湯豆腐の美食家",
        "address": "京都府",
        "description": "京都の伝統的な湯豆腐が味わえる名店です。和の情緒あふれる店内で、メンバーたちが美味しそうに京都グルメを堪能していました。清水寺参拝のルートにも組み込みやすく、推しと同じお豆腐料理を味わう贅沢な巡礼が楽しめます。\n【住所】〒605-0862 京都府京都市東山区清水２丁目２３９",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "YgOd8ZpFaUU",
        "workKey": "work-YgOd8ZpFaUU"
    },
    {
        "id": "spot-osakakyoto-nishiki",
        "name": "錦市場",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.005,
        "longitude": 135.766,
        "event_date": "2023-09-23",
        "youtube_title": "🎥 関連映像: メンバーだけで旅行に行ってきました！！！【大阪&京都旅】",
        "youtube_url": "https://www.youtube.com/embed/YgOd8ZpFaUU",
        "reward_title": "錦市場の食べ歩き達人",
        "address": "京都府",
        "description": "「京都の台所」として有名な錦市場です。佐々木舞香さん、諸橋紗夏さん、山本杏奈さん、齊藤なぎささん、大谷映美里さん、音嶋莉沙さん、野口衣織さんのメンバーで食べ歩きを楽しみました。賑やかな商店街で、メンバーたちが何を食べたのか探しながら歩くのがおすすめです。\n【住所】〒604-8055 京都府京都市中京区東魚屋町",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "YgOd8ZpFaUU",
        "workKey": "work-YgOd8ZpFaUU"
    },
    {
        "id": "spot-osakakyoto-yasakaroumon",
        "name": "八坂神社 西楼門",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.0036,
        "longitude": 135.7786,
        "event_date": "2023-09-23",
        "youtube_title": "🎥 関連映像: メンバーだけで旅行に行ってきました！！！【大阪&京都旅】",
        "youtube_url": "https://www.youtube.com/embed/YgOd8ZpFaUU",
        "reward_title": "朱塗りの西楼門でポーズ",
        "address": "京都府",
        "description": "祇園の象徴ともいえる鮮やかな朱塗りの門です。京都旅の定番スポットとしてメンバーたちも訪れ、美しい景観をバックに楽しんでいました。周辺には推し活にぴったりなお店も多く、京都巡礼の起点にふさわしい場所です。\n【住所】〒605-0073 京都府京都市東山区祇園町北側６２５",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "YgOd8ZpFaUU",
        "workKey": "work-YgOd8ZpFaUU"
    },
    {
        "id": "spot-osakakyoto-yasakakoushindou",
        "name": "金剛寺 八坂庚申堂",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 34.9983,
        "longitude": 135.7787,
        "event_date": "2023-09-23",
        "youtube_title": "🎥 関連映像: メンバーだけで旅行に行ってきました！！！【大阪&京都旅】",
        "youtube_url": "https://www.youtube.com/embed/YgOd8ZpFaUU",
        "reward_title": "くくり猿と映えるオタク",
        "address": "京都府",
        "description": "カラフルな「くくり猿」がSNSでも大人気の映えスポットです。メンバーたちも色鮮やかなお堂の前で、京都らしい華やかな雰囲気を楽しんでいました。ぜひお気に入りのアクスタや生写真を持って、同じ画角で記念撮影をしてみてください。\n【住所】〒605-0828 京都府京都市東山区金園町３９０",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "YgOd8ZpFaUU",
        "workKey": "work-YgOd8ZpFaUU"
    },
    {
        "id": "spot-osakakyoto-imopippi",
        "name": "芋ぴっぴ。京都祇園店",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.0023,
        "longitude": 135.7772,
        "event_date": "2023-09-23",
        "youtube_title": "🎥 関連映像: メンバーだけで旅行に行ってきました！！！【大阪&京都旅】",
        "youtube_url": "https://www.youtube.com/embed/YgOd8ZpFaUU",
        "reward_title": "祇園の甘いお芋ちゃん",
        "address": "京都府",
        "description": "祇園でおすすめの焼き芋スイーツ専門店です。動画内でメンバーたちが立ち寄り、美味しそうなスイーツに目を輝かせていました。食べ歩きにもぴったりで、甘いお芋を片手に祇園の街並みを散策するのが最高の推し活ルートです。\n【住所】〒605-0074 京都府京都市東山区祇園町南側５２４ ギオン和喜ビル 2階",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "YgOd8ZpFaUU",
        "workKey": "work-YgOd8ZpFaUU"
    },
    {
        "id": "spot-osakakyoto-nishikimarun",
        "name": "錦まるん",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.005,
        "longitude": 135.7646,
        "event_date": "2023-09-23",
        "youtube_title": "🎥 関連映像: メンバーだけで旅行に行ってきました！！！【大阪&京都旅】",
        "youtube_url": "https://www.youtube.com/embed/YgOd8ZpFaUU",
        "reward_title": "まるんでお土産ハンター",
        "address": "京都府",
        "description": "錦市場にある、可愛らしいお菓子や京都雑貨が並ぶお店です。お土産選びをしながらメンバーたちが楽しそうに過ごしていた空間です。カラフルで可愛い金平糖や京菓子など、巡礼の思い出になるお土産を探してみてください。\n【住所】〒604-8055 京都府京都市中京区東魚屋町 錦小路柳馬場東入東魚屋180",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "YgOd8ZpFaUU",
        "workKey": "work-YgOd8ZpFaUU"
    },
    {
        "id": "spot-osakakyoto-kiyomizudera",
        "name": "清水寺",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 34.9948,
        "longitude": 135.785,
        "event_date": "2023-09-23",
        "youtube_title": "🎥 関連映像: メンバーだけで旅行に行ってきました！！！【大阪&京都旅】",
        "youtube_url": "https://www.youtube.com/embed/YgOd8ZpFaUU",
        "reward_title": "清水の舞台からの絶景者",
        "address": "京都府",
        "description": "世界遺産にも登録されている、京都を代表する寺院です。ここでは髙松瞳さん、瀧脇笙古さん、齋藤樹愛羅さんのチームが訪れ、「清水の舞台」からの絶景を堪能したり、境内を仲良く散策していました。四季折々の美しい景色とともに、3人の足跡を辿ってみてください。\n【住所】〒605-0862 京都府京都市東山区清水１丁目２９４",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "YgOd8ZpFaUU",
        "workKey": "work-YgOd8ZpFaUU"
    },
    {
        "id": "spot-osakakyoto-ikkakuju",
        "name": "いっかくじゅう 四条新町店",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.0047,
        "longitude": 135.7574,
        "event_date": "2023-09-23",
        "youtube_title": "🎥 関連映像: メンバーだけで旅行に行ってきました！！！【大阪&京都旅】",
        "youtube_url": "https://www.youtube.com/embed/YgOd8ZpFaUU",
        "reward_title": "京風お好み焼きの晩餐会",
        "address": "京都府",
        "description": "京都旅の締めくくりに、メンバー全員集合で絶品のお好み焼きや京風鉄板焼きを囲んで晩御飯を食べたお店です。動画のラストで楽しそうに旅の思い出を語り合っていたエモーショナルな場所。聖地巡礼のディナーにこれ以上ない特別なロケーションです。\n【住所】〒604-8223 京都府京都市中京区新町通錦小路下ル小結棚町４３５ ジェイブライド四条烏丸1F",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "YgOd8ZpFaUU",
        "workKey": "work-YgOd8ZpFaUU"
    },
    {
        "id": "spot-real-taitobeach",
        "name": "太東海水浴場",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.3295,
        "longitude": 140.399,
        "event_date": "2024-07-29",
        "youtube_title": "🎥 関連映像: 『海とレモンティー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/i024yWd9oiI",
        "reward_title": "甘酸っぱいレモンティー",
        "tags": [
            "海とレモンティー巡礼"
        ],
        "address": "千葉県",
        "description": "『海とレモンティー』のMV撮影が行われたビーチです。青い海と空が広がる開放的なロケーションで、メンバーたちの爽やかで甘酸っぱい夏の思い出が詰まっています。潮風を感じながらMVの世界に浸ってみてください。\n【住所】〒299-4502 千葉県いすみ市岬町中原谷の平地74番地先",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "i024yWd9oiI",
        "workKey": "work-i024yWd9oiI"
    },
    {
        "id": "spot-real-ootani",
        "name": "海の家 おおたに",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.329,
        "longitude": 140.3985,
        "event_date": "2024-07-29",
        "youtube_title": "🎥 関連映像: 『海とレモンティー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/i024yWd9oiI",
        "reward_title": "海の家の看板娘・看板息子",
        "tags": [
            "海とレモンティー巡礼"
        ],
        "address": "千葉県",
        "description": "同じく『海とレモンティー』のMVに登場する海の家です。レトロでどこか懐かしい雰囲気の中で、メンバーたちのキュートな笑顔が弾けていた場所。夏の海辺の特別な時間を追体験できる最高の聖地です。\n【住所】〒299-4502 千葉県いすみ市岬町中原谷の平地74番地先",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "i024yWd9oiI",
        "workKey": "work-i024yWd9oiI"
    },
    {
        "id": "spot-real-seibuparking",
        "name": "西部スマイルパーク西部競輪場駐車場",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.7725,
        "longitude": 139.4358,
        "event_date": "2021-08-25",
        "youtube_title": "🎥 関連映像: 『夏祭り恋慕う』公式MV",
        "youtube_url": "https://www.youtube.com/embed/8VBDO8ZQyDo",
        "reward_title": "夏祭りの夜の夢",
        "tags": [
            "夏祭り恋慕う巡礼"
        ],
        "address": "埼玉県",
        "description": "『夏祭り恋慕う』のMVで、華やかなお祭りのセットが組まれたロケ地です。浴衣姿のメンバーたちが恋心を歌う、あのエモーショナルで儚い夏の夜の情景が浮かび上がってきます。目を閉じれば打ち上げ花火の音が聞こえてきそうな場所です。\n【住所】〒359-1133 埼玉県所沢市荒幡１４１７−２",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "8VBDO8ZQyDo",
        "workKey": "work-8VBDO8ZQyDo"
    },
    {
        "id": "spot-real-kazusaminato-1",
        "name": "上総湊海水浴場（湊752番2）",
        "youtubeId": "qzFBzJ2KWwY",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.2202,
        "longitude": 139.8678,
        "event_date": "2022-09-25",
        "youtube_title": "🎥 関連映像: 『真夜中マーメイド』公式MV",
        "youtube_url": "https://www.youtube.com/embed/qzFBzJ2KWwY",
        "reward_title": "海辺のダンスパートナー",
        "tags": [
            "真夜中マーメイド巡礼"
        ],
        "address": "千葉県",
        "description": "『真夜中マーメイド』のMVで、切なくも美しいダンスシーンや海辺のシーンが撮影されたロケ地の一つです。静かな波音とともに、楽曲の持つ儚さと優雅さをじっくりと噛み締めることができる聖地です。\n【住所】〒299-1607 千葉県富津市湊752番2",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "workKey": "work-qzFBzJ2KWwY"
    },
    {
        "id": "spot-real-haraokasanbashi",
        "name": "原岡桟橋（岡本桟橋）",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.04428,
        "longitude": 139.8227,
        "event_date": "2022-09-25",
        "youtube_title": "🎥 関連映像: 『真夜中マーメイド』公式MV",
        "youtube_url": "https://www.youtube.com/embed/qzFBzJ2KWwY",
        "reward_title": "桟橋のマーメイド",
        "tags": [
            "真夜中マーメイド巡礼"
        ],
        "description": "『真夜中マーメイド』の象徴的なシーンで登場する、海へと続く木製のノスタルジックな桟橋です。夕暮れ時や夜にかけての風景は息を呑むほど美しく、まるで本当にマーメイドが現れそうな幻想的な空気に包まれています。\n【住所】〒299-2403 千葉県南房総市富浦町原岡地先",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "qzFBzJ2KWwY",
        "workKey": "work-qzFBzJ2KWwY"
    },
    {
        "id": "spot-real-kazusaminato-2",
        "name": "上総湊海水浴場（湊６１０−９）",
        "youtubeId": "qzFBzJ2KWwY",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.2227,
        "longitude": 139.8631,
        "event_date": "2022-09-25",
        "youtube_title": "🎥 関連映像: 『真夜中マーメイド』公式MV",
        "youtube_url": "https://www.youtube.com/embed/qzFBzJ2KWwY",
        "reward_title": "潮風の歌姫・歌手",
        "tags": [
            "真夜中マーメイド巡礼"
        ],
        "description": "こちらも『真夜中マーメイド』のMV撮影で使用されたエリアです。広大な砂浜と海を背景に、楽曲の世界観にどっぷりと浸りながら、推しと同じ海風を感じてみてください。\n【住所】〒299-1607 千葉県富津市湊６１０−９",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "workKey": "work-qzFBzJ2KWwY"
    },
    {
        "id": "spot-real-nihon-u-plaza",
        "name": "日本大学理工学部 船橋キャンパス（プラザ習志野）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.7259,
        "longitude": 140.0558,
        "event_date": "2026-06-02",
        "youtube_title": "🎥 関連映像: 『超特急逃走中』公式MV",
        "youtube_url": "https://www.youtube.com/embed/d20dEAtbL08",
        "reward_title": "逃走中の超特急",
        "tags": [
            "超特急逃走中巡礼",
            "「僕たちの歌」"
        ],
        "address": "千葉県",
        "description": "=LOVE『超特急逃走中』のMV撮影が行われたプラザ習志野です。推しを追いかけるドキドキ感と疾走感あふれる楽曲の世界観が詰まった場所。メンバーたちが駆け抜けたエネルギッシュな空間をぜひ現地で体感してください。\n\n⚠️聖地巡礼に関する重要なお願い\nこちらは現在も学生が通う現役の大学キャンパスです。時期や時間帯によっては関係者以外の立ち入りが制限されている場合があります。敷地内に入る際は、必ず正門の警備員や窓口等で見学の許可を取るようにしてください。また、授業や学生生活の妨げにならないよう、マナーとモラルを厳守した節度ある行動をお願いいたします。",
        "coordinateAccuracy": "facility",
        "youtubeId": "d20dEAtbL08",
        "workKey": "work-d20dEAtbL08"
    },
    {
        "id": "spot-real-nihon-u-garden",
        "name": "日本大学理工学部 船橋キャンパス（中央庭園）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.7275,
        "longitude": 140.0558,
        "event_date": "2026-06-02",
        "youtube_title": "🎥 関連映像: 『超特急逃走中』公式MV",
        "youtube_url": "https://www.youtube.com/embed/d20dEAtbL08",
        "reward_title": "逃走中の超特急",
        "tags": [
            "超特急逃走中巡礼"
        ],
        "address": "千葉県",
        "description": "『超特急逃走中』に登場する中央庭園です。広々としたキャンパス内で、キュートでハイテンションなパフォーマンスが繰り広げられた聖地。緑豊かな風景とともに、MVのシーンを思い出しながら散策するのがおすすめです。\n\n⚠️聖地巡礼に関する重要なお願い\nこちらは現在も学生が通う現役の大学キャンパスです。時期や時間帯によっては関係者以外の立ち入りが制限されている場合があります。敷地内に入る際は、必ず正門の警備員や窓口等で見学の許可を取るようにしてください。また、授業や学生生活の妨げにならないよう、マナーとモラルを厳守した節度ある行動をお願いいたします。",
        "coordinateAccuracy": "facility",
        "youtubeId": "d20dEAtbL08",
        "workKey": "work-d20dEAtbL08"
    },
    {
        "id": "spot-real-nihon-u-tp15",
        "name": "日本大学理工学部 船橋キャンパス（テクノプレース15 西側）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.7285,
        "longitude": 140.0565,
        "event_date": "2026-06-02",
        "youtube_title": "🎥 関連映像: 『超特急逃走中』公式MV",
        "youtube_url": "https://www.youtube.com/embed/d20dEAtbL08",
        "reward_title": "逃走中の超特急",
        "tags": [
            "超特急逃走中巡礼"
        ],
        "address": "千葉県",
        "description": "『超特急逃走中』のロケ地となったテクノプレース15の西側エリアです。ハイスピードで駆け抜けるようなリズムに合わせて、メンバーの勢いと楽しさが弾けたスポット。同じ画角を探して記念撮影を楽しんでみてください。\n\n⚠️聖地巡礼に関する重要なお願い\nこちらは現在も学生が通う現役の大学キャンパスです。時期や時間帯によっては関係者以外の立ち入りが制限されている場合があります。敷地内に入る際は、必ず正門の警備員や窓口等で見学の許可を取るようにしてください。また、授業や学生生活の妨げにならないよう、マナーとモラルを厳守した節度ある行動をお願いいたします。",
        "coordinateAccuracy": "facility",
        "youtubeId": "d20dEAtbL08",
        "workKey": "work-d20dEAtbL08"
    },
    {
        "id": "spot-real-nihon-u-sphall",
        "name": "日本大学理工学部 船橋キャンパス（理工学部スポーツホール）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.7275,
        "longitude": 140.0573,
        "event_date": "2026-06-02",
        "youtube_title": "🎥 関連映像: 『超特急逃走中』公式MV",
        "youtube_url": "https://www.youtube.com/embed/d20dEAtbL08",
        "reward_title": "逃走中の超特急",
        "tags": [
            "超特急逃走中巡礼"
        ],
        "address": "千葉県",
        "description": "同じく『超特急逃走中』の撮影で使用されたスポーツホールです。ライブの高揚感と熱量がそのまま伝わってくるような、元気いっぱいのシーンが印象的な聖地。楽曲を聴きながらテンションを上げて巡礼しましょう！\n\n⚠️聖地巡礼に関する重要なお願い\nこちらは現在も学生が通う現役の大学キャンパスです。時期や時間帯によっては関係者以外の立ち入りが制限されている場合があります。敷地内に入る際は、必ず正門の警備員や窓口等で見学の許可を取るようにしてください。また、授業や学生生活の妨げにならないよう、マナーとモラルを厳守した節度ある行動をお願いいたします。",
        "coordinateAccuracy": "facility",
        "youtubeId": "d20dEAtbL08",
        "workKey": "work-d20dEAtbL08"
    },
    {
        "id": "spot-real-nihon-u-road",
        "name": "日本大学理工学部 船橋キャンパス（交通総合試験路）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.7262,
        "longitude": 140.0551,
        "event_date": "2026-06-02",
        "youtube_title": "🎥 関連映像: 『超特急逃走中』公式MV",
        "youtube_url": "https://www.youtube.com/embed/d20dEAtbL08",
        "reward_title": "逃走中の超特急",
        "tags": [
            "超特急逃走中巡礼"
        ],
        "address": "千葉県",
        "description": "『超特急逃走中』のMVを象徴する、交通総合試験路のロケ地です。まさに「超特急で逃走中」な疾走感あふれるシーンが撮影されました。広大なテストコースを背景に、スリルと楽しさが混ざり合う最高の推し活スポットです。\n\n⚠️聖地巡礼に関する重要なお願い\nこちらは現在も学生が通う現役の大学キャンパスです。時期や時間帯によっては関係者以外の立ち入りが制限されている場合があります。敷地内に入る際は、必ず正門の警備員や窓口等で見学の許可を取るようにしてください。また、授業や学生生活の妨げにならないよう、マナーとモラルを厳守した節度ある行動をお願いいたします。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "d20dEAtbL08",
        "workKey": "work-d20dEAtbL08"
    },
    {
        "id": "spot-special-national-stadium",
        "name": "国立競技場（MUFGスタジアム）",
        "group": "=LOVE",
        "category": "ライブ会場",
        "latitude": 35.6778,
        "longitude": 139.7145,
        "event_date": "2026-08-25",
        "youtube_title": "🎥 関連映像: 『夢の続き』公式MV",
        "youtubeId": "RjHjQlEjs_E",
        "youtube_url": "https://www.youtube.com/embed/RjHjQlEjs_E",
        "reward_title": "国立寄せ書きの証人",
        "tags": [
            "夢の続き",
            "＝LOVE STADIUM LIVE Beyond “KYUN”♡"
        ],
        "address": "東京都",
        "description": "2026年6月20日・21日の2日間にわたり、＝LOVE史上最大規模となるスタジアムライブ『＝LOVE STADIUM LIVE「Beyond \"KYUN\"♡」』が開催された記念すべき聖地。\nメンバーとファンの夢が詰まった最高のステージが繰り広げられました。さらに、2日目のフィナーレでは次なる夢のステージである「東京ドーム」での公演がサプライズ発表され、会場全体が歓喜と感動の涙に包まれました。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "workKey": "work-RjHjQlEjs_E"
    },
    {
        "id": "spot-real-gekiyakuchu-zeroblanc",
        "name": "ZERO BLANC",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.413958,
        "longitude": 139.931408,
        "event_date": "2026-04-01",
        "youtube_title": "🎥 関連映像: 『劇薬中毒』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Bco8bY9r_H4",
        "reward_title": "劇薬に侵されし者",
        "address": "千葉県",
        "description": "MV『劇薬中毒』のロケ地。千葉県木更津市の木更津倉庫 岩根営業所内にあるスタジオ。\n\n⚠️聖地巡礼に関する重要なお願い\n私有地（倉庫営業所内）のため、関係者以外の立ち入りは厳禁です。公道からの外観見学やマナーを守っての見学をお願いします。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "Bco8bY9r_H4",
        "workKey": "work-Bco8bY9r_H4"
    },
    {
        "id": "spot-real-gekiyakuchu-fujisanmesse",
        "name": "ふじさんめっせ",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.145176,
        "longitude": 138.666586,
        "event_date": "2026-04-01",
        "youtube_title": "🎥 関連映像: 『劇薬中毒』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Bco8bY9r_H4",
        "reward_title": "ふじさんめっせの中毒者",
        "address": "静岡県",
        "description": "MV『劇薬中毒』のロケ地。静岡県富士市にある産業交流展示場。\n\n⚠️聖地巡礼に関する重要なお願い\n開館日やイベント開催時以外は立ち入れない場合があります。公式サイトなどで予定をご確認の上、周囲の迷惑にならないよう見学してください。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "Bco8bY9r_H4",
        "workKey": "work-Bco8bY9r_H4"
    },
    {
        "id": "spot-real-moratorium-stellato",
        "name": "Stellato",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.639268,
        "longitude": 139.722874,
        "event_date": "2026-04-01",
        "youtube_title": "🎥 関連映像: 『モラトリアム』公式MV",
        "youtube_url": "https://www.youtube.com/embed/ZROuG57QGls",
        "reward_title": "Stellatoの迷い人",
        "tags": [
            "モラトリアム巡礼"
        ],
        "address": "東京都",
        "description": "MV『モラトリアム』のロケ地。東京都港区白金台の洋館レストラン「Stellato」（ステラート）。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "ZROuG57QGls",
        "workKey": "moratorium"
    },
    {
        "id": "spot-real-moratorium-parkmall",
        "name": "パークモール",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.65271341262413,
        "longitude": 140.04078621311717,
        "event_date": "2026-04-01",
        "youtube_title": "🎥 関連映像: 『モラトリアム』公式MV",
        "youtube_url": "https://www.youtube.com/embed/ZROuG57QGls",
        "reward_title": "パークモールの散策者",
        "tags": [
            "モラトリアム巡礼"
        ],
        "address": "千葉県",
        "description": "MV『モラトリアム』のロケ地。千葉県千葉市美浜区中瀬の幕張メッセ周辺 of 遊歩道エリア。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "ZROuG57QGls",
        "workKey": "moratorium"
    },
    {
        "id": "spot-real-moratorium-nakahamabashi",
        "name": "中浜橋",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.65339571489194,
        "longitude": 140.0362854166159,
        "event_date": "2026-04-01",
        "youtube_title": "🎥 関連映像: 『モラトリアム』公式MV",
        "youtube_url": "https://www.youtube.com/embed/ZROuG57QGls",
        "reward_title": "中浜橋の佇む人",
        "tags": [
            "モラトリアム巡礼"
        ],
        "address": "千葉県",
        "description": "MV『モラトリアム』のロケ地。千葉県千葉市美浜区にある、メンバーの葛藤と決意のシーンが描かれた橋。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "ZROuG57QGls",
        "workKey": "moratorium"
    },
    {
        "id": "spot-real-moratorium-businesscross",
        "name": "ビジネス通り交差点",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.652341156914574,
        "longitude": 140.03819912951226,
        "event_date": "2026-04-01",
        "youtube_title": "🎥 関連映像: 『モラトリアム』公式MV",
        "youtube_url": "https://www.youtube.com/embed/ZROuG57QGls",
        "reward_title": "ビジネス通りの信号待ち",
        "tags": [
            "モラトリアム巡礼"
        ],
        "address": "千葉県",
        "description": "MV『モラトリアム』のロケ地。千葉県千葉市美浜区中瀬のビジネス通り沿いにある交差点。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "ZROuG57QGls",
        "workKey": "moratorium"
    },
    {
        "id": "spot-real-moratorium-businessstreet",
        "name": "ビジネス通り",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6538334506979,
        "longitude": 140.03955227794762,
        "event_date": "2026-04-01",
        "youtube_title": "🎥 関連映像: 『モラトリアム』公式MV",
        "youtube_url": "https://www.youtube.com/embed/ZROuG57QGls",
        "reward_title": "モラトリアムロードの走者",
        "tags": [
            "モラトリアム巡礼"
        ],
        "address": "千葉県",
        "description": "MV『モラトリアム』のロケ地。幕張メッセに近いビジネス通り。疾走感あふれるシーンが印象的。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "ZROuG57QGls",
        "workKey": "moratorium"
    },
    {
        "id": "spot-real-moratorium-messemall",
        "name": "メッセモール 友好広場",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.65070621006259,
        "longitude": 140.03926557769051,
        "event_date": "2026-04-01",
        "youtube_title": "🎥 関連映像: 『モラトリアム』公式MV",
        "youtube_url": "https://www.youtube.com/embed/ZROuG57QGls",
        "reward_title": "友好広場の旅人",
        "tags": [
            "モラトリアム巡礼"
        ],
        "address": "千葉県",
        "description": "MV『モラトリアム』のロケ地。幕張新都心メッセモール内にある広場。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "ZROuG57QGls",
        "workKey": "moratorium"
    },
    {
        "id": "spot-real-moratorium-businessdeck",
        "name": "ビジネス通り交差点デッキ",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.65278568676466,
        "longitude": 140.03769401508944,
        "event_date": "2026-04-01",
        "youtube_title": "🎥 関連映像: 『モラトリアム』公式MV",
        "youtube_url": "https://www.youtube.com/embed/ZROuG57QGls",
        "reward_title": "デッキから見下ろす瞳",
        "tags": [
            "モラトリアム巡礼"
        ],
        "address": "千葉県",
        "description": "MV『モラトリアム』のロケ地。交差点の上を通るペデストリアンデッキ。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "ZROuG57QGls",
        "workKey": "moratorium"
    },
    {
        "id": "spot-real-ohimesama-artgrace",
        "name": "大宮アートグレイスウエディングシャトー シャトー・シャンパーニュ",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.931481,
        "longitude": 139.622923,
        "event_date": "2026-04-01",
        "youtube_title": "🎥 関連映像: 『お姫様の作り方』公式MV",
        "youtube_url": "https://www.youtube.com/embed/2udLA8-QuD8",
        "reward_title": "シャトーのプリンセス",
        "address": "埼玉県",
        "description": "MV『お姫様の作り方』のロケ地。さいたま市北区にある結婚式場「大宮アートグレイスウエディングシャトー」内の「シャトー・シャンパーニュ」。\n\n⚠️聖地巡礼に関する重要なお願い\n現役の結婚式場（私有地）です。利用者以外の無断立ち入りは固く禁止されています。公道からの外観見学やマナーを守っての見学をお願いします。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "2udLA8-QuD8",
        "workKey": "work-2udLA8-QuD8"
    },
    {
        "id": "spot-real-lovesong-toei5",
        "name": "東映 東京撮影所 No.5ステージ",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.754028,
        "longitude": 139.594806,
        "event_date": "2025-10-08",
        "youtube_title": "🎥 関連映像: 『ラブソングに襲われる』公式MV",
        "youtube_url": "https://www.youtube.com/embed/_cf4UTe1qrY",
        "reward_title": "No.5ステージの熱狂者",
        "address": "東京都",
        "description": "MV『ラブソングに襲われる』のロケ地。練馬区東大泉にある東映東京撮影所内のNo.5ステージ。\n\n⚠️聖地巡礼に関する重要なお願い\nスタジオ施設につき、一般の方の敷地内への立ち入りは固く禁止されています。",
        "coordinateAccuracy": "facility",
        "youtubeId": "_cf4UTe1qrY",
        "workKey": "work-_cf4UTe1qrY"
    },
    {
        "id": "spot-real-lovesong-mayflower",
        "name": "メイフラワーゴルフクラブ チャペル",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 36.882088,
        "longitude": 139.907432,
        "event_date": "2025-10-08",
        "youtube_title": "🎥 関連映像: 『ラブソングに襲われる』公式MV",
        "youtube_url": "https://www.youtube.com/embed/_cf4UTe1qrY",
        "reward_title": "メイフラワーチャペルの巡礼者",
        "address": "栃木県",
        "description": "MV『ラブソングに襲われる』のロケ地。栃木県矢板市にある、英国調で美しいゴルフ場のチャペル。\n\n⚠️聖地巡礼に関する重要なお願い\nゴルフ場およびプライベート施設につき、利用者以外の勝手な見学や立ち入りはご遠慮ください。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "_cf4UTe1qrY",
        "workKey": "work-_cf4UTe1qrY"
    },
    {
        "id": "spot-real-naisho-veritas",
        "name": "光英VERITAS中学校・高等学校",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.76135,
        "longitude": 139.92405,
        "event_date": "2025-08-22",
        "youtube_title": "🎥 関連映像: 『内緒バナシ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/1Cy9oaBAxns",
        "reward_title": "VERITASの語り部",
        "address": "千葉県",
        "description": "MV『内緒バナシ』のロケ地。松戸市にある光英VERITAS中学校・高等学校。\n\n⚠️聖地巡礼に関する重要なお願い\n現役の学校施設です。関係者以外の無断立ち入りや、生徒が映り込む形での撮影は絶対に禁止です。",
        "coordinateAccuracy": "facility",
        "tags": [
            "君の第3ボタン",
            "君を見かけた"
        ],
        "youtubeId": "1Cy9oaBAxns",
        "workKey": "work-1Cy9oaBAxns"
    },
    {
        "id": "spot-real-naisho-sengen",
        "name": "多摩川浅間神社",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.58736,
        "longitude": 139.66864,
        "event_date": "2025-08-22",
        "youtube_title": "🎥 関連映像: 『内緒バナシ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/1Cy9oaBAxns",
        "reward_title": "浅間神社の秘密の共有者",
        "address": "東京都",
        "description": "MV『内緒バナシ』のロケ地。大田区田園調布にある神社。展望スペースから多摩川と電車、天気が良ければ富士山が望めます。\n\n⚠️聖地巡礼に関する重要なお願い\n参拝者用の施設につき、マナーを守ってご参拝ください。",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "1Cy9oaBAxns",
        "workKey": "work-1Cy9oaBAxns"
    },
    {
        "id": "spot-real-komorebi-veranda",
        "name": "BAYSIDE GEIHINKAN VERANDA minatomirai",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.454408,
        "longitude": 139.642221,
        "event_date": "2025-10-08",
        "youtube_title": "🎥 関連映像: 『木漏れ日メゾフォルテ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/4xBmuiQNGdc",
        "reward_title": "木漏れ日のテラスの住人",
        "address": "神奈川県",
        "description": "MV『木漏れ日メゾフォルテ』のロケ地。横浜みなとみらいの「MARINE ＆ WALK YOKOHAMA」内にあるウエディングゲストハウス。\n\n⚠️聖地巡礼に関する重要なお願い\n現役の式場（私有地）です。関係者以外の無断立ち入りは禁止されています。公道や周辺施設から外観を見学するに留めてください。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "4xBmuiQNGdc",
        "workKey": "work-4xBmuiQNGdc"
    },
    {
        "id": "spot-real-kamogawa-seaside-base",
        "name": "Kamogawa SEASIDE BASE",
        "group": "≠ME",
        "category": "飲食店・その他",
        "latitude": 35.098187,
        "longitude": 140.104624,
        "event_date": "2024-08-28",
        "youtube_title": "🎥 関連映像: 【ノイミー年長組の夏休み】BBQで大はしゃぎ！今年もツッコミどころ満載です！！！",
        "youtube_url": "https://www.youtube.com/embed/nZ2K-hyErl4",
        "reward_title": "鴨川のBBQ仲間",
        "address": "千葉県",
        "description": "ノイミーお姉さんチーム（年長組）のYouTube企画でメンバーが訪れ、海を眺めながらBBQ（バーベキュー）を楽しんだ場所。千葉県鴨川市の海沿いにあるオシャレな複合施設です。",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "nZ2K-hyErl4",
        "workKey": "bbq"
    },
    {
        "id": "spot-real-kamogawa-seaworld",
        "name": "鴨川シーワールド",
        "group": "≠ME",
        "category": "飲食店・その他",
        "latitude": 35.115954,
        "longitude": 140.120373,
        "event_date": "2024-08-21",
        "youtube_title": "🎥 関連映像: 【ゆる旅】ノイミー年長組で鴨川シーワールドを大満満喫してきました🐬大迫力のシャチパフォーマンスに大興奮！",
        "youtube_url": "https://www.youtube.com/embed/8PSIWxRJCi4",
        "reward_title": "シャチにずぶ濡らされた者",
        "address": "千葉県",
        "description": "ノイミーお姉さんチーム（年長組）のYouTube企画でメンバーが訪れた水族館。大迫力のシャチパフォーマンスに大興奮したり、海の生き物たちと触れ合って大満満喫した日本屈指の水族館です。",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "8PSIWxRJCi4",
        "workKey": "work-8PSIWxRJCi4"
    },
    {
        "id": "spot-real-sakurasaku-kawanahotel",
        "name": "川奈ホテル",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.939337,
        "longitude": 139.140665,
        "event_date": "2021-05-12",
        "youtube_title": "🎥 関連映像: 『桜の咲く音がした』公式MV",
        "youtube_url": "https://www.youtube.com/embed/0ImFNEs7P_Q",
        "reward_title": "桜の咲く音を聞いた川奈の客",
        "tags": [
            "桜の咲く音がした",
            "川奈ホテル"
        ],
        "address": "静岡県",
        "description": "『桜の咲く音がした』のMVロケ地となった格式高いホテル。美しい洋館や庭園で、メンバーたちの可憐な姿が撮影されました。クラシカルな雰囲気が漂う特別な空間です。\n\nURL: https://www.princehotels.co.jp/kawana/\n住所: 〒414-0044 静岡県伊東市川奈１４５９\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/0ImFNEs7P_Q?si=eQBaUPA0cQgOh_Ft&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "0ImFNEs7P_Q",
        "workKey": "work-0ImFNEs7P_Q"
    },
    {
        "id": "spot-real-sakurasaku-akaiyane",
        "name": "赤いやね",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.95175,
        "longitude": 139.129232,
        "event_date": "2021-05-12",
        "youtube_title": "🎥 関連映像: 『桜の咲く音がした』公式MV",
        "youtube_url": "https://www.youtube.com/embed/0ImFNEs7P_Q",
        "reward_title": "赤いやねの常連",
        "tags": [
            "桜の咲く音がした",
            "赤いやね"
        ],
        "address": "静岡県",
        "description": "『桜の咲く音がした』のMVに登場するレトロで可愛い喫茶店。赤い屋根が特徴的で、相模湾を望む高台に位置しています。\n\nURL: https://tabelog.com/\n住所: 〒414-0044 静岡県伊東市川奈１３２７−１１\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/0ImFNEs7P_Q?si=eQBaUPA0cQgOh_Ft&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "0ImFNEs7P_Q",
        "workKey": "work-0ImFNEs7P_Q"
    },
    {
        "id": "spot-real-sakurasaku-izukogenstation",
        "name": "伊豆高原駅 2番線ホーム",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.877786,
        "longitude": 139.108222,
        "event_date": "2021-05-12",
        "youtube_title": "🎥 関連映像: 『桜の咲く音がした』公式MV",
        "youtube_url": "https://www.youtube.com/embed/0ImFNEs7P_Q",
        "reward_title": "伊豆高原駅の旅人",
        "tags": [
            "桜の咲く音がした",
            "伊豆高原駅"
        ],
        "address": "静岡県",
        "description": "『桜の咲く音がした』のMVでメンバーが出会いや別れを表現した伊豆高原駅の2番線ホーム。旅情を感じさせるホーム of 風景が印象的です。\n\nURL: https://www.izukyu.co.jp/\n住所: 〒413-0232 静岡県伊東市八幡野１１８３\n\n⚠️聖地巡礼に関する重要なお願い\n現在も多くの一般のお客様が利用する駅施設です。ホーム内での長時間の滞留や一般のお客様の通行の妨げになる行為、危険な撮影などは絶対にやめましょう。マナーを守って安全に見学してください。\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/0ImFNEs7P_Q?si=eQBaUPA0cQgOh_Ft&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "0ImFNEs7P_Q",
        "workKey": "work-0ImFNEs7P_Q"
    },
    {
        "id": "spot-real-sakurasaku-yamamoplaza",
        "name": "伊豆高原駅やまもプラザ",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.877583,
        "longitude": 139.107666,
        "event_date": "2021-05-12",
        "youtube_title": "🎥 関連映像: 『桜の咲く音がした』公式MV",
        "youtube_url": "https://www.youtube.com/embed/0ImFNEs7P_Q",
        "reward_title": "やまもプラザの買い物客",
        "tags": [
            "桜の咲く音がした",
            "やまもプラザ"
        ],
        "address": "静岡県",
        "description": "『桜の咲く音がした』のMV撮影で使用された、伊豆高原駅に隣接するショッピングモール。メンバーが歩いた通路などがあり、お買い物や食事を楽しみながら巡礼できます。\n\nURL: http://www.yamamo-plaza.com/\n住所: 〒413-0232 静岡県伊東市八幡野１１８３\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/0ImFNEs7P_Q?si=eQBaUPA0cQgOh_Ft&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "0ImFNEs7P_Q",
        "workKey": "work-0ImFNEs7P_Q"
    },
    {
        "id": "spot-real-sakurasaku-sakuranamiki",
        "name": "伊豆高原 桜並木",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.87954,
        "longitude": 139.10831,
        "event_date": "2021-05-12",
        "youtube_title": "🎥 関連映像: 『桜の咲く音がした』公式MV",
        "youtube_url": "https://www.youtube.com/embed/0ImFNEs7P_Q",
        "reward_title": "桜並木の散歩者",
        "tags": [
            "桜の咲く音がした",
            "桜並木"
        ],
        "address": "静岡県",
        "description": "『桜の咲く音がした』の象徴的なシーンである、美しい桜並木。春には見事な桜のトンネルができ、メンバーたちのダンスやストーリーを華やかに彩りました。\n\n住所: 〒413-0232 静岡県伊東市八幡野\n\n⚠️聖地巡礼に関する重要なお願い\n一般の道路ですので、車通りに十分注意し、歩行者や周囲の迷惑にならないよう撮影・見学を行ってください。\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/0ImFNEs7P_Q?si=eQBaUPA0cQgOh_Ft&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "0ImFNEs7P_Q",
        "workKey": "work-0ImFNEs7P_Q"
    },
    {
        "id": "spot-real-zettaiidol-avacosaginuma",
        "name": "アバコ撮影スタジオ さぎ沼1・2スタジオ",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.58685,
        "longitude": 139.56535,
        "event_date": "2024-07-31",
        "youtube_title": "🎥 関連映像: 『絶対アイドル辞めないで』公式MV",
        "youtube_url": "https://www.youtube.com/embed/17NBPoc78oM",
        "reward_title": "絶対アイドルを見届けし者",
        "tags": [
            "絶対アイドル辞めないで",
            "アバコスタジオ"
        ],
        "address": "神奈川県",
        "description": "ファンとアイドルの究極の絆を描いた名曲『絶対アイドル辞めないで』のMV撮影が行われたスタジオ。メンバーが華麗なパフォーマンスを披露した撮影の舞台です。\n\n住所: 〒216-0011 神奈川県川崎市宮前区犬蔵２丁目１７−７\n\n⚠️聖地巡礼に関する重要なお願い\n商業用の撮影スタジオ（私有地）です。一般の方の立ち入りや見学は一切禁止されています。周辺道路など近隣への迷惑になる行為も絶対にやめましょう。外観を遠目に見る程度に留めてください。\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/17NBPoc78oM?si=TmajORGeC-AdkGb1&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "facility",
        "youtubeId": "17NBPoc78oM",
        "workKey": "work-17NBPoc78oM"
    },
    {
        "id": "spot-real-todoitelove-urawalutheran",
        "name": "浦和ルーテル学院中学校・高等学校",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.88855,
        "longitude": 139.71695,
        "event_date": "2017-12-06",
        "youtube_title": "🎥 関連映像: 『届いてLOVE YOU♡』公式MV",
        "youtube_url": "https://www.youtube.com/embed/RxcNhst20uw",
        "reward_title": "届いてLOVE YOUの告白者",
        "tags": [
            "届いてLOVE YOU",
            "浦和ルーテル"
        ],
        "address": "埼玉県",
        "description": "齊藤なぎさ初センター曲『届いてLOVE YOU♡』のMVロケ地。メンバーたちが学校を舞台に、甘酸っぱいスクールライフや告白ストーリーを演じた聖地です。\n\n住所: 〒330-0051 埼玉県さいたま市緑区大崎３６４２\n\n⚠️聖地巡礼に関する重要なお願い\n現在も生徒が通う「現役の私立学校」です。関係者以外の敷地内への無断立ち入り、生徒が映り込む形での撮影、周辺での長時間の滞留は絶対に禁止です！オタクのモラルとして、巡礼はごく遠巻きに外観を眺める程度に留めてください。\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/RxcNhst20uw?si=A4VcogqM9DQDxNGl&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "facility",
        "youtubeId": "RxcNhst20uw",
        "workKey": "love-you"
    },
    {
        "id": "spot-real-kimiwata-longwood",
        "name": "ロングウッドステーション",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.4327,
        "longitude": 140.1875,
        "event_date": "2020-07-08",
        "youtube_title": "🎥 関連映像: 『君と私の歌』公式MV",
        "youtube_url": "https://www.youtube.com/embed/juImxVpogRY",
        "reward_title": "君と私の歌のファン",
        "tags": [
            "君と私の歌",
            "ロングウッドステーション"
        ],
        "address": "千葉県",
        "description": "『君と私の歌』のMVロケ地となった撮影スタジオ。メンバーたちがカラフルな衣装で元気いっぱいにパフォーマンスを披露した、ファンにとって愛着深い聖地です。\n\n住所: 〒297-0231 千葉県長生郡長柄町山之郷６７−１\n\n⚠️聖地巡礼に関する重要なお願い\n普段は大型の撮影スタジオおよびイベントスペースとして運営されています。イベント開催日など一般開放されている日を除き、敷地内への無断立ち入りは禁止されています。イベント等に参加して巡礼するか、外観を遠目に見る程度に留めてください。\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/juImxVpogRY?si=ggy-PMj9Z3jjRM2q&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "juImxVpogRY",
        "workKey": "work-juImxVpogRY"
    },
    {
        "id": "spot-real-pokepark-yomiuri",
        "name": "ポケパークカントー（よみうりランド）",
        "group": "=LOVE",
        "category": "ライブ会場",
        "latitude": 35.6275,
        "longitude": 139.515,
        "event_date": "2026-07-04",
        "reward_title": "とくべチュ、した者",
        "tags": [
            "とくべチュ、して",
            "ラブソングに襲われる",
            "THE MUSIC DAY",
            "よみうりランド"
        ],
        "address": "〒206-8725 東京都稲城市矢野口4015-1（よみうりランド内）",
        "description": "2026年7月4日放送の『THE MUSIC DAY』にて、＝LOVEがパフォーマンスを披露した特別なステージ。\n\n住所: 〒206-8725 東京都稲城市矢野口4015-1（よみうりランド内）",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定"
    },
    {
        "id": "spot-real-hamburger-obica",
        "name": "オービカ モッツァレラバー 六本木ヒルズ店",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.661139,
        "longitude": 139.730156,
        "event_date": "2024-09-25",
        "youtube_title": "🎥 関連映像: 【感動】おいしすぎて衝撃のハンバーガーに出会ってしまいました 【#イコラブハンバーガー部】",
        "youtube_url": "https://www.youtube.com/embed/LXebPFtWQhE",
        "reward_title": "モッツァレラバーガーの美食家",
        "tags": [
            "YouTube企画",
            "ハンバーガー部"
        ],
        "address": "〒106-0032 東京都港区六本木６丁目４−１ ヒルズ ハリウッドビューティプラザ 1F",
        "description": "YouTube企画「イコラブハンバーガー部」の聖地として紹介されたスポットです。髙松瞳さんと瀧脇笙古さんが訪れました。\n\n■ 注文メニュー\n・O' バーガー\n・タルトゥーフォバーガー\n※現在提供されていない可能性があります。\n\nURL: https://obica.jp/\n住所: 〒106-0032 東京都港区六本木６丁目４−１ ヒルズ ハリウッドビューティプラザ 1F\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/LXebPFtWQhE?si=htglM-6j-KB5CAPo&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "LXebPFtWQhE",
        "workKey": "work-LXebPFtWQhE"
    },
    {
        "id": "spot-real-hamburger-37steak",
        "name": "37 ステーキハウス & バー",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.6606,
        "longitude": 139.7303,
        "event_date": "2024-09-25",
        "youtube_title": "🎥 関連映像: 【感動】おいしすぎて衝撃のハンバーガーに出会ってしまいました 【#イコラブハンバーガー部】",
        "youtube_url": "https://www.youtube.com/embed/LXebPFtWQhE",
        "reward_title": "熟成ビーフバーガーの愛好家",
        "tags": [
            "YouTube企画",
            "ハンバーガー部"
        ],
        "address": "〒106-0032 東京都港区六本木６丁目１５−１ 六本木ヒルズけやき坂 2F",
        "description": "YouTube企画「イコラブハンバーガー部」の聖地として紹介されたスポットです。髙松瞳さんと瀧脇笙古さんが訪れました。\n\n■ 注文メニュー\n・21日間熟成ブラックアンガスビーフ×オーストラリアビーフのクラシックバーガー\n・21日間熟成ブラックアンガスビーフのハンバーガー カポナータと生ハム、モッツァレラ チーズを燻製BBQソースで\n※現在提供されていない可能性があります。\n\nURL: https://37steakhouse.com/roppongi\n住所: 〒106-0032 東京都港区六本木６丁目１５−１ 六本木ヒルズけやき坂 2F\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/LXebPFtWQhE?si=htglM-6j-KB5CAPo&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "LXebPFtWQhE",
        "workKey": "work-LXebPFtWQhE"
    },
    {
        "id": "spot-real-hamburger-gokuburger",
        "name": "いしがまや GOKU BURGER",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.666922,
        "longitude": 139.708289,
        "event_date": "2024-09-25",
        "youtube_title": "🎥 関連映像: 【感動】おいしすぎて衝撃のハンバーガーに出会ってしまいました 【#イコラブハンバーガー部】",
        "youtube_url": "https://www.youtube.com/embed/LXebPFtWQhE",
        "reward_title": "神戸牛チーズバーガーの熱狂者",
        "tags": [
            "YouTube企画",
            "ハンバーガー部"
        ],
        "address": "〒150-0001 東京都渋谷区神宮前５丁目８−５ ジュビリープラザビル 2F",
        "description": "YouTube企画「イコラブハンバーガー部」の聖地として紹介されたスポットです。髙松瞳さんと瀧脇笙古さんが訪れました。\n\n■ 注文メニュー\n・ダブル神戸牛 チーズ バーガー セット\n・BLTチーズバーガー＋アボカドトッピング セット\n※現在提供されていない可能性があります。\n\nURL: https://kichiri.jp/ishigamaya/gokuburger-omotesando/\n住所: 〒150-0001 東京都渋谷区神宮前５丁目８−５ ジュビリープラザビル 2F\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/LXebPFtWQhE?si=bUbtFoADpW1mY3Mp&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "LXebPFtWQhE",
        "workKey": "work-LXebPFtWQhE"
    },
    {
        "id": "spot-real-hamburger-ballpark9",
        "name": "BALLPARK BURGER &9",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.4433,
        "longitude": 139.6402,
        "event_date": "2025-06-07",
        "youtube_title": "🎥 関連映像: 【嬉しいご報告】イコラブハンバーガー部、コラボします！！",
        "youtube_url": "https://www.youtube.com/embed/xUoPnF8uUXY",
        "reward_title": "ベイスターズコラボバーガーの目撃者",
        "tags": [
            "YouTube企画",
            "ハンバーガー部"
        ],
        "address": "〒231-0022 神奈川県横浜市中区横浜公園",
        "description": "YouTube企画「イコラブハンバーガー部」の聖地として紹介されたスポットです。髙松瞳さんと瀧脇笙古さんが訪れました。\n\n■ 注文メニュー\n・コラボバーガー（※現在は提供終了しています）\n※現在提供されていない可能性があります。\n\n住所: 〒231-0022 横浜市中区横浜公園\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/xUoPnF8uUXY?si=4Ni-pe6ZQB0foiYI&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "xUoPnF8uUXY",
        "workKey": "work-xUoPnF8uUXY"
    },
    {
        "id": "spot-real-hashigozake-kinkaen",
        "name": "金華園",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.7149,
        "longitude": 139.7941,
        "event_date": "2025-04-09",
        "youtube_title": "🎥 関連映像: 【はしご酒】現役アイドルが浅草ホッピー通りでガチ飲みしたら素で楽しみ過ぎてしまいました。",
        "youtube_url": "https://www.youtube.com/embed/tvUBTJDvKQI",
        "reward_title": "浅草ホッピー通りの乾杯者",
        "tags": [
            "YouTube企画",
            "さなつんのはしご酒",
            "浅草"
        ],
        "address": "〒111-0032 東京都台東区浅草２丁目５−２",
        "description": "YouTube企画「さなつんのはしご酒（つんはしご）」浅草編の聖地として紹介されたスポットです。＝LOVEの諸橋沙夏さんが訪れました。\n\nURL: https://tabelog.com/\n住所: 〒111-0032 東京都台東区浅草２丁目５−２\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/tvUBTJDvKQI?si=iW7i9lYBkNnp5ooM&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "tvUBTJDvKQI",
        "workKey": "work-tvUBTJDvKQI"
    },
    {
        "id": "spot-real-hashigozake-ebisu",
        "name": "酒処えびす",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.714548,
        "longitude": 139.794646,
        "event_date": "2025-04-09",
        "youtube_title": "🎥 関連映像: 【はしご酒】現役アイドルが浅草ホッピー通りでガチ飲みしたら素で楽しみ過ぎてしまいました。",
        "youtube_url": "https://www.youtube.com/embed/tvUBTJDvKQI",
        "reward_title": "えびす顔の飲み手",
        "tags": [
            "YouTube企画",
            "さなつんのはしご酒",
            "浅草"
        ],
        "address": "〒111-0032 東京都台東区浅草２丁目７−１３",
        "description": "YouTube企画「さなつんのはしご酒（つんはしご）」浅草編の聖地として紹介されたスポットです。＝LOVEの諸橋沙夏さんが訪れました。\n\nURL: https://tabelog.com/\n住所: 〒111-0032 東京都台東区浅草２丁目７−１３\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/tvUBTJDvKQI?si=iW7i9lYBkNnp5ooM&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "tvUBTJDvKQI",
        "workKey": "work-tvUBTJDvKQI"
    },
    {
        "id": "spot-real-hashigozake-achirabo",
        "name": "あちらぼ",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.7077,
        "longitude": 139.6465,
        "event_date": "2024-12-15",
        "youtube_title": "🎥 関連映像: 【はしご酒】高円寺で飲むお酒がとにかく最高すぎました",
        "youtube_url": "https://www.youtube.com/embed/BPvNgGIKoeU",
        "reward_title": "高円寺の高架下探検家",
        "tags": [
            "YouTube企画",
            "さなつんのはしご酒",
            "高円寺"
        ],
        "address": "〒166-0003 東京都杉並区高円寺北３丁目６９−１",
        "description": "YouTube企画「さなつんのはしご酒（つんはしご）」高円寺編の聖地として紹介されたスポットです。＝LOVEの諸橋沙夏さんが訪れました。\n\nURL: https://tabelog.com/\n住所: 〒166-0003 東京都杉並区高円寺北３丁目６９−１\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/BPvNgGIKoeU?si=HxyNk-c6bIqY--4h&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "BPvNgGIKoeU",
        "workKey": "work-BPvNgGIKoeU"
    },
    {
        "id": "spot-real-hashigozake-nagara",
        "name": "やきとん長良",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.70509,
        "longitude": 139.6483,
        "event_date": "2024-12-15",
        "youtube_title": "🎥 関連映像: 【はしご酒】高円寺で飲むお酒がとにかく最高すぎました",
        "youtube_url": "https://www.youtube.com/embed/BPvNgGIKoeU",
        "reward_title": "やきとん長良の常連",
        "tags": [
            "YouTube企画",
            "さなつんのはしご酒",
            "高円寺"
        ],
        "address": "〒166-0003 東京都杉並区高円寺南３丁目５８−１８ 山本ビル 1F",
        "description": "YouTube企画「さなつんのはしご酒（つんはしご）」高円寺編の聖地として紹介されたスポットです。＝LOVEの諸橋沙夏さんが訪れました。\n\nURL: https://www.instagram.com/nagara_yakiton/\n住所: 〒166-0003 東京都杉並区高円寺南３丁目５８−１８ 山本ビル 1F\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/BPvNgGIKoeU?si=HxyNk-c6bIqY--4h&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "BPvNgGIKoeU",
        "workKey": "work-BPvNgGIKoeU"
    },
    {
        "id": "spot-real-hashigozake-manmajiima",
        "name": "まんまじぃま",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.702,
        "longitude": 139.6481,
        "event_date": "2024-12-15",
        "youtube_title": "🎥 関連映像: 【はしご酒】高円寺で飲むお酒がとにかく最高すぎました",
        "youtube_url": "https://www.youtube.com/embed/BPvNgGIKoeU",
        "reward_title": "まんまじぃまの酔客",
        "tags": [
            "YouTube企画",
            "さなつんのはしご酒",
            "高円寺"
        ],
        "address": "〒166-0003 東京都杉並区高円寺南４丁目２７−１８ ケーアイ高円寺ビル 1F",
        "description": "YouTube企画「さなつんのはしご酒（つんはしご）」高円寺編の聖地として紹介されたスポットです。＝LOVEの諸橋沙夏さんが訪れました。\n\nURL: https://www.instagram.com/manmajiima/\n住所: 〒166-0003 東京都杉並区高円寺南４丁目２７−１８ ケーアイ高円寺ビル 1F\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/BPvNgGIKoeU?si=HxyNk-c6bIqY--4h&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "BPvNgGIKoeU",
        "workKey": "work-BPvNgGIKoeU"
    },
    {
        "id": "spot-real-hashigozake-kaisho",
        "name": "沼津港海将 zero 上野店",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.7118,
        "longitude": 139.7765,
        "event_date": "2025-11-14",
        "youtube_title": "🎥 関連映像: 【はしご酒】さなつんが上野に上陸 楽しく好きなだけ飲みました！！！【重大発表あり】",
        "youtube_url": "https://www.youtube.com/embed/Hj0HB_c5yKw",
        "reward_title": "上野の海鮮大食漢",
        "tags": [
            "YouTube企画",
            "さなつんのはしご酒",
            "上野"
        ],
        "address": "〒110-0005 東京都台東区上野６丁目９−１３",
        "description": "YouTube企画「さなつんのはしご酒（つんはしご）」上野編の聖地として紹介されたスポットです。＝LOVEの諸橋沙夏さんが訪れました。\n\nURL: https://tabelog.com/\n住所: 〒110-0005 東京都台東区上野６丁目９−１３\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Hj0HB_c5yKw?si=gxrX6XCaFSZ_77nz&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "Hj0HB_c5yKw",
        "workKey": "work-Hj0HB_c5yKw"
    },
    {
        "id": "spot-real-hashigozake-shinobu",
        "name": "しのぶ 上野駅前店",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.7093,
        "longitude": 139.7744,
        "event_date": "2025-11-14",
        "youtube_title": "🎥 関連映像: 【はしご酒】さなつんが上野に上陸 楽しく好きなだけ飲みました！！！【重大発表あり】",
        "youtube_url": "https://www.youtube.com/embed/Hj0HB_c5yKw",
        "reward_title": "上野の夜をしのぶ者",
        "tags": [
            "YouTube企画",
            "さなつんのはしご酒",
            "上野"
        ],
        "address": "〒110-0005 東京都台東区上野４丁目８−９ Oakビル 1F",
        "description": "YouTube企画「さなつんのはしご酒（つんはしご）」上野編の聖地として紹介されたスポットです。＝LOVEの諸橋沙夏さんが訪れました。\n\nURL: https://tabelog.com/\n住所: 〒110-0005 東京都台東区上野４丁目８−９ Oakビル 1F\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Hj0HB_c5yKw?si=gxrX6XCaFSZ_77nz&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "Hj0HB_c5yKw",
        "workKey": "work-Hj0HB_c5yKw"
    },
    {
        "id": "spot-real-hashigozake-gang",
        "name": "串カツ玩具-GANG-",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.7061,
        "longitude": 139.6473,
        "event_date": "2025-11-14",
        "youtube_title": "🎥 関連映像: 【はしご酒】さなつんが上野に上陸 楽しく好きなだけ飲みました！！！【重大発表あり】",
        "youtube_url": "https://www.youtube.com/embed/Hj0HB_c5yKw",
        "reward_title": "高円寺で上野を感じた玩具使い",
        "tags": [
            "YouTube企画",
            "さなつんのはしご酒",
            "高円寺"
        ],
        "address": "〒166-0002 東京都杉並区高円寺北２丁目１０−７ ヴィラグリーン 3FA 店舗A号室",
        "description": "YouTube企画「さなつんのはしご酒（つんはしご）」上野編の聖地として紹介されたスポットです。＝LOVEの諸橋沙夏さんが訪れました。（※店舗は上野編の動画に含まれていますが、実際の住所は高円寺エリアです）\n\nURL1: https://x.com/koenji_gang\nURL2: https://www.instagram.com/koenji_gang/\n住所: 〒166-0002 東京都杉並区高円寺北２丁目１０−７ ヴィラグリーン 3FA 店舗A号室\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Hj0HB_c5yKw?si=gxrX6XCaFSZ_77nz&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "Hj0HB_c5yKw",
        "workKey": "work-Hj0HB_c5yKw"
    },
    {
        "id": "spot-real-hashigozake-hareruya",
        "name": "晴れる屋 新橋店",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.664261,
        "longitude": 139.756528,
        "event_date": "2026-02-07",
        "youtube_title": "🎥 関連映像: 【祝初ゲスト】元AKB48村山彩希×イコラブ諸橋沙夏の新橋はしご酒！仲良すぎてもはやカメラを忘れてほぼプライベート動画です【マブ】",
        "youtube_url": "https://www.youtube.com/embed/K7CCROY8Xm4",
        "reward_title": "新橋の晴れやかな酔客",
        "tags": [
            "YouTube企画",
            "さなつんのはしご酒",
            "新橋"
        ],
        "address": "〒105-0004 東京都港区新橋4-9-1 新橋プラザビルB102",
        "description": "YouTube企画「さなつんのはしご酒（つんはしご）」新橋編の聖地として紹介されたスポットです。＝LOVEの諸橋沙夏さんが訪れました。（元AKB48の村山彩希さんがゲスト出演）\n\nURL: https://hareruya-shimbashi.foodre.jp/\n住所: 〒105-0004 東京都港区新橋4-9-1 新橋プラザビルB102\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/K7CCROY8Xm4?si=me_Y7jlLQ0HmBc_b&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "K7CCROY8Xm4",
        "workKey": "akb48"
    },
    {
        "id": "spot-real-hashigozake-fukuenya",
        "name": "福炎や",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.666944,
        "longitude": 139.756842,
        "event_date": "2026-02-07",
        "youtube_title": "🎥 関連映像: 【祝初ゲスト】元AKB48村山彩希×イコラブ諸橋沙夏の新橋はしご酒！仲良すぎてもはやカメラを忘れてほぼプライベート動画です【マブ】",
        "youtube_url": "https://www.youtube.com/embed/K7CCROY8Xm4",
        "reward_title": "福炎やの賑やかな宴会者",
        "tags": [
            "YouTube企画",
            "さなつんのはしご酒",
            "新橋"
        ],
        "address": "〒105-0004 東京都港区新橋２丁目９−６ 4F",
        "description": "YouTube企画「さなつんのはしご酒（つんはしご）」新橋編の聖地として紹介されたスポットです。＝LOVEの諸橋沙夏さんが訪れました。（元AKB48の村山彩希さんがゲスト出演）\n\nURL: https://g733920.gorp.jp/\n住所: 〒105-0004 東京都港区新橋２丁目９−６ 4F\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/K7CCROY8Xm4?si=me_Y7jlLQ0HmBc_b&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "K7CCROY8Xm4",
        "workKey": "akb48"
    },
    {
        "id": "spot-real-niajoy-3rd-shinshiginobashi",
        "name": "新鴫野橋 北側",
        "group": "≒JOY",
        "category": "飲食店・その他",
        "latitude": 34.69117,
        "longitude": 135.52808,
        "event_date": "2025-06-24",
        "youtube_title": "🎥 関連映像: ≒JOY 3rdシングル『ブルーハワイレモン』特典映像ダイジェスト",
        "youtube_url": "https://www.youtube.com/embed/F8V34JsNV4A",
        "reward_title": "大阪なんでやねんの目撃者",
        "tags": [
            "YouTube企画",
            "≒JOY",
            "特典映像",
            "大阪"
        ],
        "address": "〒540-0002 大阪府大阪市中央区大阪城",
        "description": "≒JOY 3rdシングル『ブルーハワイレモン』特典映像「ニアジョイ エンジョイ部」の聖地としてメンバーが訪れた、大阪ビジネスパーク（OBP）近くの第二寝屋川に架かる橋です。\n\n住所目安: 〒540-0002 大阪府大阪市中央区大阪城\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/F8V34JsNV4A?si=oOew38mBf06NtcYT&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "F8V34JsNV4A",
        "workKey": "joy-3rd"
    },
    {
        "id": "spot-real-niajoy-3rd-hirakatapark",
        "name": "ひらかたパーク",
        "group": "≒JOY",
        "category": "飲食店・その他",
        "latitude": 34.805778,
        "longitude": 135.638131,
        "event_date": "2025-06-24",
        "youtube_title": "🎥 関連映像: ≒JOY 3rdシングル『ブルーハワイレモン』特典映像ダイジェスト",
        "youtube_url": "https://www.youtube.com/embed/F8V34JsNV4A",
        "reward_title": "ひらパーのエンジョイ部員",
        "tags": [
            "YouTube企画",
            "≒JOY",
            "特典映像",
            "大阪"
        ],
        "address": "〒573-0054 大阪府枚方市枚方公園町１−１",
        "description": "≒JOY 3rdシングル『ブルーハワイレモン』特典映像「ニアジョイ エンジョイ部」の聖地として紹介されたスポットです。\n\nURL: https://www.hirakatapark.co.jp/\n住所: 〒573-0054 大阪府枚方市枚方公園町１−１\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/F8V34JsNV4A?si=oOew38mBf06NtcYT&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "F8V34JsNV4A",
        "workKey": "joy-3rd"
    },
    {
        "id": "spot-real-niajoy-3rd-nifrel",
        "name": "ニフレル",
        "group": "≒JOY",
        "category": "飲食店・その他",
        "latitude": 34.8048,
        "longitude": 135.5378,
        "event_date": "2025-06-24",
        "youtube_title": "🎥 関連映像: ≒JOY 3rdシングル『ブルーハワイレモン』特典映像ダイジェスト",
        "youtube_url": "https://www.youtube.com/embed/F8V34JsNV4A",
        "reward_title": "感性にふれる旅人",
        "tags": [
            "YouTube企画",
            "≒JOY",
            "特典映像",
            "大阪"
        ],
        "address": "〒565-0826 大阪府吹田市千里万博公園２−１ ＮＩＦＲＥＬ EXPOCITY内",
        "description": "≒JOY 3rdシングル『ブルーハワイレモン』特典映像「ニアジョイ エンジョイ部」の聖地として紹介されたスポットです。\n\nURL: https://www.nifrel.jp/\n住所: 〒565-0826 大阪府吹田市千里万博公園２−１ ＮＩＦＲＥＬ EXPOCITY内\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/F8V34JsNV4A?si=oOew38mBf06NtcYT&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "F8V34JsNV4A",
        "workKey": "joy-3rd"
    },
    {
        "id": "spot-real-niajoy-3rd-harukas",
        "name": "あべのハルカス",
        "group": "≒JOY",
        "category": "飲食店・その他",
        "latitude": 34.646004,
        "longitude": 135.513415,
        "event_date": "2025-06-24",
        "youtube_title": "🎥 関連映像: ≒JOY 3rdシングル『ブルーハワイレモン』特典映像ダイジェスト",
        "youtube_url": "https://www.youtube.com/embed/F8V34JsNV4A",
        "reward_title": "日本一高いビルの展望者",
        "tags": [
            "YouTube企画",
            "≒JOY",
            "特典映像",
            "大阪"
        ],
        "address": "〒545-0052 大阪府大阪市阿倍野区阿倍野筋１丁目１−43-60F",
        "description": "≒JOY 3rdシングル『ブルーハワイレモン』特典映像「ニアジョイ エンジョイ部」の聖地として紹介されたスポットです。\n\nURL: https://www.abenoharukas-300.jp/\n住所: 〒545-0052 大阪府大阪市阿倍野区阿倍野筋１丁目１−43-60F\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/F8V34JsNV4A?si=oOew38mBf06NtcYT&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "F8V34JsNV4A",
        "workKey": "joy-3rd"
    },
    {
        "id": "spot-real-niajoy-3rd-himawari",
        "name": "大阪水上バス ひまわり",
        "group": "≒JOY",
        "category": "飲食店・その他",
        "latitude": 34.6908,
        "longitude": 135.5152,
        "event_date": "2025-06-24",
        "youtube_title": "🎥 関連映像: ≒JOY 3rdシングル『ブルーハワイレモン』特典映像ダイジェスト",
        "youtube_url": "https://www.youtube.com/embed/F8V34JsNV4A",
        "reward_title": "なにわの水上冒険家",
        "tags": [
            "YouTube企画",
            "≒JOY",
            "特典映像",
            "大阪"
        ],
        "address": "〒540-0032 大阪府大阪市中央区天満橋京町１−１",
        "description": "≒JOY 3rdシングル『ブルーハワイレモン』特典映像「ニアジョイ エンジョイ部」の聖地として紹介されたスポットです。\n\nURL: https://suijo-bus.osaka\n住所: 〒540-0032 大阪府大阪市中央区天満橋京町１−１\n\n<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/F8V34JsNV4A?si=oOew38mBf06NtcYT&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
        "coordinateAccuracy": "exact",
        "accuracyReason": "映像内の背景構造物（街灯、手すり、特徴的な駅の改札やホーム、看板アングル）が現地写真や地図と完全に一致し、具体的な撮影位置を特定",
        "youtubeId": "F8V34JsNV4A",
        "workKey": "joy-3rd"
    },
    {
        "id": "spot-real-summerhaze-umikaze",
        "name": "うみかぜ公園",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.276464,
        "longitude": 139.683507,
        "event_date": "2026-06-26",
        "youtube_title": "🎥 関連映像: 『Summer haze』公式MV",
        "youtube_url": "https://www.youtube.com/embed/iIcpiUg_7NQ",
        "reward_title": "Summer hazeの開拓者",
        "tags": [
            "Summer haze",
            "検証特定聖地"
        ],
        "address": "神奈川県横須賀市平成町3丁目23",
        "description": "海を背景にした『Summer haze』の印象的な屋外シーンで使用されている場所。東京湾を望む開放的な公園で、MVでは広い空、海、横須賀らしい港湾風景を生かした映像になっています。MV公開後には、横須賀周辺を知る複数のユーザーから「うみかぜ公園ではないか」という反応があり、MV映像と実際の景観も一致しています。",
        "holy_point": "MVと同じように、海と空を大きく入れた構図を楽しみやすい場所です。猿島方面まで見渡せるため、『Summer haze』らしい夏の開放感を感じられるロケ地の一つです。",
        "visitor_notes": "⚠️聖地巡礼に関する重要なお願い\n一般利用者の多い公園なので、撮影時は通行や他の利用者の妨げにならないよう注意してください。公園内の立入禁止区域には入らないでください。",
        "verification_status": "映像照合・複数の独立したSNS情報による特定",
        "last_confirmed_date": "2026-08-09",
        "coordinateAccuracy": "facility",
        "accuracyReason": "施設自体は特定できているが、施設内の具体的な撮影位置は一般非公開または特定困難なため代表入口等にピンを設定",
        "youtubeId": "iIcpiUg_7NQ",
        "workKey": "summer-haze"
    },
    {
        "id": "spot-real-summerhaze-mabori",
        "name": "馬堀海岸遊歩道",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.263585,
        "longitude": 139.709385,
        "event_date": "2026-06-26",
        "youtube_title": "🎥 関連映像: 『Summer haze』公式MV",
        "youtube_url": "https://www.youtube.com/embed/iIcpiUg_7NQ",
        "reward_title": "Summer hazeの旅人",
        "tags": [
            "Summer haze",
            "検証特定聖地"
        ],
        "address": "神奈川県横須賀市馬堀海岸1丁目周辺",
        "description": "『Summer haze』の海沿いシーンで使用されたとみられる遊歩道。馬堀海岸沿いに長く続く遊歩道で、特徴的な海岸線、柵、東京湾の景色がMV映像と一致しています。MV公開直後には、横須賀周辺を知るユーザーから「馬堀の遊歩道ではないか」という指摘も確認されています。",
        "holy_point": "海岸沿いを歩きながら、『Summer haze』の夏らしい世界観を体験できるスポット。晴れた日は東京湾を広く見渡すことができます。",
        "visitor_notes": "⚠️聖地巡礼に関する重要なお願い\n遊歩道は一般の散歩・ランニング利用者も多いため、長時間通路を占有しないでください。強風・高波・悪天候時は海側へ近づきすぎないよう注意してください。",
        "verification_status": "映像照合・独立したSNS情報による特定",
        "last_confirmed_date": "2026-08-09",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "iIcpiUg_7NQ",
        "workKey": "summer-haze"
    },
    {
        "id": "spot-real-summerhaze-old-hashirimizu-school",
        "name": "旧走水小学校",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.26508,
        "longitude": 139.72895,
        "event_date": "2026-06-26",
        "youtube_title": "🎥 関連映像: 『Summer haze』公式MV",
        "youtube_url": "https://www.youtube.com/embed/iIcpiUg_7NQ",
        "reward_title": "Summer hazeの学生",
        "tags": [
            "Summer haze",
            "検証特定聖地"
        ],
        "address": "神奈川県横須賀市走水2丁目周辺",
        "description": "『Summer haze』に登場する学校関連シーンの撮影場所として特定されている旧校舎。走水は海に非常に近い地域で、学校と海岸のシーンを一体的に撮影できるロケーションになっています。",
        "holy_point": "MVに登場する“夏の学校”という世界観を感じられる場所。周辺には海岸もあり、同じ作品の複数シーンをまとめて巡ることができます。",
        "visitor_notes": "⚠️聖地巡礼に関する重要なお願い\n旧学校施設は一般の観光施設ではありません。敷地内への無断立ち入りは禁止してください。現地では公道など、一般に立ち入り可能な場所から見学してください。施設の現在の利用状況や立入可否を必ず確認してください。",
        "verification_status": "MV映像・建物および周辺景観の照合による特定",
        "last_confirmed_date": "2026-08-09",
        "coordinateAccuracy": "facility",
        "youtubeId": "iIcpiUg_7NQ",
        "workKey": "summer-haze"
    },
    {
        "id": "spot-real-summerhaze-imaginus",
        "name": "IMAGINUS（旧杉並第四小学校）",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.706412,
        "longitude": 139.653693,
        "event_date": "2026-06-26",
        "youtube_title": "🎥 関連映像: 『Summer haze』公式MV",
        "youtube_url": "https://www.youtube.com/embed/iIcpiUg_7NQ",
        "reward_title": "Summer haze of 理科室",
        "tags": [
            "Summer haze",
            "検証特定聖地"
        ],
        "address": "東京都杉並区高円寺北2丁目14-13",
        "description": "旧杉並第四小学校の校舎を活用した施設。『Summer haze』に登場する教室・学校関連シーンのロケ地として特定されています。現在も旧学校時代の教室、廊下、体育館などの構造が残っており、MVの「夏の学校」という世界観と重なるスポットです。",
        "holy_point": "『Summer haze』の学校シーンを現実の空間として感じられる場所。現在は科学体験施設として活用されているため、旧校舎の雰囲気を残しながら一般利用されています。",
        "visitor_notes": "⚠️聖地巡礼に関する重要なお願い\n現在は営業中の施設なので、撮影だけを目的とした迷惑行為はしないでください。施設内での撮影可否・立入可能エリア・営業時間についてはIMAGINUSの最新ルールに従ってください。イベント等によって入場できないエリアがある可能性があります。",
        "verification_status": "MV映像と旧校舎の構造・景観照合による特定",
        "last_confirmed_date": "2026-08-09",
        "coordinateAccuracy": "facility",
        "youtubeId": "iIcpiUg_7NQ",
        "workKey": "summer-haze"
    },
    {
        "id": "spot-real-mahoroba-observatory",
        "name": "星の村天文台",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 37.34185,
        "longitude": 140.6764,
        "event_date": "2021-11-10",
        "youtube_title": "🎥 関連映像: 『まほろばアスタリスク』公式MV",
        "youtube_url": "https://www.youtube.com/embed/WHjHo0qFXm8",
        "reward_title": "アスタリスクの観測者",
        "tags": [
            "まほろばアスタリスク",
            "検証特定聖地"
        ],
        "address": "福島県田村市滝根町神俣字糠塚60番地1",
        "description": "『まほろばアスタリスク』の主要な屋外ロケーションの一つ。星空をテーマにした楽曲の世界観と非常に相性の良い天文台で、MVでは施設周辺の独特な景観が使用されています。星の村天文台は福島県田村市の施設で、あぶくま洞から徒歩圏内に位置しています。",
        "holy_point": "『まほろばアスタリスク』というタイトルを象徴するような「星」に関係するロケーション。天文台と周囲の山並みを含め、MVの幻想的な雰囲気を現地で感じられる場所です。",
        "visitor_notes": "⚠️聖地巡礼に関する重要なお願い\n現在も営業している施設です。営業時間・休館日・入館ルールは星の村天文台の公式情報を確認してください。施設利用者の妨げになる撮影や、立入禁止区域への進入は禁止してください。",
        "verification_status": "映像照合・外部情報から特定されたロケ地",
        "last_confirmed_date": "2026-08-10",
        "coordinateAccuracy": "facility",
        "youtubeId": "WHjHo0qFXm8",
        "workKey": "work-WHjHo0qFXm8"
    },
    {
        "id": "spot-real-mahoroba-bridge",
        "name": "天地人橋",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 37.34292,
        "longitude": 140.67515,
        "event_date": "2021-11-10",
        "youtube_title": "🎥 関連映像: 『まほろばアスタリスク』公式MV",
        "youtube_url": "https://www.youtube.com/embed/WHjHo0qFXm8",
        "reward_title": "まほろばをつなぐ架け橋",
        "tags": [
            "まほろばアスタリスク",
            "検証特定聖地"
        ],
        "address": "福島県田村市滝根町神俣・星の村天文台〜あぶくま洞間",
        "description": "星の村天文台とあぶくま洞を結ぶ歩道橋。観光情報でも紹介されており、『まほろばアスタリスク』MVでは、この特徴的な橋がロケーションとして使用されています。",
        "holy_point": "橋そのものの形状が非常に特徴的で、MV映像との照合がしやすいスポットです。星の村天文台とあぶくま洞を徒歩で巡る途中にあるため、1回の巡礼で複数の『まほろばアスタリスク』聖地を回ることができます。",
        "visitor_notes": "⚠️聖地巡礼に関する重要なお願い\n歩道橋のため、他の観光客の通行を妨げる撮影は避けてください。橋上で長時間立ち止まったり、大人数で通路を塞いだりしないでください。悪天候・積雪時は足元に注意してください。",
        "verification_status": "映像照合・外部情報から特定されたロケ地",
        "last_confirmed_date": "2026-08-10",
        "coordinateAccuracy": "scene-area",
        "accuracyReason": "作品で使用された公園や道路、海岸等の撮影エリア・区間は特定できているが、詳細な数メートルの立ち位置までは特定が難しいためエリア内にピンを設定",
        "youtubeId": "WHjHo0qFXm8",
        "workKey": "work-WHjHo0qFXm8"
    },
    {
        "id": "spot-real-mahoroba-abukuma-parking",
        "name": "あぶくま洞 第二駐車場周辺",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 37.3432,
        "longitude": 140.674,
        "event_date": "2021-11-10",
        "youtube_title": "🎥 関連映像: 『まほろばアスタリスク』公式MV",
        "youtube_url": "https://www.youtube.com/embed/WHjHo0qFXm8",
        "reward_title": "あぶくま洞の旅人",
        "tags": [
            "まほろばアスタリスク",
            "検証特定聖地"
        ],
        "address": "福島県田村市滝根町菅谷・あぶくま洞周辺",
        "description": "『まほろばアスタリスク』MVで使用されたと特定されている、あぶくま洞周辺の駐車場エリア。星の村天文台・天地人橋と非常に近く、3地点をまとめて巡ることができます。",
        "holy_point": "一つのMVのロケ地が狭いエリアに集中しているため、『まほろばアスタリスク』の聖地巡礼ルートとして非常に回りやすい場所です。星の村天文台→天地人橋→あぶくま洞という順番で徒歩巡礼できるようになっています。",
        "visitor_notes": "⚠️聖地巡礼に関する重要なお願い\n現役の駐車場なので、車両の通行・駐車を最優先してください。車道や駐車区画内で立ち止まって写真撮影をしないでください。歩行者が安全に立てる場所から見学してください。",
        "verification_status": "映像照合・外部情報から特定されたロケ地",
        "last_confirmed_date": "2026-08-10",
        "coordinateAccuracy": "scene-area",
        "youtubeId": "WHjHo0qFXm8",
        "workKey": "work-WHjHo0qFXm8"
    },
    {
        "id": "spot-real-gaiennishidori",
        "name": "外苑西通り",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.67809029483834,
        "longitude": 139.7129505654808,
        "event_date": "2026-08-25",
        "youtube_title": "🎥 関連映像: 『夢の続き』公式MV",
        "youtube_url": "https://www.youtube.com/embed/RjHjQlEjs_E",
        "youtubeId": "RjHjQlEjs_E",
        "reward_title": "夢の続きの歩行者",
        "tags": [
            "夢の続き"
        ],
        "address": "東京都",
        "description": "『夢の続き』MVに登場する外苑西通りのロケ地。国立競技場へと続く風景の中で、グループが歩んできた軌跡と未来を感じられるスポットです。",
        "coordinateAccuracy": "exact",
        "workKey": "work-RjHjQlEjs_E"
    },
    {
        "id": "spot-real-pharmacygarden-uraga",
        "name": "ファーマシーガーデン浦賀",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.230218,
        "longitude": 139.726414,
        "event_date": "2026-08-25",
        "youtube_title": "🎥 関連映像: 『夢の続き』公式MV",
        "youtube_url": "https://www.youtube.com/embed/RjHjQlEjs_E",
        "youtubeId": "RjHjQlEjs_E",
        "reward_title": "浦賀の緑に包まれた者",
        "tags": [
            "夢の続き"
        ],
        "address": "〒239-0824 神奈川県横須賀市西浦賀6丁目10",
        "description": "『夢の続き』MVの撮影地。緑に囲まれたガーデンの風景が、楽曲の温かく希望に満ちた世界観を表現しています。",
        "coordinateAccuracy": "exact",
        "workKey": "work-RjHjQlEjs_E"
    },
    {
        "id": "spot-real-sodegaura-kaihin-park",
        "name": "袖ヶ浦海浜公園",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.455910756883526,
        "longitude": 139.9512918477635,
        "event_date": "2026-08-24",
        "youtube_title": "🎥 関連映像: 『夏名残サマーチューン』公式MV",
        "youtube_url": "https://www.youtube.com/embed/_Bm66BRnM1A",
        "youtubeId": "_Bm66BRnM1A",
        "reward_title": "名残る夏の海辺を見つめた者",
        "tags": [
            "夏名残サマーチューン"
        ],
        "address": "〒299-0268 千葉県袖ケ浦市南袖36",
        "description": "『夏名残サマーチューン』MVのロケ地。海と空が広がる開放的な風景の中で、夏の終わりの切なさが描かれました。",
        "coordinateAccuracy": "exact",
        "workKey": "work-_Bm66BRnM1A"
    },
    {
        "id": "spot-real-palms-22",
        "name": "Palms 22",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.221493,
        "longitude": 139.870018,
        "event_date": "2026-08-24",
        "youtube_title": "🎥 関連映像: 『夏名残サマーチューン』公式MV",
        "youtube_url": "https://www.youtube.com/embed/_Bm66BRnM1A",
        "youtubeId": "_Bm66BRnM1A",
        "reward_title": "ノスタルジックな夏の訪問者",
        "tags": [
            "夏名残サマーチューン"
        ],
        "address": "〒299-1607 千葉県富津市湊610-3",
        "description": "『夏名残サマーチューン』MVに登場する海辺のロケーション。MVのノスタルジックな夏の空気を感じられるスポットです。",
        "coordinateAccuracy": "exact",
        "workKey": "work-_Bm66BRnM1A"
    },
    {
        "id": "spot-real-minatomirai-grandcentral",
        "name": "みなとみらいグランドセントラルタワー",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.458667,
        "longitude": 139.629333,
        "event_date": "2026-08-24",
        "youtube_title": "🎥 関連映像: 『恋、はじめました。』公式MV",
        "youtube_url": "https://www.youtube.com/embed/ikFaEAlO5N0",
        "youtubeId": "ikFaEAlO5N0",
        "reward_title": "恋のはじまりを感じた者",
        "tags": [
            "恋、はじめました。"
        ],
        "address": "〒220-0012 神奈川県横浜市西区みなとみらい4丁目6-2",
        "description": "21stシングル『恋、はじめました。』MVのメインロケ地。近未来的な建築と開放的な空間の中で、恋が始まる瞬間を描いたダンスシーンが撮影されました。",
        "coordinateAccuracy": "exact",
        "workKey": "work-ikFaEAlO5N0"
    },
    {
        "id": "spot-real-gaien-studio-part2",
        "name": "外苑スタジオ PART2 1 STUDIO",
        "group": "≠ME",
        "category": "ジャケット・アーティスト写真撮影地",
        "latitude": 35.6896,
        "longitude": 139.7214,
        "event_date": "2026-06-11",
        "youtube_title": "🎥 関連映像: 『愛くださいませ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/oWRCXGvcU9s",
        "youtubeId": "oWRCXGvcU9s",
        "reward_title": "ジャケ写の光を浴びた者",
        "tags": [
            "愛くださいませ",
            "ここでファーストキッス"
        ],
        "address": "〒160-0006 東京都新宿区舟町7-47",
        "description": "≠ME 12th両A面シングル『愛くださいませ／ここでファーストキッス』のアーティスト写真・ジャケット撮影地です。",
        "coordinateAccuracy": "exact",
        "workKey": "work-oWRCXGvcU9s"
    },
    {
        "id": "spot-real-kisarazu-mokuzai-port-warehouse",
        "name": "木更津木材港倉庫 A棟",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.367621,
        "longitude": 139.902552,
        "event_date": "2026-06-24",
        "youtube_title": "🎥 関連映像: 『ここでファーストキッス』公式MV",
        "youtube_url": "https://www.youtube.com/embed/UQ8-9SKYApo",
        "youtubeId": "UQ8-9SKYApo",
        "reward_title": "ファーストキッスのステージ目撃者",
        "tags": [
            "ここでファーストキッス"
        ],
        "address": "〒292-0837 千葉県木更津市木材港7",
        "description": "『ここでファーストキッス』MVのロケ地。巨大な倉庫を生かした印象的なパフォーマンスシーンが撮影されました。\n\n⚠️ 注意：施設内への無断立ち入り禁止。敷地内への無断立ち入りは禁止です。公道または見学可能範囲からお楽しみください。",
        "visitor_notes": "施設内への無断立ち入り禁止。敷地内への無断立ち入りは禁止です。公道または見学可能範囲からお楽しみください。",
        "coordinateAccuracy": "exact",
        "workKey": "work-UQ8-9SKYApo"
    },
    {
        "id": "spot-real-harborcity-soga-p2",
        "name": "ハーバーシティ蘇我 共用第2駐車場",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.592186,
        "longitude": 140.118787,
        "event_date": "2026-06-24",
        "youtube_title": "🎥 関連映像: 『ここでファーストキッス』公式MV",
        "youtube_url": "https://www.youtube.com/embed/UQ8-9SKYApo",
        "youtubeId": "UQ8-9SKYApo",
        "reward_title": "屋外ステージの目撃者",
        "tags": [
            "ここでファーストキッス"
        ],
        "address": "〒260-0835 千葉県千葉市中央区川崎町51-1",
        "description": "『ここでファーストキッス』MVの屋外シーンが撮影された駐車場です。利用者や車両の妨げにならないよう注意してください。",
        "coordinateAccuracy": "exact",
        "workKey": "work-UQ8-9SKYApo"
    },
    {
        "id": "spot-real-yodobashi-church",
        "name": "ウェスレアン・ホーリネス教団 淀橋教会",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.701194,
        "longitude": 139.697719,
        "event_date": "2026-06-11",
        "youtube_title": "🎥 関連映像: 『愛くださいませ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/oWRCXGvcU9s",
        "youtubeId": "oWRCXGvcU9s",
        "reward_title": "愛を祈る聖堂の訪問者",
        "tags": [
            "愛くださいませ"
        ],
        "address": "〒169-0073 東京都新宿区百人町1丁目17-8",
        "description": "『愛くださいませ』MVに登場する教会。荘厳な建築が、楽曲の祈りや愛を感じさせる世界観を作り上げています。\n\n⚠️ 注意：礼拝や施設利用者を最優先し、撮影目的だけでの無断立ち入りは行わないでください。",
        "visitor_notes": "礼拝や施設利用者を最優先し、撮影目的だけでの無断立ち入りは行わないでください。",
        "coordinateAccuracy": "exact",
        "workKey": "work-oWRCXGvcU9s"
    },
    {
        "id": "spot-real-kirigaoka-shopping-street",
        "name": "桐ケ丘中央商店街",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.7765,
        "longitude": 139.708322,
        "event_date": "2026-06-11",
        "youtube_title": "🎥 関連映像: 『愛くださいませ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/oWRCXGvcU9s",
        "youtubeId": "oWRCXGvcU9s",
        "reward_title": "昭和レトロな街並みを歩いた者",
        "tags": [
            "愛くださいませ"
        ],
        "address": "〒115-0054 東京都北区桐ケ丘1丁目9-2周辺",
        "description": "『愛くださいませ』MVの街中シーンが撮影された商店街。昔ながらの街並みがMVの物語を印象的に彩っています。",
        "coordinateAccuracy": "exact",
        "workKey": "work-oWRCXGvcU9s"
    },
    {
        "id": "spot-real-toei-kirigaoka-danchi",
        "name": "都営桐ヶ丘団地",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.7765,
        "longitude": 139.708322,
        "event_date": "2026-06-11",
        "youtube_title": "🎥 関連映像: 『愛くださいませ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/oWRCXGvcU9s",
        "youtubeId": "oWRCXGvcU9s",
        "reward_title": "団地の風景を見守る者",
        "tags": [
            "愛くださいませ"
        ],
        "address": "〒115-0054 東京都北区桐ケ丘1丁目9-2周辺",
        "description": "『愛くださいませ』MVに登場する団地エリア。生活空間のため、住民の方への配慮を最優先にしてください。\n\n⚠️ 注意：住宅敷地への立ち入りや住民が写り込む撮影は禁止。",
        "visitor_notes": "住宅敷地への立ち入りや住民が写り込む撮影は禁止。",
        "coordinateAccuracy": "exact",
        "workKey": "work-oWRCXGvcU9s"
    },
    {
        "id": "spot-real-gallery-o13-noblesse",
        "name": "Gallery-o13 NOBLESSE",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.72894,
        "longitude": 139.705956,
        "event_date": "2026-06-11",
        "youtube_title": "🎥 関連映像: 『愛くださいませ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/oWRCXGvcU9s",
        "youtubeId": "oWRCXGvcU9s",
        "reward_title": "幻想ギャラリーの探訪者",
        "tags": [
            "愛くださいませ"
        ],
        "address": "〒171-0021 東京都豊島区西池袋3丁目3-9",
        "description": "『愛くださいませ』MVに登場するギャラリースペース。独特の内装がMVの幻想的な世界観を演出しています。",
        "coordinateAccuracy": "exact",
        "workKey": "work-oWRCXGvcU9s"
    },
    {
        "id": "spot-real-riviera-zushi-marina",
        "name": "リビエラ逗子マリーナ",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.294944,
        "longitude": 139.553399,
        "event_date": "2026-08-01",
        "youtube_title": "🎥 関連映像: 『夏はジュエリー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/kIm4dcF6XDY",
        "youtubeId": "kIm4dcF6XDY",
        "reward_title": "シーサイドリゾートの光を感じた者",
        "tags": [
            "夏はジュエリー"
        ],
        "address": "〒249-0008 神奈川県逗子市小坪5丁目23-9",
        "description": "『夏はジュエリー』MVのロケ地。SEASCAPEとSEASIDE GARDENを中心に、海辺のリゾート感あふれる映像が撮影されました。",
        "coordinateAccuracy": "exact",
        "workKey": "work-kIm4dcF6XDY"
    },
    {
        "id": "spot-real-kyu-ozu-yasujiro-tei",
        "name": "旧小津安二郎邸",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.33257538331114,
        "longitude": 139.54685637577825,
        "event_date": "2026-08-01",
        "youtube_title": "🎥 関連映像: 『夏はジュエリー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/kIm4dcF6XDY",
        "youtubeId": "kIm4dcF6XDY",
        "reward_title": "鎌倉の風情に浸る者",
        "tags": [
            "夏はジュエリー"
        ],
        "address": "〒247-0062 神奈川県鎌倉市山ノ内1445",
        "description": "『夏はジュエリー』MVの撮影地。鎌倉らしい落ち着いた建物と庭が、夏の物語を彩っています。\n\n⚠️ 注意：一般住宅・私有地の場合は外観のみ。無断立ち入り禁止。敷地内への無断立ち入りは禁止です。公道または見学可能範囲からお楽しみください。",
        "visitor_notes": "一般住宅・私有地の場合は外観のみ。無断立ち入り禁止。敷地内への無断立ち入りは禁止です。公道または見学可能範囲からお楽しみください。",
        "coordinateAccuracy": "exact",
        "workKey": "work-kIm4dcF6XDY"
    },
    {
        "id": "spot-real-zaimokuza-beach",
        "name": "材木座海岸",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.30150842638666,
        "longitude": 139.55287604676897,
        "event_date": "2026-08-01",
        "youtube_title": "🎥 関連映像: 『夏はジュエリー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/kIm4dcF6XDY",
        "youtubeId": "kIm4dcF6XDY",
        "reward_title": "夕暮れの海岸ラインに立つ者",
        "tags": [
            "夏はジュエリー"
        ],
        "address": "〒248-0013 神奈川県鎌倉市材木座6丁目",
        "description": "『夏はジュエリー』MVの海岸シーンが撮影された場所。夕暮れと海が楽曲の青春感を引き立てています。",
        "coordinateAccuracy": "exact",
        "workKey": "work-kIm4dcF6XDY"
    },
    {
        "id": "spot-real-tokyodome-rollerskate-arena",
        "name": "東京ドーム ローラースケートアリーナ",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.703689,
        "longitude": 139.752946,
        "event_date": "2026-07-30",
        "youtube_title": "🎥 関連映像: 『わたし注意報』公式MV",
        "youtube_url": "https://www.youtube.com/embed/RUEnyZLCtW4",
        "youtubeId": "RUEnyZLCtW4",
        "reward_title": "カラフルアリーナのすべり手",
        "tags": [
            "わたし注意報"
        ],
        "address": "〒112-0004 東京都文京区後楽1丁目3-61 黄色いビル4F",
        "description": "『わたし注意報』MVのメインアリーナ撮影地。ローラースケート場のカラフルな空間でパフォーマンスが撮影されました。",
        "coordinateAccuracy": "exact",
        "workKey": "work-RUEnyZLCtW4"
    },
    {
        "id": "spot-real-repair-plant",
        "name": "REPAIR PLANT",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.738309,
        "longitude": 139.33868,
        "event_date": "2026-07-30",
        "youtube_title": "🎥 関連映像: 『わたし注意報』公式MV",
        "youtube_url": "https://www.youtube.com/embed/RUEnyZLCtW4",
        "youtubeId": "RUEnyZLCtW4",
        "reward_title": "ポップアートスタジオの来訪者",
        "tags": [
            "わたし注意報"
        ],
        "address": "〒197-0011 東京都福生市福生2356-7 ART GALLERY STUDIO P2H",
        "description": "『わたし注意報』MVに登場するアートギャラリー・撮影スタジオです。",
        "coordinateAccuracy": "exact",
        "workKey": "work-RUEnyZLCtW4"
    },
    {
        "id": "spot-real-nobeyama-radio-observatory",
        "name": "国立天文台 野辺山宇宙電波観測所",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.940812,
        "longitude": 138.470304,
        "event_date": "2026-07-08",
        "youtube_title": "🎥 関連映像: 『サマーツインテール』公式MV",
        "youtube_url": "https://www.youtube.com/embed/wO2z79qqB1Y",
        "youtubeId": "wO2z79qqB1Y",
        "reward_title": "電波望遠鏡と空を見上げた者",
        "tags": [
            "サマーツインテール"
        ],
        "address": "〒384-1305 長野県南佐久郡南牧村野辺山462-2",
        "description": "巨大な電波望遠鏡を背景に撮影された、『サマーツインテール』を象徴するロケ地です。",
        "coordinateAccuracy": "exact",
        "workKey": "work-wO2z79qqB1Y"
    },
    {
        "id": "spot-real-nirasaki-high-school",
        "name": "山梨県立韮崎高等学校",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.715531,
        "longitude": 138.449697,
        "event_date": "2026-07-08",
        "youtube_title": "🎥 関連映像: 『サマーツインテール』公式MV",
        "youtube_url": "https://www.youtube.com/embed/wO2z79qqB1Y",
        "youtubeId": "wO2z79qqB1Y",
        "reward_title": "ツインテールの校舎を見つめた者",
        "tags": [
            "サマーツインテール"
        ],
        "address": "〒407-0015 山梨県韮崎市若宮3丁目2-1",
        "description": "『サマーツインテール』の学校シーンが撮影された場所です。\n\n⚠️ 注意：学校敷地内への無断立ち入り禁止。敷地内への無断立ち入りは禁止です。公道または見学可能範囲からお楽しみください。",
        "visitor_notes": "学校敷地内への無断立ち入り禁止。敷地内への無断立ち入りは禁止です。公道または見学可能範囲からお楽しみください。",
        "coordinateAccuracy": "exact",
        "workKey": "work-wO2z79qqB1Y"
    },
    {
        "id": "spot-real-nikuno-yasudaya",
        "name": "肉の安田屋／今井畜産商事",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.994188,
        "longitude": 139.083672,
        "event_date": "2026-07-08",
        "youtube_title": "🎥 関連映像: 『サマーツインテール』公式MV",
        "youtube_url": "https://www.youtube.com/embed/wO2z79qqB1Y",
        "youtubeId": "wO2z79qqB1Y",
        "reward_title": "秩父の街角グルメを味わう者",
        "tags": [
            "サマーツインテール"
        ],
        "address": "〒368-0041 埼玉県秩父市番場町19-9",
        "description": "『サマーツインテール』MVに登場する秩父の精肉店です。",
        "coordinateAccuracy": "exact",
        "workKey": "work-wO2z79qqB1Y"
    },
    {
        "id": "spot-real-koumi-line-yade-fumikiri",
        "name": "JR小海線 矢出踏切",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.951616145084216,
        "longitude": 138.4726666401532,
        "event_date": "2026-07-08",
        "youtube_title": "🎥 関連映像: 『サマーツインテール』公式MV",
        "youtube_url": "https://www.youtube.com/embed/wO2z79qqB1Y",
        "youtubeId": "wO2z79qqB1Y",
        "reward_title": "高原列車の踏切に佇む者",
        "tags": [
            "サマーツインテール"
        ],
        "address": "〒384-1305 長野県南佐久郡南牧村野辺山301-5周辺",
        "description": "『サマーツインテール』MVに登場するJR小海線の踏切です。\n\n⚠️ 注意：線路内立入禁止。道路上で長時間滞留しないでください。",
        "visitor_notes": "線路内立入禁止。道路上で長時間滞留しないでください。",
        "coordinateAccuracy": "exact",
        "workKey": "work-wO2z79qqB1Y"
    },
    {
        "id": "spot-real-kyu-chichibubashi",
        "name": "旧秩父橋",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 36.018688,
        "longitude": 139.086236,
        "event_date": "2026-07-08",
        "youtube_title": "🎥 関連映像: 『サマーツインテール』公式MV",
        "youtube_url": "https://www.youtube.com/embed/wO2z79qqB1Y",
        "youtubeId": "wO2z79qqB1Y",
        "reward_title": "歴史の橋を渡る青春",
        "tags": [
            "サマーツインテール"
        ],
        "address": "〒368-0056 埼玉県秩父市阿保町3795周辺",
        "description": "『サマーツインテール』MVに登場する、秩父を代表する歴史的な橋です。",
        "coordinateAccuracy": "exact",
        "workKey": "work-wO2z79qqB1Y"
    },
    {
        "id": "spot-real-oops-second",
        "name": "ウップスセカンド",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.993119,
        "longitude": 139.083377,
        "event_date": "2026-07-08",
        "youtube_title": "🎥 関連映像: 『サマーツインテール』公式MV",
        "youtube_url": "https://www.youtube.com/embed/wO2z79qqB1Y",
        "youtubeId": "wO2z79qqB1Y",
        "reward_title": "秩父ストリートの探検家",
        "tags": [
            "サマーツインテール"
        ],
        "address": "〒368-0042 埼玉県秩父市東町8-6",
        "description": "『サマーツインテール』MVに登場する秩父の店舗です。",
        "coordinateAccuracy": "exact",
        "workKey": "work-wO2z79qqB1Y"
    },
    {
        "id": "spot-real-karaokebox-saison",
        "name": "カラオケボックスセゾン",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 36.02351,
        "longitude": 139.115999,
        "event_date": "2026-07-08",
        "youtube_title": "🎥 関連映像: 『サマーツインテール』公式MV",
        "youtube_url": "https://www.youtube.com/embed/wO2z79qqB1Y",
        "youtubeId": "wO2z79qqB1Y",
        "reward_title": "サマーツインテールを歌い明かした者",
        "tags": [
            "サマーツインテール"
        ],
        "address": "〒368-0004 埼玉県秩父市山田192-4",
        "description": "『サマーツインテール』MVのカラオケシーンが撮影された店舗です。",
        "coordinateAccuracy": "exact",
        "workKey": "work-wO2z79qqB1Y"
    },
    {
        "id": "spot-real-hitsujiyama-park-miharashinookha",
        "name": "羊山公園 見晴しの丘",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.989975,
        "longitude": 139.089089,
        "event_date": "2026-07-08",
        "youtube_title": "🎥 関連映像: 『サマーツインテール』公式MV",
        "youtube_url": "https://www.youtube.com/embed/wO2z79qqB1Y",
        "youtubeId": "wO2z79qqB1Y",
        "reward_title": "秩父のパノラマを眺めた者",
        "tags": [
            "サマーツインテール"
        ],
        "address": "〒368-0023 埼玉県秩父市熊木町41-1",
        "description": "秩父の街並みを見渡せる、『サマーツインテール』MVのロケ地です。",
        "coordinateAccuracy": "exact",
        "workKey": "work-wO2z79qqB1Y"
    },
    {
        "id": "spot-real-bushu-nakagawa-station",
        "name": "武州中川駅",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.941966,
        "longitude": 139.036264,
        "event_date": "2026-07-08",
        "youtube_title": "🎥 関連映像: 『サマーツインテール』公式MV",
        "youtube_url": "https://www.youtube.com/embed/wO2z79qqB1Y",
        "youtubeId": "wO2z79qqB1Y",
        "reward_title": "ローカル駅の旅人",
        "tags": [
            "サマーツインテール"
        ],
        "address": "〒369-1802 埼玉県秩父市荒川上田野",
        "description": "『サマーツインテール』MVに登場する秩父鉄道の駅です。",
        "coordinateAccuracy": "exact",
        "workKey": "work-wO2z79qqB1Y"
    },
    {
        "id": "spot-real-chichibu-imamiya-shrine",
        "name": "秩父今宮神社",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.995036,
        "longitude": 139.079992,
        "event_date": "2026-07-08",
        "youtube_title": "🎥 関連映像: 『サマーツインテール』公式MV",
        "youtube_url": "https://www.youtube.com/embed/wO2z79qqB1Y",
        "youtubeId": "wO2z79qqB1Y",
        "reward_title": "大樹に見守られ参拝した者",
        "tags": [
            "サマーツインテール"
        ],
        "address": "〒368-0043 埼玉県秩父市中町16-10",
        "description": "『サマーツインテール』MVに登場する秩父の神社です。\n\n⚠️ 注意：参拝者や神社行事を優先してください。",
        "visitor_notes": "参拝者や神社行事を優先してください。",
        "coordinateAccuracy": "exact",
        "workKey": "work-wO2z79qqB1Y"
    },
    {
        "id": "spot-real-chichibu-parry-shokudo",
        "name": "秩父パリー食堂",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.994211,
        "longitude": 139.083574,
        "event_date": "2026-07-08",
        "youtube_title": "🎥 関連映像: 『サマーツインテール』公式MV",
        "youtube_url": "https://www.youtube.com/embed/wO2z79qqB1Y",
        "youtubeId": "wO2z79qqB1Y",
        "reward_title": "レトロ食堂の温もりに触れた者",
        "tags": [
            "サマーツインテール"
        ],
        "address": "〒368-0041 埼玉県秩父市番場町19-8",
        "description": "『サマーツインテール』MVに登場する、昭和レトロな建物で知られる食堂です。",
        "coordinateAccuracy": "exact",
        "workKey": "work-wO2z79qqB1Y"
    },
    {
        "id": "spot-real-takahide-farm",
        "name": "高秀牧場",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.32006238847045,
        "longitude": 140.2921952461523,
        "event_date": "2026-06-03",
        "youtube_title": "🎥 関連映像: 『ノンフィクション』公式MV",
        "youtube_url": "https://www.youtube.com/embed/TCYJnm0oIfY",
        "youtubeId": "TCYJnm0oIfY",
        "reward_title": "ノンフィクションの風を感じた者",
        "tags": [
            "ノンフィクション"
        ],
        "address": "〒298-0106 千葉県いすみ市須賀谷1339-1",
        "description": "『ノンフィクション』MVの牧場シーンが撮影された場所です。",
        "coordinateAccuracy": "exact",
        "workKey": "work-TCYJnm0oIfY"
    },
    {
        "id": "spot-real-nihon-univ-funabashi-building12",
        "name": "日本大学理工学部 船橋キャンパス12号館",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.725197,
        "longitude": 140.0578,
        "event_date": "2026-06-03",
        "youtube_title": "🎥 関連映像: 『ノンフィクション』公式MV",
        "youtube_url": "https://www.youtube.com/embed/TCYJnm0oIfY",
        "youtubeId": "TCYJnm0oIfY",
        "reward_title": "キャンパスの学び舎を見上げた者",
        "tags": [
            "ノンフィクション"
        ],
        "address": "〒274-0063 千葉県船橋市習志野台7丁目24-1",
        "description": "『ノンフィクション』MVに登場する大学校舎です。\n\n⚠️ 注意：大学敷地への無断立ち入りや授業中の撮影は禁止。敷地内への無断立ち入りは禁止です。公道または見学可能範囲からお楽しみください。",
        "visitor_notes": "大学敷地への無断立ち入りや授業中の撮影は禁止。敷地内への無断立ち入りは禁止です。公道または見学可能範囲からお楽しみください。",
        "coordinateAccuracy": "exact",
        "workKey": "work-TCYJnm0oIfY"
    },
    {
        "id": "spot-real-nihon-univ-narashino-high-school",
        "name": "日本大学習志野高等学校",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.725091,
        "longitude": 140.054442,
        "event_date": "2026-06-03",
        "youtube_title": "🎥 関連映像: 『ノンフィクション』公式MV",
        "youtube_url": "https://www.youtube.com/embed/TCYJnm0oIfY",
        "youtubeId": "TCYJnm0oIfY",
        "reward_title": "青春の校庭を遠くから見つめた者",
        "tags": [
            "ノンフィクション"
        ],
        "address": "〒274-0063 千葉県船橋市習志野台7丁目24-24",
        "description": "『ノンフィクション』MVの学校シーンが撮影された場所です。\n\n⚠️ 注意：学校敷地内への無断立ち入り禁止。敷地内への無断立ち入りは禁止です。公道または見学可能範囲からお楽しみください。",
        "visitor_notes": "学校敷地内への無断立ち入り禁止。敷地内への無断立ち入りは禁止です。公道または見学可能範囲からお楽しみください。",
        "coordinateAccuracy": "exact",
        "workKey": "work-TCYJnm0oIfY"
    },
    {
        "id": "spot-real-lucky-batting-dome-yachiyo",
        "name": "ラッキーバッティングドーム 八千代店",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.723053,
        "longitude": 140.067334,
        "event_date": "2026-06-03",
        "youtube_title": "🎥 関連映像: 『ノンフィクション』公式MV",
        "youtube_url": "https://www.youtube.com/embed/TCYJnm0oIfY",
        "youtubeId": "TCYJnm0oIfY",
        "reward_title": "快音を響かせたバッター",
        "tags": [
            "ノンフィクション"
        ],
        "address": "〒276-0046 千葉県八千代市大和田新田1088",
        "description": "『ノンフィクション』MVのバッティングセンターシーンが撮影された店舗です。",
        "coordinateAccuracy": "exact",
        "workKey": "work-TCYJnm0oIfY"
    },
    {
        "id": "spot-real-akada-beach",
        "name": "赤田海水浴場",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.339207,
        "longitude": 130.891888,
        "event_date": "2020-10-24",
        "youtube_title": "🎥 関連映像: 『青春“サブリミナル”』公式MV",
        "youtube_url": "https://www.youtube.com/embed/8id6i_QeNJM",
        "youtubeId": "8id6i_QeNJM",
        "reward_title": "赤田の砂浜に立った者",
        "tags": [
            "青春“サブリミナル”"
        ],
        "address": "山口県下関市豊北町神田",
        "description": "ダンスパートの砂浜。齋藤樹愛羅の個人カットは海水浴場のトイレ・更衣室付近で撮影された。角島大橋を望む海岸景観も画面の手がかり。海水浴場の営業期間・駐車ルールに従う。",
        "visitor_notes": "海水浴場の営業期間・駐車ルールに従ってください。",
        "primarySourceUrl": "https://note.com/bellcy23/n/n312b5c8d8b22",
        "coordinateAccuracy": "exact",
        "workKey": "work-8id6i_QeNJM"
    },
    {
        "id": "spot-real-akada-road",
        "name": "赤田海水浴場〜ホテル西長門リゾート間の海岸道路",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.323949,
        "longitude": 130.90313,
        "event_date": "2020-10-24",
        "youtube_title": "🎥 関連映像: 『青春“サブリミナル”』公式MV",
        "youtube_url": "https://www.youtube.com/embed/8id6i_QeNJM",
        "youtubeId": "8id6i_QeNJM",
        "reward_title": "海岸道路を歩んだ者",
        "tags": [
            "青春“サブリミナル”"
        ],
        "address": "山口県下関市豊北町神田",
        "description": "瀧脇笙古の個人カットに登場する海沿いの細い道。赤田海水浴場からホテル西長門リゾートへ向かう区間で、海と斜面の見え方が一致する。道幅が狭いため路上駐停車はせず、徒歩で安全に確認する。\n\n⚠️ 注意：道幅が狭いため路上駐停車はせず、徒歩で安全に確認してください。",
        "visitor_notes": "道幅が狭いため路上駐停車はせず、徒歩で安全に確認してください。",
        "primarySourceUrl": "https://note.com/bellcy23/n/n312b5c8d8b22",
        "coordinateAccuracy": "exact",
        "workKey": "work-8id6i_QeNJM"
    },
    {
        "id": "spot-real-hotel-nishi-nagato-resort",
        "name": "ホテル西長門リゾート",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.343709,
        "longitude": 130.890565,
        "event_date": "2020-10-24",
        "youtube_title": "🎥 関連映像: 『青春“サブリミナル”』公式MV",
        "youtube_url": "https://www.youtube.com/embed/8id6i_QeNJM",
        "youtubeId": "8id6i_QeNJM",
        "reward_title": "西長門リゾートの夜景を見た者",
        "tags": [
            "青春“サブリミナル”"
        ],
        "address": "山口県下関市豊北町神田2045",
        "description": "佐竹のん乃・諸橋沙夏の個人カット、プール周辺、夜の花火場面で使われたリゾートホテル。角島大橋を望む立地もMVの背景と一致する。私有地のため宿泊・施設利用の範囲で見学し、撮影可否は施設案内に従う。\n\n⚠️ 注意：私有地のため宿泊・施設利用の範囲で見学し、撮影可否は施設案内に従ってください。",
        "visitor_notes": "私有地のため宿泊・施設利用の範囲で見学し、撮影可否は施設案内に従ってください。",
        "primarySourceUrl": "https://note.com/bellcy23/n/n312b5c8d8b22",
        "coordinateAccuracy": "exact",
        "workKey": "work-8id6i_QeNJM"
    },
    {
        "id": "spot-real-kyu-tsunoshima-elementary-school",
        "name": "旧下関市立角島小学校",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.354364,
        "longitude": 130.860727,
        "event_date": "2020-10-24",
        "youtube_title": "🎥 関連映像: 『青春“サブリミナル”』公式MV",
        "youtube_url": "https://www.youtube.com/embed/8id6i_QeNJM",
        "youtubeId": "8id6i_QeNJM",
        "reward_title": "木造校舎の面影を感じた者",
        "tags": [
            "青春“サブリミナル”"
        ],
        "address": "山口県下関市豊北町角島",
        "description": "音嶋莉沙の個人カットの校舎。角島小学校は2020年3月末で閉校しており、MVには閉校後の校舎外観・校内意匠が使われている。現在は通常の学校施設ではないため、敷地内へ無断で立ち入らず公道側から節度を守って訪問する。\n\n⚠️ 注意：敷地内へ無断立ち入りは禁止です。公道または見学可能範囲からお楽しみください。",
        "visitor_notes": "敷地内へ無断立ち入りは禁止です。公道または見学可能範囲からお楽しみください。",
        "primarySourceUrl": "https://note.com/bellcy23/n/n312b5c8d8b22",
        "coordinateAccuracy": "exact",
        "workKey": "work-8id6i_QeNJM"
    },
    {
        "id": "spot-real-kyu-tsunoshima-junior-high-school",
        "name": "旧下関市立角島中学校",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.35356,
        "longitude": 130.859416,
        "event_date": "2020-10-24",
        "youtube_title": "🎥 関連映像: 『青春“サブリミナル”』公式MV",
        "youtube_url": "https://www.youtube.com/embed/8id6i_QeNJM",
        "youtubeId": "8id6i_QeNJM",
        "reward_title": "旧校舎の佇まいを見つめた者",
        "tags": [
            "青春“サブリミナル”"
        ],
        "address": "山口県下関市豊北町角島",
        "description": "野口衣織の個人カットで使われた旧中学校。閉校した校舎の廊下や教室の雰囲気がシーンの印象をつくっている。現地は観光施設として常時公開されている場所ではないため、無断進入せず外観見学にとどめる。\n\n⚠️ 注意：敷地内へ無断立ち入りは禁止です。公道または見学可能範囲からお楽しみください。",
        "visitor_notes": "敷地内へ無断立ち入りは禁止です。公道または見学可能範囲からお楽しみください。",
        "primarySourceUrl": "https://note.com/bellcy23/n/n312b5c8d8b22",
        "coordinateAccuracy": "exact",
        "workKey": "work-8id6i_QeNJM"
    },
    {
        "id": "spot-real-tsunoshima-lighthouse-park",
        "name": "角島灯台公園",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.352054,
        "longitude": 130.8415,
        "event_date": "2020-10-24",
        "youtube_title": "🎥 関連映像: 『青春“サブリミナル”』公式MV",
        "youtube_url": "https://www.youtube.com/embed/8id6i_QeNJM",
        "youtubeId": "8id6i_QeNJM",
        "reward_title": "白亜の灯台を望む者",
        "tags": [
            "青春“サブリミナル”"
        ],
        "address": "山口県下関市豊北町角島2343-2",
        "description": "角島灯台周辺の海辺の場面で登場。園内の散策路、灯台、海岸線の組み合わせがMVの背景を特定する手がかりになる。灯台の参観時間や公園の利用ルールに従う。",
        "primarySourceUrl": "https://note.com/bellcy23/n/n312b5c8d8b22",
        "coordinateAccuracy": "exact",
        "workKey": "work-8id6i_QeNJM"
    },
    {
        "id": "spot-real-yumezaki-namino-park",
        "name": "夢崎波の公園",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.35351,
        "longitude": 130.840435,
        "event_date": "2020-10-24",
        "youtube_title": "🎥 関連映像: 『青春“サブリミナル”』公式MV",
        "youtube_url": "https://www.youtube.com/embed/8id6i_QeNJM",
        "youtubeId": "8id6i_QeNJM",
        "reward_title": "東屋の海風を感じた者",
        "tags": [
            "青春“サブリミナル”"
        ],
        "address": "山口県下関市豊北町角島",
        "description": "大谷映美里の海辺の東屋・散策路、大場花菜の海岸付近の個人カットに対応する公園。角島灯台公園に隣接するため、同日に徒歩で巡りやすい。植栽や波打つ園路を傷めず見学する。",
        "primarySourceUrl": "https://note.com/bellcy23/n/n312b5c8d8b22",
        "coordinateAccuracy": "exact",
        "workKey": "work-8id6i_QeNJM"
    },
    {
        "id": "spot-real-makizaki-road",
        "name": "牧崎風の公園へ向かう道",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.372842,
        "longitude": 130.866888,
        "event_date": "2020-10-24",
        "youtube_title": "🎥 関連映像: 『青春“サブリミナル”』公式MV",
        "youtube_url": "https://www.youtube.com/embed/8id6i_QeNJM",
        "youtubeId": "8id6i_QeNJM",
        "reward_title": "風吹く一本道を走った者",
        "tags": [
            "青春“サブリミナル”"
        ],
        "address": "山口県下関市豊北町角島",
        "description": "メンバーが坂道を走るグループカットの区間。牧崎風の公園へ向かう細い生活道路で、草地と海へ抜ける景観が特徴。車両のすれ違いが難しいため、公園駐車場等を利用し徒歩で訪れる。\n\n⚠️ 注意：車両のすれ違いが難しいため、公園駐車場等を利用し徒歩で安全に訪問してください。",
        "visitor_notes": "車両のすれ違いが難しいため、公園駐車場等を利用し徒歩で安全に訪問してください。",
        "primarySourceUrl": "https://note.com/bellcy23/n/n312b5c8d8b22",
        "coordinateAccuracy": "exact",
        "workKey": "work-8id6i_QeNJM"
    },
    {
        "id": "spot-real-doigahama-beach",
        "name": "土井ヶ浜海水浴場",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.299847,
        "longitude": 130.885204,
        "event_date": "2020-10-24",
        "youtube_title": "🎥 関連映像: 『青春“サブリミナル”』公式MV",
        "youtube_url": "https://www.youtube.com/embed/8id6i_QeNJM",
        "youtubeId": "8id6i_QeNJM",
        "reward_title": "夕景のグラデーションを目撃した者",
        "tags": [
            "青春“サブリミナル”"
        ],
        "address": "山口県下関市豊北町神田上",
        "description": "MVの冒頭・終盤、夕景のグループカットを中心に使われた砂浜。沖に見える島影や長い海岸線が映像との照合点。佐々木舞香の駐車場カット、山本杏奈の坂・階段カットも周辺で撮影された。海水浴場の営業・駐車ルールに従う。",
        "primarySourceUrl": "https://note.com/bellcy23/n/n312b5c8d8b22",
        "coordinateAccuracy": "exact",
        "workKey": "work-8id6i_QeNJM"
    },
    {
        "id": "spot-real-kyu-temiya-line",
        "name": "旧国鉄手宮線跡地",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 43.199064,
        "longitude": 140.998736,
        "event_date": "2020-12-07",
        "youtube_title": "🎥 関連映像: 『流星群』公式MV",
        "youtube_url": "https://www.youtube.com/embed/FbMXfjeUXXA",
        "youtubeId": "FbMXfjeUXXA",
        "reward_title": "小樽の廃線跡を散策した者",
        "tags": [
            "流星群"
        ],
        "address": "北海道小樽市色内1丁目周辺",
        "description": "髙松瞳と齊藤なぎさが小樽を歩く場面に登場する旧線路跡。レールと石畳が残る遊歩道で、小樽運河側へ向かう移動シーンの起点として描かれる。歩行者や周辺住民の通行を妨げず見学する。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/entry-12648266496.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-FbMXfjeUXXA"
    },
    {
        "id": "spot-real-otaru-ungah-promenade",
        "name": "小樽運河遊歩道（中央橋・乗船場付近）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 43.199559,
        "longitude": 141.003368,
        "event_date": "2020-12-07",
        "youtube_title": "🎥 関連映像: 『流星群』公式MV",
        "youtube_url": "https://www.youtube.com/embed/FbMXfjeUXXA",
        "youtubeId": "FbMXfjeUXXA",
        "reward_title": "運河沿いを二人で歩いた者",
        "tags": [
            "流星群"
        ],
        "address": "北海道小樽市港町5",
        "description": "運河沿いを二人で歩く場面のロケ地。石造倉庫、運河、遊歩道の手すりが画面と一致し、クルーズ乗船場に近い区間が中心。観光客の多い場所なので長時間の占有や通行を遮る撮影は避ける。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/entry-12648266496.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-FbMXfjeUXXA"
    },
    {
        "id": "spot-real-ajino-eiroku",
        "name": "味の栄六",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 43.193331,
        "longitude": 140.998558,
        "event_date": "2020-12-07",
        "youtube_title": "🎥 関連映像: 『流星群』公式MV",
        "youtube_url": "https://www.youtube.com/embed/FbMXfjeUXXA",
        "youtubeId": "FbMXfjeUXXA",
        "reward_title": "小樽のぬくもりを味わった者",
        "tags": [
            "流星群"
        ],
        "address": "北海道小樽市花園1丁目5-4",
        "description": "二人の食事場面で繰り返し登場する飲食店。店内奥側の座席が撮影位置として紹介されている。通常の飲食店なので来店・注文のうえ、店内撮影は必ず店員へ確認する。\n\n⚠️ 注意：通常営業の店舗です。ご来店のうえ、店内撮影の際は必ず店舗スタッフの確認・許可を得てください。",
        "visitor_notes": "通常営業の店舗です。ご来店のうえ、店内撮影の際は必ず店舗スタッフの確認・許可を得てください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/entry-12648266496.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-FbMXfjeUXXA"
    },
    {
        "id": "spot-real-auberge-oyado-sakurai",
        "name": "オーベルジュ 御宿 櫻井",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 43.195759,
        "longitude": 141.003236,
        "event_date": "2020-12-07",
        "youtube_title": "🎥 関連映像: 『流星群』公式MV",
        "youtube_url": "https://www.youtube.com/embed/FbMXfjeUXXA",
        "youtubeId": "FbMXfjeUXXA",
        "reward_title": "不老長寿の間の滞在者",
        "tags": [
            "流星群"
        ],
        "address": "北海道小樽市堺町2-12",
        "description": "ソファやベッドで過ごす宿泊場面に使われた宿。客室「不老長寿の間」が撮影場所として特定されている。宿泊施設のため、見学だけの立入りはせず予約・利用規則に従う。\n\n⚠️ 注意：宿泊施設のため、見学目的のみの無断立ち入りはご遠慮ください。",
        "visitor_notes": "宿泊施設のため、見学目的のみの無断立ち入りはご遠慮ください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/entry-12648266496.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-FbMXfjeUXXA"
    },
    {
        "id": "spot-real-taisho-glass-kanzashiya",
        "name": "大正硝子 かんざし屋",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 43.196852,
        "longitude": 141.003609,
        "event_date": "2020-12-07",
        "youtube_title": "🎥 関連映像: 『流星群』公式MV",
        "youtube_url": "https://www.youtube.com/embed/FbMXfjeUXXA",
        "youtubeId": "FbMXfjeUXXA",
        "reward_title": "ガラスの煌めきを選んだ者",
        "tags": [
            "流星群"
        ],
        "address": "北海道小樽市堺町1-1",
        "description": "二人がアクセサリーを選ぶ買い物場面の店舗。店内のガラス装飾品や陳列がMVとの照合点になる。営業中の店舗であるため商品や他の客に配慮し、撮影はスタッフの許可を得る。\n\n⚠️ 注意：営業中の店舗です。商品や他のお客様に配慮し、撮影はスタッフの許可を得てください。",
        "visitor_notes": "営業中の店舗です。商品や他のお客様に配慮し、撮影はスタッフの許可を得てください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/entry-12648266496.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-FbMXfjeUXXA"
    },
    {
        "id": "spot-real-moiwayama-summit-observation-deck",
        "name": "藻岩山 山頂展望台",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 43.018793,
        "longitude": 141.323616,
        "event_date": "2020-12-07",
        "youtube_title": "🎥 関連映像: 『流星群』公式MV",
        "youtube_url": "https://www.youtube.com/embed/FbMXfjeUXXA",
        "youtubeId": "FbMXfjeUXXA",
        "reward_title": "煌めく夜景と誓いを立てた者",
        "tags": [
            "流星群"
        ],
        "address": "北海道札幌市南区藻岩山",
        "description": "夜景を背景に二人が過ごす終盤のロケ地。山頂展望台と「愛の南京錠」周辺が登場し、小樽市街の場面から札幌の夜景へ移る構成になっている。ロープウェイ等の運行・営業時間を事前確認する。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/entry-12648266496.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-FbMXfjeUXXA"
    },
    {
        "id": "spot-real-helena-international-hotel",
        "name": "ヘレナ国際ホテル",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 36.956793,
        "longitude": 140.802078,
        "event_date": "2023-11-25",
        "youtube_title": "🎥 関連映像: 『狂想カタストロフィ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/RG_B3gfOzLo",
        "youtubeId": "RG_B3gfOzLo",
        "reward_title": "未完の回廊を駆け抜けた者",
        "tags": [
            "狂想カタストロフィ"
        ],
        "address": "福島県いわき市渡辺町松小屋中丸",
        "description": "MV全編の主要舞台となった未完成ホテル建築。コンクリートの廊下、吹き抜け、外壁のない空間でダンスや移動シーンが撮影された。ゴルフ場敷地内の管理施設で一般見学場所ではないため、無断進入は厳禁。\n\n⚠️ 注意：私有地・管理施設につき無断進入厳禁。公道または見学可能範囲からお楽しみください。",
        "visitor_notes": "私有地・管理施設につき無断進入厳禁。公道または見学可能範囲からお楽しみください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/entry-12830382345.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-RG_B3gfOzLo"
    },
    {
        "id": "spot-real-nasu-highland-tropicana",
        "name": "那須ハイランドパーク レストラン トロピカーナ",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 37.065423,
        "longitude": 139.963285,
        "event_date": "2024-07-24",
        "youtube_title": "🎥 関連映像: 『仲直りシュークリーム』公式MV",
        "youtube_url": "https://www.youtube.com/embed/D0SfIi-0Zpo",
        "youtubeId": "D0SfIi-0Zpo",
        "reward_title": "トロピカーナで甘い一口を味わった者",
        "tags": [
            "仲直りシュークリーム"
        ],
        "address": "栃木県那須郡那須町高久乙3375",
        "description": "髙松瞳と野口衣織を中心とした飲食店の場面に使われた園内レストラン。明るい客席とカウンター周辺がMVの舞台。遊園地の営業日・入園条件に従い、店舗利用中の撮影はスタッフへ確認する。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/entry-12861898865.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-D0SfIi-0Zpo"
    },
    {
        "id": "spot-real-nasu-highland-rocknroll-diner",
        "name": "那須ハイランドパーク ロックンロールダイナー",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 37.065555,
        "longitude": 139.963333,
        "event_date": "2024-07-24",
        "youtube_title": "🎥 関連映像: 『仲直りシュークリーム』公式MV",
        "youtube_url": "https://www.youtube.com/embed/D0SfIi-0Zpo",
        "youtubeId": "D0SfIi-0Zpo",
        "reward_title": "ポップダイナーで仲直りした者",
        "tags": [
            "仲直りシュークリーム"
        ],
        "address": "栃木県那須郡那須町高久乙3375",
        "description": "アメリカンダイナー風の場面に登場する園内店舗。赤を基調とした内装やポップな装飾がMVのゲーム風世界観と対応する。営業日や店舗名が変更される場合があるため公式案内を確認し、一般客に配慮する。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/entry-12861898865.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-D0SfIi-0Zpo"
    },
    {
        "id": "spot-real-nihon-univ-building14-faraday",
        "name": "日本大学理工学部 船橋キャンパス 14号館・学生食堂ファラディ",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.7255,
        "longitude": 140.0575,
        "event_date": "2025-01-28",
        "youtube_title": "🎥 関連映像: 『恋人以上、好き未満』",
        "youtube_url": "https://www.youtube.com/embed/p-jc9qMpMp4",
        "youtubeId": "p-jc9qMpMp4",
        "reward_title": "青春のテラスを歩んだ者",
        "tags": [
            "恋人以上、好き未満"
        ],
        "address": "千葉県船橋市習志野台7-24-1",
        "description": "高校生活を描くMVの学校場面。14号館のガラス張りテラス、テニスコート、学生食堂ファラディでダンスや物語場面が撮影された。教育施設のため一般公開イベント等を除き無断入構せず、大学の案内を優先する。\n\n⚠️ 注意：大学敷地への無断立ち入りや授業中の撮影は禁止です。公道または見学可能範囲からお楽しみください。",
        "visitor_notes": "大学敷地への無断立ち入りや授業中の撮影は禁止です。公道または見学可能範囲からお楽しみください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/entry-12885062101.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-p-jc9qMpMp4"
    },
    {
        "id": "spot-real-ensoleille",
        "name": "アンソレイエ",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.796438,
        "longitude": 140.11353,
        "event_date": "2025-01-28",
        "youtube_title": "🎥 関連映像: 『恋人以上、好き未満』",
        "youtube_url": "https://www.youtube.com/embed/p-jc9qMpMp4",
        "youtubeId": "p-jc9qMpMp4",
        "reward_title": "洋館のガーデンに佇む者",
        "tags": [
            "恋人以上、好き未満"
        ],
        "address": "千葉県印西市中央南2-3-1",
        "description": "MV冒頭の洋館・ガーデンの場面に使われた結婚式場。外観、石造風の壁、庭の意匠が作品世界の導入として映る。婚礼施設のため無断見学は避け、フェア・イベント等の正規利用時のみ案内に従う。\n\n⚠️ 注意：婚礼施設のため無断立ち入り・無断撮影はご遠慮ください。",
        "visitor_notes": "婚礼施設のため無断立ち入り・無断撮影はご遠慮ください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/entry-12885062101.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-p-jc9qMpMp4"
    },
    {
        "id": "spot-real-hananuki-dam",
        "name": "花貫ダム",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 36.725083,
        "longitude": 140.647899,
        "event_date": "2017-09-06",
        "youtube_title": "🎥 関連映像: 『＝LOVE』公式MV",
        "youtube_url": "https://www.youtube.com/embed/xOAaBsPaPpY",
        "youtubeId": "xOAaBsPaPpY",
        "reward_title": "花貫の風を感じた者",
        "tags": [
            "＝LOVE"
        ],
        "address": "茨城県高萩市大字秋山",
        "description": "デビューシングル『＝LOVE』MVのダンスシーンや自然豊かな場面で登場するダム湖・緑地ロケーション。高萩市の誇る景勝地で美しい水辺と木々が広がります。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "love"
    },
    {
        "id": "spot-real-tachikawa-sozosha",
        "name": "たちかわ創造舎（旧多摩川小学校）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.701717,
        "longitude": 139.394386,
        "event_date": "2018-05-16",
        "youtube_title": "🎥 関連映像: 『手遅れcaution』公式MV",
        "youtube_url": "https://www.youtube.com/embed/w0N0TiOlAY0",
        "youtubeId": "w0N0TiOlAY0",
        "reward_title": "廃校の廊下に佇む者",
        "tags": [
            "手遅れcaution"
        ],
        "address": "東京都立川市富士見町1-32-17",
        "description": "『手遅れcaution』MVのシリアスな学校場面やドラマパートが撮影された元小学校施設。現在は文化・たまがわクリエイティブ拠点として活用されています。\n\n⚠️ 注意：文化・学びの複合施設です。一般利用者の妨げにならないよう見学ルールを守ってください。",
        "visitor_notes": "文化・学びの複合施設です。一般利用者の妨げにならないよう見学ルールを守ってください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "caution"
    },
    {
        "id": "spot-real-monalisa-ebisu",
        "name": "モナリザ恵比寿店前",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.647732,
        "longitude": 139.707703,
        "event_date": "2018-05-16",
        "youtube_title": "🎥 関連映像: 『手遅れcaution』公式MV",
        "youtube_url": "https://www.youtube.com/embed/w0N0TiOlAY0",
        "youtubeId": "w0N0TiOlAY0",
        "reward_title": "恵比寿の路地を駆け抜けた者",
        "tags": [
            "手遅れcaution"
        ],
        "address": "東京都渋谷区恵比寿西1-14-4",
        "description": "『手遅れcaution』MVの街頭・疾走シーン周辺に登場する有名フレンチレストラン前の通り。恵比寿の静かな街並みが印象的です。\n\n⚠️ 注意：営業中の店舗周辺です。他のお客様や通行人の邪魔にならないよう注意してください。",
        "visitor_notes": "営業中の店舗周辺です。他のお客様や通行人の邪魔にならないよう注意してください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "caution"
    },
    {
        "id": "spot-real-koriyama-culture-park",
        "name": "郡山カルチャーパーク",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 37.366994,
        "longitude": 140.329478,
        "event_date": "2019-04-24",
        "youtube_title": "🎥 関連映像: 『探せ ダイヤモンドリリー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/t5r0rNwjXQU",
        "youtubeId": "t5r0rNwjXQU",
        "reward_title": "観覧車の観測者",
        "tags": [
            "探せ ダイヤモンドリリー"
        ],
        "address": "福島県郡山市安積町成田字東丸山61",
        "description": "『探せ ダイヤモンドリリー』MVの遊園地・観覧車やアトラクション周辺で撮影されたレジャースポット。メンバーたちの切なくも瑞々しい表情が収められています。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "sagase-diamond-lily"
    },
    {
        "id": "spot-real-toei-tokyo-studio-roof",
        "name": "東映東京撮影所 屋上",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.753159,
        "longitude": 139.594357,
        "event_date": "2019-04-24",
        "youtube_title": "🎥 関連映像: 『探せ ダイヤモンドリリー』公式MV",
        "youtube_url": "https://www.youtube.com/embed/t5r0rNwjXQU",
        "youtubeId": "t5r0rNwjXQU",
        "reward_title": "東映屋上の空を見上げた者",
        "tags": [
            "探せ ダイヤモンドリリー"
        ],
        "address": "東京都練馬区東大泉2-34-5",
        "description": "『探せ ダイヤモンドリリー』MVのラストシーンや青空背景のダンスカットで使われた撮影所の屋上スペース。\n\n⚠️ 注意：映画・映像撮影スタジオ（私有地）につき関係者以外の無断立ち入り厳禁。公道側から見学してください。",
        "visitor_notes": "映画・映像撮影スタジオ（私有地）につき関係者以外の無断立ち入り厳禁。公道側から見学してください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "sagase-diamond-lily"
    },
    {
        "id": "spot-real-shimokitazawa-garden",
        "name": "下北沢GARDEN",
        "group": "=LOVE",
        "category": "ライブ会場",
        "latitude": 35.660447,
        "longitude": 139.668518,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『いらない ツインテール』公式MV",
        "youtube_url": "https://www.youtube.com/embed/7V8eS16Y-zY",
        "youtubeId": "7V8eS16Y-zY",
        "reward_title": "ツインテールパンクの熱狂者",
        "tags": [
            "いらない ツインテール"
        ],
        "address": "東京都世田谷区北沢2-4-5",
        "description": "『いらない ツインテール』MVの激しいバンドステージ・ライブパフォーマンス場面で使われた下北沢の伝説的ライブハウス。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-7V8eS16Y-zY"
    },
    {
        "id": "spot-real-kissa-ginza-ebisu",
        "name": "喫茶 銀座（恵比寿）",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.645862,
        "longitude": 139.708174,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『ズルいよ ズルいね』公式MV",
        "youtube_url": "https://www.youtube.com/embed/zR7-eBv28_w",
        "youtubeId": "zR7-eBv28_w",
        "reward_title": "純喫茶の悲哀に浸った者",
        "tags": [
            "ズルいよ ズルいね"
        ],
        "address": "東京都渋谷区恵比寿南1-3-9",
        "description": "『ズルいよ ズルいね』MVのレトロで切ないドラマパートに使われた恵比寿の老舗純喫茶。ネオンライトや深い色調の客席が印象的です。\n\n⚠️ 注意：通常営業の喫茶店です。ご来店のうえ店内撮影の際は必ず店舗スタッフの許可を得てください。",
        "visitor_notes": "通常営業の喫茶店です。ご来店のうえ店内撮影の際は必ず店舗スタッフの許可を得てください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-zR7-eBv28_w"
    },
    {
        "id": "spot-real-tipness-kokuryo",
        "name": "ティップネス国領店",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.650789,
        "longitude": 139.558315,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『ズルいよ ズルいね』公式MV",
        "youtube_url": "https://www.youtube.com/embed/zR7-eBv28_w",
        "youtubeId": "zR7-eBv28_w",
        "reward_title": "プールサイドの涙を知る者",
        "tags": [
            "ズルいよ ズルいね"
        ],
        "address": "東京都調布市国領町2-5-15",
        "description": "『ズルいよ ズルいね』MVのスイミングプール場面で撮影されたスポーツクラブ施設。\n\n⚠️ 注意：会員制フィットネスクラブです。館内への無断立ち入りはご遠慮ください。",
        "visitor_notes": "会員制フィットネスクラブです。館内への無断立ち入りはご遠慮ください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-zR7-eBv28_w"
    },
    {
        "id": "spot-real-ikebukuro-overpass",
        "name": "池袋駅付近の架道橋",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.7328,
        "longitude": 139.7125,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『ズルいよ ズルいね』公式MV",
        "youtube_url": "https://www.youtube.com/embed/zR7-eBv28_w",
        "youtubeId": "zR7-eBv28_w",
        "reward_title": "線路沿いの孤独を感じた者",
        "tags": [
            "ズルいよ ズルいね"
        ],
        "address": "東京都豊島区池袋2丁目周辺",
        "description": "『ズルいよ ズルいね』MVの夜の街頭場面でメンバーが佇む池袋駅近くの架道橋・線路沿いスポット。交通量や歩行者に配慮して安全に見学してください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-zR7-eBv28_w"
    },
    {
        "id": "spot-real-toshimaen-record",
        "name": "としまえん（閉園・記録用）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.745042,
        "longitude": 139.646099,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『ズルいよ ズルいね』公式MV",
        "youtube_url": "https://www.youtube.com/embed/zR7-eBv28_w",
        "youtubeId": "zR7-eBv28_w",
        "reward_title": "カルーセルエルドラドの記憶",
        "tags": [
            "ズルいよ ズルいね"
        ],
        "address": "東京都練馬区向山3-25-1",
        "description": "『ズルいよ ズルいね』MVでメリーゴーラウンド（カルーセルエルドラド）の幻想的なカットが撮影された名遊園地。\n\n⚠️ 注意：2020年8月31日をもって閉園いたしました。現在はメイキング・オブ・ハリー・ポッターが営業中。歴史的記録用聖地として掲載しています。",
        "visitor_notes": "2020年8月31日に閉園いたしました。記録用聖地として掲載しています。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-zR7-eBv28_w"
    },
    {
        "id": "spot-real-udagawacho-shimoda-bldg",
        "name": "渋谷区宇田川町 下田ビル側面",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.662643,
        "longitude": 139.695125,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『ズルいよ ズルいね』公式MV",
        "youtube_url": "https://www.youtube.com/embed/zR7-eBv28_w",
        "youtubeId": "zR7-eBv28_w",
        "reward_title": "渋谷路地裏の感傷者",
        "tags": [
            "ズルいよ ズルいね"
        ],
        "address": "東京都渋谷区宇田川町37-15",
        "description": "『ズルいよ ズルいね』MVで雨や夜の都会カットで登場する渋谷宇田川町のビル外壁・路地裏スポット。公道から安全に見学してください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-zR7-eBv28_w"
    },
    {
        "id": "spot-real-tokyo-pool-labo",
        "name": "TOKYO POOL LABO（営業終了・記録用）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.769338,
        "longitude": 139.828553,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『ズルいよ ズルいね』公式MV",
        "youtube_url": "https://www.youtube.com/embed/zR7-eBv28_w",
        "youtubeId": "zR7-eBv28_w",
        "reward_title": "水中撮影の余韻",
        "tags": [
            "ズルいよ ズルいね"
        ],
        "address": "東京都足立区綾瀬6-31-1",
        "description": "『ズルいよ ズルいね』MVの水中ドラマ・ダンスシーンが撮影された特殊撮影プール施設。\n\n⚠️ 注意：現在は営業終了しています。記憶・記録用聖地として掲載しています。",
        "visitor_notes": "現在は営業終了しています。記録用聖地として掲載しています。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-zR7-eBv28_w"
    },
    {
        "id": "spot-real-shibuya2-shinsei-bldg",
        "name": "渋谷2丁目 新生ビル前",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.660096,
        "longitude": 139.707796,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『ズルいよ ズルいね』公式MV",
        "youtube_url": "https://www.youtube.com/embed/zR7-eBv28_w",
        "youtubeId": "zR7-eBv28_w",
        "reward_title": "渋谷2丁目の佇まい",
        "tags": [
            "ズルいよ ズルいね"
        ],
        "address": "東京都渋谷区渋谷2-7-6",
        "description": "『ズルいよ ズルいね』MVの移動カットや佇むシーンで使われた渋谷2丁目地区のビル前ストリート。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-zR7-eBv28_w"
    },
    {
        "id": "spot-real-arakawa-bridge-yanagihara",
        "name": "京成本線 荒川橋梁下（足立区柳原）",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.7465,
        "longitude": 139.815,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『ズルいよ ズルいね』公式MV",
        "youtube_url": "https://www.youtube.com/embed/zR7-eBv28_w",
        "youtubeId": "zR7-eBv28_w",
        "reward_title": "鉄橋下の河川敷を歩いた者",
        "tags": [
            "ズルいよ ズルいね"
        ],
        "address": "東京都足立区柳原2丁目",
        "description": "『ズルいよ ズルいね』MVで荒川河川敷と頭上を走る電車（京成荒川橋梁）が映り込む切ないロケーション。河川敷公園から安全に見学できます。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-zR7-eBv28_w"
    },
    {
        "id": "spot-real-planear-ebisu-studio",
        "name": "プラネアール恵比寿スタジオ",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.64621,
        "longitude": 139.704976,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『ズルいよ ズルいね』公式MV",
        "youtube_url": "https://www.youtube.com/embed/zR7-eBv28_w",
        "youtubeId": "zR7-eBv28_w",
        "reward_title": "恵比寿スタジオの光",
        "tags": [
            "ズルいよ ズルいね"
        ],
        "address": "東京都渋谷区恵比寿南3-2-16",
        "description": "『ズルいよ ズルいね』MVの室内・ドラマカットが撮影されたスタジオ。\n\n⚠️ 注意：民間撮影スタジオ（私有地）につき関係者以外の無断立ち入り禁止。",
        "visitor_notes": "民間撮影スタジオ（私有地）につき関係者以外の無断立ち入り禁止。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-zR7-eBv28_w"
    },
    {
        "id": "spot-real-sakurajosui-studio",
        "name": "桜上水スタジオ",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.666377,
        "longitude": 139.629669,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『ズルいよ ズルいね』公式MV",
        "youtube_url": "https://www.youtube.com/embed/zR7-eBv28_w",
        "youtubeId": "zR7-eBv28_w",
        "reward_title": "桜上水ハウスの住人",
        "tags": [
            "ズルいよ ズルいね"
        ],
        "address": "東京都世田谷区桜上水5-10-18",
        "description": "『ズルいよ ズルいね』MVの個別リップシーンや室内ドラマで使われたハウススタジオ。\n\n⚠️ 注意：民間撮影スタジオ（私有地）につき関係者以外の無断立ち入り禁止。",
        "visitor_notes": "民間撮影スタジオ（私有地）につき関係者以外の無断立ち入り禁止。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-zR7-eBv28_w"
    },
    {
        "id": "spot-real-jingu-gaien-east-studio",
        "name": "神宮外苑EAST STUDIO",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.678269,
        "longitude": 139.715392,
        "event_date": "2021-05-12",
        "youtube_title": "🎥 関連映像: 『お姉さんじゃダメですか？』公式MV",
        "youtube_url": "https://www.youtube.com/embed/BkyRth1s_lM",
        "youtubeId": "BkyRth1s_lM",
        "reward_title": "お姉さんの部屋を覗いた者",
        "tags": [
            "お姉さんじゃダメですか？"
        ],
        "address": "東京都新宿区霞ヶ丘町周辺",
        "description": "大谷映美里を中心としたユニット曲『お姉さんじゃダメですか？』MVのオシャレなリビング・インテリアカットが撮影されたスタジオ。\n\n⚠️ 注意：撮影スタジオ（私有地）につき無断立ち入り禁止。",
        "visitor_notes": "撮影スタジオ（私有地）につき無断立ち入り禁止。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-BkyRth1s_lM"
    },
    {
        "id": "spot-real-hanahiroba-farm",
        "name": "観光農園花ひろば",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 34.722251,
        "longitude": 136.934388,
        "event_date": "2021-08-25",
        "youtube_title": "🎥 関連映像: 『ウィークエンドシトロン』公式MV",
        "youtube_url": "https://www.youtube.com/embed/p1022tthj7s",
        "youtubeId": "p1022tthj7s",
        "reward_title": "ひまわり畑を駆け抜けた者",
        "tags": [
            "ウィークエンドシトロン"
        ],
        "address": "愛知県知多郡南知多町豊丘高見台48",
        "description": "『ウィークエンドシトロン』MVの広大なひまわり畑ダンスシーンで使われた知多半島の有名な花園。一面に咲き誇る黄色いひまわりと青空が感動的です。入園料・開園時間に従って見学してください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-p1022tthj7s"
    },
    {
        "id": "spot-real-heat-studio",
        "name": "HEAT STUDIO",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.600082,
        "longitude": 139.745677,
        "event_date": "2021-08-25",
        "youtube_title": "🎥 関連映像: 『ウィークエンドシトロン』公式MV",
        "youtube_url": "https://www.youtube.com/embed/p1022tthj7s",
        "youtubeId": "p1022tthj7s",
        "reward_title": "シトロンカラーのスタジオ",
        "tags": [
            "ウィークエンドシトロン"
        ],
        "address": "東京都品川区勝島1-4-11",
        "description": "『ウィークエンドシトロン』MVのポップなイエロー背景や室内セット撮影が行われた大型スタジオ。\n\n⚠️ 注意：民間撮影スタジオ（私有地）につき無断立ち入り禁止。",
        "visitor_notes": "民間撮影スタジオ（私有地）につき無断立ち入り禁止。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-p1022tthj7s"
    },
    {
        "id": "spot-real-love-kingdom",
        "name": "LOVE KINGDOM",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.649626,
        "longitude": 139.789062,
        "event_date": "2021-12-15",
        "youtube_title": "🎥 関連映像: 『ズッ友案件』公式MV",
        "youtube_url": "https://www.youtube.com/embed/t08XqB-E43k",
        "youtubeId": "t08XqB-E43k",
        "reward_title": "ズッ友のパーティ会場",
        "tags": [
            "ズッ友案件"
        ],
        "address": "東京都江東区豊洲6-1-23",
        "description": "『ズッ友案件』MVのカジュアルなバーベキュー＆パーティー感溢れるアウトドア会場。メンバー同士のわちゃわちゃした笑顔が弾ける名スポットです。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-t08XqB-E43k"
    },
    {
        "id": "spot-real-bookcafe-bousingot",
        "name": "BOOK CAFE BOUSINGOT",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.723662,
        "longitude": 139.7629,
        "event_date": "2021-12-15",
        "youtube_title": "🎥 関連映像: 『The 5th』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Q1-yYjZqk7o",
        "youtubeId": "Q1-yYjZqk7o",
        "reward_title": "谷中のブックカフェで温もった者",
        "tags": [
            "The 5th"
        ],
        "address": "東京都文京区千駄木2-33-2",
        "description": "『The 5th』MVの温かな本棚・ブックカフェ場面で登場する千駄木の落ち着いたカフェ。\n\n⚠️ 注意：営業中の店舗です。ご利用時は静かにマナーを守ってお楽しみください。",
        "visitor_notes": "営業中の店舗です。ご利用時は静かにマナーを守ってお楽しみください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "the-5th"
    },
    {
        "id": "spot-real-cafe-meursault",
        "name": "カフェ ムルソー",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.709013,
        "longitude": 139.796993,
        "event_date": "2021-12-15",
        "youtube_title": "🎥 関連映像: 『The 5th』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Q1-yYjZqk7o",
        "youtubeId": "Q1-yYjZqk7o",
        "reward_title": "隅田川テラスを望む席へ",
        "tags": [
            "The 5th"
        ],
        "address": "東京都台東区雷門2-1-3",
        "description": "『The 5th』MVの冬のカフェシーンで登場する浅草・隅田川沿いのロマンチックなカフェレストラン。窓からスカイツリーや川辺が見渡せます。\n\n⚠️ 注意：営業中のカフェです。店舗ご利用のうえ店内撮影はマナーを守ってください。",
        "visitor_notes": "営業中のカフェです。店舗ご利用のうえ店内撮影はマナーを守ってください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "the-5th"
    },
    {
        "id": "spot-real-gooya-shibuya-office",
        "name": "GOOYA 渋谷オフィス",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.661307,
        "longitude": 139.703597,
        "event_date": "2021-12-15",
        "youtube_title": "🎥 関連映像: 『The 5th』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Q1-yYjZqk7o",
        "youtubeId": "Q1-yYjZqk7o",
        "reward_title": "渋谷のオフィスイルミネーション",
        "tags": [
            "The 5th"
        ],
        "address": "東京都渋谷区渋谷1-17-4",
        "description": "『The 5th』MVのオフィスワークや街の煌めき場面で使用された渋谷のオフィスビル。\n\n⚠️ 注意：民間企業のオフィスビルにつき部外者の立ち入りはご遠慮ください。",
        "visitor_notes": "民間企業のオフィスビルにつき部外者の立ち入りはご遠慮ください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "the-5th"
    },
    {
        "id": "spot-real-konan-ryokusui-park",
        "name": "港南緑水公園",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.628111,
        "longitude": 139.750615,
        "event_date": "2021-12-15",
        "youtube_title": "🎥 関連映像: 『The 5th』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Q1-yYjZqk7o",
        "youtubeId": "Q1-yYjZqk7o",
        "reward_title": "冬の夜公園を歩いた者",
        "tags": [
            "The 5th"
        ],
        "address": "東京都港区港南4-7-47",
        "description": "『The 5th』MVの夜の公園・ツリーや光の余韻が綺麗な運河沿いの公園。都会の夜の静けさが引き立ちます。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "the-5th"
    },
    {
        "id": "spot-real-tokyo-glamping-wbcafe",
        "name": "Tokyo Glamping produced by WBcafe",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.654589,
        "longitude": 139.79652,
        "event_date": "2021-12-15",
        "youtube_title": "🎥 関連映像: 『The 5th』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Q1-yYjZqk7o",
        "youtubeId": "Q1-yYjZqk7o",
        "reward_title": "グランピングでパーティーした者",
        "tags": [
            "The 5th"
        ],
        "address": "東京都江東区豊洲",
        "description": "『The 5th』MVの豪華なグランピング・クリスマスパーティーシーンで使われた人気施設。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "the-5th"
    },
    {
        "id": "spot-real-mimosa-house-country",
        "name": "ミモザハウス カントリー",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.613412,
        "longitude": 139.666816,
        "event_date": "2022-05-25",
        "youtube_title": "🎥 関連映像: 『あの子コンプレックス』公式MV",
        "youtube_url": "https://www.youtube.com/embed/20QxaOu6B4g",
        "youtubeId": "20QxaOu6B4g",
        "reward_title": "雨の洋館に佇む者",
        "tags": [
            "あの子コンプレックス"
        ],
        "address": "東京都世田谷区自由が丘2-2-10",
        "description": "『あの子コンプレックス』MVのナチュラルアンティークな室内・ドラマカットが撮影された美しい撮影ハウススタジオ。\n\n⚠️ 注意：ハウススタジオ（私有地）につき無断立ち入り禁止。",
        "visitor_notes": "ハウススタジオ（私有地）につき無断立ち入り禁止。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-20QxaOu6B4g"
    },
    {
        "id": "spot-real-jingu-gaien-ichogo-namiki",
        "name": "神宮外苑いちょう並木",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.673337,
        "longitude": 139.719542,
        "event_date": "2022-05-25",
        "youtube_title": "🎥 関連映像: 『あの子コンプレックス』公式MV",
        "youtube_url": "https://www.youtube.com/embed/20QxaOu6B4g",
        "youtubeId": "20QxaOu6B4g",
        "reward_title": "銀杏並木の下を歩いた者",
        "tags": [
            "あの子コンプレックス"
        ],
        "address": "東京都港区北青山2丁目周辺",
        "description": "『あの子コンプレックス』MVの街頭移動・散策カットで登場する青山通りの有名な銀杏並木。新緑や紅葉の季節に素晴らしいロケーションです。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-20QxaOu6B4g"
    },
    {
        "id": "spot-real-sundowner-zushi",
        "name": "SUNDOWNER",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.292362,
        "longitude": 139.579213,
        "event_date": "2022-05-25",
        "youtube_title": "🎥 関連映像: 『僕のヒロイン』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Y0rQz2K51sA",
        "youtubeId": "Y0rQz2K51sA",
        "reward_title": "逗子のダイナーで微笑む者",
        "tags": [
            "僕のヒロイン"
        ],
        "address": "神奈川県逗子市逗子6-5-1",
        "description": "髙松瞳のソロ曲『僕のヒロイン』MVでオムライスやオムレツサンドを楽しむ笑顔が弾ける可愛い飲食店・ダイナー。\n\n⚠️ 注意：飲食店です。ご来店・ご利用のうえ撮影マナーをお守りください。",
        "visitor_notes": "飲食店です。ご来店・ご利用のうえ撮影マナーをお守りください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-Y0rQz2K51sA"
    },
    {
        "id": "spot-real-sakuta-beach",
        "name": "作田海岸",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.547234,
        "longitude": 140.459342,
        "event_date": "2022-05-25",
        "youtube_title": "🎥 関連映像: 『僕のヒロイン』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Y0rQz2K51sA",
        "youtubeId": "Y0rQz2K51sA",
        "reward_title": "九十九里の砂浜にヒロインを見た者",
        "tags": [
            "僕のヒロイン"
        ],
        "address": "千葉県山武郡九十九里町作田",
        "description": "『僕のヒロイン』MVのダンス・海辺カットで爽やかな潮風と青空が映し出された九十九里の美しい海岸スポット。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-Y0rQz2K51sA"
    },
    {
        "id": "spot-real-snug-beach-house",
        "name": "SNUG BEACH HOUSE",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.289415,
        "longitude": 139.575342,
        "event_date": "2022-05-25",
        "youtube_title": "🎥 関連映像: 『僕のヒロイン』公式MV",
        "youtube_url": "https://www.youtube.com/embed/Y0rQz2K51sA",
        "youtubeId": "Y0rQz2K51sA",
        "reward_title": "ビーチハウスの風を感じた者",
        "tags": [
            "僕のヒロイン"
        ],
        "address": "神奈川県逗子市新宿1-5-4",
        "description": "『僕のヒロイン』MVの海の近くのカフェ・ハウスロケーション。\n\n⚠️ 注意：施設・店舗につき利用規則を守ってご訪問ください。",
        "visitor_notes": "施設・店舗につき利用規則を守ってご訪問ください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-Y0rQz2K51sA"
    },
    {
        "id": "spot-real-kujira-kabukicho",
        "name": "KUJIRA（歌舞伎町）",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.695214,
        "longitude": 139.704164,
        "event_date": "2022-05-25",
        "youtube_title": "🎥 関連映像: 『知らんけど』公式MV",
        "youtube_url": "https://www.youtube.com/embed/g2f0W7s3Ves",
        "youtubeId": "g2f0W7s3Ves",
        "reward_title": "ネオンの夜に酔いしれた者",
        "tags": [
            "知らんけど"
        ],
        "address": "東京都新宿区歌舞伎町2-23-1",
        "description": "野口衣織・佐々木舞香・諸橋沙夏の3人ユニット曲『知らんけど』MVのスタイリッシュ＆デンジャラスなネオン空間が広がるエンターテインメントラウンジ。\n\n⚠️ 注意：夜間営業店舗・ラウンジです。営業条件や利用ルールに従ってください。",
        "visitor_notes": "夜間営業店舗・ラウンジです。営業条件や利用ルールに従ってください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-g2f0W7s3Ves"
    },
    {
        "id": "spot-real-kyu-choshi-6th-jh-school",
        "name": "旧銚子市立第六中学校",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.803008,
        "longitude": 140.713182,
        "event_date": "2022-09-28",
        "youtube_title": "🎥 関連映像: 『好きって、言えなかった』公式MV",
        "youtube_url": "https://www.youtube.com/embed/V6dnp58i_Q8",
        "youtubeId": "V6dnp58i_Q8",
        "reward_title": "放課後の夕日を目撃した者",
        "tags": [
            "好きって、言えなかった"
        ],
        "address": "千葉県銚子市諸持町141",
        "description": "『好きって、言えなかった』MVの校舎・教室・体育館・校庭シーンが撮影された旧中学校。切ない青春のストーリーが描かれます。\n\n⚠️ 注意：閉校施設につき敷地内への無断立ち入りは禁止です。公道から見学してください。",
        "visitor_notes": "閉校施設につき敷地内への無断立ち入りは禁止です。公道から見学してください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-V6dnp58i_Q8"
    },
    {
        "id": "spot-real-tenkubashi-a2-underpass",
        "name": "天空橋駅〜A2出口 地下道",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.5489,
        "longitude": 139.7558,
        "event_date": "2023-11-29",
        "youtube_title": "🎥 関連映像: 『ラストノートしか知らない』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "近未来の地下道を歩む者",
        "tags": [
            "ラストノートしか知らない"
        ],
        "address": "東京都大田区羽田空港1-1-4",
        "description": "『ラストノートしか知らない』MVのSF感漂う白い幾何学デザインの地下通路カット。羽田イノベーションシティ直結の通路です。歩行者の通行を遮らないよう注意してください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-anniversaire-minatomirai",
        "name": "アニヴェルセルみなとみらい横浜",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.4542,
        "longitude": 139.6372,
        "event_date": "2023-11-29",
        "youtube_title": "🎥 関連映像: 『ラストノートしか知らない』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "みなとみらいの大聖堂を望む者",
        "tags": [
            "ラストノートしか知らない"
        ],
        "address": "神奈川県横浜市中区新港2-1-4",
        "description": "『ラストノートしか知らない』MVで夜景や美しい大聖堂・水辺ロケーションとして映り込むみなとみらいの名結婚式場。\n\n⚠️ 注意：婚礼施設につき敷地内への無断立ち入り・無断撮影は禁止されています。",
        "visitor_notes": "婚礼施設につき敷地内への無断立ち入り・無断撮影は禁止されています。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-shinko-chuo-hiroba",
        "name": "新港中央広場・サークルウォーク周辺",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.4535,
        "longitude": 139.641,
        "event_date": "2023-11-29",
        "youtube_title": "🎥 関連映像: 『ラストノートしか知らない』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "サークルウォークの夜景を見つめた者",
        "tags": [
            "ラストノートしか知らない"
        ],
        "address": "神奈川県横浜市中区新港1-5",
        "description": "『ラストノートしか知らない』MVの夜のドレス・ダンスシーン周辺、洗練された横浜港の夜景が広がる中央広場と歩道橋。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-tomigaya-footbridge",
        "name": "富ヶ谷歩道橋",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6678,
        "longitude": 139.6885,
        "event_date": "2023-11-29",
        "youtube_title": "🎥 関連映像: 『ラストノートしか知らない』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "山手通りを見下ろした者",
        "tags": [
            "ラストノートしか知らない"
        ],
        "address": "東京都渋谷区富ヶ谷1-38",
        "description": "『ラストノートしか知らない』MVで車のライトの光流や夜の都市美が印象的な富ヶ谷交差点の歩道橋。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-saigo-bridge",
        "name": "西郷橋",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6492,
        "longitude": 139.6975,
        "event_date": "2023-11-29",
        "youtube_title": "🎥 関連映像: 『ラストノートしか知らない』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "代官山の切なきアーチ橋",
        "tags": [
            "ラストノートしか知らない"
        ],
        "address": "東京都渋谷区鉢山町",
        "description": "『ラストノートしか知らない』MVで印象的なヨーロッパ風クラシカルな西郷山公園横のアーチ橋。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-jre-aoyama-crystal-bldg",
        "name": "JRE青山クリスタルビル前",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6625,
        "longitude": 139.7118,
        "event_date": "2023-11-29",
        "youtube_title": "🎥 関連映像: 『ラストノートしか知らない』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "表参道のガラス壁に映る影",
        "tags": [
            "ラストノートしか知らない"
        ],
        "address": "東京都港区南青山5-1-25",
        "description": "『ラストノートしか知らない』MVのモダンなビル壁面・都市の光が反射する表参道エリアのスポット。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-nakagawa-minnano-hiroba",
        "name": "中川駅前みんなの広場",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.563,
        "longitude": 139.578,
        "event_date": "2023-11-29",
        "youtube_title": "🎥 関連映像: 『ラストノートしか知らない』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "中川の広場で光を求めた者",
        "tags": [
            "ラストノートしか知らない"
        ],
        "address": "神奈川県横浜市都筑区中川1-1-1",
        "description": "『ラストノートしか知らない』MVの開放的な広場・コミュニティスペースで撮影されたロケーション。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-nakagawa-footbridge",
        "name": "中川駅歩道橋",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.5635,
        "longitude": 139.5785,
        "event_date": "2023-11-29",
        "youtube_title": "🎥 関連映像: 『ラストノートしか知らない』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "歩道橋の上で風に揺れた者",
        "tags": [
            "ラストノートしか知らない"
        ],
        "address": "神奈川県横浜市都筑区中川1",
        "description": "『ラストノートしか知らない』MVの歩道橋シーンで使われた港北ニュータウンの穏やかな歩道橋。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-bar-gossip",
        "name": "BAR GOSSIP",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.663,
        "longitude": 139.7315,
        "event_date": "2023-11-29",
        "youtube_title": "🎥 関連映像: 『ラストノートしか知らない』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "ゴシップバーの暗がりに佇む者",
        "tags": [
            "ラストノートしか知らない"
        ],
        "address": "東京都港区六本木7-17-14",
        "description": "『ラストノートしか知らない』MVのラグジュアリーなバーカウンター・大人っぽいドラマカットが撮影された六本木のバー。\n\n⚠️ 注意：バー店舗です。営業中の撮影は必ずスタッフの許可を得てください。",
        "visitor_notes": "バー店舗です。営業中の撮影は必ずスタッフの許可を得てください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-boogie-cafe",
        "name": "Boogie Cafe",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.4248,
        "longitude": 139.658,
        "event_date": "2023-11-29",
        "youtube_title": "🎥 関連映像: 『ラストノートしか知らない』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "本牧アメリカンの風を感じた者",
        "tags": [
            "ラストノートしか知らない"
        ],
        "address": "神奈川県横浜市中区本牧間門19-28",
        "description": "『ラストノートしか知らない』MVのアメリカンヴィンテージなダイナー・カフェシーンが撮影された本牧の名店。\n\n⚠️ 注意：カフェ店舗です。ご利用のうえ店内撮影はスタッフにお尋ねください。",
        "visitor_notes": "カフェ店舗です。ご利用のうえ店内撮影はスタッフにお尋ねください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-ashikaga-scramble-studio",
        "name": "足利スクランブルシティスタジオ",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 36.335,
        "longitude": 139.423,
        "event_date": "2024-03-06",
        "youtube_title": "🎥 関連映像: 『呪って呪って』公式MV",
        "youtube_url": "https://www.youtube.com/embed/6iW_iO7W7pA",
        "youtubeId": "6iW_iO7W7pA",
        "reward_title": "渋谷スクランブルの幻影を歩く者",
        "tags": [
            "呪って呪って"
        ],
        "address": "栃木県足利市五十部町284-5",
        "description": "野口衣織センター曲『呪って呪って』MVのダークかつ圧倒的な渋谷スクランブル交差点再現セットで撮影された映画ロケ用大型オープンセット。\n\n⚠️ 注意：撮影用オープンセット（私有地）につき関係者以外の無断進入厳禁。",
        "visitor_notes": "撮影用オープンセット（私有地）につき関係者以外の無断進入厳禁。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-6iW_iO7W7pA"
    },
    {
        "id": "spot-real-myojinyu",
        "name": "明神湯",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.5898,
        "longitude": 139.6958,
        "event_date": "2024-03-06",
        "youtube_title": "🎥 関連映像: 『呪って呪って』公式MV",
        "youtube_url": "https://www.youtube.com/embed/6iW_iO7W7pA",
        "youtubeId": "6iW_iO7W7pA",
        "reward_title": "レトロ銭湯の湯気に佇む者",
        "tags": [
            "呪って呪って"
        ],
        "address": "東京都大田区南雪谷5-14-13",
        "description": "『呪って呪って』MVのレトロで風情漂う銭湯カットで登場する歴史ある宮造りの伝統銭湯。\n\n⚠️ 注意：営業中の銭湯です。入浴利用のうえ他のお客様の迷惑となる撮影はご遠慮ください。",
        "visitor_notes": "営業中の銭湯です。入浴利用のうえ他のお客様の迷惑となる撮影はご遠慮ください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-6iW_iO7W7pA"
    },
    {
        "id": "spot-real-tokyo-budokan",
        "name": "東京武道館",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.766,
        "longitude": 139.827,
        "event_date": "2024-03-06",
        "youtube_title": "🎥 関連映像: 『呪って呪って』公式MV",
        "youtube_url": "https://www.youtube.com/embed/6iW_iO7W7pA",
        "youtubeId": "6iW_iO7W7pA",
        "reward_title": "菱形幾何学の回廊に立つ者",
        "tags": [
            "呪って呪って"
        ],
        "address": "東京都足立区綾瀬3-20-1",
        "description": "『呪って呪って』MVの前衛的・幾何学的な建築外観や大広間で撮影された綾瀬の武道館施設。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-6iW_iO7W7pA"
    },
    {
        "id": "spot-real-konno-hachimangu",
        "name": "金王八幡宮",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6575,
        "longitude": 139.7058,
        "event_date": "2024-03-06",
        "youtube_title": "🎥 関連映像: 『呪って呪って』公式MV",
        "youtube_url": "https://www.youtube.com/embed/6iW_iO7W7pA",
        "youtubeId": "6iW_iO7W7pA",
        "reward_title": "渋谷の鎮守に祈りを捧げた者",
        "tags": [
            "呪って呪って"
        ],
        "address": "東京都渋谷区渋谷3-5-12",
        "description": "『呪って呪って』MVの境内・鳥居・厳かな和の雰囲気カットが撮影された渋谷最古の歴史ある神社。参拝マナーを守ってお参りしてください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-6iW_iO7W7pA"
    },
    {
        "id": "spot-real-yoyogi-noh-stage",
        "name": "代々木能舞台",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 35.6815,
        "longitude": 139.689,
        "event_date": "2024-03-06",
        "youtube_title": "🎥 関連映像: 『呪って呪って』公式MV",
        "youtube_url": "https://www.youtube.com/embed/6iW_iO7W7pA",
        "youtubeId": "6iW_iO7W7pA",
        "reward_title": "能舞台の幽玄を垣間見た者",
        "tags": [
            "呪って呪って"
        ],
        "address": "東京都渋谷区代々木4-36-12",
        "description": "『呪って呪って』MVの和の伝統・能舞台シーンで登場する歴史的建築。\n\n⚠️ 注意：伝統芸能施設につき無断進入厳禁。",
        "visitor_notes": "伝統芸能施設につき無断進入厳禁。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-6iW_iO7W7pA"
    },
    {
        "id": "spot-real-florist-fujimi",
        "name": "フローリスト富士美",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.7125,
        "longitude": 139.7042,
        "event_date": "2024-03-06",
        "youtube_title": "🎥 関連映像: 『呪って呪って』公式MV",
        "youtube_url": "https://www.youtube.com/embed/6iW_iO7W7pA",
        "youtubeId": "6iW_iO7W7pA",
        "reward_title": "呪いの花束を抱く者",
        "tags": [
            "呪って呪って"
        ],
        "address": "東京都新宿区高田馬場",
        "description": "『呪って呪って』MVの花屋・赤い花束シーンで使われた高田馬場の生花店。\n\n⚠️ 注意：営業中の生花店です。お買い物・店内確認のうえマナーを守ってください。",
        "visitor_notes": "営業中の生花店です。お買い物・店内確認のうえマナーを守ってください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-6iW_iO7W7pA"
    },
    {
        "id": "spot-real-yotsukaido-culture-center",
        "name": "四街道市文化センター 大ホール",
        "group": "=LOVE",
        "category": "ライブ会場",
        "latitude": 35.666,
        "longitude": 140.165,
        "event_date": "2024-07-31",
        "youtube_title": "🎥 関連映像: 『誰にもバレずに』公式MV",
        "youtube_url": "https://www.youtube.com/embed/4yW4m_S_7wY",
        "youtubeId": "4yW4m_S_7wY",
        "reward_title": "静寂のホールのオーディエンス",
        "tags": [
            "誰にもバレずに"
        ],
        "address": "千葉県四街道市大日397",
        "description": "佐々木舞香センター曲『誰にもバレずに』MVの重厚なホールステージ・照明・客席パフォーマンスシーンが撮影されたホール施設。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "work-4yW4m_S_7wY"
    },
    {
        "id": "spot-real-royal-chester-maebashi",
        "name": "ロイヤルチェスター前橋",
        "group": "=LOVE",
        "category": "MVロケ地",
        "latitude": 36.398,
        "longitude": 139.052,
        "event_date": "2024-07-31",
        "youtube_title": "🎥 関連映像: 『Queens』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "宮殿の女王となった者",
        "tags": [
            "Queens"
        ],
        "address": "群馬県前橋市大友町1-2-11",
        "description": "『Queens』MVの豪華絢爛なヨーロッパ風宮殿・回廊・シャンデリアのカットが撮影された美しい婚礼・パーティ施設。\n\n⚠️ 注意：婚礼・宴会施設のため無断立ち入りはご遠慮ください。",
        "visitor_notes": "婚礼・宴会施設のため無断立ち入りはご遠慮ください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/",
        "coordinateAccuracy": "exact",
        "workKey": "queens"
    },
    {
        "id": "spot-real-okutama-field-school",
        "name": "奥多摩フィールド（旧小河内小学校）",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.789,
        "longitude": 139.015,
        "event_date": "2021-04-07",
        "youtube_title": "🎥 関連映像: 『自分賛歌』公式MV",
        "youtube_url": "https://www.youtube.com/embed/g2qM40T0F2Y",
        "youtubeId": "g2qM40T0F2Y",
        "reward_title": "奥多摩の空に賛歌を響かせた者",
        "tags": [
            "自分賛歌"
        ],
        "address": "東京都西多摩郡奥多摩町原",
        "description": "≠ME『自分賛歌』MVの緑豊かな校庭・グラウンドや木造校舎で撮影された奥多摩のロケ地。\n\n⚠️ 注意：閉校活用施設（私有地）につき許可なく入構しないでください。",
        "visitor_notes": "閉校活用施設（私有地）につき許可なく入構しないでください。",
        "primarySourceUrl": "https://ameblo.jp/nix52/entry-12668751619.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-g2qM40T0F2Y"
    },
    {
        "id": "spot-real-meisei-univ-ome",
        "name": "明星大学 青梅校",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.772,
        "longitude": 139.278,
        "event_date": "2022-08-03",
        "youtube_title": "🎥 関連映像: 『す、好きじゃない！』公式MV",
        "youtube_url": "https://www.youtube.com/embed/G6jWn6_n4jU",
        "youtubeId": "G6jWn6_n4jU",
        "reward_title": "学園の告白を目撃した者",
        "tags": [
            "す、好きじゃない！"
        ],
        "address": "東京都青梅市長淵2-590",
        "description": "≠ME『す、好きじゃない！』MVのアニメコメディ風学園ドラマや大階段シーンが撮影されたキャンパス施設。\n\n⚠️ 注意：大学施設につき無断入構は禁止されています。",
        "visitor_notes": "大学施設につき無断入構は禁止されています。",
        "primarySourceUrl": "https://blog.livedoor.jp/fumichen2/archives/56787153.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-G6jWn6_n4jU"
    },
    {
        "id": "spot-real-kyu-ashikaga-girls-hs",
        "name": "旧栃木県立足利女子高等学校",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 36.338,
        "longitude": 139.448,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『君の音だったんだ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/R28z0qBqO_k",
        "youtubeId": "R28z0qBqO_k",
        "reward_title": "君の音を聴いた者",
        "tags": [
            "君の音だったんだ"
        ],
        "address": "栃木県足利市本城3-2120",
        "description": "≠ME『君の音だったんだ』MVの吹奏楽部・校舎・音楽室の青春グラフィティが撮影された伝統校舎。\n\n⚠️ 注意：統合閉校した旧校舎施設です。無断進入は厳禁です。",
        "visitor_notes": "統合閉校した旧校舎施設です。無断進入は厳禁です。",
        "primarySourceUrl": "https://x.com/sznk_/status/2083469319816823019",
        "coordinateAccuracy": "exact",
        "workKey": "work-R28z0qBqO_k"
    },
    {
        "id": "spot-real-ashikaga-gas-ground",
        "name": "足利ガスグラウンド",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 36.345,
        "longitude": 139.462,
        "event_date": "2019-10-30",
        "youtube_title": "🎥 関連映像: 『君の音だったんだ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/R28z0qBqO_k",
        "youtubeId": "R28z0qBqO_k",
        "reward_title": "グラウンドのスタンドで佇む者",
        "tags": [
            "君の音だったんだ"
        ],
        "address": "栃木県足利市大豆生田町",
        "description": "≠ME『君の音だったんだ』MVの屋外野球場・スタンドダンスシーンが撮影されたスポーツ施設。",
        "primarySourceUrl": "https://x.com/sznk_/status/2083469319816823019",
        "coordinateAccuracy": "exact",
        "workKey": "work-R28z0qBqO_k"
    },
    {
        "id": "spot-real-kamimeguro-hikawa-shrine",
        "name": "上目黒氷川神社",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.6515,
        "longitude": 139.6895,
        "event_date": "2023-04-12",
        "youtube_title": "🎥 関連映像: 『君を見かけた』公式MV",
        "youtube_url": "https://www.youtube.com/embed/kIm4dcF6XDY",
        "youtubeId": "kIm4dcF6XDY",
        "reward_title": "階段の参道で君を見かけた者",
        "tags": [
            "君を見かけた"
        ],
        "address": "東京都目黒区大橋2-16-21",
        "description": "≠ME『君を見かけた』MVの長い石段・鳥居・神社参道でメンバーが擦れ違う切ないロケーション。参拝マナーを守ってご訪問ください。",
        "primarySourceUrl": "https://ameblo.jp/hayabusa1043/entry-12924543312.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-kIm4dcF6XDY"
    },
    {
        "id": "spot-real-royal-crest-house-record",
        "name": "ロイヤルクレストハウス（閉業情報あり）",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.908,
        "longitude": 139.608,
        "event_date": "2021-11-10",
        "youtube_title": "🎥 関連映像: 『モブノデレラ』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "モブノデレラの舞踏会",
        "tags": [
            "モブノデレラ"
        ],
        "address": "埼玉県さいたま市大宮区三橋",
        "description": "≠ME『モブノデレラ』MVのシックな洋館・螺旋階段・ドレスシーンで撮影された施設。\n\n⚠️ 注意：閉業した施設です。記録用聖地として掲載しています。無断立ち入り厳禁。",
        "visitor_notes": "閉業した施設です。記録用聖地として掲載しています。無断立ち入り厳禁。",
        "primarySourceUrl": "https://x.com/hoshi_hokuto/status/1910794518296944814",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-ariake-kyoiku-junior-college",
        "name": "有明教育芸術短期大学",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.6315,
        "longitude": 139.7925,
        "event_date": "2022-11-23",
        "youtube_title": "🎥 関連映像: 『神様の言うとーり！』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "神様の教卓の前に立つ者",
        "tags": [
            "神様の言うとーり！"
        ],
        "address": "東京都江東区有明3-9-25",
        "description": "≠ME『神様の言うとーり！』MVのモダンな講義室や学内ロケーション。\n\n⚠️ 注意：学校施設につき関係者以外の無断入構は禁止されています。",
        "visitor_notes": "学校施設につき関係者以外の無断入構は禁止されています。",
        "primarySourceUrl": "https://ameblo.jp/tanmen2021/entry-12891358050.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-ariake-shinsui-kaihin-park",
        "name": "有明親水海浜公園",
        "group": "≠ME",
        "category": "MVロケ地",
        "latitude": 35.634,
        "longitude": 139.789,
        "event_date": "2022-11-23",
        "youtube_title": "🎥 関連映像: 『神様の言うとーり！』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "有明の海風を浴びた者",
        "tags": [
            "神様の言うとーり！"
        ],
        "address": "東京都江東区有明2-1",
        "description": "≠ME『神様の言うとーり！』MVの湾岸プロムナード・海辺の公園シーン。",
        "primarySourceUrl": "https://equallove-2017.blog.jp/archives/38202911.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-coffee-seibu-honten",
        "name": "珈琲西武本店",
        "group": "≠ME",
        "category": "飲食店・その他",
        "latitude": 35.6948,
        "longitude": 139.7025,
        "event_date": "2023-04-12",
        "youtube_title": "🎥 関連映像: 『カフェ樂園』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "ステンドグラスの純喫茶で憩う者",
        "tags": [
            "カフェ樂園"
        ],
        "address": "東京都新宿区歌舞伎町1-6-12",
        "description": "≠ME『カフェ樂園』MVの豪華なステンドグラスと赤ソファが広がる昭和レトロな名純喫茶。\n\n⚠️ 注意：通常営業の喫茶店です。店舗利用のうえ他のお客様へのご配慮をお願いします。",
        "visitor_notes": "通常営業の喫茶店です。店舗利用のうえ他のお客様へのご配慮をお願いします。",
        "primarySourceUrl": "https://ameblo.jp/tanmen2021/entry-12896953250.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-wayo-kokubun-campus",
        "name": "和洋学園 国分キャンパス（旧校舎）",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.741,
        "longitude": 139.905,
        "event_date": "2023-09-06",
        "youtube_title": "🎥 関連映像: 『きっと、青い』公式MV",
        "youtube_url": "https://www.youtube.com/embed/gQ81Vl0OBlQ",
        "youtubeId": "gQ81Vl0OBlQ",
        "reward_title": "青い春の校庭を奔る者",
        "tags": [
            "きっと、青い"
        ],
        "address": "千葉県市川市国分4-20-1",
        "description": "≒JOY『きっと、青い』MVの爽やかな校舎・グラウンド・廊下で撮影されたロケーション。\n\n⚠️ 注意：学園施設につき敷地内への無断立ち入りは禁止されています。",
        "visitor_notes": "学園施設につき敷地内への無断立ち入りは禁止されています。",
        "primarySourceUrl": "https://ameblo.jp/tanmen2021/entry-12832272052.html",
        "coordinateAccuracy": "exact",
        "workKey": "kitto-aoi"
    },
    {
        "id": "spot-real-anea-cafe-matsumizaka",
        "name": "ANEA CAFE 松見坂",
        "group": "≒JOY",
        "category": "飲食店・その他",
        "latitude": 35.6558,
        "longitude": 139.6872,
        "event_date": "2024-06-12",
        "youtube_title": "🎥 関連映像: 『だだだ、だって。』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "松見坂のカフェで恋を知る者",
        "tags": [
            "だだだ、だって。"
        ],
        "address": "東京都目黒区駒場1-16-7",
        "description": "≒JOY『だだだ、だって。』MVのオシャレなドラマ・カフェシーンで登場する有名カフェ。\n\n⚠️ 注意：通常営業のカフェです。ご来店のうえ撮影マナーをお守りください。",
        "visitor_notes": "通常営業のカフェです。ご来店のうえ撮影マナーをお守りください。",
        "primarySourceUrl": "https://prtimes.jp/main/html/rd/p/000004367.000013546.html",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-r-for-d",
        "name": "R for D",
        "group": "≒JOY",
        "category": "聖地店舗",
        "latitude": 35.6562,
        "longitude": 139.688,
        "event_date": "2024-06-12",
        "youtube_title": "🎥 関連映像: 『だだだ、だって。』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "セレクトショップの目撃者",
        "tags": [
            "だだだ、だって。"
        ],
        "address": "東京都目黒区神林1-2-5",
        "description": "≒JOY『だだだ、だって。』MVのファッションセレクトショップロケーション。\n\n⚠️ 注意：営業中のアパレル店舗です。営業ルールを守ってご利用ください。",
        "visitor_notes": "営業中のアパレル店舗です。営業ルールを守ってご利用ください。",
        "primarySourceUrl": "https://x.com/hoshi_hokuto/status/1850086374940213414",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-yoyogi-park-keyaki-street",
        "name": "代々木公園 ケヤキ並木",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.6685,
        "longitude": 139.6965,
        "event_date": "2024-06-12",
        "youtube_title": "🎥 関連映像: 『だだだ、だって。』公式MV",
        "youtube_url": "https://www.youtube.com/embed/5F_3l4n2k8Y",
        "youtubeId": "5F_3l4n2k8Y",
        "reward_title": "ケヤキ並木を歩んだ者",
        "tags": [
            "だだだ、だって。"
        ],
        "address": "東京都渋谷区代々木神園町2-1",
        "description": "≒JOY『だだだ、だって。』MVでメンバーが楽しそうに歩く緑豊かな代々木公園ケヤキ並木通り。",
        "primarySourceUrl": "https://www.muse.ac.jp/news/yoyogipark-mv/",
        "coordinateAccuracy": "exact",
        "workKey": "work-5F_3l4n2k8Y"
    },
    {
        "id": "spot-real-space-odd",
        "name": "SPACE ODD",
        "group": "≒JOY",
        "category": "ライブ会場",
        "latitude": 35.6518,
        "longitude": 139.7022,
        "event_date": "2024-10-16",
        "youtube_title": "🎥 関連映像: 『The rock is you!』公式MV",
        "youtube_url": "https://www.youtube.com/embed/kDgadIAsQf4",
        "youtubeId": "kDgadIAsQf4",
        "reward_title": "ロックの熱量を鳴らした者",
        "tags": [
            "The rock is you!"
        ],
        "address": "東京都渋谷区猿楽町2-11",
        "description": "≒JOY『The rock is you!』MVの重厚でロックなライブハウスパフォーマンスシーンが撮影された渋谷・代官山エリアのライブ会場。",
        "primarySourceUrl": "https://ameblo.jp/tanmen2021/entry-12956597424.html",
        "coordinateAccuracy": "exact",
        "workKey": "the-rock-is-you"
    },
    {
        "id": "spot-real-urayasu-hinode-seawall",
        "name": "浦安海岸 日の出地区護岸",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.638,
        "longitude": 139.932,
        "event_date": "2024-10-16",
        "youtube_title": "🎥 関連映像: 『The rock is you!』公式MV",
        "youtube_url": "https://www.youtube.com/embed/kDgadIAsQf4",
        "youtubeId": "kDgadIAsQf4",
        "reward_title": "日の出護岸の空と海",
        "tags": [
            "The rock is you!"
        ],
        "address": "千葉県浦安市日の出",
        "description": "≒JOY『The rock is you!』MVのオープンで解放感溢れる浦安海岸の護岸・水平線ロケーション。",
        "primarySourceUrl": "https://ameblo.jp/tanmen2021/entry-12956597424.html",
        "coordinateAccuracy": "exact",
        "workKey": "the-rock-is-you"
    },
    {
        "id": "spot-real-yoyogi-oyama-park",
        "name": "代々木大山公園",
        "group": "≒JOY",
        "category": "MVロケ地",
        "latitude": 35.674,
        "longitude": 139.6805,
        "event_date": "2024-10-16",
        "youtube_title": "🎥 関連映像: 『The rock is you!』公式MV",
        "youtube_url": "https://www.youtube.com/embed/kDgadIAsQf4",
        "youtubeId": "kDgadIAsQf4",
        "reward_title": "大山公園のプレイグラウンド",
        "tags": [
            "The rock is you!"
        ],
        "address": "東京都渋谷区大山町35-22",
        "description": "≒JOY『The rock is you!』MVでジャングルジムなどのアトラクションや広場でメンバーが笑顔を咲かせる公園。",
        "primarySourceUrl": "https://ameblo.jp/tanmen2021/entry-12956597424.html",
        "coordinateAccuracy": "exact",
        "workKey": "the-rock-is-you"
    },
    {
        "id": "spot-real-white-atelier-converse-harajuku",
        "name": "White atelier BY CONVERSE 原宿店",
        "group": "=LOVE",
        "category": "聖地店舗",
        "latitude": 35.665427,
        "longitude": 139.703832,
        "event_date": "2026-08-30",
        "youtube_title": "🎥 関連映像: 『齋藤樹愛羅presents 東京プレミアムツアー』公式YouTube EDIT",
        "youtube_url": "https://www.youtube.com/embed/6TDaGcSbm9M",
        "youtubeId": "6TDaGcSbm9M",
        "reward_title": "世界に一つのスニーカーの贈主",
        "tags": [
            "YouTube企画",
            "特典映像",
            "齋藤樹愛羅presents 東京プレミアムツアー"
        ],
        "address": "〒150-0001 東京都渋谷区神宮前6-16-5 HOLON-Ⅲ",
        "description": "『齋藤樹愛羅presents 東京プレミアムツアー』で、齋藤樹愛羅が諸橋沙夏と音嶋莉沙へ、世界に一つだけのスニーカーをサプライズプレゼントした場所です。\n\nWhite atelier BY CONVERSEは、「Design Yourself」をテーマに、自分だけのオリジナルスニーカーを作ることができるコンバースのコンセプトショップ。店舗限定のオールホワイトの「オールスター」をベースに、好きなデザインや文字をプリントし、シューレースやチャームなどを組み合わせてカスタマイズできます。\n\n映像では、樹愛羅が諸橋沙夏と音嶋莉沙のためにオリジナルスニーカーを用意。2人へ感謝の気持ちを込めたサプライズプレゼントを贈った、心温まる場面の舞台となりました。\n\n■ 営業時間：11:00～20:00（不定休）\n※営業時間は変更される場合があります。最新情報は公式サイトをご確認ください。\n公式サイト: https://converse.co.jp/pages/shop-white-atelier-by-converse-harajuku",
        "visitor_notes": "カスタマイズサービスの内容、料金、受付方法、完成までの時間は変更される場合があります。制作を希望する場合は、来店前に公式サイトで最新情報を確認してください。営業中の店舗のため、一般のお客様やスタッフが写り込む撮影、通路を塞ぐ行為、長時間の撮影は控えてください。",
        "primarySourceUrl": "https://converse.co.jp/pages/shop-white-atelier-by-converse-harajuku",
        "coordinateAccuracy": "exact",
        "workKey": "presents"
    },
    {
        "id": "spot-real-shibuya-bowling-est",
        "name": "シブヤボウリング",
        "group": "=LOVE",
        "category": "飲食店・その他",
        "latitude": 35.660093,
        "longitude": 139.702812,
        "event_date": "2026-08-30",
        "youtube_title": "🎥 関連映像: 『齋藤樹愛羅presents 東京プレミアムツアー』公式YouTube EDIT",
        "youtube_url": "https://www.youtube.com/embed/6TDaGcSbm9M",
        "youtubeId": "6TDaGcSbm9M",
        "reward_title": "イコラブ最強ボウラーの目撃者",
        "tags": [
            "YouTube企画",
            "特典映像",
            "齋藤樹愛羅presents 東京プレミアムツアー"
        ],
        "address": "〒150-0002 東京都渋谷区渋谷1-14-14 EST渋谷東口会館",
        "description": "『齋藤樹愛羅presents 東京プレミアムツアー』で、「めざせ21！イコラブ最強ボウラー決定戦」が行われたボウリング場です。\n\nメンバーがボウリングの腕を競う企画が行われるなか、齋藤樹愛羅は“リアルドッキリ”を仕掛けようとします。しかし、企画は思惑どおりに進まず、ドッキリは失敗する結果に。樹愛羅らしい予測不能な展開と、メンバー同士のにぎやかなやり取りが楽しめる場面の舞台となりました。\n\nシブヤボウリングは、渋谷駅宮益坂口から徒歩約1分、地下鉄渋谷駅B3出口を出てすぐのEST渋谷東口会館内にあるボウリング場です。複数のフロアに、それぞれ雰囲気の異なるボウリングレーンが設けられています。\n\n■ 営業時間：11:00～翌5:00（最終受付 翌4:30）\n※営業時間は変更される可能性があるため、最新情報は公式サイトで確認してください。\n公式サイト: https://www.shibuyaest.co.jp/bowling/",
        "visitor_notes": "映像と同じフロアやレーンを利用できるとは限りません。一般のお客様が多い施設のため、人物の無断撮影、プレーをせずにレーン付近へ立ち入る行為、長時間の場所の占有は控えてください。貸切営業や営業時間の変更が行われる可能性があるため、訪問前に公式サイトを確認してください。",
        "primarySourceUrl": "https://www.shibuyaest.co.jp/bowling/",
        "coordinateAccuracy": "exact",
        "workKey": "presents"
    }
];









// 初期ユーザー（デフォルト）
const DEFAULT_USER: User = {
  id: "user-default-ikonoijoy",
  username: "イコノイジョイ探検隊",
  oshi_group: "合同",
  titles: [],
  acquired_titles: []
};

// データベースの初期化と取得
export const db = {
  // Spots操作
  getSpots(): Spot[] {
    const fillDefaults = (items: Spot[]): Spot[] => {
      return items.map(item => ({
        ...item,
        slug: item.slug || item.id.replace(/^(spot-real-|spot-special-)/, ''),
        status: item.status || 'published',
        address: item.address || '',
        nearest_station: item.nearest_station || '',
        walk_time: item.walk_time || '',
        scene: item.scene || '',
        check_points: item.check_points || [],
        visitor_notes: item.visitor_notes || '',
        last_confirmed_date: item.last_confirmed_date || '2026-06-29',
        images: item.images || [],
        twitter_url: item.twitter_url || '',
        verification_status: item.verification_status || '',
        holy_point: item.holy_point || '',
        coordinateAccuracy: item.coordinateAccuracy || 'exact',
        accuracyReason: item.accuracyReason || ''
      }));
    };

    const data = localStorage.getItem('tdm_spots');
    if (!data) {
      const filled = fillDefaults(INITIAL_SPOTS);
      this.setSpots(filled);
      return filled;
    }
    // データのプロパティ（説明文や座標など）に何かしらの変更があれば確実に最新化する完全同期
    try {
      const parsed = JSON.parse(data) as Spot[];
      
      // parsedデータとINITIAL_SPOTSの並び順などを考慮し、ID順にソートした上でシリアライズして比較
      const sortedInitial = [...INITIAL_SPOTS].sort((a, b) => a.id.localeCompare(b.id));
      const sortedParsed = [...parsed].sort((a, b) => a.id.localeCompare(b.id));
      
      if (
        sortedInitial.length !== sortedParsed.length ||
        sortedInitial.some((val, i) => {
          const parsedVal = sortedParsed[i];
          return (
            val.id !== parsedVal.id ||
            val.latitude !== parsedVal.latitude ||
            val.longitude !== parsedVal.longitude ||
            val.coordinateAccuracy !== parsedVal.coordinateAccuracy ||
            val.accuracyReason !== parsedVal.accuracyReason ||
            val.verification_status !== parsedVal.verification_status ||
            val.holy_point !== parsedVal.holy_point ||
            val.description !== parsedVal.description
          );
        })
      ) {
        const filled = fillDefaults(INITIAL_SPOTS);
        this.setSpots(filled);
        return filled;
      }
      return fillDefaults(parsed);
    } catch (e) {
      const filled = fillDefaults(INITIAL_SPOTS);
      this.setSpots(filled);
      return filled;
    }
  },

  setSpots(spots: Spot[]): void {
    localStorage.setItem('tdm_spots', JSON.stringify(spots));
  },

  // Users操作
  getCurrentUser(): User {
    const data = localStorage.getItem('tdm_user');
    if (!data) {
      this.setCurrentUser(DEFAULT_USER);
      return DEFAULT_USER;
    }
    try {
      const parsed = JSON.parse(data) as User;
      if (!parsed.titles) {
        parsed.titles = [];
      }
      if (!parsed.acquired_titles) {
        parsed.acquired_titles = [];
      }
      return parsed;
    } catch (e) {
      return DEFAULT_USER;
    }
  },

  setCurrentUser(user: User): void {
    localStorage.setItem('tdm_user', JSON.stringify(user));
  },

  updateCurrentUser(username: string, oshiGroup: GroupType): User {
    const user = this.getCurrentUser();
    user.username = username;
    user.oshi_group = oshiGroup;
    if (!user.titles) {
      user.titles = [];
    }
    this.setCurrentUser(user);
    return user;
  },

  // 全ユーザーのRAWデータを取得する（内部用）
  getAllCheckInsRaw(): CheckIn[] {
    const data = localStorage.getItem('tdm_checkins');
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  // CheckIns操作 (現在ログインしているユーザーのチェックインのみ取得)
  getCheckIns(userId?: string): CheckIn[] {
    const all = this.getAllCheckInsRaw();
    const targetId = userId || this.getCurrentUser().id;
    // ゲスト（未ログイン）の時は巡礼記録を空にするという仕様に基づき、[] を返却
    if (!targetId || targetId === 'guest') return [];
    return all.filter(c => c.user_id === targetId);
  },

  addCheckIn(spotId: string, isManual?: boolean): CheckIn {
    const allCheckins = this.getAllCheckInsRaw();
    const user = this.getCurrentUser();
    const newCheckIn: CheckIn = {
      id: generateUUID(),
      user_id: user.id,
      spot_id: spotId,
      visited_at: new Date().toISOString(),
      is_manual: isManual
    };
    allCheckins.push(newCheckIn);
    localStorage.setItem('tdm_checkins', JSON.stringify(allCheckins));
    return newCheckIn;
  },

  removeCheckIn(spotId: string): void {
    const allCheckins = this.getAllCheckInsRaw();
    const user = this.getCurrentUser();
    // 現在のユーザーかつ指定のスポットIDに一致するチェックインのみを削除
    const filtered = allCheckins.filter(c => !(c.spot_id === spotId && c.user_id === user.id));
    localStorage.setItem('tdm_checkins', JSON.stringify(filtered));
  },

  resetAll(): void {
    localStorage.removeItem('tdm_spots');
    localStorage.removeItem('tdm_user');
    localStorage.removeItem('tdm_checkins');
  },

  // 🏟️ 国立競技場寄せ書きメッセージ操作
  async getStadiumMessages(): Promise<StadiumMessage[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('national_stadium_messages')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data as StadiumMessage[];
        }
        console.error('Failed to fetch messages from Supabase:', error);
      } catch (err) {
        console.error('Error fetching messages from Supabase:', err);
      }
    }
    
    // ローカルストレージフォールバック
    const local = localStorage.getItem('tdm_stadium_messages');
    if (!local) return [];
    try {
      return JSON.parse(local) as StadiumMessage[];
    } catch (e) {
      return [];
    }
  },

  async addStadiumMessage(name: string, message: string, color: string, deviceId: string): Promise<StadiumMessage> {
    // コンテンツモデレーション（サーバー/API側の検証）
    const validationError = validateStadiumMessage(message);
    if (validationError) {
      throw new Error(validationError);
    }

    const newMessage: StadiumMessage = {
      id: generateUUID(),
      name,
      message,
      color,
      device_id: deviceId,
      created_at: new Date().toISOString()
    };

    const afterLiveThreshold = new Date('2026-06-22T00:00:00+09:00').getTime();

    if (supabase) {
      try {
        // 重複チェック: device_id と color に一致する過去の投稿を取得
        const { data: existing, error: fetchError } = await supabase
          .from('national_stadium_messages')
          .select('created_at')
          .eq('device_id', deviceId)
          .eq('color', color);

        if (!fetchError && existing && existing.length > 0) {
          // 2026年6月22日 0:00 以降の投稿が既にあればブロック
          const hasAlreadyPostedAfterLive = existing.some(m => 
            new Date(m.created_at).getTime() >= afterLiveThreshold
          );
          if (hasAlreadyPostedAfterLive) {
            throw new Error('このメンバーへは既にメッセージを投稿済みです。');
          }
        }

        const { data, error } = await supabase
          .from('national_stadium_messages')
          .insert([newMessage])
          .select();
        if (!error && data && data[0]) {
          localStorage.setItem(`is_message_posted_after_live_${color}`, 'true');
          return data[0] as StadiumMessage;
        }
        console.error('Failed to insert message to Supabase, falling back to local:', error);
      } catch (err) {
        console.error('Error inserting message to Supabase:', err);
      }
    }

    // ローカルストレージフォールバック
    const local = localStorage.getItem('tdm_stadium_messages');
    let messages: StadiumMessage[] = [];
    if (local) {
      try {
        messages = JSON.parse(local);
      } catch (e) {}
    }

    // ローカル側でも一意制約の検証を行う (ライブ後 [2026-06-22 0:00] 以降の投稿が既に存在すれば重複とみなす)
    const hasAlreadyPostedAfterLive = messages.some(m => 
      m.device_id === deviceId && 
      m.color === color && 
      new Date(m.created_at).getTime() >= afterLiveThreshold
    );
    if (hasAlreadyPostedAfterLive) {
      throw new Error('このメンバーへは既にメッセージを投稿済みです。');
    }

    messages.unshift(newMessage);
    localStorage.setItem('tdm_stadium_messages', JSON.stringify(messages));
    localStorage.setItem(`is_message_posted_after_live_${color}`, 'true');
    return newMessage;
  }
};
