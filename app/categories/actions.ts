"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  SESSION_EXPIRED_MESSAGE,
  type ActionResult,
} from "@/lib/action-result";

/** redirect しない認証取得。NEXT_REDIRECT を投げないので呼び出し側で try/catch できる */
async function getAuth() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

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

  revalidatePath("/categories");
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

  revalidatePath("/categories");
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

  revalidatePath("/categories");
  return { ok: true };
}
