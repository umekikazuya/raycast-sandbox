import { Prompt, UpdatePromptParams } from "../../domain/models/prompt";
import { PromptId, PromptError, Result, UserId } from "../../domain/models/types";
import { PromptFilter, PromptRepository } from "../../domain/repositories/prompt-repository";

/**
 * テスト用のモックプロンプトリポジトリ
 */
export class MockPromptRepository implements PromptRepository {
  private prompts: Prompt[] = [];

  constructor(initialPrompts: Prompt[] = []) {
    this.prompts = [...initialPrompts];
  }

  async findAll(): Promise<Result<Prompt[], PromptError>> {
    return { ok: true, value: [...this.prompts] };
  }

  async findById(id: PromptId): Promise<Result<Prompt | null, PromptError>> {
    const prompt = this.prompts.find((p) => p.id === id);
    return { ok: true, value: prompt || null };
  }

  async findByUserId(userId: UserId): Promise<Result<Prompt[], PromptError>> {
    const filtered = this.prompts.filter((p) => p.createdBy === userId);
    return { ok: true, value: filtered };
  }

  async findByFilter(filter: PromptFilter): Promise<Result<Prompt[], PromptError>> {
    let filtered = [...this.prompts];

    if (filter.keywords) {
      const keywords = filter.keywords.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(keywords) ||
          p.content.toLowerCase().includes(keywords) ||
          p.tags.some((tag) => tag.toLowerCase().includes(keywords)),
      );
    }

    if (filter.category) {
      filtered = filtered.filter((p) => p.category === filter.category);
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter((p) => filter.tags!.some((tag) => p.tags.includes(tag as any)));
    }

    if (filter.createdBy) {
      filtered = filtered.filter((p) => p.createdBy === filter.createdBy);
    }

    if (filter.department) {
      filtered = filtered.filter((p) => p.department === filter.department);
    }

    if (filter.position) {
      filtered = filtered.filter((p) => p.position === filter.position);
    }

    return { ok: true, value: filtered };
  }

  async save(prompt: Prompt): Promise<Result<Prompt, PromptError>> {
    // 既存のIDがある場合は重複チェック
    const existing = this.prompts.find((p) => p.id === prompt.id);
    if (existing) {
      return { ok: false, error: PromptError.DUPLICATE_ID };
    }

    this.prompts.push(prompt);
    return { ok: true, value: prompt };
  }

  async update(id: PromptId, params: UpdatePromptParams): Promise<Result<Prompt, PromptError>> {
    const index = this.prompts.findIndex((p) => p.id === id);
    if (index === -1) {
      return { ok: false, error: PromptError.NOT_FOUND };
    }

    const existingPrompt = this.prompts[index];

    // 更新されたプロンプトを保存
    const updatedPrompt: Prompt = {
      ...existingPrompt,
      title: params.title !== undefined ? params.title : existingPrompt.title,
      content: params.content !== undefined ? params.content : existingPrompt.content,
      category: params.category !== undefined ? (params.category as any) : existingPrompt.category,
      tags: params.tags !== undefined ? (params.tags as any[]) : existingPrompt.tags,
      variables: params.variables !== undefined ? params.variables : existingPrompt.variables,
      updatedAt: new Date(),
      department: params.department !== undefined ? params.department : existingPrompt.department,
      position: params.position !== undefined ? params.position : existingPrompt.position,
      executionCount: params.executionCount !== undefined ? params.executionCount : existingPrompt.executionCount,
    };

    this.prompts[index] = updatedPrompt;

    return { ok: true, value: updatedPrompt };
  }

  async delete(id: PromptId): Promise<Result<void, PromptError>> {
    const index = this.prompts.findIndex((p) => p.id === id);
    if (index === -1) {
      return { ok: false, error: PromptError.NOT_FOUND };
    }

    this.prompts.splice(index, 1);
    return { ok: true, value: undefined };
  }
}
