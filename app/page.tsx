import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProcedureCard from "@/app/procedures/_components/ProcedureCard";
import type { Category } from "@/lib/types";

type Props = {
  searchParams: { category?: string; q?: string };
};

/**
 * 検索キーワードを PostgREST の or() に安全に埋め込める形にする。
 *
 * or() の中身はカンマ区切りの条件リストとして解釈されるため、値を素で連結すると
 * キーワードに含まれるカンマで条件を追加注入できてしまう。値をダブルクォートで
 * 囲むとカンマが区切りとして扱われなくなる。
 *
 * エスケープは2層あり、順序が重要:
 *   1. ILIKE のワイルドカード（% _）を打ち消す。バックスラッシュ自身が先。
 *   2. PostgREST のダブルクォート文字列として \ と " を退避する。
 *
 * 既知の制限: PostgREST は ilike の値に含まれる * を % に変換する仕様のため、
 * * だけはワイルドカードとして働く（クォートしても抑止できない）。条件の注入は
 * できないのでセキュリティ上の問題はない。厳密に literal 検索したい場合は
 * Postgres 関数（RPC）に逃がす必要がある。
 */
function toSearchPattern(keyword: string): string {
  const ilikePattern =
    "%" +
    keyword.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_") +
    "%";

  const quoted = ilikePattern.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  return `"${quoted}"`;
}

export default async function Home({ searchParams }: Props) {
  const supabase = createClient();
  const categoryId = searchParams.category ?? "";
  const keyword = searchParams.q?.trim() ?? "";

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at");

  let query = supabase
    .from("procedures")
    .select("*")
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false });

  if (categoryId) query = query.eq("category_id", categoryId);
  if (keyword) {
    const pattern = toSearchPattern(keyword);
    query = query.or(`title.ilike.${pattern},content.ilike.${pattern}`);
  }

  const { data: procedures } = await query;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const categoryMap = new Map<string, Category>(
    (categories ?? []).map((c) => [c.id, c]),
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">手順書一覧</h1>
        {user && (
          <div className="flex items-center gap-2">
            <Link
              href="/categories"
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              カテゴリ管理
            </Link>
            <Link
              href="/procedures/new"
              className="bg-[#2d6a4f] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#255c43] transition-colors"
            >
              + 新規作成
            </Link>
          </div>
        )}
      </div>

      <form className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          name="category"
          defaultValue={categoryId}
          className="border border-border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
        >
          <option value="">すべてのカテゴリ</option>
          {(categories ?? []).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="q"
          placeholder="タイトル・本文で検索"
          defaultValue={keyword}
          className="flex-1 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
        />

        <button
          type="submit"
          className="bg-[#2d6a4f] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#255c43] transition-colors"
        >
          検索
        </button>
      </form>

      {!procedures || procedures.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          該当する手順書がありません。
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {procedures.map((procedure) => (
            <li key={procedure.id}>
              <ProcedureCard
                procedure={procedure}
                category={
                  procedure.category_id
                    ? (categoryMap.get(procedure.category_id) ?? null)
                    : null
                }
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
