import { createSearchPromptsUseCase, createGetPromptDetailsUseCase } from "../../usecases/search-prompts";
import { MockPromptRepository } from "../utils/mock-prompt-repository";
import { PromptFilter } from "../../domain/repositories/prompt-repository";

// テスト用のサンプルプロンプト
const samplePrompts = [
  {
    id: "prompt-1" as any,
    title: "プログラミングのヒント",
    content: "コードレビューのポイントを教えてください",
    category: "開発" as any,
    tags: ["プログラミング", "レビュー"] as any[],
    variables: [],
    createdBy: "user1" as any,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
    executionCount: 10,
    department: "開発部",
    position: "エンジニア",
  },
  {
    id: "prompt-2" as any,
    title: "ブログ記事のアイデア",
    content: "新しい技術トレンドについて記事を書きたい",
    category: "マーケティング" as any,
    tags: ["ブログ", "コンテンツ"] as any[],
    variables: [],
    createdBy: "user2" as any,
    createdAt: new Date("2023-02-01"),
    updatedAt: new Date("2023-02-01"),
    executionCount: 5,
    department: "マーケティング部",
    position: "コンテンツマネージャー",
  },
  {
    id: "prompt-3" as any,
    title: "デザインのフィードバック",
    content: "UIデザインのフィードバックをください",
    category: "デザイン" as any,
    tags: ["UI", "フィードバック"] as any[],
    variables: [],
    createdBy: "user3" as any,
    createdAt: new Date("2023-03-01"),
    updatedAt: new Date("2023-03-01"),
    executionCount: 3,
    department: "デザイン部",
    position: "デザイナー",
  },
];

describe("検索プロンプトユースケース", () => {
  describe("createSearchPromptsUseCase", () => {
    it("すべてのプロンプトを検索できる", async () => {
      // Arrange
      const repository = new MockPromptRepository(samplePrompts);
      const searchPrompts = createSearchPromptsUseCase(repository);
      const filter: PromptFilter = {};

      // Act
      const result = await searchPrompts(filter);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(3);
        expect(result.value).toEqual(samplePrompts);
      }
    });

    it("キーワードで検索できる", async () => {
      // Arrange
      const repository = new MockPromptRepository(samplePrompts);
      const searchPrompts = createSearchPromptsUseCase(repository);
      const filter: PromptFilter = { keywords: "プログラミング" };

      // Act
      const result = await searchPrompts(filter);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(1);
        expect(result.value[0].id).toBe("prompt-1");
      }
    });

    it("カテゴリで検索できる", async () => {
      // Arrange
      const repository = new MockPromptRepository(samplePrompts);
      const searchPrompts = createSearchPromptsUseCase(repository);
      const filter: PromptFilter = { category: "マーケティング" };

      // Act
      const result = await searchPrompts(filter);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(1);
        expect(result.value[0].id).toBe("prompt-2");
      }
    });

    it("タグで検索できる", async () => {
      // Arrange
      const repository = new MockPromptRepository(samplePrompts);
      const searchPrompts = createSearchPromptsUseCase(repository);
      const filter: PromptFilter = { tags: ["UI"] };

      // Act
      const result = await searchPrompts(filter);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(1);
        expect(result.value[0].id).toBe("prompt-3");
      }
    });

    it("部署で検索できる", async () => {
      // Arrange
      const repository = new MockPromptRepository(samplePrompts);
      const searchPrompts = createSearchPromptsUseCase(repository);
      const filter: PromptFilter = { department: "開発部" };

      // Act
      const result = await searchPrompts(filter);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(1);
        expect(result.value[0].id).toBe("prompt-1");
      }
    });

    it("役職で検索できる", async () => {
      // Arrange
      const repository = new MockPromptRepository(samplePrompts);
      const searchPrompts = createSearchPromptsUseCase(repository);
      const filter: PromptFilter = { position: "デザイナー" };

      // Act
      const result = await searchPrompts(filter);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(1);
        expect(result.value[0].id).toBe("prompt-3");
      }
    });
  });

  describe("createGetPromptDetailsUseCase", () => {
    it("IDで詳細を取得できる", async () => {
      // Arrange
      const repository = new MockPromptRepository(samplePrompts);
      const getPromptDetails = createGetPromptDetailsUseCase(repository);

      // Act
      const result = await getPromptDetails("prompt-2");

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).not.toBeNull();
        expect(result.value?.id).toBe("prompt-2");
        expect(result.value?.title).toBe("ブログ記事のアイデア");
      }
    });

    it("存在しないIDの場合はnullを返す", async () => {
      // Arrange
      const repository = new MockPromptRepository(samplePrompts);
      const getPromptDetails = createGetPromptDetailsUseCase(repository);

      // Act
      const result = await getPromptDetails("non-existent-id");

      // Assert
      expect(result.ok).toBe(true);
      expect(result.value).toBeNull();
    });
  });
});
