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
      return JSON.parse(data) as Course[];
    } catch (e) {
      return INITIAL_COURSES;
    }
  },
  setCourses(courses: Course[]): void {
    localStorage.setItem('tdm_courses', JSON.stringify(courses));
  }
};
