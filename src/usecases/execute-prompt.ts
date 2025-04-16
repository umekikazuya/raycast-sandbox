import { Prompt, incrementExecutionCount } from "../domain/models/prompt";
import { PromptError, PromptId, Result } from "../domain/models/types";
import { PromptVariable } from "../domain/models/prompt-variable";
import { PromptRepository } from "../domain/repositories/prompt-repository";

/**
 * 変数値のマップ型
 */
export type VariableValues = Record<string, string>;

/**
 * プロンプト実行結果型
 */
export type ExecutePromptResult = {
  content: string;
  promptId: PromptId;
};

/**
 * プロンプト実行ユースケース
 */
export function createExecutePromptUseCase(repository: PromptRepository) {
  /**
   * プロンプトの実行（変数の置換）
   */
  return async (
    promptId: PromptId,
    variableValues: VariableValues,
  ): Promise<Result<ExecutePromptResult, PromptError>> => {
    // プロンプトの取得
    const promptResult = await repository.findById(promptId);
    if (!promptResult.ok) {
      return promptResult;
    }

    const prompt = promptResult.value;
    if (!prompt) {
      return { ok: false, error: PromptError.NOT_FOUND };
    }

    // 変数の置換
    const content = replaceVariables(prompt.content, prompt.variables, variableValues);

    // 実行回数をインクリメント
    const updatedPrompt = incrementExecutionCount(prompt);

    // リポジトリを更新
    await repository.update(promptId, { executionCount: updatedPrompt.executionCount });

    return {
      ok: true,
      value: {
        content,
        promptId,
      },
    };
  };
}

/**
 * プロンプト内の変数を置換する
 */
function replaceVariables(content: string, variables: ReadonlyArray<PromptVariable>, values: VariableValues): string {
  let result = content;

  for (const variable of variables) {
    const value = values[variable.name] || variable.defaultValue || "";
    // {{変数名}} の形式で置換
    const regex = new RegExp(`{{\\s*${escapeRegExp(variable.name)}\\s*}}`, "g");
    result = result.replace(regex, value);
  }

  return result;
}

/**
 * 正規表現のエスケープ
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
