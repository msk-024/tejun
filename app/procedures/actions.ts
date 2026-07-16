"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import {
  SESSION_EXPIRED_MESSAGE,
  type ActionResult,
} from "@/lib/action-result";

/** 未ログインなら /login へ飛ばす。throw 系のアクションから使う */
async function requireAuth() {
  const { supabase, user } = await getAuth();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

export async function createProcedure(formData: FormData) {
  const title = formData.get("title");
  const content = formData.get("content") ?? "";
  const categoryIdRaw = formData.get("category_id");

  if (typeof title !== "string" || title.trim() === "") return;
  if (typeof content !== "string") return;

  const category_id =
    typeof categoryIdRaw === "string" && categoryIdRaw !== ""
      ? categoryIdRaw
      : null;

  const { supabase, userId } = await requireAuth();

  const { data: procedure, error } = await supabase
    .from("procedures")
    .insert({
      title: title.trim(),
      content,
      category_id,
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single();

  if (error || !procedure)
    throw new Error(error?.message ?? "手順書の作成に失敗しました");

  await supabase.from("procedure_histories").insert({
    procedure_id: procedure.id,
    title: procedure.title,
    content: procedure.content,
    category_id: procedure.category_id,
    changed_by: userId,
    action: "created",
  });

  revalidatePath("/");
  redirect(`/procedures/${procedure.id}`);
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

  await supabase.from("procedure_histories").insert({
    procedure_id: procedure.id,
    title: procedure.title,
    content: procedure.content,
    category_id: procedure.category_id,
    changed_by: user.id,
    action: "deleted",
  });

  revalidatePath("/");
  revalidatePath(`/procedures/${procedure.id}`);
  revalidatePath(`/procedures/${procedure.id}/history`);
  return { ok: true, redirectTo: "/" };
}

export async function updateProcedure(formData: FormData) {
  const id = formData.get("id");
  const title = formData.get("title");
  const content = formData.get("content") ?? "";
  const categoryIdRaw = formData.get("category_id");

  if (typeof id !== "string") return;
  if (typeof title !== "string" || title.trim() === "") return;
  if (typeof content !== "string") return;

  const category_id =
    typeof categoryIdRaw === "string" && categoryIdRaw !== ""
      ? categoryIdRaw
      : null;

  const { supabase, userId } = await requireAuth();

  const { data: procedure, error } = await supabase
    .from("procedures")
    .update({
      title: title.trim(),
      content,
      category_id,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !procedure)
    throw new Error(error?.message ?? "手順書の更新に失敗しました");

  await supabase.from("procedure_histories").insert({
    procedure_id: procedure.id,
    title: procedure.title,
    content: procedure.content,
    category_id: procedure.category_id,
    changed_by: userId,
    action: "updated",
  });

  // 一覧はタイトルと更新日時を、履歴ページは今 INSERT した行を表示するため両方古くなる
  revalidatePath("/");
  revalidatePath(`/procedures/${id}`);
  revalidatePath(`/procedures/${id}/history`);
  redirect(`/procedures/${id}`);
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

  await supabase.from("procedure_histories").insert({
    procedure_id: duplicate.id,
    title: duplicate.title,
    content: duplicate.content,
    category_id: duplicate.category_id,
    changed_by: user.id,
    action: "created",
  });

  revalidatePath("/");
  return { ok: true, redirectTo: `/procedures/${duplicate.id}/edit` };
}
