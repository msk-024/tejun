"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

// ルートレイアウト自体が落ちた場合の最終防衛線。layout.tsx を置き換えるため html/body を自前で持つ
export default function GlobalError({ error, reset }: Props) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <main className="max-w-3xl mx-auto px-4 py-16">
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-8 text-center">
            <h1 className="text-xl font-bold mb-2">エラーが発生しました</h1>
            <p className="text-sm text-gray-500 mb-6">
              アプリケーションを表示できませんでした。時間をおいて再度お試しください。
            </p>

            {error.digest && (
              <p className="text-xs text-gray-500 mb-6">
                エラーID: <code className="font-mono">{error.digest}</code>
              </p>
            )}

            <button
              type="button"
              onClick={reset}
              className="bg-[#2d6a4f] text-white rounded-md px-5 py-2 text-sm font-medium hover:bg-[#255c43] transition-colors"
            >
              もう一度試す
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
