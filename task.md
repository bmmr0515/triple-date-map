# 🛠️ 富士急コラム差し替え & アスタリスク完全排除 TODOリスト

- [x] **1. UIコンポーネントのHTMLパース対応**
  - [x] `src/components/ArticleViews.tsx` 内の `parseContentToReact` の描画処理を `dangerouslySetInnerHTML` 形式に修正する
- [x] **2. 記事データの更新とアスタリスク排除**
  - [x] `src/articles.ts` の富士急ハイランド記事を、提供された新原稿へ全面的に差し替え、アスタリスクを `<strong>` タグに変更する
  - [x] `src/articles.ts` のこの空がトリガー記事からもアスタリスクを完全に排除し、`<strong>` タグに変更する
- [x] **3. 動作確認 & ビルド検証**
  - [x] ビルドを実行してコンパイルとプリレンダリングが正常終了するか確認する
  - [x] `walkthrough.md` を作成して変更内容をまとめる
