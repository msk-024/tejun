"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/lib/auth";
import {
  SESSION_EXPIRED_MESSAGE,
  type ActionResult,
} from "@/lib/action-result";

export async function createProcedure(
  formData: FormData,
): Promise<ActionResult> {
  const title = formData.get("title");
  const content = formData.get("content") ?? "";
  const categoryIdRaw = formData.get("category_id");

  if (typeof title !== "string" || title.trim() === "") {
    return { ok: false, message: "タイトルを入力してください" };
  }
  if (typeof content !== "string") {
    return { ok: false, message: "本文の形式が不正です" };
  }

  const category_id =
    typeof categoryIdRaw === "string" && categoryIdRaw !== ""
      ? categoryIdRaw
      : null;

  const { supabase, user } = await getAuth();
  if (!user) return { ok: false, message: SESSION_EXPIRED_MESSAGE };

  const { data: procedure, error } = await supabase
    .from("procedures")
    .insert({
      title: title.trim(),
      content,
      category_id,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error || !procedure) {
    return { ok: false, message: "手順書の作成に失敗しました" };
  }

  // 履歴は procedures のトリガーが自動記録する（PLAN.md / migrations 参照）

  revalidatePath("/");
  return { ok: true, redirectTo: `/procedures/${procedure.id}` };
}

export async function deleteProcedure(
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id");
  if (typeof id !== "string")
    return { ok: false, message: "不正なリクエストです" };

  const { supabase, user } = await getAuth();
  if (!user) return { ok: false, message: SESSION_EXPIRED_MESSAGE };

  const { data: procedure, error } = await supabase
    .from("procedures")
    .update({
      is_deleted: true,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("is_deleted", false)
    .select()
    .single();

  if (error || !procedure) {
    return { ok: false, message: "手順書の削除に失敗しました" };
  }

  // 履歴は procedures のトリガーが自動記録する

  revalidatePath("/");
  revalidatePath(`/procedures/${procedure.id}`);
  revalidatePath(`/procedures/${procedure.id}/history`);
  return { ok: true, redirectTo: "/" };
}

export async function updateProcedure(
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id");
  const title = formData.get("title");
  const content = formData.get("content") ?? "";
  const categoryIdRaw = formData.get("category_id");

  if (typeof id !== "string") {
    return { ok: false, message: "不正なリクエストです" };
  }
  if (typeof title !== "string" || title.trim() === "") {
    return { ok: false, message: "タイトルを入力してください" };
  }
  if (typeof content !== "string") {
    return { ok: false, message: "本文の形式が不正です" };
  }

  const category_id =
    typeof categoryIdRaw === "string" && categoryIdRaw !== ""
      ? categoryIdRaw
      : null;

  const { supabase, user } = await getAuth();
  if (!user) return { ok: false, message: SESSION_EXPIRED_MESSAGE };

  const { data: procedure, error } = await supabase
    .from("procedures")
    .update({
      title: title.trim(),
      content,
      category_id,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("is_deleted", false)
    .select()
    .single();

  if (error || !procedure) {
    return { ok: false, message: "手順書の更新に失敗しました" };
  }

  // 履歴は procedures のトリガーが自動記録する

  // 一覧はタイトルと更新日時を、履歴ページは今記録された行を表示するため両方古くなる
  revalidatePath("/");
  revalidatePath(`/procedures/${id}`);
  revalidatePath(`/procedures/${id}/history`);
  return { ok: true, redirectTo: `/procedures/${id}` };
}

export async function duplicateProcedure(
  formData: FormData,
): Promise<ActionResult> {
  const id = formData.get("id");
  if (typeof id !== "string")
    return { ok: false, message: "不正なリクエストです" };

  const { supabase, user } = await getAuth();
  if (!user) return { ok: false, message: SESSION_EXPIRED_MESSAGE };

  const { data: original, error } = await supabase
    .from("procedures")
    .select("*")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (error || !original) {
    return { ok: false, message: "複製元の手順書が見つかりません" };
  }

  const { data: duplicate, error: dupError } = await supabase
    .from("procedures")
    .insert({
      title: `${original.title}（コピー）`,
      content: original.content,
      category_id: original.category_id,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (dupError || !duplicate) {
    return { ok: false, message: "複製に失敗しました" };
  }

  // 履歴は procedures のトリガーが自動記録する

  revalidatePath("/");
  return { ok: true, redirectTo: `/procedures/${duplicate.id}/edit` };
}
