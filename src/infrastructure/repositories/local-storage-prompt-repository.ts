import { LocalStorage } from "@raycast/api";
import { Prompt, UpdatePromptParams, updatePrompt } from "../../domain/models/prompt";
import { PromptId, PromptError, Result, UserId } from "../../domain/models/types";
import { PromptFilter, PromptRepository } from "../../domain/repositories/prompt-repository";

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
  async findAll(): Promise<Result<Prompt[], PromptError>> {
    try {
      const promptsJson = await LocalStorage.getItem<string>(PROMPTS_STORAGE_KEY);
      if (!promptsJson) {
        return { ok: true, value: [] };
      }

      const prompts = JSON.parse(promptsJson) as Prompt[];

      // 日付の文字列をDateオブジェクトに変換
      return {
        ok: true,
        value: prompts.map(this.deserializePrompt),
      };
    } catch (error) {
      return { ok: false, error: PromptError.STORAGE_ERROR };
    }
  }

  /**
   * IDによるプロンプトの取得
   */
  async findById(id: PromptId): Promise<Result<Prompt | null, PromptError>> {
    try {
      const result = await this.findAll();
      if (!result.ok) {
        return result;
      }

      const prompt = result.value.find((p) => p.id === id);
      return { ok: true, value: prompt || null };
    } catch (error) {
      return { ok: false, error: PromptError.STORAGE_ERROR };
    }
  }

  /**
   * ユーザーIDに基づくプロンプトの取得
   */
  async findByUserId(userId: UserId): Promise<Result<Prompt[], PromptError>> {
    try {
      const result = await this.findAll();
      if (!result.ok) {
        return result;
      }

      return {
        ok: true,
        value: result.value.filter((p) => p.createdBy === userId),
      };
    } catch (error) {
      return { ok: false, error: PromptError.STORAGE_ERROR };
    }
  }

  /**
   * 条件によるプロンプトの検索
   */
  async findByFilter(filter: PromptFilter): Promise<Result<Prompt[], PromptError>> {
    try {
      const result = await this.findAll();
      if (!result.ok) {
        return result;
      }

      let filtered = result.value;

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

      return { ok: true, value: filtered };
    } catch (error) {
      return { ok: false, error: PromptError.STORAGE_ERROR };
    }
  }

  /**
   * プロンプトの保存
   */
  async save(prompt: Prompt): Promise<Result<Prompt, PromptError>> {
    try {
      const result = await this.findAll();
      if (!result.ok) {
        return { ok: false, error: result.error };
      }

      // 既存のIDがある場合は重複チェック
      const existing = result.value.find((p) => p.id === prompt.id);
      if (existing) {
        return { ok: false, error: PromptError.DUPLICATE_ID };
      }

      // 新しいプロンプトを追加
      const updatedPrompts = [...result.value, prompt];

      // ローカルストレージに保存
      await LocalStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(updatedPrompts));

      return { ok: true, value: prompt };
    } catch (error) {
      return { ok: false, error: PromptError.STORAGE_ERROR };
    }
  }

  /**
   * IDによるプロンプトの更新
   */
  async update(id: PromptId, params: UpdatePromptParams): Promise<Result<Prompt, PromptError>> {
    try {
      const promptResult = await this.findById(id);
      if (!promptResult.ok) {
        return { ok: false, error: promptResult.error };
      }

      const prompt = promptResult.value;
      if (!prompt) {
        return { ok: false, error: PromptError.NOT_FOUND };
      }

      // プロンプトを更新
      const updateResult = updatePrompt(prompt, params);
      if (!updateResult.ok) {
        return updateResult;
      }

      const updatedPrompt = updateResult.value;

      // 全プロンプトを取得
      const allPromptsResult = await this.findAll();
      if (!allPromptsResult.ok) {
        return { ok: false, error: allPromptsResult.error };
      }

      // 更新対象のプロンプトを置き換え
      const updatedPrompts = allPromptsResult.value.map((p) => (p.id === id ? updatedPrompt : p));

      // ローカルストレージに保存
      await LocalStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(updatedPrompts));

      return { ok: true, value: updatedPrompt };
    } catch (error) {
      return { ok: false, error: PromptError.STORAGE_ERROR };
    }
  }

  /**
   * IDによるプロンプトの削除
   */
  async delete(id: PromptId): Promise<Result<void, PromptError>> {
    try {
      const result = await this.findAll();
      if (!result.ok) {
        return { ok: false, error: result.error };
      }

      // 削除対象が存在するか確認
      const exists = result.value.some((p) => p.id === id);
      if (!exists) {
        return { ok: false, error: PromptError.NOT_FOUND };
      }

      // 削除対象以外のプロンプトをフィルタリング
      const updatedPrompts = result.value.filter((p) => p.id !== id);

      // ローカルストレージに保存
      await LocalStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(updatedPrompts));

      return { ok: true, value: undefined };
    } catch (error) {
      return { ok: false, error: PromptError.STORAGE_ERROR };
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
