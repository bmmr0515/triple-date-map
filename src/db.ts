export interface Spot {
  id: string;
  name: string;
  group: "=LOVE" | "≠ME" | "≒JOY" | "合同";
  category: "MVロケ地" | "ライブ会場" | "聖地店舗" | "飲食店・その他";
  description: string;
  latitude: number;
  longitude: number;
  event_date: string;
  youtube_title?: string;
  youtube_url?: string;
  tags?: string[];
  reward_title?: string;
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
    id: "spot-real-yoyogi-ani",
    name: "代々木アニメーション学院 東京校",
    group: "合同",
    category: "飲食店・その他",
    description: "イコノイジョイ全グループのオーディション、初期の合宿やレッスンの舞台となったすべての始まりの場所。指原莉乃プロデューサーとメンバーの絆が生まれた絶対的聖地。\n【⚠️注意】現役の専門学校です。学生の迷惑になるため、校舎内への無断立ち入りや出入り待ちなどの行為は絶対にやめましょう。外観を眺めるのみにしてください。",
    latitude: 35.7011,
    longitude: 139.7531,
    event_date: "2017-04-29",
    youtube_title: "🎥 関連映像: Documentary of =LOVE -Episode0-",
    youtube_url: "https://www.youtube.com/embed/zXR_xhihDOQ?si=4ram6tzvtxIfDN8t",
    reward_title: "すべての始まりの目撃者"
  },
  {
    id: "spot-real-tsunoshima",
    name: "角島大橋（山口県）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "休養から復帰した髙松瞳をセンターに据えた、王道アイドルソング of 最高峰『青春”サブリミナル”』のロケ地。エメラルドグリーンの海と青空の下、この美しい橋を駆け抜けるシーンはまさに「青春」そのもの。山口県という遠方のため巡礼ハードルは高いが、景色を見た瞬間にイントロが脳内再生される、イコラブオタクなら一生に一度は訪れたい約束の地。",
    latitude: 34.3512,
    longitude: 130.8876,
    event_date: "2020-11-25",
    youtube_title: "🎥 関連映像: 『青春”サブリミナル”』公式MV",
    youtube_url: "https://www.youtube.com/embed/8id6i_QeNJM?si=DummyForSeishun",
    reward_title: "青サビの約束を交わした者"
  },
  {
    id: "spot-real-futtsu-stadium",
    name: "富津臨海陸上競技場（千葉県）",
    group: "≠ME",
    category: "MVロケ地",
    description: "記念すべきノイミー最初のオリジナル曲『≠ME』のMV撮影地。青空の下、トラックでメンバーが全力で踊り、走り抜けるシーンは「泥臭い青春感」の原点。真夏に訪れれば、彼女たちの眩しい笑顔と青春のエネルギーがフラッシュバックすること間違いなし。\n【⚠️注意】公共のスポーツ施設です。大会や貸切利用時は一般の立ち入りやトラック内への入場が制限される場合があります。ルールを守って見学しましょう。",
    latitude: 35.3279,
    longitude: 139.8427,
    event_date: "2019-08-04",
    youtube_title: "🎥 関連映像: 『≠ME』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/wsKSUGDKRpQ?si=XLaiyg1-3lOZz8E9&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "ノイミー原点の走者"
  },
  {
    id: "spot-real-crystal-hotel",
    name: "湘南鎌倉クリスタルホテル",
    group: "≠ME",
    category: "MVロケ地",
    description: "≠ME 3rdシングル『チョコレートメランコリー』のロケ地。普段の爽やかなノイミーから一転、ゴシックでダークな世界観を見せつけた衝撃作。修道女風の衣装で踊った荘厳なチャペルや、狂気を感じさせるお茶会のシーンが撮影された。オタクたちの間で「推しにチョコで閉じ込められたい」という謎の願望を生み出した、美しくも恐ろしい狂気の館。",
    latitude: 35.3364,
    longitude: 139.4883,
    event_date: "2022-02-16",
    youtube_title: "🎥 関連映像: 『チョコレートメランコリー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/rDVWtyXTuoU?si=OZbZ4RXmt8FmurZ5&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "チョコメラの虜"
  },
  {
    id: "spot-real-enoshima-daiteibo",
    name: "江ノ島湘南大堤防（神奈川県藤沢市）",
    group: "≠ME",
    category: "MVロケ地",
    description: "『虹が架かる瞬間』の撮影地. メンバーがそれぞれの場所から集まり、海と夕焼けをバックに歌い踊るエモさ1000%のMV。オーディションからの軌跡を描いた歌詞と相まって、ファンの涙腺を崩壊させた聖地。\n【ℹ️見学情報】釣り人や観光客が多い公共エリアです。堤防の先端など足元の悪い場所もあるため安全に注意して巡礼してください。",
    latitude: 35.2982,
    longitude: 139.4827,
    event_date: "2021-04-07",
    youtube_title: "🎥 関連映像: 『虹が架かる瞬間』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/DJdpqIGp1XA?si=vVIRDkcvR98o4RI5&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "大堤防に架かる虹を見た者"
  },
  {
    id: "spot-real-budokan",
    name: "日本武道館",
    group: "=LOVE",
    category: "ライブ会場",
    description: "デビューから約3年半の月日を経て辿り着いた悲願の日本武道館公演「You all are \"My ideal\"」の会場。コロナ禍の困難を乗り越え、休養中のメンバーを待ち続け、ついに全員で立った夢のステージ。「次に会えた時は 何を話そうかな」という歌詞が現実に重なり、会場中のペンライトとオタクの涙が交差した、歴史に残る伝説の一夜。",
    latitude: 35.6933,
    longitude: 139.7500,
    event_date: "2021-01-16",
    youtube_title: "🎥 関連映像: 日本武道館ライブ『青春サブリミナル』",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/bCvjbkE3iMI?si=jLacLiU_RLFeKvaq&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "日本武道館の証言者"
  },
  {
    id: "spot-real-conifer",
    name: "富士急ハイランド コニファーフォレスト",
    group: "合同",
    category: "ライブ会場",
    description: "「イコノイフェス」や「イコノイジョイ」の舞台。夏の野外合同フェスといえば絶対にここ！大量 of 放水祭りでオタクもメンバーもずぶ濡れになりながら、グループの垣根を越えたバチバチのパフォーマンスと最高の笑顔が交差する。日が落ちてからのエモーショナルな演出と花火は、毎年の夏を締めくくる最高の思い出になる最強の聖地。\n【ℹ️見学情報】富士急ハイランド自体は入園無料ですが、コニファーフォレスト内部はイベント時以外は基本的に立ち入ることができません。遊園地のアトラクション等を楽しむ場合は別途料金が必要です。",
    latitude: 35.4869,
    longitude: 138.7806,
    event_date: "2021-10-09",
    youtube_title: "🎥 関連映像: イコノイジョイ合同曲『トリプルデート』",
    youtube_url: "https://www.youtube.com/embed/gkabNNfTjX4?si=TripleDateDummy",
    reward_title: "放水祭りのサバイバー"
  },
  {
    id: "spot-real-asaka-school",
    name: "旧福島県尋常中学校本館（安積歴史博物館）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "『探せ ダイヤモンドリリー』のロケ地。趣のあるレトロな木造校舎で、別れと旅立ちの切ない青春ストーリーが描かれたエモい聖地。\n【ℹ️見学情報】博物館として一般公開されており、入館料（大人300円等）を払えば内部の見学が可能です。館内での撮影ルール（動画NGなど）に従ってオタ活を楽しみましょう。",
    latitude: 37.3916,
    longitude: 140.3546,
    event_date: "2019-04-24",
    youtube_title: "🎥 関連映像: 『探せ ダイヤモンドリリー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/t5r0rNwjXQU?si=jxG3rGTeYyzDb8-s&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "ダイヤモンドリリーの語り部"
  },
  {
    id: "spot-real-oya-museum",
    name: "大谷資料館（栃木県宇都宮市）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "『あの子コンプレックス』のロケ地。佐々木舞香センターの儚く美しい世界観を見事に表現した広大な地下採石場跡。ミステリアスさ溢れる聖地。\n【ℹ️見学情報】入場料（大人800円等）が必要です。地下空間は夏でも非常に寒いため上着の持参をおすすめします。また暗いため足元に注意してください。",
    latitude: 36.6000,
    longitude: 139.8248,
    event_date: "2022-05-25",
    youtube_title: "🎥 関連映像: 『あの子コンプレックス』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/ShbfYtAPXuI?si=aaflUoEuepcTCdVZ&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "大谷資料館の目撃者"
  },
  {
    id: "spot-real-cebu",
    name: "セブ島（フィリピン）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "『ナツマトペ』のMVロケ地。イコラブの夏曲といえばここ！透き通るような青い海とリゾート感全開 of ロケーションで、メンバーたちの最高に弾けた笑顔が撮影された。海外遠征となるため巡礼ハードルは最強クラスだが、マップ上にピンがあるだけでも「ナツマトペ」の多幸感が蘇る。",
    latitude: 10.3157,
    longitude: 123.8854,
    event_date: "2023-07-19",
    youtube_title: "🎥 関連映像: 『ナツマトペ』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Y1Bboo5KXL4?si=GeyEtfxvv8MrNIz9&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "ナツマトペの漂流者"
  },
  {
    id: "spot-real-seoul",
    name: "韓国・ソウル",
    group: "=LOVE",
    category: "MVロケ地",
    description: "『Be Selfish』でイコラブが初めて海外MV撮影を敢行した場所。K-POPライクなバキバキのダンスと野口衣織の圧倒的センターオーラが炸裂した記念碑的作品。自己肯定感を爆上げしてくれる、都会的で洗練された空気感を感じられるグローバルな聖地。",
    latitude: 37.5636,
    longitude: 126.9832,
    event_date: "2022-09-28",
    youtube_title: "🎥 関連映像: 『Be Selfish』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/suf7S4AKdmY?si=qqNOS93njbn_34LB&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "Be Selfishの体現者"
  },
  {
    id: "spot-real-fuchukeiba-seimon",
    name: "京王競馬場線 府中競馬正門前駅",
    group: "=LOVE",
    category: "MVロケ地",
    description: "齊藤なぎさ初センター曲『ズルいよ ズルいね』の印象的なシーンが撮影された駅。雨降る誰もいないホームや改札前で、メンバーたちが魅せた本気の泣き演技と切ない表情が胸を締め付ける。オタクなら雨の日に訪れて、傘を差しながらMVの失恋 of 痛みに浸りたくなるエモさ満点の聖地。\n【⚠️注意】現在も営業している駅施設です。ホームや改札付近での長時間の滞留、一般の乗客の通行の妨げになる撮影、三脚の使用などは厳禁です。乗客としてのマナーを守り、周囲への配慮を徹底してください。",
    latitude: 35.6681,
    longitude: 139.4846,
    event_date: "2019-10-30",
    youtube_title: "🎥 関連映像: 『ズルいよ ズルいね』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/J5eTB_0SEeg?si=KvMLe08R0cVhYO-R&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "ズルいよ駅の雨宿り人"
  },
  {
    id: "spot-real-mika-school",
    name: "アトリエミカミ 学校スタジオ（茨城県）",
    group: "≠ME",
    category: "MVロケ地",
    description: "メジャーデビュー曲『秘密インシデント』の撮影が行われた学校スタジオ。屋上での爽やかなダンスシーンや、誰もが経験した「青春のきらめき」をギュッと詰め込んだようなロケーション。ノイミーの「青さ」を象徴する重要スポット。\n【⚠️注意】撮影・ハウススタジオとして運営されているため、一般のオタクが許可なく敷地内に入ることは厳禁です。周辺道路からの見学も近隣 of 迷惑になる場合があるため、巡礼時は十分に配慮してください。",
    latitude: 36.0270,
    longitude: 139.9930,
    event_date: "2021-04-07",
    youtube_title: "🎥 関連映像: 『秘密インシデント』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/dpSgsHxhWbA?si=ThM3tT7HUI8lglLr&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "秘密インシデントの当事者"
  },
  {
    id: "spot-real-ashizuri",
    name: "足摺岬（高知県）",
    group: "≠ME",
    category: "MVロケ地",
    description: "『夏が来たから』のMVロケ地。果てしなく広がる青空と太平洋をバックに、冨田菜々風がエモーショナルに歌い上げる姿が印象的な絶景スポット。壮大な自然の中で、ノイミーのエモい夏曲のエネルギーを全身で浴びることができる、究極の浄化系聖地。",
    latitude: 32.7214,
    longitude: 133.0200,
    event_date: "2024-08-28",
    youtube_title: "🎥 関連映像: 『夏が来たから』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/OGb7M9nvBHE?si=LHoyLkZp91Lu_KJe&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "足摺岬で風を浴びた者"
  },
  {
    id: "spot-real-ogawa-school",
    name: "越後屋東小川小学校スタジオ（埼玉県）",
    group: "≒JOY",
    category: "MVロケ地",
    description: "1stシングル『体育館ディスコ』の舞台となった廃校スタジオ。ニアジョイカラーの黄色に装飾された体育館で、フレッシュなエネルギーを爆発させて踊るメンバーの姿が焼き付いている。ニアジョイのハッピーオーラを感じられる場所。\n【⚠️注意】撮影・ハウススタジオとして運営されているため、予約利用者以外の敷地内への無断立ち入りや見学は固く禁止されています。外観を遠くから眺めるのみにしてください。",
    latitude: 36.0520,
    longitude: 139.2770,
    event_date: "2024-06-12",
    youtube_title: "🎥 関連映像: 『体育館ディスコ』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/pwT02lNsloU?si=ENJno4TyuIcdoZs7&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "体育館ディスコのダンサー"
  },
  {
    id: "spot-real-lockhart",
    name: "ロックハート城（群馬県）",
    group: "≠ME",
    category: "MVロケ地",
    description: "『チョコレートメランコリー』のジャケット撮影などでも使用された、中世ヨーロッパの古城を移築したテーマパーク。ゴシックでダークな世界観のノイミーを堪能できる場所であり、推しに閉じ込められる妄想を捗らせるには完璧すぎるシチュエーション。オタクの厨二心をくすぐる魅惑の聖地。",
    latitude: 36.5925,
    longitude: 138.9328,
    event_date: "2022-02-16",
    youtube_title: "🎥 関連映像: 『チョコレートメランコリー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/rDVWtyXTuoU?si=OZbZ4RXmt8FmurZ5&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "古城に閉じ込められし者"
  },
  {
    id: "spot-real-anniversaire-omiya",
    name: "アニヴェルセル大宮（埼玉県）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "『The 5th』のロケ地。きらびやかな冬のイルミネーションに包まれたクリスマスソングの舞台となった結婚式場。少し大人になったイコラブのメンバーたちが冬のラブソングを歌い上げた。クリスマスシーズンにここを歩けば、完全に「イコラブと過ごす特別な冬」の主人公になれる最強のデート気分聖地。\n【⚠️注意】現役の結婚式場（私有地）です。利用者以外の無断立ち入りや、営業の妨げになる敷地内での無断撮影は固く禁止されています。公道からの外観見学や、併設のカフェ等を利用する範囲でマナーを守って楽しみましょう。",
    latitude: 35.9258,
    longitude: 139.5969,
    event_date: "2021-12-15",
    youtube_title: "🎥 関連映像: 『The 5th』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Q1-yYjZqk7o?si=HzwPTmY-d5WcQFTN&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "制服クリスマスの約束人"
  },
  {
    id: "spot-real-fujikyu-land",
    name: "富士急ハイランド（山梨県）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "『Oh！Darling』のMV撮影地。メンバー全員が遊園地を全力で楽しみながら踊る姿が最高にハッピーな一曲。ライブでもタオルを振り回して爆上がりする定番曲やから、ここでアトラクションに乗りながら脳内再生すればテンションMAX間違いなし。",
    latitude: 35.4868,
    longitude: 138.7806,
    event_date: "2021-05-12",
    youtube_title: "🎥 関連映像: 『Oh！Darling』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/E-mJ15dJ3Fg?si=9oxCdENFhn4UiEAD&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "Oh! Darlingの恋人"
  },
  {
    id: "spot-real-tokorozawa-shinmei",
    name: "所澤神明社（埼玉県所沢市）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "佐々木舞香センターの最強夏曲『夏祭り恋慕う』のロケ地となった由緒ある神社。浴衣姿 of メンバーたちが境内や石段で見せた儚くも美しい表情は、オタクの「ひと夏の恋」の記憶を完全に書き換えた。夏祭りの時期に絶対に訪れたいエモさ爆発の聖地。",
    latitude: 35.7937,
    longitude: 139.4637,
    event_date: "2021-08-25",
    youtube_title: "🎥 関連映像: 『夏祭り恋慕う』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/8VBDO8ZQyDo?si=RTvUT1g5yJzaIL61&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "夏祭り恋慕うオタク"
  },
  {
    id: "spot-real-fw-soga",
    name: "フェスティバルウォーク蘇我（千葉県）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "『ドライブ デート 都内』のMVで、メンバーと夜のドライブデートを楽しんでいるかのような彼氏ヅラ（彼女ヅラ）を極限まで味わえるロケーション。海沿いの開放的な施設で、MVのドライブ気分を味わいながら推しへの想いを馳せることができるスポット。",
    latitude: 35.5922,
    longitude: 140.1182,
    event_date: "2023-11-29",
    youtube_title: "🎥 関連映像: 『ドライブ デート 都内』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Y3aRUM8ebKE?si=YIxzuvSzTfxrjRO8&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "ドライブデートのナビゲーター"
  },
  {
    id: "spot-real-showanomori",
    name: "昭和の森（千葉県千葉市）",
    group: "≠ME",
    category: "MVロケ地",
    description: "『君はこの夏、恋をする』のロケ地。広大な公園の緑やグラウンドで全力の恋心を歌う姿は疾走感の塊。学生時代の甘酸っぱい記憶が呼び起こされる、ノイミーオタクの魂の故郷。\n【ℹ️見学情報】県内最大級の総合公園で一般開放されています。ピクニックや散策がてらの巡礼に最適ですが、休日は家族連れで混雑するため周囲への配慮をお願いします。",
    latitude: 35.5241,
    longitude: 140.2840,
    event_date: "2021-07-14",
    youtube_title: "🎥 関連映像: 『君はこの夏、恋をする』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Y6uOJ_jw6cQ?si=-QtsfH_XD9wIfDnf&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "君夏に恋した者"
  },
  {
    id: "spot-real-daikeien",
    name: "大慶園（千葉県市川市）",
    group: "≠ME",
    category: "MVロケ地",
    description: "『天使は何処へ』のMVロケ地。ネオン輝くアメリカンな巨大アミューズメントパークで, 過去最高難易度の激しいダンスを披露した。夜に訪れれば、MVの治安悪めなカッコいいノイミーの世界観にどっぷり浸れる映えスポット。\n【ℹ️見学情報】24時間営業の施設のため、普通に遊びながらオタ活が可能です。ただし他のお客さんの迷惑になるような長時間の占有や本格的な撮影は控えましょう。",
    latitude: 35.7624,
    longitude: 139.9690,
    event_date: "2023-04-12",
    youtube_title: "🎥 関連映像: 『天使は何処へ』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/PQb1ZMMV1h0?si=4ZXn2X8Bdqn2HPB7&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "大慶園のネオンダンサー"
  },
  {
    id: "spot-real-ooguronomori-school",
    name: "流山市立おおぐろの森中学校（千葉県）",
    group: "≠ME",
    category: "MVロケ地",
    description: "『ラストチャンス、ラストダンス』のMV撮影地。美しい木造校舎を背景に、切ない恋の終わりと始まりを描いた青春の痛みと眩しさが詰まったエモすぎるロケ地。\n【⚠️重要な注意】現在も生徒が通う「現役の公立中学校」です。関係者以外の敷地内への無断立ち入り、生徒が映り込む形での撮影、不審に思われる長時間の滞在は絶対に禁止です！オタクのモラルとして、巡礼はごく遠巻きに外観を眺める程度に留めてください。",
    latitude: 35.8751,
    longitude: 139.9132,
    event_date: "2024-03-20",
    youtube_title: "🎥 関連映像: 『ラストチャンス、ラストダンス』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/TN--u8kgVM0?si=YrzK3um58T_ChdCF&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "ラスチャンの中学生"
  },
  {
    id: "spot-real-kotakizawa-camp",
    name: "小滝沢キャンプ場（茨城県）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "記念すべきデビュー曲『=LOVE』のMVロケ地のひとつ。茨城県の花貫渓谷に位置する、大自然に囲まれた癒しの聖地。MV内でメンバーが笑顔で駆け回り、ダブルピースを決める印象的なシーンが撮影されており、多くのファンがそのポイントを特定して巡礼に訪れている。撮影時と同じ構図で写真を撮ったり、川のせせらぎなど自然音をBGMに散策したりと、オた活を満喫するには最高のロケーション。ただし、自然豊かな場所ゆえに雨の日などは足元が滑りやすいため、スニーカーなど歩きやすい靴で訪れるのがおすすめ。",
    latitude: 36.7348,
    longitude: 140.6151,
    event_date: "2017-09-06",
    youtube_title: "🎥 関連映像: 『=LOVE』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/xOAaBsPaPpY?si=DyZ02Gn3ZCQXA55S&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "イコラブ原点のダブルピース"
  },
  {
    id: "spot-real-unoshima-villa",
    name: "うのしまヴィラ海岸（茨城県）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "記念すべきデビュー曲『=LOVE』のもうひとつのMVロケ地。海辺のロケーションで初々しいメンバーたちの爽やかなダンスシーンが撮影された。ここからイコラブの歴史がスタートした、ファンにとっても特別な海辺の聖地。\n【⚠️注意】隣接する「うのしまヴィラ」は宿泊・飲食施設（私有地）です。海岸自体は公共の場所ですが、施設の駐車場への無断駐車や、宿泊客の迷惑になる騒音・長時間の占有は避け、節度あるオタ活を心がけてください。",
    latitude: 36.6168,
    longitude: 140.6811,
    event_date: "2017-09-06",
    youtube_title: "🎥 関連映像: 『=LOVE』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/xOAaBsPaPpY?si=DyZ02Gn3ZCQXA55S&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "うのしま海岸の開拓者"
  },
  {
    id: "spot-real-kanto-gakuin",
    name: "関東学院中学校・高等学校（神奈川県）",
    group: "≒JOY",
    category: "MVロケ地",
    description: "≒JOYの2ndソング『笑って フラジール』のロケ地。学校の屋上や体育館で、不器用ながらも前を向いて「笑って！」とエールを送る姿に、多くのファンが救われたニアジョイの応援歌としての原点。\n【⚠️注意】現在も生徒が通う現役の学校施設です。敷地内への無断立ち入りや、生徒が映り込む形での撮影、周辺での長時間の滞留は絶対に禁止です。巡礼の際は公道から静かに校舎を眺める程度に留めてください。",
    latitude: 35.4373,
    longitude: 139.6146,
    event_date: "2022-09-28",
    youtube_title: "🎥 関連映像: 『笑って フラジール』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/YCbV-2dCyiM?si=YCbV-2dCyiM&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "笑ってフラジールの応援団"
  },
  {
    id: "spot-real-mitagawa-school",
    name: "旧三田川中学校（埼玉県小鹿野町）",
    group: "≒JOY",
    category: "MVロケ地",
    description: "『今日も君の夢を見たんだ』のロケ地となった中学校跡地。自然豊かな環境の中で、メンバーたちが無邪気に笑い合う多幸感あふれる映像が撮影された、ピースフルな空間。\n【⚠️注意】現在は廃校となっており、自治体（フィルムコミッション）が管理していますが、当面の間は撮影受け入れ自体が休止されています。敷地内への無断立ち入りは厳禁です。周辺から雰囲気を味わう程度にしましょう。",
    latitude: 36.0125,
    longitude: 138.9880,
    event_date: "2023-07-19",
    youtube_title: "🎥 関連映像: 『今日も君の夢を見たんだ』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/2ltZx6FkU4w?si=t9baxpFeCmf2kH4g&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "君の夢を見た夢追い人"
  },
  {
    id: "spot-real-kisarazu-warehouse",
    name: "木更津市 木材港の大型倉庫（千葉県）",
    group: "≒JOY",
    category: "MVロケ地",
    description: "『無謀人』のMV撮影地。炎が燃え盛る中でハードなラップと力強いダンスを見せつけ、ニアジョイの底知れぬポテンシャルと圧倒的な覇気を証明した、闘争 of 聖地。\n【⚠️注意】稼働中の港湾施設および私有地の大型倉庫エリアです。大型トラック of 出入りが多く非常に危険なため、関係者以外の立ち入りは厳しく禁止されています。公道からの遠巻きの巡礼に留め、絶対に敷地内には入らないでください。",
    latitude: 35.3670,
    longitude: 139.9142,
    event_date: "2024-01-17",
    youtube_title: "🎥 関連映像: 『無謀人』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/qUzXtUsVgH8?si=Xmhb-YEBXHRNRcYB&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "無謀なる港の開拓者"
  },
  {
    id: "spot-real-ushiku-chateau",
    name: "牛久シャトー (旧シャトーカミヤ)",
    group: "≒JOY",
    category: "MVロケ地",
    description: "ニアジョイの始まりの曲『≒JOY』の撮影地のひとつ。レンガ造りの美しい洋館（歴史的建造物）をバックに、夢への第一歩を踏み出したフレッシュなメンバーたちの輝かしい姿が撮影された。ここから始まった快進撃に思いを馳せることができる癒やしの聖地。\n【ℹ️見学情報】入場・見学は無料です。神谷傳兵衛記念館などの内部見学（10:00〜16:00）や敷地内の散策が可能です（年末年始などは休園）。一部立ち入れない建物もありますが、写真撮影も楽しめます。レストラン等も併設されているため、オタ活の拠点にも最適です。",
    latitude: 35.9754,
    longitude: 140.1481,
    event_date: "2022-07-02",
    youtube_title: "🎥 関連映像: 『≒JOY』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/2nOHrLolG08?si=4XIOKawh7ordSvTc&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "ニアジョイ始まりの乾杯者"
  },
  {
    id: "spot-real-british-hills",
    name: "ブリティッシュヒルズ（福島県）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "夏曲『ウィークエンドシトロン』の舞台となった、中世英国の街並みを再現したリゾート施設。ひまわり畑や豪華な洋館で踊るメンバーのお嬢様感がたまらない。オタク仲間とシトロンイエローの服を着て訪れたい、最高に映える聖地。\n【ℹ️見学情報】宿泊利用のほか、日帰りでも入場料（大人400円等）で利用可能です。MVで登場するマナーハウス（洋館）の見学は別途ツアー料金が必要です。マナーを守って英国とイコラブの世界観を楽しみましょう。",
    latitude: 37.2345,
    longitude: 140.0456,
    event_date: "2021-08-25",
    youtube_title: "🎥 関連映像: 『ウィークエンドシトロン』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/skgh3juWdFU?si=LMCBDuHmLA6XsZZx&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "ウィークエンドシトロンのお嬢様"
  },
  {
    id: "spot-real-shutoken-water",
    name: "首都圏外郭放水路（埼玉県）",
    group: "≠ME",
    category: "MVロケ地",
    description: "冨田菜々風がバチバチに決める『P.I.C.』の撮影地。巨大な柱が立ち並ぶ「地下神殿」は、ノイミーのパフォーマンスの迫力を最大限に引き出した伝説の空間。ステッキを持った振り付けを真似して写真を撮りたくなる, 圧倒的スケールのロケ地。\n【ℹ️見学情報】一般見学が可能ですが、完全事前予約制です。地下神殿コース（1,000円〜）など見学料金が必要です。施設稼働時などは見学できない場合があるため、必ず公式サイトで確認・予約をしてから訪れてください。",
    latitude: 35.9976,
    longitude: 139.8115,
    event_date: "2020-10-21",
    youtube_title: "🎥 関連映像: 『P.I.C.』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/DJdpqIGp1XA?si=hMtsCSlsrD9al5Xs&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "地下神殿のステッキ使い"
  },
  {
    id: "spot-real-italia-town",
    name: "イタリア街（東京都港区）",
    group: "≠ME",
    category: "MVロケ地",
    description: "冬の超王道アイドルソング『はにかみショート』のロケ地。まるでヨーロッパのようなオシャレな石畳とビルが立ち並ぶエリア。きらびやかな夜の街並みを背景に、メンバーがマフラー姿で歌い踊る姿がオタクの心に永遠に刻まれた。冬のデート気分を味わいながら映える写真を撮るならここ一択。\n【ℹ️見学情報】公道ですので自由に散策・撮影が可能ですが、オフィスや商業施設が隣接するエリアです。一般の方の通行の妨げや、大声で騒ぐなどの行為は控え、マナーを守ってオタ活を楽しみましょう。",
    latitude: 35.6603,
    longitude: 139.7569,
    event_date: "2022-11-23",
    youtube_title: "🎥 関連映像: 『はにかみショート』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/JXchs8DEDWk?si=z8dnGQ32FPx0KLFD&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "はにかみショートの主人公"
  },
  {
    id: "spot-real-longwood",
    name: "ロングウッドステーション（千葉県）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "イコラブのダークな魅力が爆発した3rdシングル『手遅れcaution』のロケ地。血まみれの制服や百合の愛憎劇という衝撃的な展開でオタクの心を鷲掴みにした。ここで「手遅れ」のイントロを流すだけで、あのヒリヒリした空気を味わえる。\n【⚠️注意】普段は大型の撮影スタジオおよびイベントスペースとして運営されています。イベント開催日など一般開放されている日を除き、敷地内への無断立ち入りは禁止されています。イベント等に参加して巡礼するか、外観を遠目に見る程度に留めてください。",
    latitude: 35.4325,
    longitude: 140.1873,
    event_date: "2018-05-16",
    youtube_title: "🎥 関連映像: 『手遅れcaution』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/w0N0TiOlAY0?si=S7o-oHglt-uamNUE&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "手遅れ警告の発令者"
  },
  {
    id: "spot-real-yamanashi-eiwa",
    name: "山梨英和大学（山梨県甲府市）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "冬の定番曲『僕らの制服クリスマス』のMV撮影地。大学院棟前の広場をはじめ、キャンパス全体を使ってマフラーを巻いたメンバーたちの甘酸っぱい青春ストーリーが撮影された。冬が来るたびに訪れたくなるエモすぎる学校ロケ地。\n【⚠️注意】現在も学生が通う現役の大学キャンパスです。関係者以外の無断立ち入りや、学生が映り込む撮影は厳禁です。大学祭など一般開放されている日を狙うか、外観を遠巻きに眺めるに留めてください。",
    latitude: 35.6888,
    longitude: 138.5830,
    event_date: "2017-12-06",
    youtube_title: "🎥 関連映像: 『僕らの制服クリスマス』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/YIjPbF-dKQA?si=YVeqA_tKJ_3RDx21&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "僕らの制服クリスマスの学生"
  },
  {
    id: "spot-real-kawaguchiko-music-forest",
    name: "河口湖 音楽と森の美術館（山梨県）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "最年少・齋藤樹愛羅がセンターを務めた『ラストノートしか知らない』のMVロケ地。煌びやかなダンスオルガンが設置された「オルガンホール」で、美しくも切ないダンスシーンが撮影された。中世ヨーロッパのような館内は、イコラブの気品ある世界観に完全にマッチしている。\n【ℹ️見学情報】美術館のため入館料（大人2,100円〜※季節変動あり）が必要です。館内は非常に美しく撮影も楽しめますが、他のお客さんの鑑賞の妨げにならないよう静かにオタ活を楽しみましょう。",
    latitude: 35.5222,
    longitude: 138.7686,
    event_date: "2023-11-29",
    youtube_title: "🎥 関連映像: 『ラストノートしか知らない』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/C8WMX7dEH7Y?si=gDweR-_vaEpgUrir&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "ラストノートの調香師"
  },
  {
    id: "spot-real-ease-meguro",
    name: "ウェディングファンタジア（静岡県沼津市）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "イコラブのポップでキュートな楽曲『Want you! Want you!』のMVロケ地となった静岡県沼津市の結婚式場・フォトスタジオ。テーマパークのような広大で多彩なセットがあり、MV的で可愛い世界観そのままの雰囲気を味わえるロケーション。\n【ℹ️見学情報】実際の結婚式場およびスタジオとして営業しているため、無断での立ち入りや撮影は厳禁です。見学や撮影利用を希望する場合は、必ず事前に施設へ問い合わせ、営業の迷惑にならないようルールを守ってオタ活を楽しみましょう。",
    latitude: 35.085277,
    longitude: 138.859882,
    event_date: "2018-10-17",
    youtube_title: "🎥 関連映像: 『Want you! Want you!』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Bot92Nn-ozk?si=G2dfc6nPxvh12RDc&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "Want you! のウェディングメイト"
  },
  {
    id: "spot-real-dopo-ueno",
    name: "不純喫茶ドープ 上野御徒町店（東京都台東区）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "ダークで情熱的な表題曲『呪って呪って』のMV内で、瀧脇笙古がお店から出てくる印象的なシーンで使われたレトロ喫茶。昭和レトロなネオンやクリームソーダがオタク心をくすぐる。アクスタを置いてMVのダークな世界観を再現したくなる人気スポット。\n【ℹ️見学情報】実際の飲食店として営業しています。普通に来店して飲食しながらオタ活が可能ですが、店内撮影の際は他のお客さんが映り込まないよう配慮し、混雑時は長居を避けましょう。",
    latitude: 35.707767,
    longitude: 139.772591,
    event_date: "2024-03-06",
    youtube_title: "🎥 関連映像: 『呪って呪って』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/cyRZGtNx_a4?si=lWyRvRwwEvULNyUC&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "不純喫茶の呪われし者"
  },
  {
    id: "spot-real-seibuen-yuenchi",
    name: "西武園ゆうえんち（埼玉県所沢市）",
    group: "=LOVE",
    category: "飲食店・その他",
    description: "大ヒット曲『絶対アイドル辞めないで』のType Cに収録された特典映像『イコラブ社員旅行 in 埼玉！〜昭和レトロ編〜』のロケ地。大場花菜のプロデュースで、メンバーたちが昭和の街並みで大はしゃぎする姿が収められた。推しと同じアトラクションに乗って社員旅行気分を味わえる多幸感スポット。\n【ℹ️見学情報】入園にはチケット（1日レヂャー切符など）が必要です。昭和の街並み（夕日の丘商店街）はフォトスポットとしても最高なので、推しのアクスタやグッズを持参して全力で満喫しましょう。",
    latitude: 35.7667,
    longitude: 139.4439,
    event_date: "2024-07-31",
    youtube_title: "🎥 関連映像: 特典映像『イコラブ社員旅行 in 埼玉！』",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Rn0vbPbMGcQ?si=BBX-yLxa0KFk1ZWs&amp;controls=0\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    reward_title: "昭和レトロの旅人"
  },
  {
    id: "spot-trigger-kiraku",
    name: "中華料理 喜楽（大森）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "大谷映美里がラーメンを食べていたお店。実際に同じメニューを頼んでオタ活したいスポット。",
    latitude: 35.5866,
    longitude: 139.7297,
    event_date: "2023-02-22",
    youtube_title: "🎥 関連映像: 『この空がトリガー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/20QJax8CwQo?si=kPUEeAcfNct48srm\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    tags: ["トリガー巡礼"],
    reward_title: "大森喜楽のラーメン愛好家"
  },
  {
    id: "spot-trigger-veille",
    name: "Bar VEILLE（大森）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "諸橋沙夏が訪れた大人な雰囲気のバー。喜楽のすぐ近く。",
    latitude: 35.5864,
    longitude: 139.7296,
    event_date: "2023-02-22",
    youtube_title: "🎥 関連映像: 『この空がトリガー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/20QJax8CwQo?si=kPUEeAcfNct48srm\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    tags: ["トリガー巡礼"],
    reward_title: "大森VEILLEの大人"
  },
  {
    id: "spot-trigger-spbs",
    name: "Shibuya Publishing & Booksellers",
    group: "=LOVE",
    category: "MVロケ地",
    description: "音嶋莉沙が入ったオシャレな本屋さん。",
    latitude: 35.6631,
    longitude: 139.6934,
    event_date: "2023-02-22",
    youtube_title: "🎥 関連映像: 『この空がトリガー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/20QJax8CwQo?si=kPUEeAcfNct48srm\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    tags: ["トリガー巡礼"],
    reward_title: "SPBSの本の虫"
  },
  {
    id: "spot-trigger-1214",
    name: "Hair Salon 1214（渋谷）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "髙松瞳が髪を切っていた美容室。",
    latitude: 35.6565,
    longitude: 139.7045,
    event_date: "2023-02-22",
    youtube_title: "🎥 関連映像: 『この空がトリガー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/20QJax8CwQo?si=kPUEeAcfNct48srm\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    tags: ["トリガー巡礼"],
    reward_title: "渋谷1214のヘアスタイリスト"
  },
  {
    id: "spot-trigger-airstream",
    name: "the AIRSTREAM GARDEN",
    group: "=LOVE",
    category: "MVロケ地",
    description: "山本杏奈が働いていたキッチンカー。表参道エリアのカフェスペース。",
    latitude: 35.6679,
    longitude: 139.7088,
    event_date: "2023-02-22",
    youtube_title: "🎥 関連映像: 『この空がトリガー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/20QJax8CwQo?si=kPUEeAcfNct48srm\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    tags: ["トリガー巡礼"],
    reward_title: "表参道エアストリームの旅人"
  },
  {
    id: "spot-trigger-taimei",
    name: "みらい館大明（池袋）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "屋上や教室、男の子が走っているシーンが撮影された廃校活用施設。",
    latitude: 35.7356,
    longitude: 139.7018,
    event_date: "2023-02-22",
    youtube_title: "🎥 関連映像: 『この空がトリガー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/20QJax8CwQo?si=kPUEeAcfNct48srm\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    tags: ["トリガー巡礼"],
    reward_title: "みらい館大明の放課後メンバー"
  },
  {
    id: "spot-trigger-ladybugs",
    name: "LadyBugs（神山町）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "大場花菜が働いていた花屋さん。本屋（SPBS）のすぐ近く。",
    latitude: 35.6628,
    longitude: 139.6932,
    event_date: "2023-02-22",
    youtube_title: "🎥 関連映像: 『この空がトリガー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/20QJax8CwQo?si=kPUEeAcfNct48srm\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    tags: ["トリガー巡礼"],
    reward_title: "神山町LadyBugsの花屋"
  },
  {
    id: "spot-trigger-toyosu",
    name: "豊洲ぐるり公園",
    group: "=LOVE",
    category: "MVロケ地",
    description: "瀧脇笙古が走っていた公園。レインボーブリッジが見える水辺のランニングスポット。",
    latitude: 35.6469,
    longitude: 139.7891,
    event_date: "2023-02-22",
    youtube_title: "🎥 関連映像: 『この空がトリガー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/20QJax8CwQo?si=kPUEeAcfNct48srm\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    tags: ["トリガー巡礼"],
    reward_title: "豊洲水辺のランニングスター"
  },
  {
    id: "spot-trigger-kait",
    name: "神奈川工科大学 KAIT広場",
    group: "=LOVE",
    category: "MVロケ地",
    description: "美しいダンスパートが撮影された特徴的な建築の広場。",
    latitude: 35.4831,
    longitude: 139.3496,
    event_date: "2023-02-22",
    youtube_title: "🎥 関連映像: 『この空がトリガー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/20QJax8CwQo?si=kPUEeAcfNct48srm\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    tags: ["トリガー巡礼"],
    reward_title: "KAIT広場の芸術鑑賞家"
  },
  {
    id: "spot-trigger-tute",
    name: "東京工科大学 八王子キャンパス",
    group: "=LOVE",
    category: "MVロケ地",
    description: "卒業式のキスシーンが撮影された場所。",
    latitude: 35.6258,
    longitude: 139.3387,
    event_date: "2023-02-22",
    youtube_title: "🎥 関連映像: 『この空がトリガー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/20QJax8CwQo?si=kPUEeAcfNct48srm\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    tags: ["トリガー巡礼"],
    reward_title: "八王子キャンパスの卒業生"
  },
  {
    id: "spot-trigger-jissen",
    name: "実践女子大学 渋谷キャンパス",
    group: "=LOVE",
    category: "MVロケ地",
    description: "佐々木舞香がビル街を見つめるシーンの撮影地。",
    latitude: 35.6536,
    longitude: 139.7077,
    event_date: "2023-02-22",
    youtube_title: "🎥 関連映像: 『この空がトリガー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/20QJax8CwQo?si=kPUEeAcfNct48srm\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    tags: ["トリガー巡礼"],
    reward_title: "渋谷キャンパス of 夢追い人"
  },
  {
    id: "spot-trigger-mimosa",
    name: "ミモザハウス（パスティスグループ）",
    group: "=LOVE",
    category: "MVロケ地",
    description: "野口衣織が男の子と相合傘をするシーンが撮影されたハウススタジオ。",
    latitude: 35.6635,
    longitude: 139.6935,
    event_date: "2023-02-22",
    youtube_title: "🎥 関連映像: 『この空がトリガー』公式MV",
    youtube_url: "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/20QJax8CwQo?si=kPUEeAcfNct48srm\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>",
    tags: ["トリガー巡礼"],
    reward_title: "ミモザハウスの相合傘メイト"
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
    const data = localStorage.getItem('tdm_spots');
    if (!data) {
      this.setSpots(INITIAL_SPOTS);
      return INITIAL_SPOTS;
    }
    // データのプロパティ（説明文や座標など）に何かしらの変更があれば確実に最新化する完全同期
    try {
      const parsed = JSON.parse(data) as Spot[];
      
      // parsedデータとINITIAL_SPOTSの並び順などを考慮し、ID順にソートした上でシリアライズして比較
      const sortedInitial = [...INITIAL_SPOTS].sort((a, b) => a.id.localeCompare(b.id));
      const sortedParsed = [...parsed].sort((a, b) => a.id.localeCompare(b.id));
      
      if (JSON.stringify(sortedInitial) !== JSON.stringify(sortedParsed)) {
        this.setSpots(INITIAL_SPOTS);
        return INITIAL_SPOTS;
      }
      return parsed;
    } catch (e) {
      this.setSpots(INITIAL_SPOTS);
      return INITIAL_SPOTS;
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

  // CheckIns操作
  getCheckIns(): CheckIn[] {
    const data = localStorage.getItem('tdm_checkins');
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  addCheckIn(spotId: string): CheckIn {
    const checkins = this.getCheckIns();
    const user = this.getCurrentUser();
    const newCheckIn: CheckIn = {
      id: generateUUID(),
      user_id: user.id,
      spot_id: spotId,
      visited_at: new Date().toISOString()
    };
    checkins.push(newCheckIn);
    localStorage.setItem('tdm_checkins', JSON.stringify(checkins));
    return newCheckIn;
  },

  removeCheckIn(spotId: string): void {
    const checkins = this.getCheckIns();
    const filtered = checkins.filter(c => c.spot_id !== spotId);
    localStorage.setItem('tdm_checkins', JSON.stringify(filtered));
  },

  resetAll(): void {
    localStorage.removeItem('tdm_spots');
    localStorage.removeItem('tdm_user');
    localStorage.removeItem('tdm_checkins');
  }
};
