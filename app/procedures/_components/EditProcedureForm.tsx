"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProcedure } from "@/app/procedures/actions";
import MarkdownEditor from "./MarkdownEditor";
import type { Category, Procedure } from "@/lib/types";

type Props = {
  procedure: Procedure;
  categories: Category[];
};

export default function EditProcedureForm({ procedure, categories }: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setSubmitError("");
    startTransition(async () => {
      try {
        const result = await updateProcedure(formData);
        if (!result.ok) {
          setSubmitError(result.message);
          return;
        }
        // アクション側は redirect() せず遷移先を返す（他アクションと同じ方式）
        if (result.redirectTo) router.push(result.redirectTo);
      } catch {
        setSubmitError("保存に失敗しました。時間をおいて再度お試しください。");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={procedure.id} />

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={procedure.title}
          className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="category_id" className="text-sm font-medium">
          カテゴリ
        </label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={procedure.category_id ?? ""}
          className="border border-border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
        >
          <option value="">カテゴリなし</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">本文</label>
        <MarkdownEditor name="content" defaultValue={procedure.content ?? ""} />
      </div>

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {submitError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#2d6a4f] text-white rounded-md px-5 py-2 text-sm font-medium hover:bg-[#255c43] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "保存中…" : "保存する"}
        </button>
        <a
          href={`/procedures/${procedure.id}`}
          className="rounded-md border border-border px-5 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </a>
      </div>
    </form>
  );
}
