import { Prompt } from "../../domain/entities/prompt";
import { PromptFilter, PromptRepository, PromptRepositoryErr } from "../../domain/repositories/promptRepository";
import { Result, ok, err } from "../../shared/kernel/result";
import { ApplicationErr } from "../../shared/kernel/types";

export type FilterPromptsErr = ApplicationErr | PromptRepositoryErr;

/**
 * プロンプトをフィルタリングするユースケース
 */
export const filterPromptsUseCase =
  ({ promptRepository }: { readonly promptRepository: PromptRepository }) =>
  async ({ filter }: { readonly filter: PromptFilter }): Promise<Result<readonly Prompt[], FilterPromptsErr>> => {
    const result = await promptRepository.findByFilter({ filter });

    if (result.tag === "err") {
      return err({
        kind: "RepositoryError",
        message: "プロンプトのフィルタリングに失敗しました",
        cause: result.err,
      });
    }

    return ok(result.val);
  };
