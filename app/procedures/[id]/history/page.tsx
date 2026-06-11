import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HistoryEntry from '@/app/procedures/_components/HistoryEntry'

type Props = {
  params: { id: string }
}

export default async function ProcedureHistoryPage({ params }: Props) {
  const supabase = createClient()

  const [{ data: procedure }, { data: histories }, { data: { user } }] = await Promise.all([
    supabase.from('procedures').select('id, title').eq('id', params.id).single(),
    supabase
      .from('procedure_histories')
      .select('*')
      .eq('procedure_id', params.id)
      .order('changed_at', { ascending: true }),
    supabase.auth.getUser(),
  ])

  if (!procedure) notFound()

  const sorted = histories ?? []
  const reversed = [...sorted].reverse()

  // display_name があれば優先、なければメールアドレスにフォールバック
  const currentUserLabel =
    (user?.user_metadata?.display_name as string | undefined) ?? user?.email ?? null

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href={`/procedures/${params.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        ← 詳細に戻る
      </Link>

      <h1 className="text-xl font-bold mb-1">{procedure.title}</h1>
      <p className="text-sm text-muted-foreground mb-6">変更履歴（{sorted.length} 件）</p>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">履歴がありません。</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reversed.map((entry, i) => (
            <li key={entry.id}>
              <HistoryEntry
                entry={entry}
                prevEntry={reversed[i + 1] ?? null}
                currentUserId={user?.id ?? null}
                currentUserLabel={currentUserLabel}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
