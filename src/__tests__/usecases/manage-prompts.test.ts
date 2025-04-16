import {
  createCreatePromptUseCase,
  createUpdatePromptUseCase,
  createDeletePromptUseCase,
} from "../../usecases/manage-prompts";
import { MockPromptRepository } from "../utils/mock-prompt-repository";
import { PromptError } from "../../domain/models/types";

// テスト用のサンプルプロンプト
const samplePrompt = {
  id: "prompt-1" as any,
  title: "テストプロンプト",
  content: "これはテスト用のプロンプトです",
  category: "テスト" as any,
  tags: ["テスト", "サンプル"] as any[],
  variables: [],
  createdBy: "user1" as any,
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-01-01"),
  executionCount: 0,
  department: "開発部",
  position: "エンジニア",
};

describe("プロンプト管理ユースケース", () => {
  describe("createCreatePromptUseCase", () => {
    it("新規プロンプトを作成して保存できる", async () => {
      // Arrange
      const repository = new MockPromptRepository();
      const createPrompt = createCreatePromptUseCase(repository);
      const params = {
        title: "新しいプロンプト",
        content: "これは新しいテスト用プロンプトです",
        category: "テスト",
        tags: ["新規", "テスト"],
        variables: [],
        createdBy: "user1",
        department: "テスト部",
        position: "テスター",
      };

      // Act
      const result = await createPrompt(params);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.title).toBe(params.title);
        expect(result.value.content).toBe(params.content);
        expect(result.value.category).toBe(params.category);
        expect(result.value.tags).toEqual(params.tags);
        expect(result.value.createdBy).toBe(params.createdBy);
        expect(result.value.department).toBe(params.department);
        expect(result.value.position).toBe(params.position);
        expect(result.value.executionCount).toBe(0);
        expect(result.value.id).toBeDefined();
      }

      // 保存されたことを確認
      const all = await repository.findAll();
      expect(all.ok).toBe(true);
      if (all.ok) {
        expect(all.value.length).toBe(1);
      }
    });

    it("無効なパラメータではプロンプトを作成できない", async () => {
      // Arrange
      const repository = new MockPromptRepository();
      const createPrompt = createCreatePromptUseCase(repository);
      const params = {
        title: "", // 空のタイトル - 無効
        content: "これは新しいテスト用プロンプトです",
        category: "テスト",
        tags: ["新規", "テスト"],
        variables: [],
        createdBy: "user1",
      };

      // Act
      const result = await createPrompt(params);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(PromptError.INVALID_TITLE);
      }

      // 何も保存されていないことを確認
      const all = await repository.findAll();
      expect(all.ok).toBe(true);
      if (all.ok) {
        expect(all.value.length).toBe(0);
      }
    });
  });

  describe("createUpdatePromptUseCase", () => {
    it("既存のプロンプトを更新できる", async () => {
      // Arrange
      const repository = new MockPromptRepository([samplePrompt]);
      const updatePrompt = createUpdatePromptUseCase(repository);
      const params = {
        title: "更新されたタイトル",
        content: "これは更新されたコンテンツです",
        tags: ["更新", "テスト"],
      };

      // Act
      const result = await updatePrompt(samplePrompt.id, params);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(samplePrompt.id);
        expect(result.value.title).toBe(params.title);
        expect(result.value.content).toBe(params.content);
        expect(result.value.tags).toEqual(params.tags);
        expect(result.value.category).toBe(samplePrompt.category);
        expect(result.value.createdBy).toBe(samplePrompt.createdBy);
        expect(result.value.createdAt).toEqual(samplePrompt.createdAt);
        expect(result.value.updatedAt).not.toEqual(samplePrompt.updatedAt);
      }
    });

    it("存在しないIDの場合はエラーを返す", async () => {
      // Arrange
      const repository = new MockPromptRepository([samplePrompt]);
      const updatePrompt = createUpdatePromptUseCase(repository);
      const params = {
        title: "更新されたタイトル",
      };

      // Act
      const result = await updatePrompt("non-existent-id" as any, params);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(PromptError.NOT_FOUND);
      }
    });
  });

  describe("createDeletePromptUseCase", () => {
    it("既存のプロンプトを削除できる", async () => {
      // Arrange
      const repository = new MockPromptRepository([samplePrompt]);
      const deletePrompt = createDeletePromptUseCase(repository);

      // Act
      const result = await deletePrompt(samplePrompt.id);

      // Assert
      expect(result.ok).toBe(true);

      // 削除されたことを確認
      const all = await repository.findAll();
      expect(all.ok).toBe(true);
      if (all.ok) {
        expect(all.value.length).toBe(0);
      }
    });

    it("存在しないIDの場合はエラーを返す", async () => {
      // Arrange
      const repository = new MockPromptRepository([samplePrompt]);
      const deletePrompt = createDeletePromptUseCase(repository);

      // Act
      const result = await deletePrompt("non-existent-id" as any);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(PromptError.NOT_FOUND);
      }

      // 何も削除されていないことを確認
      const all = await repository.findAll();
      expect(all.ok).toBe(true);
      if (all.ok) {
        expect(all.value.length).toBe(1);
      }
    });
  });
});
