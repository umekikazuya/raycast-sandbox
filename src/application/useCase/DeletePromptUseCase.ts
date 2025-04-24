import { PromptId } from "../../domain/valueObjects/prompt/PromptId";
import { PromptRepository, PromptRepositoryErr } from "../../domain/repositories/promptRepository";
import { Result, ok, err } from "../../shared/kernel/result";
import { ApplicationErr } from "../../shared/kernel/types";

export type DeletePromptErr = ApplicationErr | PromptRepositoryErr;

/**
 * プロンプト削除ユースケース
 */
export const deletePromptUseCase =
  ({ promptRepository }: { readonly promptRepository: PromptRepository }) =>
  async ({ id }: { readonly id: PromptId }): Promise<Result<void, DeletePromptErr>> => {
    const existingPromptResult = await promptRepository.findById({ id });

    if (existingPromptResult.tag === "err") {
      return err({
        kind: "RepositoryError",
        message: `ID ${id} のプロンプト取得に失敗しました`,
        cause: existingPromptResult.err,
      });
    }

    if (!existingPromptResult.val) {
      return err({
        kind: "NotFoundError",
        message: `ID ${id} のプロンプトが見つかりません`,
      });
    }

    // プロンプトの削除
    const deleteResult = await promptRepository.delete({ id });

    if (deleteResult.tag === "err") {
      return err({
        kind: "RepositoryError",
        message: "プロンプトの削除に失敗しました",
        cause: deleteResult.err,
      });
    }

    return ok(undefined);
  };
