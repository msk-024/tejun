"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCategory, updateCategory } from "../actions";
import type { Category } from "@/lib/types";

type Props =
  | { mode: "create"; children: React.ReactElement }
  | { mode: "edit"; category: Category; children: React.ReactElement };

export default function CategoryModal(props: Props) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const isEdit = props.mode === "edit";

  function changeOpen(next: boolean) {
    setErrorMessage("");
    setOpen(next);
  }

  function handleSubmit(formData: FormData) {
    setErrorMessage("");

    startTransition(async () => {
      try {
        const result = isEdit
          ? await updateCategory(formData)
          : await createCategory(formData);

        if (!result.ok) {
          setErrorMessage(result.message);
          return;
        }

        setOpen(false);
      } catch {
        setErrorMessage("保存に失敗しました。時間をおいて再度お試しください。");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger render={props.children} />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "カテゴリを編集" : "カテゴリを追加"}
          </DialogTitle>
        </DialogHeader>

        {errorMessage && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-2">
            {errorMessage}
          </p>
        )}

        <form action={handleSubmit} className="flex flex-col gap-4 mt-2">
          {isEdit && (
            <input type="hidden" name="id" value={props.category.id} />
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              カテゴリ名 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={isEdit ? props.category.name : ""}
              className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-medium">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={isEdit ? props.category.description : ""}
              className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#2d6a4f] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#255c43] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "処理中..." : isEdit ? "更新する" : "追加する"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
