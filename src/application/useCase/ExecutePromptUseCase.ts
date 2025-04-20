import { Prompt } from "../../domain/entities/prompt";
import { PromptId } from "../../domain/valueObjects/prompt/PromptId";
import { PromptRepository, PromptRepositoryErr } from "../../domain/repositories/promptRepository";
import { ClipboardService, ClipboardServiceErr } from "../../domain/services/clipboardService";
import { Result, ok, err } from "../../shared/kernel/result";
import { ApplicationErr } from "../../shared/kernel/types";

export type ExecutePromptParams = Readonly<{
  id: PromptId;
  variables: Record<string, string>;
}>;

export type ExecutionOutput = Readonly<{
  content: string;
  executedAt: Date;
}>;

export type ExecutePromptErr = ApplicationErr | PromptRepositoryErr | ClipboardServiceErr;

/**
 * プロンプト実行ユースケース
 *
 * プロンプトの変数を置換し、結果をクリップボードにコピーします
 */
export const executePromptUseCase = ({ promptRepository, clipboardService }: { readonly promptRepository: PromptRepository; readonly clipboardService: ClipboardService; } ) => async ({ params }: { readonly params: ExecutePromptParams }): Promise<Result<ExecutionOutput, ExecutePromptErr>> => {
  // プロンプトの取得
  const promptResult = await promptRepository.findById({ id: params.id });

  if (promptResult.tag === "err") {
    return err({
      kind: "RepositoryError",
      message: "プロンプトの取得に失敗しました",
      cause: promptResult.err,
    });
  }

  if (!promptResult.val) {
    return err({
      kind: "NotFoundError",
      message: `ID ${params.id} のプロンプトが見つかりません`,
    });
  }

  // 変数が入力されてない場合は実行しない
  if (promptResult.val.variables && promptResult.val.variables.length > 0) {
    for (const variable of promptResult.val.variables) {
      const key = variable.key.toString();
      // If variable is required but not provided or empty
      if (variable.required && (!params.variables[key] || params.variables[key].trim() === '')) {
        return err({
          kind: "ValidationError",
          message: "変数が入力されていません",
        });
      }
    }
  }
  // プロンプトの変数を置換
  const finalContent = applyVariablesToPrompt({
    prompt: promptResult.val,
    variables: params.variables,
  });

  // クリップボードにコピー
  const clipboardResult = await clipboardService.copyToClipboard({ text: finalContent });

  if (clipboardResult.tag === "err") {
    return err({
      kind: "ExecutionError",
      message: "クリップボードへのコピーに失敗しました",
      cause: clipboardResult.err,
    });
  }

  // 出力結果を返す
  return ok({
    content: finalContent,
    executedAt: new Date(),
  });
};

/**
 * プロンプト内の変数を置換する関数
 */
const applyVariablesToPrompt = ({
  prompt,
  variables,
}: {
  readonly prompt: Prompt;
  readonly variables: Record<string, string>;
}): string => {
  let content = prompt.body.toString();

  // プロンプト内の変数プレースホルダーを実際の値で置換
  if (!prompt.variables) {
    return content;
  }
  for (const variable of prompt.variables) {
    const key = variable.key.toString();
    if (variables[key]) {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, "g"), variables[key]);
    }
  }

  return content;
};
