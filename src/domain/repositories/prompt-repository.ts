import { Prompt, UpdatePromptParams } from "../models/prompt";
import { PromptId, UserId, Result, PromptError } from "../models/types";

/**
 * プロンプトリポジトリインターフェース
 */
export interface PromptRepository {
  /**
   * すべてのプロンプトを取得
   */
  findAll(): Promise<Result<Prompt[], PromptError>>;

  /**
   * IDによるプロンプトの取得
   */
  findById(id: PromptId): Promise<Result<Prompt | null, PromptError>>;

  /**
   * ユーザーIDに基づくプロンプトの取得
   */
  findByUserId(userId: UserId): Promise<Result<Prompt[], PromptError>>;

  /**
   * 条件によるプロンプトの検索
   */
  findByFilter(filter: PromptFilter): Promise<Result<Prompt[], PromptError>>;

  /**
   * プロンプトの保存
   */
  save(prompt: Prompt): Promise<Result<Prompt, PromptError>>;

  /**
   * IDによるプロンプトの更新
   */
  update(id: PromptId, params: UpdatePromptParams): Promise<Result<Prompt, PromptError>>;

  /**
   * IDによるプロンプトの削除
   */
  delete(id: PromptId): Promise<Result<void, PromptError>>;
}

/**
 * プロンプトの検索フィルタ
 */
export type PromptFilter = {
  keywords?: string;
  category?: string;
  tags?: string[];
  createdBy?: string;
  department?: string;
  position?: string;
};
