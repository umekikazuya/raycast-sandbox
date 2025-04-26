import { Prompt } from "../../domain/entities/prompt";
import { PromptRepository, PromptRepositoryErr, UpdatePromptParams } from "../../domain/repositories/promptRepository";
import { Result, ok, err } from "../../shared/kernel/result";
import { ApplicationErr } from "../../shared/kernel/types";

export type UpdatePromptErr = ApplicationErr | PromptRepositoryErr;

/**
 * プロンプト更新ユースケース
 */
export const updatePromptUseCase =
  ({ promptRepository }: { readonly promptRepository: PromptRepository }) =>
  async ({ prompt }: { readonly prompt: Prompt }): Promise<Result<Prompt, UpdatePromptErr>> => {
    // 対象プロンプトの存在確認
    const existingPromptResult = await promptRepository.findById({ id: prompt.id });

    if (existingPromptResult.tag === "err") {
      return err({
        kind: "RepositoryError",
        message: `ID ${prompt.id} のプロンプト取得に失敗しました`,
        cause: existingPromptResult.err,
      });
    }

    if (!existingPromptResult.val) {
      return err({
        kind: "NotFoundError",
        message: `ID ${prompt.id} のプロンプトが見つかりません`,
      });
    }

    // プロンプトの更新
    const updateResult = await promptRepository.update({ prompt: prompt });

    if (updateResult.tag === "err") {
      return err({
        kind: "RepositoryError",
        message: "プロンプトの更新に失敗しました",
        cause: updateResult.err,
      });
    }

    return ok(updateResult.val);
  };
