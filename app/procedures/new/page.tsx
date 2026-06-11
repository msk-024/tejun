import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewProcedureForm from '../_components/NewProcedureForm'

export default async function NewProcedurePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at')

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">手順書を作成</h1>
      <NewProcedureForm categories={categories ?? []} />
    </main>
  )
}
