import { login } from '@/app/actions/auth'

type Props = {
  searchParams: { error?: string }
}

export default function LoginPage({ searchParams }: Props) {
  const errorMessage =
    searchParams.error === 'invalid_credentials'
      ? 'メールアドレスまたはパスワードが正しくありません'
      : searchParams.error === 'invalid_input'
        ? '入力値が不正です'
        : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-border p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-center mb-6">ログイン</h1>

        {errorMessage && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {errorMessage}
          </p>
        )}

        <form action={login} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-[#2d6a4f] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#255c43] transition-colors"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  )
}
