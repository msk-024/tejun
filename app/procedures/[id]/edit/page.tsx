import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateProcedure } from '@/app/procedures/actions'
import MarkdownEditor from '@/app/procedures/_components/MarkdownEditor'

type Props = {
  params: { id: string }
}

export default async function EditProcedurePage({ params }: Props) {
  const supabase = createClient()

  const [{ data: { user } }, { data: procedure }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('procedures').select('*').eq('id', params.id).eq('is_deleted', false).single(),
  ])

  if (!user) redirect('/login')
  if (!procedure) notFound()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at')

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">手順書を編集</h1>

      <form action={updateProcedure} className="flex flex-col gap-5">
        <input type="hidden" name="id" value={procedure.id} />

        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm font-medium">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={procedure.title}
            className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category_id" className="text-sm font-medium">
            カテゴリ
          </label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={procedure.category_id ?? ''}
            className="border border-border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
          >
            <option value="">カテゴリなし</option>
            {(categories ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">本文（Markdown）</label>
          <MarkdownEditor name="content" defaultValue={procedure.content ?? ''} />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-[#2d6a4f] text-white rounded-md px-5 py-2 text-sm font-medium hover:bg-[#255c43] transition-colors"
          >
            保存する
          </button>
          <a
            href={`/procedures/${procedure.id}`}
            className="rounded-md border border-border px-5 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </a>
        </div>
      </form>
    </main>
  )
}
