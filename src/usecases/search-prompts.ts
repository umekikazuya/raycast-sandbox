import { PromptFilter, PromptRepository } from "../domain/repositories/prompt-repository";
import { Prompt, PromptError, Result } from "../domain/models/types";

/**
 * プロンプト検索ユースケース
 */
export function createSearchPromptsUseCase(repository: PromptRepository) {
  /**
   * 条件によるプロンプトの検索
   */
  return async (filter: PromptFilter): Promise<Result<Prompt[], PromptError>> => {
    return repository.findByFilter(filter);
  };
}

/**
 * プロンプト詳細取得ユースケース
 */
export function createGetPromptDetailsUseCase(repository: PromptRepository) {
  /**
   * プロンプト詳細の取得
   */
  return async (promptId: string): Promise<Result<Prompt | null, PromptError>> => {
    return repository.findById(promptId as any);
  };
}
