import { Prompt } from "../../domain/entities/prompt";
import { PromptFilter, PromptRepository, PromptRepositoryErr } from "../../domain/repositories/promptRepository";
import { Result, ok, err } from "../../shared/kernel/result";
import { ApplicationErr } from "../../shared/kernel/types";

export type FilterPromptsErr = ApplicationErr | PromptRepositoryErr;

/**
 * Use case for filtering prompts
 * 
 * @param promptRepository - The prompt repository to use for filtering
 * @returns A promise that resolves to the filtered prompts or an error
 */
export const filterPromptsUseCase =
  ({ promptRepository }: { readonly promptRepository: PromptRepository }) =>
  async ({ filter }: { readonly filter: PromptFilter }): Promise<Result<Prompt[], FilterPromptsErr>> => {
    const result = await promptRepository.findByFilter({ filter });

    if (result.tag === "err") {
      return err({
        kind: "RepositoryError",
        message: "Failed to filter prompts",
        cause: result.err,
      });
    }

    return ok(result.val);
  };
