import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'

export default async function Header() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-base font-bold text-[#2d6a4f]">
          てじゅん
        </a>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.email}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-gray-50 transition-colors"
                >
                  ログアウト
                </button>
              </form>
            </>
          ) : (
            <a
              href="/login"
              className="text-sm px-3 py-1.5 rounded-md bg-[#2d6a4f] text-white hover:bg-[#255c43] transition-colors"
            >
              ログイン
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
