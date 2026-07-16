"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import {
  SESSION_EXPIRED_MESSAGE,
  type ActionResult,
} from "@/lib/action-result";

export async function createCategory(
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get("name");
  const description = formData.get("description") ?? "";

  if (typeof name !== "string" || name.trim() === "") {
    return { ok: false, message: "カテゴリ名を入力してください" };
  }
  if (typeof description !== "string") {
    return { ok: false, message: "説明の形式が不正です" };
  }

  const { supabase, user } = await getAuth();
  if (!user) return { ok: false, message: SESSION_EXPIRED_MESSAGE };

  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      name: name.trim(),
      description,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error || !category) {
    return { ok: false, message: "カテゴリの作成に失敗しました" };
  }

  await supabase.from("category_histories").insert({
    category_id: category.id,
    name: category.name,
    description: category.description,
    changed_by: user.id,
    action: "created",
  });

  // カテゴリ名は一覧のフィルタ・カード・手順書詳細・新規作成/編集のセレクトと
  // 5画面に散っているため、個別列挙より layout 単位でまとめて再検証する。
  // カテゴリの変更は頻度が低く、取りこぼしの方が痛い。
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateCategory(
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id");
  const name = formData.get("name");
  const description = formData.get("description") ?? "";

  if (typeof id !== "string") {
    return { ok: false, message: "不正なリクエストです" };
  }
  if (typeof name !== "string" || name.trim() === "") {
    return { ok: false, message: "カテゴリ名を入力してください" };
  }
  if (typeof description !== "string") {
    return { ok: false, message: "説明の形式が不正です" };
  }

  const { supabase, user } = await getAuth();
  if (!user) return { ok: false, message: SESSION_EXPIRED_MESSAGE };

  const { data: category, error } = await supabase
    .from("categories")
    .update({
      name: name.trim(),
      description,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("is_deleted", false)
    .select()
    .single();

  if (error || !category) {
    return { ok: false, message: "カテゴリの更新に失敗しました" };
  }

  await supabase.from("category_histories").insert({
    category_id: category.id,
    name: category.name,
    description: category.description,
    changed_by: user.id,
    action: "updated",
  });

  // カテゴリ名は一覧のフィルタ・カード・手順書詳細・新規作成/編集のセレクトと
  // 5画面に散っているため、個別列挙より layout 単位でまとめて再検証する。
  // カテゴリの変更は頻度が低く、取りこぼしの方が痛い。
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCategory(
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id");
  if (typeof id !== "string") {
    return { ok: false, message: "不正なリクエストです" };
  }

  const { supabase, user } = await getAuth();
  if (!user) return { ok: false, message: SESSION_EXPIRED_MESSAGE };

  // 使用中カテゴリを削除すると手順書の category_id が宙に浮くため、UI のボタン無効化とは別にここでも防ぐ
  const { count, error: usageError } = await supabase
    .from("procedures")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)
    .eq("is_deleted", false);

  if (usageError) {
    return { ok: false, message: "カテゴリの使用状況を確認できませんでした" };
  }
  if ((count ?? 0) > 0) {
    return {
      ok: false,
      message: `このカテゴリは${count}件の手順書で使用中のため削除できません`,
    };
  }

  const { data: category, error } = await supabase
    .from("categories")
    .update({
      is_deleted: true,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("is_deleted", false)
    .select()
    .single();

  if (error || !category) {
    return { ok: false, message: "カテゴリの削除に失敗しました" };
  }

  await supabase.from("category_histories").insert({
    category_id: category.id,
    name: category.name,
    description: category.description,
    changed_by: user.id,
    action: "deleted",
  });

  // カテゴリ名は一覧のフィルタ・カード・手順書詳細・新規作成/編集のセレクトと
  // 5画面に散っているため、個別列挙より layout 単位でまとめて再検証する。
  // カテゴリの変更は頻度が低く、取りこぼしの方が痛い。
  revalidatePath("/", "layout");
  return { ok: true };
}
