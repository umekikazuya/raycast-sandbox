import { createPromptVariable, validateVariableValue } from "../../../domain/models/prompt-variable";
import { PromptError } from "../../../domain/models/types";

describe("PromptVariable", () => {
  describe("createPromptVariable", () => {
    it("正しいパラメータで変数を作成できる", () => {
      // Arrange
      const name = "topic";
      const description = "記事のトピック";
      const defaultValue = "テクノロジー";

      // Act
      const result = createPromptVariable(name, description, defaultValue);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe(name);
        expect(result.value.description).toBe(description);
        expect(result.value.defaultValue).toBe(defaultValue);
      }
    });

    it("デフォルト値なしでも変数を作成できる", () => {
      // Arrange
      const name = "topic";
      const description = "記事のトピック";

      // Act
      const result = createPromptVariable(name, description);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe(name);
        expect(result.value.description).toBe(description);
        expect(result.value.defaultValue).toBeUndefined();
      }
    });

    it("空の名前で変数を作成するとエラーを返す", () => {
      // Arrange
      const name = "";
      const description = "記事のトピック";

      // Act
      const result = createPromptVariable(name, description);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(PromptError.INVALID_CONTENT);
      }
    });

    it("スペースのみの名前で変数を作成するとエラーを返す", () => {
      // Arrange
      const name = "   ";
      const description = "記事のトピック";

      // Act
      const result = createPromptVariable(name, description);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(PromptError.INVALID_CONTENT);
      }
    });
  });

  describe("validateVariableValue", () => {
    it("値が提供されている場合はtrueを返す", () => {
      // Arrange
      const variable = { name: "topic", description: "記事のトピック" };
      const value = "テクノロジー";

      // Act
      const result = validateVariableValue(variable, value);

      // Assert
      expect(result).toBe(true);
    });

    it("値が提供されていないがデフォルト値がある場合はtrueを返す", () => {
      // Arrange
      const variable = { name: "topic", description: "記事のトピック", defaultValue: "テクノロジー" };
      const value = undefined;

      // Act
      const result = validateVariableValue(variable, value);

      // Assert
      expect(result).toBe(true);
    });

    it("値もデフォルト値も提供されていない場合はfalseを返す", () => {
      // Arrange
      const variable = { name: "topic", description: "記事のトピック" };
      const value = undefined;

      // Act
      const result = validateVariableValue(variable, value);

      // Assert
      expect(result).toBe(false);
    });
  });
});
