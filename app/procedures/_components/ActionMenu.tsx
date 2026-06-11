'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { deleteProcedure, duplicateProcedure } from '@/app/procedures/actions'

type Props = {
  procedureId: string
  procedureTitle: string
}

export default function ActionMenu({ procedureId, procedureTitle }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-gray-50 transition-colors flex items-center gap-1"
      >
        操作 <span className="text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-md shadow-md z-20 w-32 py-1">
          <Link
            href={`/procedures/${procedureId}/edit`}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            編集
          </Link>

          <form action={duplicateProcedure}>
            <input type="hidden" name="id" value={procedureId} />
            <button
              type="submit"
              onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              複製
            </button>
          </form>

          <div className="border-t border-border my-1" />

          <DeleteConfirmDialog
            title="手順書を削除しますか？"
            description={`「${procedureTitle}」を削除します。この操作は取り消せません。`}
            formAction={deleteProcedure}
            hiddenFields={{ id: procedureId }}
          >
            <button
              onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              削除
            </button>
          </DeleteConfirmDialog>
        </div>
      )}
    </div>
  )
}
