import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import {
  MAX_IMPORT_FILE_SIZE,
  MAX_IMPORT_FILE_SIZE_MESSAGE,
} from "@/lib/import-limits";

/** 値は要素の内容としてのみ埋めるので & < > で足りる（属性には一切出力しない） */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Excel を手順書本文用の HTML に変換する。
 *
 * XLSX.utils.sheet_to_html() を使うと短く書けるが、あちらは data-v 属性に
 * セル値を素で埋めるため、`" onmouseover="…` のような値で属性から抜け出せる
 * （検証済み）。ここでは属性を一切出力せず、内容だけをエスケープして組み立てる。
 * TipTap のサニタイズに頼らず、この時点で安全な HTML にしておく。
 */
function excelToHtml(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const parts: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      defval: "",
    });
    // Excel は区切りに空行を使うことが多く、そのまま表にすると空セルの行が残る
    const nonEmptyRows = rows.filter((row) =>
      row.some((cell) => String(cell).trim() !== ""),
    );

    if (nonEmptyRows.length === 0) continue;

    if (workbook.SheetNames.length > 1) {
      parts.push(`<h2>${escapeHtml(sheetName)}</h2>`);
    }

    const colCount = Math.max(...nonEmptyRows.map((r) => r.length));

    if (colCount <= 1) {
      for (const row of nonEmptyRows) {
        const cell = escapeHtml(String(row[0] ?? "").trim());
        if (cell) parts.push(`<p>${cell}</p>`);
      }
    } else {
      parts.push("<table>");
      for (const row of nonEmptyRows) {
        const cells = Array.from({ length: colCount }, (_, i) =>
          escapeHtml(String(row[i] ?? "").trim()),
        );
        parts.push(`<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`);
      }
      parts.push("</table>");
    }
  }

  return parts.join("\n");
}

export async function POST(request: Request) {
  // 1. 認証。パースは CPU とメモリを食うので、未ログインは何も読まずに弾く
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 });
  }

  // 2. Content-Length で事前判定。formData() まで進むと巨大なボディを展開済みになる
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_IMPORT_FILE_SIZE) {
    return Response.json(
      { error: MAX_IMPORT_FILE_SIZE_MESSAGE },
      { status: 413 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json(
      { error: "ファイルが見つかりません" },
      { status: 400 },
    );
  }

  // 3. Content-Length は欠落も偽装もあり得るため、実サイズでも確認する
  if (file.size > MAX_IMPORT_FILE_SIZE) {
    return Response.json(
      { error: MAX_IMPORT_FILE_SIZE_MESSAGE },
      { status: 413 },
    );
  }

  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".docx")) {
    const result = await mammoth.convertToHtml({ buffer });
    return Response.json({ html: result.value });
  }

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const html = excelToHtml(buffer);
    return Response.json({ html });
  }

  return Response.json(
    {
      error:
        "Word（.docx）またはExcel（.xlsx / .xls）ファイルを選択してください",
    },
    { status: 400 },
  );
}
