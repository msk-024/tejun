# TEJUN（てじゅん）

看護師向け手順書・マニュアル管理アプリ。  
作成・編集・変更履歴の管理を、チーム全員がブラウザからいつでも確認できます。

## 特徴

- **閲覧は誰でも可能** — 未ログインでも手順書を読める（URLを共有するだけでOK）
- **変更履歴を完全保存** — 誰が・いつ・何を変えたかが一目でわかる。履歴の改ざんは構造上不可能
- **差分表示（Diff）** — 前バージョンとの変更箇所を緑・赤でハイライト
- **WYSIWYGエディタ** — Markdown を知らなくても書ける（TipTap）
- **テンプレート付き** — 処置手順・薬剤投与・観察手順・緊急時対応（SBAR）
- **既存ファイルの取り込み** — Word（.docx）・Excel（.xlsx）をそのままインポート
- **カテゴリ管理** — 部署・手技ごとに分類可能
- **全文検索** — タイトル・本文を横断検索
- **印刷・PDF出力** — ヘッダー・ボタン類を非表示にした印刷専用レイアウト
- **複製機能** — 似た手順書を素早く量産
- **AI 質問パネル** — 手順書ページ右側のチャット（準備中）
- **スマートフォン対応** — モバイルでも崩れないレスポンシブデザイン

## スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | [Next.js 14](https://nextjs.org)（App Router） |
| スタイリング | [Tailwind CSS](https://tailwindcss.com) / [shadcn/ui](https://ui.shadcn.com) |
| DB / Auth | [Supabase](https://supabase.com) |
| エディタ | [TipTap](https://tiptap.dev)（tiptap-markdown） |
| Diff | [diff](https://www.npmjs.com/package/diff) |
| ファイル変換 | [mammoth](https://www.npmjs.com/package/mammoth)（Word）/ [xlsx](https://www.npmjs.com/package/xlsx)（Excel） |
| アイコン | [Lucide React](https://lucide.dev) |

## セットアップ

詳細は `TEJUN-BUILD-GUIDE.md` を参照してください。ゼロからのセットアップ手順を全てのコードと共に記載しています。

### クイックスタート

```bash
# 1. 依存パッケージのインストール
npm install

# 2. 環境変数の設定
cp .env.local.example .env.local
# .env.local に Supabase の URL と anon キーを設定

# 3. 開発サーバーの起動
npm run dev
```

[http://localhost:3000](http://localhost:3000) で確認できます。

### 必要な Supabase 設定

1. `categories` / `category_histories` / `procedures` / `procedure_histories` テーブルの作成
2. RLS ポリシーと GRANT の設定
3. Authentication > Users でユーザーを作成

SQL は `TEJUN-BUILD-GUIDE.md` のセクション2を参照してください。

## ディレクトリ構成

```
app/
├── actions/auth.ts           # 認証アクション
├── api/
│   ├── ai/ask/               # AI質問エンドポイント（モック）
│   └── import/word/          # Word/Excelインポート
├── categories/               # カテゴリ管理
├── login/                    # ログインページ
├── procedures/
│   ├── _components/          # 手順書専用コンポーネント
│   ├── [id]/edit/            # 編集ページ
│   ├── [id]/history/         # 変更履歴ページ
│   ├── [id]/                 # 詳細ページ
│   ├── new/                  # 新規作成ページ
│   └── actions.ts            # 手順書Server Actions
└── page.tsx                  # 一覧ページ（トップ）
components/                   # 共有コンポーネント
lib/
├── supabase/                 # Supabaseクライアント
└── types.ts                  # DB型定義
middleware.ts                 # セッション管理
```

## スクリプト

```bash
npm run dev        # 開発サーバー起動
npm run build      # 本番ビルド
npm run lint       # Lint 実行
npm run typecheck  # 型チェック
```

## 設計方針

- 手順書の**閲覧・AI質問は未ログインでも可能**（URLを知っていれば誰でも読める）
- 変更時は **histories テーブルへの同時 INSERT** を必須とする（履歴の欠損を防ぐ）
- 削除は**論理削除のみ**（`is_deleted: true`）。物理削除は行わない
- `procedure_histories` / `category_histories` は **INSERT のみ**。UPDATE・DELETE は RLS で禁止（改ざん防止）
