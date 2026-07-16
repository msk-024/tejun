"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

type Props = {
  /** トリガー要素。open を指定する制御モードでは省略する */
  children?: React.ReactElement;
  title: string;
  description: string;
  formAction: (formData: FormData) => Promise<void>;
  hiddenFields: Record<string, string>;
  /** 開閉を外部から制御する。省略時は children をトリガーとする非制御モード */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function DeleteConfirmDialog({
  children,
  title,
  description,
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
              className="rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors"
            >
              削除する
            </button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
