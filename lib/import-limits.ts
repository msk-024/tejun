/**
 * ファイル取り込みの上限。サーバー（API側の防御）とクライアント（事前チェック）で共用する。
 *
 * Vercel のサーバーレス関数はリクエストボディを約 4.5MB で打ち切るため、
 * それより手前で自前のエラーを返せるよう 4MB にしている。
 * 上限を上げるとプラットフォーム側の不親切なエラーが先に出てしまう。
 */
export const MAX_IMPORT_FILE_SIZE = 4 * 1024 * 1024;

export const MAX_IMPORT_FILE_SIZE_MESSAGE = "ファイルサイズは4MBまでです";
