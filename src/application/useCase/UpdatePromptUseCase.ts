import { Prompt } from "../../domain/entities/prompt";
import { PromptId } from "../../domain/valueObjects/prompt/PromptId";
import { PromptRepository, PromptRepositoryErr, UpdatePromptParams } from "../../domain/repositories/promptRepository";
import { Result, ok, err } from "../../shared/kernel/result";
import { ApplicationErr } from "../../shared/kernel/types";

export type UpdatePromptErr = ApplicationErr | PromptRepositoryErr;

/**
 * プロンプト更新ユースケース
 */
export const updatePromptUseCase =
  ({ promptRepository }: { readonly promptRepository: PromptRepository }) =>
  async ({
    id,
    params,
  }: {
    readonly id: PromptId;
    readonly params: UpdatePromptParams;
  }): Promise<Result<Prompt, UpdatePromptErr>> => {
    // 対象プロンプトの存在確認
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

    // プロンプトの更新
    const updateResult = await promptRepository.update({ id, params });

    if (updateResult.tag === "err") {
      return err({
        kind: "RepositoryError",
        message: "プロンプトの更新に失敗しました",
        cause: updateResult.err,
      });
    }

    return ok(updateResult.val);
  };
