import {
  createPrompt,
  updatePrompt,
  incrementExecutionCount,
  generatePromptId,
  createCategory,
  createTag,
  createUserId,
} from "../../../domain/models/prompt";
import { PromptError } from "../../../domain/models/types";
import { PromptVariable } from "../../../domain/models/prompt-variable";

describe("Prompt", () => {
  const validVariable: PromptVariable = {
    name: "variable1",
    description: "テスト変数",
    defaultValue: "デフォルト値",
  };

  describe("createPrompt", () => {
    it("有効なパラメータでプロンプトを作成できる", () => {
      // Arrange
      const params = {
        title: "テストプロンプト",
        content: "これはテスト用のプロンプトです。{{variable1}}を使用します。",
        category: "テスト",
        tags: ["テスト", "サンプル"],
        variables: [validVariable],
        createdBy: "user1",
        department: "開発部",
        position: "エンジニア",
      };

      // Act
      const result = createPrompt(params);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.title).toBe(params.title);
        expect(result.value.content).toBe(params.content);
        expect(result.value.category).toBe("テスト");
        expect(result.value.tags).toEqual(["テスト", "サンプル"]);
        expect(result.value.variables).toEqual([validVariable]);
        expect(result.value.createdBy).toBe("user1");
        expect(result.value.department).toBe("開発部");
        expect(result.value.position).toBe("エンジニア");
        expect(result.value.executionCount).toBe(0);
        expect(result.value.id).toBeDefined();
        expect(result.value.createdAt).toBeInstanceOf(Date);
        expect(result.value.updatedAt).toBeInstanceOf(Date);
      }
    });

    it("タイトルが空の場合はエラーを返す", () => {
      // Arrange
      const params = {
        title: "",
        content: "これはテスト用のプロンプトです。",
        category: "テスト",
        tags: ["テスト"],
        variables: [],
        createdBy: "user1",
      };

      // Act
      const result = createPrompt(params);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(PromptError.INVALID_TITLE);
      }
    });

    it("コンテンツが空の場合はエラーを返す", () => {
      // Arrange
      const params = {
        title: "テストプロンプト",
        content: "",
        category: "テスト",
        tags: ["テスト"],
        variables: [],
        createdBy: "user1",
      };

      // Act
      const result = createPrompt(params);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(PromptError.INVALID_CONTENT);
      }
    });

    it("カテゴリが空の場合はエラーを返す", () => {
      // Arrange
      const params = {
        title: "テストプロンプト",
        content: "これはテスト用のプロンプトです。",
        category: "",
        tags: ["テスト"],
        variables: [],
        createdBy: "user1",
      };

      // Act
      const result = createPrompt(params);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(PromptError.INVALID_CONTENT);
      }
    });
  });

  describe("updatePrompt", () => {
    it("プロンプトを更新できる", () => {
      // Arrange
      const originalPrompt = {
        id: "prompt-1" as any,
        title: "元のタイトル",
        content: "元のコンテンツ",
        category: "元のカテゴリ" as any,
        tags: ["タグ1", "タグ2"] as any[],
        variables: [validVariable],
        createdBy: "user1" as any,
        createdAt: new Date("2022-01-01"),
        updatedAt: new Date("2022-01-01"),
        executionCount: 5,
        department: "開発部",
        position: "エンジニア",
      };

      const updateParams = {
        title: "新しいタイトル",
        content: "新しいコンテンツ",
        category: "新しいカテゴリ",
        tags: ["新しいタグ"],
        variables: [],
      };

      // Act
      const result = updatePrompt(originalPrompt, updateParams);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(originalPrompt.id);
        expect(result.value.title).toBe(updateParams.title);
        expect(result.value.content).toBe(updateParams.content);
        expect(result.value.category).toBe(updateParams.category);
        expect(result.value.tags).toEqual(updateParams.tags);
        expect(result.value.variables).toEqual(updateParams.variables);
        expect(result.value.createdBy).toBe(originalPrompt.createdBy);
        expect(result.value.createdAt).toBe(originalPrompt.createdAt);
        expect(result.value.executionCount).toBe(originalPrompt.executionCount);
        expect(result.value.department).toBe(originalPrompt.department);
        expect(result.value.position).toBe(originalPrompt.position);
        expect(result.value.updatedAt).not.toBe(originalPrompt.updatedAt);
      }
    });

    it("無効なカテゴリでの更新はエラーを返す", () => {
      // Arrange
      const originalPrompt = {
        id: "prompt-1" as any,
        title: "元のタイトル",
        content: "元のコンテンツ",
        category: "元のカテゴリ" as any,
        tags: ["タグ1", "タグ2"] as any[],
        variables: [],
        createdBy: "user1" as any,
        createdAt: new Date("2022-01-01"),
        updatedAt: new Date("2022-01-01"),
        executionCount: 5,
      };

      const updateParams = {
        category: "",
      };

      // Act
      const result = updatePrompt(originalPrompt, updateParams);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(PromptError.INVALID_CONTENT);
      }
    });
  });

  describe("incrementExecutionCount", () => {
    it("実行回数をインクリメントできる", () => {
      // Arrange
      const originalPrompt = {
        id: "prompt-1" as any,
        title: "テストプロンプト",
        content: "テストコンテンツ",
        category: "テスト" as any,
        tags: ["タグ"] as any[],
        variables: [],
        createdBy: "user1" as any,
        createdAt: new Date("2022-01-01"),
        updatedAt: new Date("2022-01-01"),
        executionCount: 5,
      };

      // Act
      const result = incrementExecutionCount(originalPrompt);

      // Assert
      expect(result.executionCount).toBe(6);
      expect(result.updatedAt).not.toEqual(originalPrompt.updatedAt);
    });
  });

  describe("ID生成関数", () => {
    it("generatePromptIdでUUIDが生成される", () => {
      // Act
      const id = generatePromptId();

      // Assert
      expect(typeof id).toBe("string");
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it("createCategoryで有効なカテゴリが生成される", () => {
      // Act
      const result = createCategory("テストカテゴリ");

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("テストカテゴリ");
      }
    });

    it("createTagで有効なタグが生成される", () => {
      // Act
      const result = createTag("テストタグ");

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("テストタグ");
      }
    });

    it("createUserIdでユーザーIDが生成される", () => {
      // Act
      const userId = createUserId("user123");

      // Assert
      expect(userId).toBe("user123");
    });
  });
});
