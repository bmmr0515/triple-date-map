export interface CourseSpot {
  spot_id: string;
  short_commentary: string; // 各スポットの見どころ・解説
}

export interface Course {
  slug: string;
  name: string;
  duration: string; // 想定所要時間 (例: "約3時間")
  start_point: string; // 開始地点 (例: "渋谷駅ハチ公口")
  end_point: string; // 終了地点 (例: "原宿駅表参道口")
  transportation: string; // 移動方法 (例: "徒歩・電車")
  estimated_cost: string; // 交通費や施設料金の目安 (例: "約1,200円（飲食費除く）")
  recommended_time: string; // おすすめの時間帯 (例: "午後（13:00〜17:00）")
  spots: CourseSpot[]; // 巡る順番と見どころ
  external_map_url?: string; // Googleマップなどの外部リンク
  notes?: string; // 注意事項・巡礼マナー
  related_groups: string[]; // 関連グループ
  related_songs: string[]; // 関連作品
  cafe_spots?: string[]; // 休憩場所
  updated_at: string; // 最終更新日 (例: "2026-10-12")
  status: 'published' | 'draft';
}

export const INITIAL_COURSES: Course[] = [
  {
    slug: "shibuya-harajuku-pop",
    name: "イコノイジョイ渋谷・原宿 王道カルチャー＆MV巡礼コース",
    duration: "約2時間30分",
    start_point: "JR渋谷駅 ハチ公口",
    end_point: "JR原宿駅（明治神宮前駅）",
    transportation: "徒歩",
    estimated_cost: "約800円（飲食費・クレープ代等）",
    recommended_time: "午後（13:00〜17:00）",
    spots: [
      {
        spot_id: "spot-real-miyashita-park",
        short_commentary: "『絶対アイドル辞めないで』に登場した、渋谷の中心に広がる開放的な空中公園。芝生エリアや屋上デッキから渋谷の街並みを一望できます。"
      },
      {
        spot_id: "spot-real-santamonica-crepe",
        short_commentary: "原宿明治通り沿いに佇むクレープ店。メンバーと同じメニューを味わいながら、ポップなストリートカルチャーの聖地気分を満喫しましょう。"
      },
      {
        spot_id: "spot-trigger-jissen",
        short_commentary: "『この空がトリガー』のMVで印象的に登場したキャンパス。現役の学校施設のため敷地外から美しい校舎の外観を静かに見学します。"
      }
    ],
    external_map_url: "https://www.google.com/maps/dir/?api=1&origin=Shibuya+Station&destination=Harajuku+Station",
    notes: "歩きやすい靴での散策をおすすめします。実践女子大学は現役の大学キャンパスですので敷地内への無断立ち入りは固くご遠慮ください。原宿竹下通り周辺は混雑するため通行人に十分配慮してください。",
    related_groups: ["=LOVE"],
    related_songs: ["絶対アイドル辞めないで", "この空がトリガー"],
    cafe_spots: ["MIYASHITA PARK South 2F スターバックス", "サンタモニカクレープ原宿明治通り店", "THE ROASTERY BY NOZY COFFEE (キャットストリート)"],
    updated_at: "2026-10-12",
    status: "published"
  },
  {
    slug: "omori-kamiyama-trigger",
    name: "『この空がトリガー』世界観を巡る東京ロケ地散策コース",
    duration: "約3時間",
    start_point: "JR大森駅 東口",
    end_point: "渋谷駅（奥渋エリア）",
    transportation: "電車（JR京浜東北線・山手線）および徒歩",
    estimated_cost: "約500円（電車運賃）",
    recommended_time: "午後（14:00〜18:00・夕暮れ時の情緒がおすすめ）",
    spots: [
      {
        spot_id: "spot-trigger-veille",
        short_commentary: "MVの大人びた切ないトーンを象徴するシックなバー「Bar VEILLE」。大森駅周辺の下町情緒漂う通りを歩きながらロケ地の余韻を感じられます。"
      },
      {
        spot_id: "spot-trigger-spbs",
        short_commentary: "奥渋（神山町）にあるハイセンスな書店「Shibuya Publishing & Booksellers」。メンバーが本を手にとるシーンを思い浮かべながら、ゆっくりと本を選びましょう。"
      },
      {
        spot_id: "spot-trigger-ladybugs",
        short_commentary: "同じく神山町エリアに位置する個性的なフラワー＆プランツショップ。街歩きの合間に洗練された緑の空間を楽しめます。"
      }
    ],
    external_map_url: "https://www.google.com/maps/dir/?api=1&origin=Omori+Station&destination=Shibuya+Station",
    notes: "Bar VEILLEは大人の落ち着いたバーです。営業時間外の外観見学の際も近隣住民への配慮をお願いします。SPBSは営業中の書店ですので店内では静粛にし、本を購入するなどファンとしてのマナーを守りましょう。",
    related_groups: ["=LOVE"],
    related_songs: ["この空がトリガー"],
    cafe_spots: ["SPBS併設コーヒースタンド", "Camelback sandwich&espresso (神山町)", "大森駅前 珈琲亭"],
    updated_at: "2026-10-12",
    status: "published"
  },
  {
    slug: "chichibu-summer-twintail",
    name: "≒JOY『サマーツインテール』秩父レトロ聖地巡礼コース",
    duration: "約4時間",
    start_point: "西武秩父駅 / 秩父鉄道 御花畑駅",
    end_point: "秩父鉄道 武州中川駅",
    transportation: "秩父鉄道・徒歩",
    estimated_cost: "約1,500円（秩父鉄道運賃＋名物グルメ代）",
    recommended_time: "午前〜午後（10:30〜15:30、店舗営業時間に合わせる）",
    spots: [
      {
        spot_id: "spot-real-chichibu-imamiya-shrine",
        short_commentary: "樹齢1000年を超える大ケヤキと清らかな龍神池が迎える名社。メンバーが夏空の下で浴衣姿を見せた涼やかな名所です。"
      },
      {
        spot_id: "spot-real-chichibu-parry-shokudo",
        short_commentary: "昭和の面影をそのまま残す登録有形文化財の洋食食堂。看板建築の外観やレトロな店内がMVのノスタルジーと完璧に一致します。"
      },
      {
        spot_id: "spot-real-nikuno-yasudaya",
        short_commentary: "番場通りで愛される老舗精肉店。熱々の手作りコロッケやメンチカツをテイクアウトして、食べ歩きマナーを守りながら秩父の味を堪能できます。"
      },
      {
        spot_id: "spot-real-bushu-nakagawa-station",
        short_commentary: "秩父鉄道の素朴で懐かしい木造駅舎。静かなホームや駅前広場は、MVの青春感あふれるカットそのままの空気が流れています。"
      }
    ],
    external_map_url: "https://www.google.com/maps/dir/?api=1&origin=Seibu-Chichibu+Station&destination=Bushu-Nakagawa+Station",
    notes: "秩父今宮神社は神聖な信仰の場です。境内での大声や撮影時の参拝者への写り込みに注意してください。パリー食堂や安田屋では他のお客様の迷惑にならないよう配慮し、食事を美味しくいただきましょう。駅ホームでは黄色い線の内側で見学してください。",
    related_groups: ["≒JOY"],
    related_songs: ["サマーツインテール"],
    cafe_spots: ["秩父パリー食堂（レトロオムライス等）", "肉の安田屋（揚げたてメンチカツ・コロッケ）", "西武秩父駅前 祭の湯 カフェコーナー"],
    updated_at: "2026-10-12",
    status: "published"
  },
  {
    slug: "mahoroba-asterisk-tamura",
    name: "≠ME『まほろばアスタリスク』星と空の福島・あぶくまコース",
    duration: "約2時間30分",
    start_point: "星の村天文台（福島県田村市）",
    end_point: "あぶくま洞 第二駐車場周辺",
    transportation: "車・レンタカー・徒歩",
    estimated_cost: "約1,200円（天文台入場料等）",
    recommended_time: "日中〜夕暮れ（星空観賞なら晴天の夜間）",
    spots: [
      {
        spot_id: "spot-real-mahoroba-observatory",
        short_commentary: "星空をテーマにした楽曲を象徴する天文台。施設周辺の山並みを含め、MVのノスタルジックな雰囲気を現地で味わえます。"
      },
      {
        spot_id: "spot-real-mahoroba-bridge",
        short_commentary: "星の村天文台とあぶくま洞を結ぶ歩道橋。特徴的な形状をしており、MVのカメラアングルが捉えやすい象徴的なスポットです。"
      },
      {
        spot_id: "spot-real-mahoroba-abukuma-parking",
        short_commentary: "天地人橋を渡った先にある、あぶくま洞の第二駐車場周辺。MVのシーンを脳裏に描きつつ、安全な歩道から見学しましょう。"
      }
    ],
    external_map_url: "https://www.google.com/maps/dir/?api=1&origin=Hoshinomura+Observatory&destination=Abukuma+Cave",
    notes: "星の村天文台とあぶくま洞は山間部に位置するため、悪天候時や冬季・積雪時の移動は足元に十分ご注意ください。天文台は現役の施設ですので営業ルールを守って見学してください。",
    related_groups: ["≠ME"],
    related_songs: ["まほろばアスタリスク"],
    cafe_spots: ["あぶくま洞レストハウス（名物じゅうねん味噌うどん）", "星の村天文台売店"],
    updated_at: "2026-10-12",
    status: "published"
  },
  {
    slug: "shonan-kamakura-zaimokuza",
    name: "湘南・鎌倉 海風と青空のMVロケ地めぐりコース",
    duration: "約4時間",
    start_point: "JR鎌倉駅 東口",
    end_point: "片瀬江ノ島駅",
    transportation: "江ノ島電鉄（江ノ電）・徒歩",
    estimated_cost: "約800円（江ノ電1日乗車券のりおりくん利用がお得）",
    recommended_time: "午前〜夕方（11:00〜16:30）",
    spots: [
      {
        spot_id: "spot-real-kyu-ozu-yasujiro-tei",
        short_commentary: "『夏はジュエリー』の撮影地として知られる情緒あふれる邸宅。歴史ある建物の佇まいと湘南の静謐な空気感が調和しています。"
      },
      {
        spot_id: "spot-real-zaimokuza-beach",
        short_commentary: "青い海と広い砂浜が広がる材木座海岸。メンバーが波打ち際ではしゃぐ爽快な夏のシーンがそのまま目の前に蘇ります。"
      },
      {
        spot_id: "spot-real-enoshima-daiteibo",
        short_commentary: "江ノ島の突端にある湘南大堤防。雄大な相模湾と灯台を臨む絶景スポットで、爽やかな潮風を感じながら巡礼のゴールを飾れます。"
      }
    ],
    external_map_url: "https://www.google.com/maps/dir/?api=1&origin=Kamakura+Station&destination=Katase-Enoshima+Station",
    notes: "海岸沿いの道路は歩道が狭い区間があります。車や自転車に注意して歩行してください。旧小津安二郎邸周辺は閑静な別荘地・住宅街のため、大声を出さず静かに見学してください。防波堤では波が高い日の立ち入りは危険ですのでお控えください。",
    related_groups: ["≒JOY", "=LOVE"],
    related_songs: ["夏はジュエリー", "青春“サブリミナル”"],
    cafe_spots: ["材木座テラス POST by HONKI DELI", "江ノ島小屋（海鮮丼）", "江の島アイランドスパ カフェ"],
    updated_at: "2026-10-12",
    status: "published"
  },
  {
    slug: "kyoto-gion-kiyomizu",
    name: "イコノイジョイch 京都・清水〜祇園はんなり満喫コース",
    duration: "約3時間30分",
    start_point: "京阪本線 祇園四条駅",
    end_point: "音羽山 清水寺",
    transportation: "徒歩",
    estimated_cost: "約1,000円（清水寺拝観料＋スイーツ代）",
    recommended_time: "午前中（9:30〜13:00、混雑前の散策が快適）",
    spots: [
      {
        spot_id: "spot-osakakyoto-yasakaroumon",
        short_commentary: "祇園の象徴である鮮やかな朱塗りの楼門。イコノイジョイchのメンバーが京都散策のスタートとして訪れた記念すべき名所です。"
      },
      {
        spot_id: "spot-osakakyoto-yasakakoushindou",
        short_commentary: "色とりどりの「くくり猿」が奉納された華やかなフォトスポット。メンバーも願いを込めたSNS映え抜群の境内です。"
      },
      {
        spot_id: "spot-osakakyoto-imopippi",
        short_commentary: "極密熟成焼き芋スイーツの名店。散策のエネルギーチャージとして、メンバーも舌鼓を打った絶品芋スイーツを堪能できます。"
      },
      {
        spot_id: "spot-osakakyoto-kiyomizudera",
        short_commentary: "言わずと知れた世界遺産「清水の舞台」。京都の街並みを一望できる大パノラマと、悠久の歴史を感じる圧巻の聖地です。"
      }
    ],
    external_map_url: "https://www.google.com/maps/dir/?api=1&origin=Gion-Shijo+Station&destination=Kiyomizu-dera",
    notes: "清水寺や八坂庚申堂は神仏への礼拝を行う宗教施設です。参拝マナーを遵守し、境内での過度なポーズや大声は厳禁です。坂道や石段が多いので歩きやすいスニーカーでの訪問をおすすめします。",
    related_groups: ["合同", "=LOVE"],
    related_songs: ["イコノイジョイch 京都旅"],
    cafe_spots: ["芋ぴっぴ。京都祇園店（極密熟成焼き芋）", "清水順正 おかべ家（豆腐料理）", "かさぎ屋（二寧坂の甘味処）"],
    updated_at: "2026-10-12",
    status: "published"
  },
  {
    slug: "kyoto-nishiki-gourmet",
    name: "京都・錦市場 食べ歩き＆名店お好み焼きランチコース",
    duration: "約2時間30分",
    start_point: "阪急 烏丸駅 / 地下鉄 四条駅",
    end_point: "四条新町",
    transportation: "徒歩",
    estimated_cost: "約2,000円（ランチ代・お土産代）",
    recommended_time: "昼（11:00〜14:00）",
    spots: [
      {
        spot_id: "spot-osakakyoto-nishiki",
        short_commentary: "「京の台所」として賑わう全長約400mの歴史ある商店街。様々な京都の美味が集まる活気あふれる空間です。"
      },
      {
        spot_id: "spot-osakakyoto-nishikimarun",
        short_commentary: "錦市場内にある可愛い焼き菓子やお土産が並ぶ専門店。メンバーがお気に入りを選んだお菓子探しを楽しめます。"
      },
      {
        spot_id: "spot-osakakyoto-ikkakuju",
        short_commentary: "四条新町にある名物お好み焼き店。香ばしいソースの香りとふわふわの食感が旅の満足度を最高潮にしてくれます。"
      }
    ],
    external_map_url: "https://www.google.com/maps/dir/?api=1&origin=Karasuma+Station&destination=Shijo-Shinmachi",
    notes: "錦市場では混雑防止と美化のため歩きながらの飲食が禁止されている区間があります。購入した店舗のイートインスペースや指定場所で食べるルールを守りましょう。いっかくじゅうは人気店のため事前予約またはピークをずらした訪問が推奨されます。",
    related_groups: ["合同"],
    related_songs: ["イコノイジョイch 関西ロケ"],
    cafe_spots: ["錦まるん（可愛い京菓子・お土産）", "いっかくじゅう 四条新町店（絶品お好み焼き）", "前田珈琲 本店（烏丸の老舗喫茶）"],
    updated_at: "2026-10-12",
    status: "published"
  },
  {
    slug: "yokohama-minatomirai-breeze",
    name: "横浜みなとみらい ベイエリアMV＆グルメ散歩コース",
    duration: "約3時間30分",
    start_point: "みなとみらい線 みなとみらい駅",
    end_point: "JR桜木町駅 / 関内駅",
    transportation: "徒歩",
    estimated_cost: "約1,800円（ハンバーガーランチ代等）",
    recommended_time: "昼〜夕暮れ（12:00〜17:00、夜景も美しい）",
    spots: [
      {
        spot_id: "spot-real-minatomirai-grandcentral",
        short_commentary: "『恋、はじめました。』のスタイリッシュな映像に登場した近代的なビル建築。洗練された広場やガラスウォールが美しく映えます。"
      },
      {
        spot_id: "spot-real-anniversaire-minatomirai",
        short_commentary: "運河沿いに佇むヨーロッパ調の美しいブライダル施設。運河沿いのプロムナードから眺める景観はデート気分満点です。"
      },
      {
        spot_id: "spot-real-shinko-chuo-hiroba",
        short_commentary: "サークルウォークや赤レンガ倉庫を望む開放的な緑地広場。海風を感じながらのんびりとロケ地散策が楽しめます。"
      },
      {
        spot_id: "spot-real-hamburger-ballpark9",
        short_commentary: "YouTube企画「イコラブハンバーガー部」でメンバーが訪れた名店。ジューシーな絶品バーガーで巡礼を締めくくりましょう。"
      }
    ],
    external_map_url: "https://www.google.com/maps/dir/?api=1&origin=Minatomirai+Station&destination=Sakuragicho+Station",
    notes: "グランドセントラルタワーや結婚式場アニヴェルセルはオフィス・ブライダル施設です。私有地敷地内への無断進入や一般営業の妨げになる行為は厳禁です。BALLPARK BURGER &9では野球開催日に混雑することがあるため事前に営業時間等をご確認ください。",
    related_groups: ["=LOVE"],
    related_songs: ["恋、はじめました。", "イコラブハンバーガー部"],
    cafe_spots: ["BALLPARK BURGER &9 (横浜スタジアム前)", "横浜赤レンガ倉庫 カフェ群", "MARINE & WALK YOKOHAMA 内のカフェ"],
    updated_at: "2026-10-12",
    status: "published"
  },
  {
    slug: "okinawa-yanbaru-voice",
    name: "諸橋沙夏『My Voice Is For You』沖縄やんばる大自然巡礼ドライブコース",
    duration: "約5時間",
    start_point: "オクマ プライベートビーチ&リゾート",
    end_point: "大石林山（国頭村）",
    transportation: "レンタカー（車移動）",
    estimated_cost: "約3,000円（高速料金・施設入場料等、レンタカー代除く）",
    recommended_time: "朝〜午後（9:00〜15:00、自然散策のため明るい時間帯必須）",
    spots: [
      {
        spot_id: "spot-real-mvify-okuma",
        short_commentary: "エメラルドグリーンの東シナ海と白い砂浜が広がる極上のリゾート。諸橋沙夏の透き通る歌声が心に響く開放的なロケーションです。"
      },
      {
        spot_id: "spot-real-mvify-hiji-waterfall",
        short_commentary: "やんばるの大自然に抱かれたマイナスイオン満点のキャンプ場・大滝。豊かな原生林を歩くトレッキングルートで撮影の軌跡を辿れます。"
      },
      {
        spot_id: "spot-real-mvify-sekiseizan",
        short_commentary: "2億年前の石灰岩が隆起した聖地「大石林山」。雄大な奇岩とパノラマビューの展望台から、壮大な自然の力を体感できます。"
      }
    ],
    external_map_url: "https://www.google.com/maps/dir/?api=1&origin=Okuma+Private+Beach+%26+Resort&destination=Daisekirinzan",
    notes: "沖縄本島北部のやんばるエリアは世界自然遺産登録地域です。ヤンバルクイナなどの希少動物の飛び出しに注意しスピードを抑えて運転してください。比地大滝の遊歩道は片道約40分の自然歩道ですので、歩きやすい運動靴と水分補給の準備が必須です。",
    related_groups: ["=LOVE"],
    related_songs: ["My Voice Is For You"],
    cafe_spots: ["オクマビーチカフェ", "比地カフェ（比地大滝キャンプ場入口）", "精進料理 ふんしん亭（大石林山）"],
    updated_at: "2026-10-12",
    status: "published"
  },
  {
    slug: "tokyo-anniversary-roots",
    name: "イコノイジョイ原点と飛躍の軌跡！都内記念碑的スポット巡礼コース",
    duration: "約3時間",
    start_point: "JR水道橋駅 / 東京ドーム",
    end_point: "九段下駅 / 日本武道館",
    transportation: "電車（JR総武線・中央線）および徒歩",
    estimated_cost: "約350円（JR運賃等）",
    recommended_time: "日中（11:00〜16:00）",
    spots: [
      {
        spot_id: "spot-real-tokyodome-recipe",
        short_commentary: "イコラブが目指す夢の舞台であり、数々の記念碑的歴史が刻まれる東京ドーム。巨大なスタジアムの外観を見上げながら、グループの更なる飛躍に想いを馳せましょう。"
      },
      {
        spot_id: "spot-real-tokyodome-rollerskate-arena",
        short_commentary: "≒JOY『わたし注意報』のMVロケ地として使用されたローラースケートアリーナ。ポップでアメリカンな内装とスピード感あふれる映像の世界観を体感できます。"
      },
      {
        spot_id: "spot-real-yoyogi-ani",
        short_commentary: "すべての始まりの場所「代々木アニメーション学院 東京校」。初期のオーディションや合宿が行われた、指原莉乃Pとメンバーの原点です。"
      },
      {
        spot_id: "spot-real-budokan",
        short_commentary: "数々の感動的な単独コンサートが開催された聖地「日本武道館」。九段下の緑豊かな北の丸公園に佇む八角形の屋根を前に、歴史の重みを感じられます。"
      }
    ],
    external_map_url: "https://www.google.com/maps/dir/?api=1&origin=Tokyo+Dome&destination=Nippon+Budokan",
    notes: "水道橋（東京ドーム）から代々木（代々木アニメーション学院）間、および代々木から九段下（日本武道館）間はJR総武線・中央線および地下鉄の利用が現実的です。代々木アニメーション学院は現役の専門学校です。校舎内への無断立ち入りや出待ち行為は厳禁であり、公道から外観を見学してください。日本武道館や東京ドームはイベント開催日には大変混雑しますので一般通行の妨げにならないよう配慮してください。",
    related_groups: ["合同", "=LOVE", "≠ME", "≒JOY"],
    related_songs: ["Documentary of =LOVE", "わたし注意報", "夢の続き"],
    cafe_spots: ["東京ドームシティ ラクーア内カフェ", "神保町・水道橋の純喫茶（さぼうる等）", "北の丸公園休憩所 CAFÉ 33"],
    updated_at: "2026-10-12",
    status: "published"
  }
];

