import { Prompt } from "../../domain/models/prompt";
import { PromptId, PromptError, Result } from "../../domain/models/types";
import { PromptFilter } from "../../domain/repositories/prompt-repository";
import { PromptRepository } from "../../domain/repositories/prompt-repository";
import { ExecutePromptResult, VariableValues, createExecutePromptUseCase } from "../../usecases/execute-prompt";
import { createCreatePromptUseCase, createDeletePromptUseCase, createUpdatePromptUseCase } from "../../usecases/manage-prompts";
import { createGetPromptDetailsUseCase, createSearchPromptsUseCase } from "../../usecases/search-prompts";
import { generateSamplePrompts } from "../../utils/sample-data-generator";
import { PromptApplicationService } from "./prompt-application-service";

/**
 * プロンプトアプリケーションサービスの実装
 * ユースケースを利用してアプリケーションの機能を提供する
 */
export class PromptApplicationServiceImpl implements PromptApplicationService {
  private searchPromptsUseCase;
  private getPromptDetailsUseCase;
  private executePromptUseCase;
  private createPromptUseCase;
  private updatePromptUseCase;
  private deletePromptUseCase;

  constructor(private repository: PromptRepository) {
    // 各ユースケースの初期化
    this.searchPromptsUseCase = createSearchPromptsUseCase(repository);
    this.getPromptDetailsUseCase = createGetPromptDetailsUseCase(repository);
    this.executePromptUseCase = createExecutePromptUseCase(repository);
    this.createPromptUseCase = createCreatePromptUseCase(repository);
    this.updatePromptUseCase = createUpdatePromptUseCase(repository);
    this.deletePromptUseCase = createDeletePromptUseCase(repository);
  }

  async searchPrompts(filter: PromptFilter): Promise<Result<Prompt[], PromptError>> {
    return await this.searchPromptsUseCase(filter);
  }

  async getPromptDetails(promptId: PromptId): Promise<Result<Prompt | null, PromptError>> {
    return await this.getPromptDetailsUseCase(promptId);
  }

  async executePrompt(promptId: PromptId, variables: VariableValues): Promise<Result<ExecutePromptResult, PromptError>> {
    return await this.executePromptUseCase(promptId, variables);
  }

  async createPrompt(params: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    variables: any[];
    createdBy: string;
    department?: string;
    position?: string;
  }): Promise<Result<Prompt, PromptError>> {
    return await this.createPromptUseCase(params);
  }

  async updatePrompt(
    promptId: PromptId,
    params: Partial<{
      title: string;
      content: string;
      category: string;
      tags: string[];
      variables: any[];
      department: string;
      position: string;
    }>
  ): Promise<Result<Prompt, PromptError>> {
    return await this.updatePromptUseCase(promptId, params);
  }

  async deletePrompt(promptId: PromptId): Promise<Result<void, PromptError>> {
    return await this.deletePromptUseCase(promptId);
  }
  
  /**
   * 初期サンプルデータを生成
   * データが存在しない場合に、サンプルプロンプトデータを生成して保存する
   */
  async initializeSampleData(): Promise<Result<void, PromptError>> {
    try {
      // まず現在のデータを取得
      const existingPromptsResult = await this.repository.findAll();
      
      if (!existingPromptsResult.ok) {
        return { ok: false, error: existingPromptsResult.error };
      }
      
      // 既存のデータがある場合は何もしない
      if (existingPromptsResult.value.length > 0) {
        return { ok: true, value: undefined };
      }
      
      // サンプルデータを生成
      const samplePromptsResult = generateSamplePrompts();
      if (!samplePromptsResult.ok) {
        return { ok: false, error: samplePromptsResult.error };
      }
      
      // 各サンプルプロンプトを保存
      for (const prompt of samplePromptsResult.value) {
        const saveResult = await this.repository.save(prompt);
        if (!saveResult.ok) {
          return { ok: false, error: saveResult.error };
        }
      }
      
      return { ok: true, value: undefined };
    } catch (error) {
      return { ok: false, error: PromptError.STORAGE_ERROR };
    }
  }
}
