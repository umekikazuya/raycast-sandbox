import { createExecutePromptUseCase, VariableValues } from "../../usecases/execute-prompt";
import { MockPromptRepository } from "../utils/mock-prompt-repository";
import { PromptError } from "../../domain/models/types";
import { PromptVariable } from "../../domain/models/prompt-variable";

// テスト用の変数を含むプロンプト
const variablePrompt = {
  id: "prompt-with-vars" as any,
  title: "変数を含むプロンプト",
  content: "こんにちは、{{name}}さん。あなたの職業は{{job}}ですね。{{optional}}",
  category: "テスト" as any,
  tags: ["変数", "テスト"] as any[],
  variables: [
    { name: "name", description: "名前", defaultValue: "田中" },
    { name: "job", description: "職業", defaultValue: "エンジニア" },
    { name: "optional", description: "オプションメッセージ", defaultValue: "" },
  ] as PromptVariable[],
  createdBy: "user1" as any,
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-01-01"),
  executionCount: 5,
  department: "開発部",
  position: "エンジニア",
};

describe("プロンプト実行ユースケース", () => {
  describe("createExecutePromptUseCase", () => {
    it("変数を置換してプロンプトを実行できる", async () => {
      // Arrange
      const repository = new MockPromptRepository([variablePrompt]);
      const executePrompt = createExecutePromptUseCase(repository);
      const variables: VariableValues = {
        name: "佐藤",
        job: "デザイナー",
        optional: "素晴らしい作品を作りますね。",
      };

      // Act
      const result = await executePrompt(variablePrompt.id, variables);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.promptId).toBe(variablePrompt.id);
        expect(result.value.content).toBe(
          "こんにちは、佐藤さん。あなたの職業はデザイナーですね。素晴らしい作品を作りますね。",
        );

        // 実行回数がインクリメントされたことを確認
        const updatedPrompt = await repository.findById(variablePrompt.id);
        expect(updatedPrompt.ok).toBe(true);
        if (updatedPrompt.ok && updatedPrompt.value) {
          expect(updatedPrompt.value.executionCount).toBe(variablePrompt.executionCount + 1);
        }
      }
    });

    it("一部の変数を省略しデフォルト値を使用してプロンプトを実行できる", async () => {
      // Arrange
      const repository = new MockPromptRepository([variablePrompt]);
      const executePrompt = createExecutePromptUseCase(repository);
      const variables: VariableValues = {
        name: "鈴木", // jobとoptionalは省略
      };

      // Act
      const result = await executePrompt(variablePrompt.id, variables);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.content).toBe("こんにちは、鈴木さん。あなたの職業はエンジニアですね。");
      }
    });

    it("存在しないプロンプトIDではエラーを返す", async () => {
      // Arrange
      const repository = new MockPromptRepository([variablePrompt]);
      const executePrompt = createExecutePromptUseCase(repository);
      const variables: VariableValues = {
        name: "山田",
      };

      // Act
      const result = await executePrompt("non-existent-id" as any, variables);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(PromptError.NOT_FOUND);
      }
    });

    it("スペースを含む変数名も正しく置換できる", async () => {
      // Arrange
      const spacePrompt = {
        ...variablePrompt,
        id: "space-prompt" as any,
        content: "こんにちは、{{ name }}さん。あなたの職業は{{  job  }}ですね。",
      };
      const repository = new MockPromptRepository([spacePrompt]);
      const executePrompt = createExecutePromptUseCase(repository);
      const variables: VariableValues = {
        name: "伊藤",
        job: "医師",
      };

      // Act
      const result = await executePrompt(spacePrompt.id, variables);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.content).toBe("こんにちは、伊藤さん。あなたの職業は医師ですね。");
      }
    });
  });
});