export const coursesDb = {
  getCourses(): Course[] {
    const data = typeof window !== 'undefined' ? localStorage.getItem('tdm_courses') : null;
    if (!data) {
      if (typeof window !== 'undefined') localStorage.setItem('tdm_courses', JSON.stringify(INITIAL_COURSES));
      return INITIAL_COURSES;
    }
    try {
      const parsed = JSON.parse(data) as Course[];
      
      // コースマスタ(INITIAL_COURSES)の更新を検知し、自動同期するロジック
      const sortedInitial = [...INITIAL_COURSES].sort((a, b) => a.slug.localeCompare(b.slug));
      const sortedParsed = [...parsed].sort((a, b) => a.slug.localeCompare(b.slug));
      
      if (
        sortedInitial.length !== sortedParsed.length ||
        sortedInitial.some((val, i) => {
          const parsedVal = sortedParsed[i];
          return (
            !parsedVal ||
            val.slug !== parsedVal.slug ||
            val.name !== parsedVal.name ||
            val.spots.length !== parsedVal.spots.length ||
            val.spots.some((s, idx) => s.spot_id !== parsedVal.spots[idx]?.spot_id)
          );
        })
      ) {
        if (typeof window !== 'undefined') localStorage.setItem('tdm_courses', JSON.stringify(INITIAL_COURSES));
        return INITIAL_COURSES;
      }
      return parsed;
    } catch (e) {
      if (typeof window !== 'undefined') localStorage.setItem('tdm_courses', JSON.stringify(INITIAL_COURSES));
      return INITIAL_COURSES;
    }
  },
  setCourses(courses: Course[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tdm_courses', JSON.stringify(courses));
    }
  }
};
