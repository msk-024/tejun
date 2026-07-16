"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  /** トリガー要素。open を指定する制御モードでは省略する */
  children?: React.ReactElement;
  title: string;
  description: string;
  /** 実行ボタンのラベル（例: 削除する / 複製する） */
  confirmLabel: string;
  /** danger は赤系（取り消せない操作）、primary はアクセントカラー */
  tone?: "danger" | "primary";
  formAction: (formData: FormData) => Promise<void>;
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
  formAction,
  hiddenFields,
  open,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger render={children} />}
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{description}</p>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose
            render={
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            }
          />

          <form action={formAction}>
            {Object.entries(hiddenFields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <button
              type="submit"
              className={`rounded-md text-white px-4 py-2 text-sm font-medium transition-colors ${TONE_CLASS[tone]}`}
            >
              {confirmLabel}
            </button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
