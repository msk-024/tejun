"use client";

import { useEffect } from "react";
import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    // 本番では error.message は伏せられるため、原因追跡には digest をログ基盤側で突き合わせる
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="rounded-lg border border-border bg-white px-6 py-8 text-center">
        <h1 className="text-xl font-bold mb-2">エラーが発生しました</h1>
        <p className="text-sm text-muted-foreground mb-6">
          処理を完了できませんでした。時間をおいて再度お試しください。
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground mb-6">
            エラーID: <code className="font-mono">{error.digest}</code>
          </p>
        )}

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="bg-[#2d6a4f] text-white rounded-md px-5 py-2 text-sm font-medium hover:bg-[#255c43] transition-colors"
          >
            もう一度試す
          </button>
          <Link
            href="/"
            className="rounded-md border border-border px-5 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            手順書一覧へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
