import { Result } from "../../shared/kernel/result";

export type ClipboardServiceErr = 
  | { kind: "ClipboardAccessDenied"; message: string }
  | { kind: "ClipboardWriteFailed"; message: string };

/**
 * クリップボード操作サービスのインターフェース
 */
export interface ClipboardService {
  /**
   * テキストをクリップボードにコピーする
   */
  copyToClipboard({ text }: { readonly text: string }): Promise<Result<void, ClipboardServiceErr>>;
}
