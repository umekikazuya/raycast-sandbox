import { LocalStorage } from "@raycast/api";
import { Prompt } from "../../domain/entities/prompt";
import { PromptId } from "../../domain/valueObjects/prompt/PromptId";
import { PromptFilter, PromptRepository, PromptRepositoryErr, UpdatePromptParams } from "../../domain/repositories/promptRepository";
import { Result, ok, err } from "../../shared/kernel/result";

/**
 * ローカルストレージに保存するプロンプトのキー
 */
const PROMPTS_STORAGE_KEY = "raycast-prompt-manager.prompts";

/**
 * ローカルストレージを使用したプロンプトリポジトリの実装
 */
export class LocalStoragePromptRepository implements PromptRepository {
  /**
   * すべてのプロンプトを取得
   */
  async findAll(): Promise<Result<readonly Prompt[], PromptRepositoryErr>> {
    try {
      const promptsJson = await LocalStorage.getItem<string>(PROMPTS_STORAGE_KEY);
      if (!promptsJson) {
        return ok([]);
      }

      const prompts = JSON.parse(promptsJson) as Prompt[];

      // 日付の文字列をDateオブジェクトに変換
      return ok(prompts.map(this.deserializePrompt));
    } catch (error) {
      return err({
        kind: "InfrastructureError",
        message: "Failed to retrieve prompts from storage",
        cause: error
      });
    }
  }

  /**
   * IDによるプロンプトの取得
   */
  async findById({ id }: { readonly id: PromptId }): Promise<Result<Prompt | null, PromptRepositoryErr>> {
    try {
      const result = await this.findAll();
      if (result.tag === "err") {
        return result;
      }

      const prompt = result.val.find((p) => p.id === id);
      return ok(prompt || null);
    } catch (error) {
      return err({
        kind: "InfrastructureError",
        message: "Failed to retrieve prompt by ID",
        cause: error
      });
    }
  }

  /**
   * ユーザーIDに基づくプロンプトの取得
   */

  /**
   * 条件によるプロンプトの検索
   */
  async findByFilter({ filter }: { readonly filter: PromptFilter }): Promise<Result<readonly Prompt[], PromptRepositoryErr>> {
    try {
      const result = await this.findAll();
      if (result.tag === "err") {
        return result;
      }

      let filtered = result.val;
      // キーワード検索
      if (filter.keywords) {
        const keywords = filter.keywords.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(keywords) ||
            p.content.toLowerCase().includes(keywords) ||
            p.tags.some((tag) => tag.toLowerCase().includes(keywords)),
        );
      }

      // カテゴリフィルタ
      if (filter.category) {
        filtered = filtered.filter((p) => p.category === filter.category);
      }

      // タグフィルタ
      if (filter.tags && filter.tags.length > 0) {
        filtered = filtered.filter((p) => filter.tags!.some((tag) => p.tags.includes(tag as any)));
      }

      // 作成者フィルタ
      if (filter.createdBy) {
        filtered = filtered.filter((p) => p.createdBy === filter.createdBy);
      }

      // 部署フィルタ
      if (filter.department) {
        filtered = filtered.filter((p) => p.department === filter.department);
      }

      // 役職フィルタ
      if (filter.position) {
        filtered = filtered.filter((p) => p.position === filter.position);
      }

      return ok(filtered);
    } catch (error) {
      return err({
        kind: "InfrastructureError",
        message: "Failed to filter prompts",
        cause: error
      });
    }
  }

  /**
   * プロンプトの保存
   */
  async save({ prompt }: { readonly prompt: Prompt }): Promise<Result<Prompt, PromptRepositoryErr>> {
    try {
      const result = await this.findAll();
      if (result.tag === "err") {
        return result;
      }

      // 既存のIDがある場合は重複チェック
      const existing = result.val.find((p) => p.id === prompt.id);
      if (existing) {
        return err({
          kind: "PromptAlreadyExists",
          id: prompt.id.toString()
        });
      }

      // 新しいプロンプトを追加
      const updatedPrompts = [...result.val, prompt];

      // ローカルストレージに保存
      await LocalStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(updatedPrompts));

      return ok(prompt);
    } catch (error) {
      return err({
        kind: "InfrastructureError",
        message: "Failed to save prompt",
        cause: error
      });
    }
  }

  /**
   * IDによるプロンプトの更新
   */
  async update({
    id,
    params,
  }: {
    readonly id: PromptId;
    readonly params: UpdatePromptParams;
  }): Promise<Result<Prompt, PromptRepositoryErr>> {
    try {
      const promptResult = await this.findById({ id });
      if (promptResult.tag === "err") {
        return promptResult;
      }

      const prompt = promptResult.val;
      if (!prompt) {
        return err({
          kind: "PromptNotFound",
          id: id.toString()
        });
      }

      // プロンプトを更新
      const updatedPrompt = {
        ...prompt,
        title: params.title ?? prompt.title,
        content: params.content ?? prompt.content,
        category: params.category ?? prompt.category,
        tags: params.tags ?? prompt.tags,
        variables: params.variables ?? prompt.variables,
        department: params.department ?? prompt.department,
        position: params.position ?? prompt.position,
        updatedAt: new Date()
      };

      // 全プロンプトを取得
      const allPromptsResult = await this.findAll();
      if (allPromptsResult.tag === "err") {
        return allPromptsResult;
      }

      // 更新対象のプロンプトを置き換え
      const updatedPrompts = allPromptsResult.val.map((p) => (p.id === id ? updatedPrompt : p));

      // ローカルストレージに保存
      await LocalStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(updatedPrompts));

      return ok(updatedPrompt);
    } catch (error) {
      return err({
        kind: "InfrastructureError",
        message: "Failed to update prompt",
        cause: error
      });
    }
  }

  /**
   * IDによるプロンプトの削除
   */
  async delete({ id }: { readonly id: PromptId }): Promise<Result<void, PromptRepositoryErr>> {
    try {
      const result = await this.findAll();
      if (result.tag === "err") {
        return result;
      }

      // 削除対象が存在するか確認
      const exists = result.val.some((p) => p.id === id);
      if (!exists) {
        return err({
          kind: "PromptNotFound",
          id: id.toString()
        });
      }

      // 削除対象以外のプロンプトをフィルタリング
      const updatedPrompts = result.val.filter((p) => p.id !== id);

      // ローカルストレージに保存
      await LocalStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(updatedPrompts));

      return ok(undefined);
    } catch (error) {
      return err({
        kind: "InfrastructureError",
        message: "Failed to delete prompt",
        cause: error
      });
    }
  }

  /**
   * プロンプトのデシリアライズ
   * JSONから取得した日付文字列をDateオブジェクトに変換
   */
  private deserializePrompt(prompt: Prompt): Prompt {
    return {
      ...prompt,
      createdAt: new Date(prompt.createdAt),
      updatedAt: new Date(prompt.updatedAt),
    };
  }
}
