import { Prompt } from "../domain/models/prompt";
import { PromptId, PromptError, Result } from "../domain/models/types";
import { PromptFilter } from "../domain/repositories/prompt-repository";
import { VariableValues, ExecutePromptResult } from "../usecases/execute-prompt";

/**
 * プロンプトアプリケーションサービスのインターフェース
 * UIレイヤーはこのインターフェースに依存し、実装の詳細を知る必要がない
 */
export interface PromptApplicationService {
  /**
   * プロンプトを検索する
   */
  searchPrompts(filter: PromptFilter): Promise<Result<Prompt[], PromptError>>;
  
  /**
   * プロンプトの詳細を取得する
   */
  getPromptDetails(promptId: PromptId): Promise<Result<Prompt | null, PromptError>>;
  
  /**
   * プロンプトを実行する
   */
  executePrompt(promptId: PromptId, variables: VariableValues): Promise<Result<ExecutePromptResult, PromptError>>;
  
  /**
   * 新規プロンプトを作成する
   */
  createPrompt(params: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    variables: any[];
    createdBy: string;
    department?: string;
    position?: string;
  }): Promise<Result<Prompt, PromptError>>;
  
  /**
   * プロンプトを更新する
   */
  updatePrompt(
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
  ): Promise<Result<Prompt, PromptError>>;
  
  /**
   * プロンプトを削除する
   */
  deletePrompt(promptId: PromptId): Promise<Result<void, PromptError>>;
  
  /**
   * サンプルデータを初期化する
   * データが存在しない場合にサンプルデータを生成する
   */
  initializeSampleData(): Promise<Result<void, PromptError>>;
}
