'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function requireAuth() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, userId: user.id }
}

export async function createProcedure(formData: FormData) {
  const title = formData.get('title')
  const content = formData.get('content') ?? ''
  const categoryIdRaw = formData.get('category_id')

  if (typeof title !== 'string' || title.trim() === '') return
  if (typeof content !== 'string') return

  const category_id = typeof categoryIdRaw === 'string' && categoryIdRaw !== '' ? categoryIdRaw : null

  const { supabase, userId } = await requireAuth()

  const { data: procedure, error } = await supabase
    .from('procedures')
    .insert({
      title: title.trim(),
      content,
      category_id,
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single()

  if (error || !procedure) throw new Error(error?.message ?? '手順書の作成に失敗しました')

  await supabase.from('procedure_histories').insert({
    procedure_id: procedure.id,
    title: procedure.title,
    content: procedure.content,
    category_id: procedure.category_id,
    changed_by: userId,
    action: 'created',
  })

  revalidatePath('/')
  redirect(`/procedures/${procedure.id}`)
}

export async function deleteProcedure(formData: FormData) {
  const id = formData.get('id')
  if (typeof id !== 'string') return

  const { supabase, userId } = await requireAuth()

  const { data: procedure, error } = await supabase
    .from('procedures')
    .update({ is_deleted: true, updated_by: userId, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !procedure) throw new Error(error?.message ?? '手順書の削除に失敗しました')

  await supabase.from('procedure_histories').insert({
    procedure_id: procedure.id,
    title: procedure.title,
    content: procedure.content,
    category_id: procedure.category_id,
    changed_by: userId,
    action: 'deleted',
  })

  revalidatePath('/')
  redirect('/')
}

export async function updateProcedure(formData: FormData) {
  const id = formData.get('id')
  const title = formData.get('title')
  const content = formData.get('content') ?? ''
  const categoryIdRaw = formData.get('category_id')

  if (typeof id !== 'string') return
  if (typeof title !== 'string' || title.trim() === '') return
  if (typeof content !== 'string') return

  const category_id = typeof categoryIdRaw === 'string' && categoryIdRaw !== '' ? categoryIdRaw : null

  const { supabase, userId } = await requireAuth()

  const { data: procedure, error } = await supabase
    .from('procedures')
    .update({
      title: title.trim(),
      content,
      category_id,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !procedure) throw new Error(error?.message ?? '手順書の更新に失敗しました')

  await supabase.from('procedure_histories').insert({
    procedure_id: procedure.id,
    title: procedure.title,
    content: procedure.content,
    category_id: procedure.category_id,
    changed_by: userId,
    action: 'updated',
  })

  revalidatePath(`/procedures/${id}`)
  redirect(`/procedures/${id}`)
}

export async function duplicateProcedure(formData: FormData) {
  const id = formData.get('id')
  if (typeof id !== 'string') return

  const { supabase, userId } = await requireAuth()

  const { data: original, error } = await supabase
    .from('procedures')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !original) throw new Error('手順書が見つかりません')

  const { data: duplicate, error: dupError } = await supabase
    .from('procedures')
    .insert({
      title: `${original.title}（コピー）`,
      content: original.content,
      category_id: original.category_id,
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single()

  if (dupError || !duplicate) throw new Error('複製に失敗しました')

  await supabase.from('procedure_histories').insert({
    procedure_id: duplicate.id,
    title: duplicate.title,
    content: duplicate.content,
    category_id: duplicate.category_id,
    changed_by: userId,
    action: 'created',
  })

  revalidatePath('/')
  redirect(`/procedures/${duplicate.id}/edit`)
}
