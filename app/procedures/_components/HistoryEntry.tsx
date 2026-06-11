'use client'

import { useState } from 'react'
import type { ProcedureHistory } from '@/lib/types'
import DiffViewer from './DiffViewer'

type Props = {
  entry: ProcedureHistory
  prevEntry: ProcedureHistory | null
  currentUserId: string | null
  currentUserLabel: string | null
}

const ACTION_CONFIG = {
  created: { label: '作成', className: 'bg-green-100 text-green-800' },
  updated: { label: '更新', className: 'bg-blue-100 text-blue-800' },
  deleted: { label: '削除', className: 'bg-red-100 text-red-800' },
}

function formatChangedBy(
  changedBy: string | null,
  currentUserId: string | null,
  currentUserLabel: string | null,
): string {
  if (!changedBy) return '不明'
  if (changedBy === currentUserId) return currentUserLabel ?? changedBy.substring(0, 8) + '…'
  return changedBy.substring(0, 8) + '…'
}

export default function HistoryEntry({ entry, prevEntry, currentUserId, currentUserLabel }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasDiff = entry.action === 'updated' && prevEntry !== null
  const [mode, setMode] = useState<'diff' | 'full'>(hasDiff ? 'diff' : 'full')

  const config = ACTION_CONFIG[entry.action]
  const changedByLabel = formatChangedBy(entry.changed_by, currentUserId, currentUserLabel)
  const formattedDate = new Date(entry.changed_at).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${config.className}`}>
          {config.label}
        </span>
        <span className="text-sm font-medium flex-1 truncate">{entry.title}</span>
        <span className="text-xs text-muted-foreground shrink-0">{changedByLabel}</span>
        <span className="text-xs text-muted-foreground shrink-0">{formattedDate}</span>
        <span className="text-muted-foreground shrink-0 text-xs ml-1">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border">
          {hasDiff && (
            <div className="flex gap-2 my-3">
              <button
                type="button"
                onClick={() => setMode('diff')}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  mode === 'diff'
                    ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                    : 'border-border hover:bg-gray-50'
                }`}
              >
                差分
              </button>
              <button
                type="button"
                onClick={() => setMode('full')}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  mode === 'full'
                    ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                    : 'border-border hover:bg-gray-50'
                }`}
              >
                全文
              </button>
            </div>
          )}

          {mode === 'diff' && hasDiff && prevEntry ? (
            <DiffViewer oldContent={prevEntry.content} newContent={entry.content} />
          ) : (
            <pre className="text-xs bg-gray-50 rounded-md p-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed mt-3">
              {entry.content || '（内容なし）'}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
