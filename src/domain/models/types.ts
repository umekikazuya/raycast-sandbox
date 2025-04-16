/**
 * Result型: 成功または失敗の状態を表現する
 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/**
 * ブランド型: 型安全性を高めるための型
 */
export type Branded<T, B> = T & { _brand: B };

/**
 * プロンプトID型
 */
export type PromptId = Branded<string, "PromptId">;

/**
 * ユーザーID型
 */
export type UserId = Branded<string, "UserId">;

/**
 * タグ型
 */
export type Tag = Branded<string, "Tag">;

/**
 * カテゴリ型
 */
export type Category = Branded<string, "Category">;

/**
 * エラー定義
 */
export enum PromptError {
  INVALID_TITLE = "タイトルが無効です",
  INVALID_CONTENT = "コンテンツが無効です",
  DUPLICATE_ID = "既に同じIDのプロンプトが存在します",
  NOT_FOUND = "プロンプトが見つかりません",
  STORAGE_ERROR = "ストレージエラーが発生しました",
}
