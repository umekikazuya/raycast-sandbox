import { PromptRepository, PromptRepositoryErr, PromptFilter } from "../../domain/repositories/promptRepository";
import { Prompt } from "../../domain/entities/prompt";
import { PromptId } from "../../domain/valueObjects/prompt/PromptId";
import { Result, ok, err } from "../../shared/kernel/result";
import { LocalStorage } from "@raycast/api";

/**
 * Raycast LocalStorageを利用したPromptRepository実装
 * エラー型はPromptRepositoryErr（ValidationErr, InfrastructureErr, PromptNotFound, ...）
 */
export class LocalStoragePromptRepository implements PromptRepository {
  private static STORAGE_KEY = "prompts";

  async findAll(): Promise<Result<Prompt[], PromptRepositoryErr>> {
    const raw = await LocalStorage.getItem<string>(LocalStoragePromptRepository.STORAGE_KEY);
    if (!raw) return ok([]);
    const prompts: Prompt[] = JSON.parse(raw);
    return ok(prompts);
  }

  async findById({ id }: { readonly id: PromptId }): Promise<Result<Prompt | null, PromptRepositoryErr>> {
    const all = await this.findAll();
    if (all.tag === "err") return all;
    const found = all.val.find((p) => p.id === id);
    return ok(found ?? null);
  }

  async findByFilter({ filter }: { readonly filter: PromptFilter }): Promise<Result<Prompt[], PromptRepositoryErr>> {
    const all = await this.findAll();
    if (all.tag !== "ok") return all;
    let filtered = all.val;

    if (filter.keyword !== undefined && filter.keyword !== "") {
      filtered = filtered.filter((p) => p.keyword.includes(filter.keyword!) || p.body.includes(filter.keyword!));
    }
    if (filter.category) {
      filtered = filtered.filter((p) => p.category === filter.category);
    }

    return ok(filtered);
  }

  async save({ prompt }: { readonly prompt: Prompt }): Promise<Result<Prompt, PromptRepositoryErr>> {
    const all = await this.findAll();
    if (all.tag === "err") return all;
    const exists = all.val.find((p) => p.id === prompt.id);
    let newPrompts: Prompt[];
    if (exists) {
      newPrompts = all.val.map((p) => (p.id === prompt.id ? prompt : p));
    } else {
      newPrompts = [...all.val, prompt];
    }
    try {
      await LocalStorage.setItem(LocalStoragePromptRepository.STORAGE_KEY, JSON.stringify(newPrompts));
      return ok(prompt);
    } catch (e) {
      return err({ kind: "StorageError", message: "Failed to save prompt" });
    }
  }

  async update({ prompt }: { readonly prompt: Prompt }): Promise<Result<Prompt, PromptRepositoryErr>> {
    const all = await this.findAll();
    if (all.tag === "err") return all;
    const idx = all.val.findIndex((p) => p.id === prompt.id);
    if (idx === -1) return err({ kind: "PromptNotFound", id: prompt.id });
    const old = all.val[idx];
    const updated: Prompt = {
      ...old,
      ...prompt,
      updatedAt: new Date(),
    };
    const newPrompts = [...all.val];
    newPrompts[idx] = updated;
    try {
      await LocalStorage.setItem(LocalStoragePromptRepository.STORAGE_KEY, JSON.stringify(newPrompts));
      return ok(updated);
    } catch (e) {
      return err({ kind: "StorageError", message: "Failed to update prompt" });
    }
  }

  async delete({ id }: { readonly id: PromptId }): Promise<Result<void, PromptRepositoryErr>> {
    const all = await this.findAll();
    if (all.tag === "err") return all;
    const exists = all.val.some((p) => p.id === id);
    if (!exists) return err({ kind: "PromptNotFound", id });
    const newPrompts = all.val.filter((p) => p.id !== id);
    try {
      await LocalStorage.setItem(LocalStoragePromptRepository.STORAGE_KEY, JSON.stringify(newPrompts));
      return ok(undefined);
    } catch (e) {
      return err({ kind: "StorageError", message: "Failed to delete prompt" });
    }
  }
}
