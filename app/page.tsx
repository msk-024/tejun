import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createClient()
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_deleted', false)

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Tejun - 手順書管理</h1>

      {error ? (
        <div className="text-red-600 bg-red-50 p-4 rounded">
          <p className="font-semibold">Supabase 接続エラー</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      ) : (
        <div className="text-green-700 bg-green-50 p-4 rounded">
          <p className="font-semibold">✓ Supabase 接続成功</p>
          <p className="text-sm mt-1">カテゴリ数: {categories?.length ?? 0} 件</p>
        </div>
      )}
    </main>
  )
}
