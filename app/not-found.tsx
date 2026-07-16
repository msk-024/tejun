import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="rounded-lg border border-border bg-white px-6 py-8 text-center">
        <h1 className="text-xl font-bold mb-2">ページが見つかりません</h1>
        <p className="text-sm text-muted-foreground mb-6">
          お探しの手順書は削除されたか、URLが変更された可能性があります。
        </p>

        <Link
          href="/"
          className="inline-block bg-[#2d6a4f] text-white rounded-md px-5 py-2 text-sm font-medium hover:bg-[#255c43] transition-colors"
        >
          手順書一覧へ戻る
        </Link>
      </div>
    </main>
  );
}
