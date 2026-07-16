import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CategoryModal from "./_components/CategoryModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { deleteCategory } from "./actions";

export default async function CategoriesPage() {
  const supabase = createClient();

  const [
    { data: categories },
    { data: procedures },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at"),
    supabase.from("procedures").select("category_id").eq("is_deleted", false),
    supabase.auth.getUser(),
  ]);

  const isLoggedIn = !!user;

  // 使用中カテゴリは削除させないため、カテゴリごとの手順書件数を数えておく
  const usageCount = new Map<string, number>();
  for (const procedure of procedures ?? []) {
    if (!procedure.category_id) continue;
    usageCount.set(
      procedure.category_id,
      (usageCount.get(procedure.category_id) ?? 0) + 1,
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        ← 一覧に戻る
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">カテゴリ管理</h1>
        {isLoggedIn && (
          <CategoryModal mode="create">
            <button className="bg-[#2d6a4f] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#255c43] transition-colors">
              + カテゴリを追加
            </button>
          </CategoryModal>
        )}
      </div>

      {!categories || categories.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          カテゴリがまだありません。
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {categories.map((category) => {
            const count = usageCount.get(category.id) ?? 0;

            return (
              <li
                key={category.id}
                className="flex items-start justify-between rounded-lg border border-border bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium">{category.name}</p>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {category.description}
                    </p>
                  )}
                  {count > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {count}件の手順書で使用中
                    </p>
                  )}
                </div>

                {isLoggedIn && (
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <CategoryModal mode="edit" category={category}>
                      <button className="text-sm px-3 py-1 rounded border border-border hover:bg-gray-50 transition-colors">
                        編集
                      </button>
                    </CategoryModal>

                    {count > 0 ? (
                      <button
                        type="button"
                        disabled
                        title="このカテゴリを使用している手順書があるため削除できません"
                        className="text-sm px-3 py-1 rounded border border-border text-muted-foreground opacity-50 cursor-not-allowed"
                      >
                        削除
                      </button>
                    ) : (
                      <ConfirmDialog
                        title="カテゴリを削除しますか？"
                        description={`「${category.name}」を削除します。この操作は取り消せません。`}
                        confirmLabel="削除する"
                        action={deleteCategory}
                        hiddenFields={{ id: category.id }}
                      >
                        <button className="text-sm px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                          削除
                        </button>
                      </ConfirmDialog>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
