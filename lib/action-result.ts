/**
 * Server Action の実行結果。
 *
 * 'use server' ファイルは async 関数しか export できないため、型はここに置く。
 *
 * 想定内のエラー（バリデーション・業務ルール違反・セッション切れ）は throw せず
 * `{ ok: false }` で返し、UI がインライン表示する。想定外のエラーだけを throw し、
 * `app/error.tsx` に受けさせる。
 */
export type ActionResult =
  { ok: true; redirectTo?: string } | { ok: false; message: string };

/** セッション切れ時の共通メッセージ */
export const SESSION_EXPIRED_MESSAGE =
  "セッションが切れました。再度ログインしてください。";
