"use client";

import { useRef, useState } from "react";
import { createProcedure } from "@/app/procedures/actions";
import MarkdownEditor from "./MarkdownEditor";
import { PROCEDURE_TEMPLATES } from "./templates";
import {
  MAX_IMPORT_FILE_SIZE,
  MAX_IMPORT_FILE_SIZE_MESSAGE,
} from "@/lib/import-limits";
import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
};

export default function NewProcedureForm({ categories }: Props) {
  const [editorKey, setEditorKey] = useState(0);
  const [defaultContent, setDefaultContent] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleTemplateSelect(content: string) {
    setDefaultContent(content);
    setEditorKey((k) => k + 1);
  }

  async function handleWordImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 送る前に弾く。サーバー側でも同じ上限で防いでいるので、こちらはUXのための先回り
    if (file.size > MAX_IMPORT_FILE_SIZE) {
      setImportError(MAX_IMPORT_FILE_SIZE_MESSAGE);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsImporting(true);
    setImportError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/import/word", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setImportError(data.error ?? "インポートに失敗しました");
        return;
      }

      setDefaultContent(data.html);
      setEditorKey((k) => k + 1);
    } catch {
      setImportError("ファイルの読み込みに失敗しました");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <form action={createProcedure} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md border border-border">
        <p className="text-xs font-medium text-muted-foreground">
          テンプレートから始める（任意）
        </p>
        <div className="flex flex-wrap gap-2">
          {PROCEDURE_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleTemplateSelect(template.content)}
              className="text-xs px-3 py-1.5 rounded-md border border-[#2d6a4f] text-[#2d6a4f] hover:bg-[#2d6a4f]/10 transition-colors"
            >
              {template.name}
            </button>
          ))}
        </div>

        <div className="border-t border-border pt-2 mt-1">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            既存ファイルから取り込む（任意）
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.xlsx,.xls"
              onChange={handleWordImport}
              className="hidden"
              id="word-import"
            />
            <label
              htmlFor="word-import"
              className={`text-xs px-3 py-1.5 rounded-md border border-border bg-white cursor-pointer hover:bg-gray-50 transition-colors ${isImporting ? "opacity-50 pointer-events-none" : ""}`}
            >
              {isImporting ? "読み込み中…" : "ファイルを選択"}
            </label>
            <span className="text-xs text-muted-foreground">
              Word・Excel ファイルに対応
            </span>
          </div>
          {importError && (
            <p className="text-xs text-red-500 mt-1">{importError}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
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
          defaultValue=""
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
        <MarkdownEditor
          key={editorKey}
          name="content"
          defaultValue={defaultContent}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-[#2d6a4f] text-white rounded-md px-5 py-2 text-sm font-medium hover:bg-[#255c43] transition-colors"
        >
          作成する
        </button>
        {/* 新規作成なので戻り先の手順書はまだ無い。一覧へ戻す */}
        <a
          href="/"
          className="rounded-md border border-border px-5 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </a>
      </div>
    </form>
  );
}
