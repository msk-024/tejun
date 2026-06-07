'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

type Props = {
  children: React.ReactElement
  title: string
  description: string
  formAction: (formData: FormData) => Promise<void>
  hiddenFields: Record<string, string>
}

export default function DeleteConfirmDialog({
  children,
  title,
  description,
  formAction,
  hiddenFields,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger render={children} />
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
  )
}
