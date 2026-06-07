import { createClient } from '@/lib/supabase/server'
import CategoryModal from './_components/CategoryModal'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { deleteCategory } from './actions'

export default async function CategoriesPage() {
  const supabase = createClient()

  const [{ data: categories }, { data: { user } }] = await Promise.all([
    supabase.from('categories').select('*').eq('is_deleted', false).order('created_at'),
    supabase.auth.getUser(),
  ])

  const isLoggedIn = !!user

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">カテゴリ管理</h1>
        {isLoggedIn && (
          <CategoryModal mode="create">
            <button className="bg-[#2d6a4f] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#255c43] transition-colors">
              + カテゴリを追加
            </button>
          </CategoryModal>
        )}
      </div>

      {!categories || categories.length === 0 ? (
        <p className="text-muted-foreground text-sm">カテゴリがまだありません。</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-start justify-between rounded-lg border border-border bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium">{category.name}</p>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{category.description}</p>
                )}
              </div>

              {isLoggedIn && (
                <div className="flex gap-2 ml-4 shrink-0">
                  <CategoryModal mode="edit" category={category}>
                    <button className="text-sm px-3 py-1 rounded border border-border hover:bg-gray-50 transition-colors">
                      編集
                    </button>
                  </CategoryModal>

                  <DeleteConfirmDialog
                    title="カテゴリを削除しますか？"
                    description={`「${category.name}」を削除します。この操作は取り消せません。`}
                    formAction={deleteCategory}
                    hiddenFields={{ id: category.id }}
                  >
                    <button className="text-sm px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                      削除
                    </button>
                  </DeleteConfirmDialog>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
