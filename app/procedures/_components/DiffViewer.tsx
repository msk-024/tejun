"use client";

import { diffLines } from "diff";

type Props = {
  oldContent: string;
  newContent: string;
};

type LineType = "add" | "del" | "context";
type Row =
  | { kind: "line"; type: LineType; text: string }
  | { kind: "gap"; count: number };

/** 変更行の前後に残す文脈行数 */
const CONTEXT = 3;

/**
 * 差分を GitHub 風に畳む。
 * 変更行とその前後 CONTEXT 行だけを残し、変更から離れた行は「N行省略」にまとめる。
 * 長い手順書で1行だけ直したときに全文が出るのを防ぐ。
 */
function buildRows(oldContent: string, newContent: string): Row[] {
  const changes = diffLines(oldContent, newContent);

  const lines: { type: LineType; text: string }[] = [];
  for (const change of changes) {
    const parts = change.value.split("\n");
    // 末尾の改行が生む空要素は捨てる
    const filtered =
      parts[parts.length - 1] === "" ? parts.slice(0, -1) : parts;
    const type: LineType = change.added
      ? "add"
      : change.removed
        ? "del"
        : "context";
    for (const text of filtered) lines.push({ type, text });
  }

  // 変更行の周辺 CONTEXT 行を「表示」にマークする
  const visible = new Array<boolean>(lines.length).fill(false);
  lines.forEach((line, i) => {
    if (line.type === "context") return;
    const from = Math.max(0, i - CONTEXT);
    const to = Math.min(lines.length - 1, i + CONTEXT);
    for (let j = from; j <= to; j++) visible[j] = true;
  });

  // 非表示の連続を1つの gap に畳む。ただし1行だけなら畳まずそのまま出す
  const rows: Row[] = [];
  let i = 0;
  while (i < lines.length) {
    if (visible[i]) {
      rows.push({ kind: "line", ...lines[i] });
      i++;
      continue;
    }
    let j = i;
    while (j < lines.length && !visible[j]) j++;
    const count = j - i;
    if (count <= 1) {
      rows.push({ kind: "line", ...lines[i] });
      i++;
    } else {
      rows.push({ kind: "gap", count });
      i = j;
    }
  }
  return rows;
}

const LINE_STYLE: Record<
  LineType,
  { bg: string; text: string; prefix: string; prefixColor: string }
> = {
  add: {
    bg: "bg-green-50",
    text: "text-green-800",
    prefix: "+",
    prefixColor: "text-green-600",
  },
  del: {
    bg: "bg-red-50",
    text: "text-red-800",
    prefix: "-",
    prefixColor: "text-red-500",
  },
  context: {
    bg: "bg-white",
    text: "text-foreground",
    prefix: " ",
    prefixColor: "text-muted-foreground",
  },
};

export default function DiffViewer({ oldContent, newContent }: Props) {
  const rows = buildRows(oldContent, newContent);
  const hasChanges = rows.some(
    (r) => r.kind === "line" && r.type !== "context",
  );

  if (!hasChanges) {
    return <p className="text-xs text-muted-foreground">本文の変更なし</p>;
  }

  return (
    <div className="rounded-md border border-border overflow-hidden font-mono text-xs leading-relaxed">
      {rows.map((row, i) => {
        if (row.kind === "gap") {
          return (
            <div
              key={i}
              className="px-3 py-1 bg-gray-50 text-muted-foreground text-center select-none border-y border-border"
            >
              ⋯ {row.count}行省略
            </div>
          );
        }
        const style = LINE_STYLE[row.type];
        return (
          <div key={i} className={`flex gap-2 px-3 py-0.5 ${style.bg}`}>
            <span className={`shrink-0 w-3 select-none ${style.prefixColor}`}>
              {style.prefix}
            </span>
            <span className={`whitespace-pre-wrap ${style.text}`}>
              {row.text || " "}
            </span>
          </div>
        );
      })}
    </div>
  );
}
