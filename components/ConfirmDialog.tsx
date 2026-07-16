"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/action-result";

type Props = {
  /** トリガー要素。open を指定する制御モードでは省略する */
  children?: React.ReactElement;
  title: string;
  description: string;
  /** 実行ボタンのラベル（例: 削除する / 複製する） */
  confirmLabel: string;
  /** danger は赤系（取り消せない操作）、primary はアクセントカラー */
  tone?: "danger" | "primary";
  action: (formData: FormData) => Promise<ActionResult>;
  hiddenFields: Record<string, string>;
  /** 開閉を外部から制御する。省略時は children をトリガーとする非制御モード */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const TONE_CLASS = {
  danger: "bg-red-600 hover:bg-red-700",
  primary: "bg-[#2d6a4f] hover:bg-[#255c43]",
} as const;

export default function ConfirmDialog({
  children,
  title,
  description,
  confirmLabel,
  tone = "danger",
  action,
  hiddenFields,
  open,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // 成功時に自前で閉じる必要があるため、非制御モードでも内部で開閉状態を持つ
  const isControlled = open !== undefined;
  const actualOpen = isControlled ? open : internalOpen;

  function changeOpen(next: boolean) {
    setErrorMessage("");
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }

  function handleConfirm() {
    setErrorMessage("");

    const formData = new FormData();
    for (const [name, value] of Object.entries(hiddenFields)) {
      formData.append(name, value);
    }

    startTransition(async () => {
      try {
        const result = await action(formData);

        if (!result.ok) {
          setErrorMessage(result.message);
          return;
        }

        changeOpen(false);
        // アクション側は redirect() せず遷移先を返す（NEXT_REDIRECT を try/catch で潰さないため）
        if (result.redirectTo) router.push(result.redirectTo);
      } catch {
        setErrorMessage("処理に失敗しました。時間をおいて再度お試しください。");
      }
    });
  }

  return (
    <Dialog open={actualOpen} onOpenChange={changeOpen}>
      {children && <DialogTrigger render={children} />}
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{description}</p>

        {errorMessage && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorMessage}
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose
            render={
              <button
                type="button"
                disabled={isPending}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
            }
          />

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={`rounded-md text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${TONE_CLASS[tone]}`}
          >
            {isPending ? "処理中…" : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
