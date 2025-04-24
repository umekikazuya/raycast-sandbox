import { Prompt } from "../../domain/entities/prompt";
import { PromptId } from "../../domain/valueObjects/prompt/PromptId";
import { PromptRepository, PromptRepositoryErr } from "../../domain/repositories/promptRepository";
import { Result, ok, err } from "../../shared/kernel/result";
import { ApplicationErr } from "../../shared/kernel/types";

export type GetPromptByIdErr = ApplicationErr | PromptRepositoryErr;

/**
 * 特定IDのプロンプトを取得するユースケース
 */
export const getPromptByIdUseCase =
  ({ promptRepository }: { readonly promptRepository: PromptRepository }) =>
  async ({ id }: { readonly id: PromptId }): Promise<Result<Prompt | null, GetPromptByIdErr>> => {
    const result = await promptRepository.findById({ id });

    if (result.tag === "err") {
      return err({
        kind: "RepositoryError",
        message: `ID ${id} のプロンプト取得に失敗しました`,
        cause: result.err,
      });
    }

    return ok(result.val);
  };
