# Tejun（てじゅん）

看護師向け手順書管理アプリ。手順書・カテゴリの作成、編集、変更履歴の管理ができます。

## 特徴

- 手順書の閲覧は未ログインでも可能
- ログイン済みユーザーは手順書・カテゴリの作成・編集・削除（論理削除）が可能
- 変更時は履歴テーブルに自動で記録され、改ざん防止のため履歴は更新・削除されない

## スタック

- [Next.js 14](https://nextjs.org)（App Router）
- [Tailwind CSS](https://tailwindcss.com) / [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com)（DB / Auth）

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、Supabase プロジェクトの URL と Publishable key を設定してください。

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 3. Supabase のテーブル・RLS ポリシーを準備

Supabase の SQL Editor で以下のテーブルを作成し、RLS ポリシーと権限（GRANT）を設定してください。

- `categories` / `category_histories`
- `procedures` / `procedure_histories`

各テーブルの定義は [`lib/types.ts`](lib/types.ts) を参照してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) で確認できます。

## ディレクトリ構成

```
app/
├── actions/        # 複数ページで共有する Server Actions（認証など）
├── categories/     # カテゴリ管理ページ・専用コンポーネント・Actions
├── login/          # ログインページ
└── page.tsx        # トップページ
components/         # 複数ページで共有するコンポーネント
lib/
├── supabase/       # Supabase クライアント（ブラウザ用・サーバー用）
└── types.ts        # DB 型定義
middleware.ts       # Supabase Auth セッション管理
```

## スクリプト

```bash
npm run dev        # 開発サーバー起動
npm run build      # 本番ビルド
npm run lint       # Lint 実行
```
