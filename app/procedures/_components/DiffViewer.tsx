'use client'

import { diffLines } from 'diff'

type Props = {
  oldContent: string
  newContent: string
}

export default function DiffViewer({ oldContent, newContent }: Props) {
  const changes = diffLines(oldContent, newContent)
  const hasChanges = changes.some((c) => c.added || c.removed)

  if (!hasChanges) {
    return <p className="text-xs text-muted-foreground">本文の変更なし</p>
  }

  return (
    <div className="rounded-md border border-border overflow-hidden font-mono text-xs leading-relaxed">
      {changes.flatMap((change, i) => {
        const lines = change.value.split('\n')
        const filtered = lines[lines.length - 1] === '' ? lines.slice(0, -1) : lines

        const bg = change.added ? 'bg-green-50' : change.removed ? 'bg-red-50' : 'bg-white'
        const textColor = change.added ? 'text-green-800' : change.removed ? 'text-red-800' : 'text-foreground'
        const prefix = change.added ? '+' : change.removed ? '-' : ' '
        const prefixColor = change.added ? 'text-green-600 select-none' : change.removed ? 'text-red-500 select-none' : 'text-muted-foreground select-none'

        return filtered.map((line, j) => (
          <div key={`${i}-${j}`} className={`flex gap-2 px-3 py-0.5 ${bg}`}>
            <span className={`shrink-0 w-3 ${prefixColor}`}>{prefix}</span>
            <span className={textColor}>{line || ' '}</span>
          </div>
        ))
      })}
    </div>
  )
}
