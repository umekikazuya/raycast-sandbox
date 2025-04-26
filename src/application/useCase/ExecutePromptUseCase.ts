import { Prompt } from "../../domain/entities/prompt";
import { PromptId } from "../../domain/valueObjects/prompt/PromptId";
import { PromptRepository, PromptRepositoryErr } from "../../domain/repositories/promptRepository";
import { ClipboardService, ClipboardServiceErr } from "../../domain/services/clipboardService";
import { Result, ok, err } from "../../shared/kernel/result";
import { ApplicationErr } from "../../shared/kernel/types";

export type ExecutePromptParams = Readonly<{
  id: PromptId;
  variables: Record<string, string>;
}>;

export type ExecutionOutput = Readonly<{
  content: string;
  executedAt: Date;
}>;

export type ExecutePromptErr = ApplicationErr | PromptRepositoryErr | ClipboardServiceErr;

/**
 * プロンプト実行ユースケース
 *
 * プロンプトの変数を置換し、結果をクリップボードにコピー
 */
export const executePromptUseCase =
  ({
    promptRepository,
    clipboardService,
  }: {
    readonly promptRepository: PromptRepository;
    readonly clipboardService: ClipboardService;
  }) =>
  async ({ params }: { readonly params: ExecutePromptParams }): Promise<Result<ExecutionOutput, ExecutePromptErr>> => {
    // プロンプトの取得
    const promptResult = await promptRepository.findById({ id: params.id });

    if (promptResult.tag === "err") {
      return err({
        kind: "RepositoryError",
        message: "プロンプトの取得に失敗しました",
        cause: promptResult.err,
      });
    }

    if (!promptResult.val) {
      return err({
        kind: "NotFoundError",
        message: `ID ${params.id} のプロンプトが見つかりません`,
      });
    }

    // クリップボードにコピー
    const clipboardResult = await clipboardService.copyToClipboard(
      { text: promptResult.val.body }
    );

    if (clipboardResult.tag === "err") {
      return err({
        kind: "ExecutionError",
        message: "クリップボードへのコピーに失敗しました",
        cause: clipboardResult.err,
      });
    }

    // 出力結果を返す
    return ok({
      content: promptResult.val.body,
      executedAt: new Date(),
    });
  };
