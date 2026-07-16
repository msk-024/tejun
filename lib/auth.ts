import { createClient } from "@/lib/supabase/server";

/**
 * Server Action 用の認証取得。
 *
 * redirect() を呼ばないので NEXT_REDIRECT が飛ばず、呼び出し側で try/catch できる。
 * 未ログインは各アクションが ActionResult で返す。
 */
export async function getAuth() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}
