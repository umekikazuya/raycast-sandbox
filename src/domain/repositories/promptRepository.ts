import { PromptAggregate } from "../entities/prompt/PromptAggregate.ts";
import { PromptId } from "../valueObjects/prompt/PromptId";
import { Result } from "../../shared/kernel/result";
import { InfrastructureErr, ValidationErr } from "../../shared/kernel/types";
import { PromptCategory } from "../valueObjects/prompt/PromptCategory";

/**
 * プロンプトリポジトリエラー型
 */
export type PromptRepositoryErr =
  | ValidationErr
  | InfrastructureErr
  | { kind: "PromptNotFound"; id: string }
  | { kind: "PromptAlreadyExists"; id: string }
  | { kind: "OptimisticLockError"; id: string; version: number };

/**
 * プロンプトの検索フィルタ
 */
export type PromptFilter = {
  readonly keyword?: string;
  readonly category?: PromptCategory;
};

/**
 * Interface for PromptRepository
 * This interface defines the methods for managing prompts in the repository.
 *
 * @interface PromptRepository
 * @description Interface for managing prompts in the repository.
 * @property {function} findAll - Retrieves all prompts.
 * @property {function} findById - Retrieves a prompt by its ID.
 * @property {function} findByFilter - Searches for prompts based on the provided filter.
 * @property {function} save - Saves a prompt (creates or updates).
 * @property {function} update - Updates a prompt by its ID.
 * @property {function} delete - Deletes a prompt by its ID.
 */
export interface PromptRepository {
  /**
   * すべてのプロンプトを取得
   */
  findAll(): Promise<Result<PromptAggregate[], PromptRepositoryErr>>;

  /**
   * IDによるプロンプトの取得
   */
  findById({ id }: { readonly id: PromptId }): Promise<Result<PromptAggregate | null, PromptRepositoryErr>>;

  /**
   * 条件によるプロンプトの検索
   */
  findByFilter({ filter }: { readonly filter: PromptFilter }): Promise<Result<PromptAggregate[], PromptRepositoryErr>>;

  /**
   * プロンプトの保存
   * 新規プロンプトの場合は作成、既存のプロンプトの場合は更新
   */
  save({ prompt }: { readonly prompt: PromptAggregate }): Promise<Result<PromptAggregate, PromptRepositoryErr>>;

  /**
   * IDによるプロンプトの更新
   * 部分的な更新をサポート
   */
  update({ prompt }: { readonly prompt: PromptAggregate }): Promise<Result<PromptAggregate, PromptRepositoryErr>>;

  /**
   * IDによるプロンプトの削除
   */
  delete({ id }: { readonly id: PromptId }): Promise<Result<void, PromptRepositoryErr>>;
}
