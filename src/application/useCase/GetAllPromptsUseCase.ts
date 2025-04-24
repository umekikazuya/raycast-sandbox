import { Prompt } from "../../domain/entities/prompt";
import { PromptRepository, PromptRepositoryErr } from "../../domain/repositories/promptRepository";
import { Result, ok, err } from "../../shared/kernel/result";
import { ApplicationErr } from "../../shared/kernel/types";

export type GetAllPromptsErr = ApplicationErr | PromptRepositoryErr;

/**
 * すべてのプロンプトを取得するユースケース
 */
export const getAllPromptsUseCase =
  ({ promptRepository }: { readonly promptRepository: PromptRepository }) =>
  async (): Promise<Result<readonly Prompt[], GetAllPromptsErr>> => {
    const result = await promptRepository.findAll();

    if (result.tag === "err") {
      return err({
        kind: "RepositoryError",
        message: "プロンプトの取得に失敗しました",
        cause: result.err,
      });
    }

    return ok(result.val);
  };
