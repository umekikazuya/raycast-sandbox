import { Result, PromptError } from "./types";

/**
 * プロンプト変数の型
 */
export type PromptVariable = {
  readonly name: string;
  readonly description: string;
  readonly defaultValue?: string;
};

/**
 * プロンプト変数の作成関数
 */
export function createPromptVariable(
  name: string,
  description: string,
  defaultValue?: string,
): Result<PromptVariable, PromptError> {
  if (!name.trim()) {
    return { ok: false, error: PromptError.INVALID_CONTENT };
  }

  return {
    ok: true,
    value: {
      name,
      description,
      defaultValue,
    },
  };
}

/**
 * プロンプト変数の値の検証
 */
export function validateVariableValue(variable: PromptVariable, value: string | undefined): boolean {
  // 基本的な検証ロジック（拡張可能）
  return value !== undefined || variable.defaultValue !== undefined;
}
