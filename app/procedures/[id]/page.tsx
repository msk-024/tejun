import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MarkdownRenderer from '@/app/procedures/_components/MarkdownRenderer'
import AiPanel from '@/app/procedures/_components/AiPanel'
import PrintButton from '@/app/procedures/_components/PrintButton'
import ActionMenu from '@/app/procedures/_components/ActionMenu'

type Props = {
  params: { id: string }
}

export default async function ProcedureDetailPage({ params }: Props) {
  const supabase = createClient()

  const [{ data: procedure }, { data: { user } }] = await Promise.all([
    supabase.from('procedures').select('*').eq('id', params.id).eq('is_deleted', false).single(),
    supabase.auth.getUser(),
  ])

  if (!procedure) notFound()

  const { data: category } = procedure.category_id
    ? await supabase.from('categories').select('*').eq('id', procedure.category_id).single()
    : { data: null }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="no-print inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        ← 一覧に戻る
      </Link>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* メインコンテンツ */}
        <main className="w-full md:flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              {category && (
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] mb-2">
                  {category.name}
                </span>
              )}
              <h1 className="text-2xl font-bold">{procedure.title}</h1>
            </div>

            <div className="no-print flex gap-2 shrink-0">
              <PrintButton />
              <Link
                href={`/procedures/${procedure.id}/history`}
                className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-gray-50 transition-colors"
              >
                履歴
              </Link>
              {user && (
                <ActionMenu
                  procedureId={procedure.id}
                  procedureTitle={procedure.title}
                />
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <MarkdownRenderer content={procedure.content} />
          </div>
        </main>

        {/* AI パネル */}
        <aside className="w-full md:w-80 shrink-0 md:sticky md:top-20">
          <AiPanel />
        </aside>
      </div>
    </div>
  )
}
