export interface CourseSpot {
  spot_id: string;
  short_commentary: string; // 各スポットの短い解説
}

export interface Course {
  slug: string;
  name: string;
  duration: string; // 所要時間 (例: "2時間")
  transportation: string; // 移動方法 (例: "徒歩・電車")
  recommended_time: string; // 推奨する時間帯
  spots: CourseSpot[]; // 回る順番
  external_map_url?: string; // Googleマップなどの外部リンク
  notes?: string; // 注意事項
  related_groups: string[]; // 関連するグループ
  related_songs: string[]; // 関連する楽曲・作品
  cafe_spots?: string[]; // 周辺の飲食店や休憩場所を追加できる欄
  status: 'published' | 'draft';
}

export const INITIAL_COURSES: Course[] = [
  {
    slug: "shibuya-harajuku-quick",
    name: "イコノイジョイ渋谷・原宿2時間クイックコース",
    duration: "約2時間",
    transportation: "徒歩",
    recommended_time: "午後（13:00〜17:00）",
    spots: [
      {
        spot_id: "spot-trigger-jissen",
        short_commentary: "『この空がトリガー』のMVで登場した美しいキャンパス。渋谷からスタートしてまず外観を眺めてみましょう。"
      },
      {
        spot_id: "spot-zettaiidol-miyashitapark",
        short_commentary: "『絶対アイドル辞めないで』に登場した、渋谷の中心にある開放的な空中公園。のんびり散策に最適です。"
      },
      {
        spot_id: "spot-zettaiidol-santamonica",
        short_commentary: "原宿へ歩いて移動し、MVに登場したクレープ店へ。メンバーと同じクレープを食べて聖地巡礼を締めくくり！"
      }
    ],
    external_map_url: "https://maps.google.com/?q=渋谷MIYASHITAPARK",
    notes: "歩きやすい靴で参加することをおすすめします。実践女子大学は現役のキャンパスですので、敷地内への無断立ち入りはご遠慮ください。",
    related_groups: ["=LOVE"],
    related_songs: ["この空がトリガー", "絶対アイドル辞めないで"],
    cafe_spots: ["MIYASHITA PARK内のスターバックス", "原宿明治通り沿いのカフェ"],
    status: "published"
  },
  {
    slug: "omori-trigger-deep",
    name: "『この空がトリガー』大森聖地ディープ巡礼コース",
    duration: "約3時間",
    transportation: "徒歩・電車",
    recommended_time: "ランチタイム（11:30〜15:00）",
    spots: [
      {
        spot_id: "spot-trigger-kiraku",
        short_commentary: "まずはランチ！MVでメンバーがラーメンを食べていた「喜楽」で、美味しいラーメンや定食を堪能します。"
      },
      {
        spot_id: "spot-trigger-veille",
        short_commentary: "大人っぽい雰囲気のシーンで使われたBar VEILLE。周辺を散策してロケ地の空気感を感じてみましょう。"
      },
      {
        spot_id: "spot-trigger-spbs",
        short_commentary: "メンバーが本を読んでいたオシャレなブックショップ。本を探しながら、ゆっくりとした時間を過ごします。"
      }
    ],
    external_map_url: "https://maps.google.com/?q=大森駅",
    notes: "喜楽はランチタイムに混雑することがありますので、時間に余裕を持ってお出かけください。",
    related_groups: ["=LOVE"],
    related_songs: ["この空がトリガー"],
    cafe_spots: ["大森駅近くの純喫茶", "SPBS周辺のコーヒースタンド"],
    status: "published"
  },
  {
    slug: "mahoroba-asterisk-tamura",
    name: "≠ME『まほろばアスタリスク』滝根・あぶくま洞巡礼コース",
    duration: "約40分",
    transportation: "徒歩",
    recommended_time: "午前中または夕方（星空を楽しむなら夕暮れ以降）",
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
    external_map_url: "https://maps.google.com/?q=星の村天文台",
    notes: "星の村天文台とあぶくま洞は山間部に位置するため、悪天候時や冬季・積雪時の移動は足元に十分ご注意ください。天文台は現役の施設ですので営業ルールを守って見学してください。",
    related_groups: ["≠ME"],
    related_songs: ["まほろばアスタリスク"],
    cafe_spots: ["あぶくま洞売店", "星の村天文台周辺の自動販売機"],
    status: "published"
  }
];

export const coursesDb = {
  getCourses(): Course[] {
    const data = localStorage.getItem('tdm_courses');
    if (!data) {
      localStorage.setItem('tdm_courses', JSON.stringify(INITIAL_COURSES));
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
            val.slug !== parsedVal.slug ||
            val.name !== parsedVal.name ||
            val.spots.length !== parsedVal.spots.length ||
            val.spots.some((s, idx) => s.spot_id !== parsedVal.spots[idx]?.spot_id)
          );
        })
      ) {
        localStorage.setItem('tdm_courses', JSON.stringify(INITIAL_COURSES));
        return INITIAL_COURSES;
      }
      return parsed;
    } catch (e) {
      localStorage.setItem('tdm_courses', JSON.stringify(INITIAL_COURSES));
      return INITIAL_COURSES;
    }
  },
  setCourses(courses: Course[]): void {
    localStorage.setItem('tdm_courses', JSON.stringify(courses));
  }
};
