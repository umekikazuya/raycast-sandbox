import { Clipboard } from "@raycast/api";
import { ClipboardService, ClipboardServiceErr } from "../../domain/services/clipboardService";
import { Result, ok, err } from "../../shared/kernel/result";

/**
 * Raycast APIを使用したクリップボードサービスの実装
 */
export class RaycastClipboardService implements ClipboardService {
  async copyToClipboard({ text }: { readonly text: string }): Promise<Result<void, ClipboardServiceErr>> {
    try {
      await Clipboard.copy(text);
      return ok(undefined);
    } catch (error) {
      return err({
        kind: "ClipboardWriteFailed",
        message: error instanceof Error ? error.message : "クリップボードへのコピーに失敗しました",
      });
    }
  }
}
