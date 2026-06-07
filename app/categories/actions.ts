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

export async function createCategory(formData: FormData) {
  const name = formData.get('name')
  const description = formData.get('description') ?? ''

  if (typeof name !== 'string' || name.trim() === '') return
  if (typeof description !== 'string') return

  const { supabase, userId } = await requireAuth()

  const { data: category, error } = await supabase
    .from('categories')
    .insert({ name: name.trim(), description, created_by: userId, updated_by: userId })
    .select()
    .single()

  if (error || !category) throw new Error(error?.message ?? 'カテゴリの作成に失敗しました')

  await supabase.from('category_histories').insert({
    category_id: category.id,
    name: category.name,
    description: category.description,
    changed_by: userId,
    action: 'created',
  })

  revalidatePath('/categories')
}

export async function updateCategory(formData: FormData) {
  const id = formData.get('id')
  const name = formData.get('name')
  const description = formData.get('description') ?? ''

  if (typeof id !== 'string' || typeof name !== 'string' || name.trim() === '') return
  if (typeof description !== 'string') return

  const { supabase, userId } = await requireAuth()

  const { data: category, error } = await supabase
    .from('categories')
    .update({ name: name.trim(), description, updated_by: userId, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !category) throw new Error(error?.message ?? 'カテゴリの更新に失敗しました')

  await supabase.from('category_histories').insert({
    category_id: category.id,
    name: category.name,
    description: category.description,
    changed_by: userId,
    action: 'updated',
  })

  revalidatePath('/categories')
}

export async function deleteCategory(formData: FormData) {
  const id = formData.get('id')
  if (typeof id !== 'string') return

  const { supabase, userId } = await requireAuth()

  const { data: category, error } = await supabase
    .from('categories')
    .update({ is_deleted: true, updated_by: userId, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !category) throw new Error(error?.message ?? 'カテゴリの削除に失敗しました')

  await supabase.from('category_histories').insert({
    category_id: category.id,
    name: category.name,
    description: category.description,
    changed_by: userId,
    action: 'deleted',
  })

  revalidatePath('/categories')
}
