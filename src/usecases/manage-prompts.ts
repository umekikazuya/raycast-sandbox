import { CreatePromptParams, Prompt, UpdatePromptParams, createPrompt } from "../domain/models/prompt";
import { PromptError, PromptId, Result } from "../domain/models/types";
import { PromptRepository } from "../domain/repositories/prompt-repository";

/**
 * プロンプト作成ユースケース
 */
export function createCreatePromptUseCase(repository: PromptRepository) {
  /**
   * 新規プロンプトの作成と保存
   */
  return async (params: CreatePromptParams): Promise<Result<Prompt, PromptError>> => {
    // ドメインロジックによるプロンプト作成
    const promptResult = createPrompt(params);
    if (!promptResult.ok) {
      return promptResult;
    }

    // リポジトリに保存
    return repository.save(promptResult.value);
  };
}

/**
 * プロンプト更新ユースケース
 */
export function createUpdatePromptUseCase(repository: PromptRepository) {
  /**
   * 既存プロンプトの更新
   */
  return async (id: PromptId, params: UpdatePromptParams): Promise<Result<Prompt, PromptError>> => {
    return repository.update(id, params);
  };
}

/**
 * プロンプト削除ユースケース
 */
export function createDeletePromptUseCase(repository: PromptRepository) {
  /**
   * プロンプトの削除
   */
  return async (id: PromptId): Promise<Result<void, PromptError>> => {
    return repository.delete(id);
  };
}
