import { useState, useEffect } from "react";
import { Detail, ActionPanel, Action, Icon, showToast, Toast, useNavigation } from "@raycast/api";
import { Prompt } from "../domain/entities/prompt";
import { PromptError } from "../shared/kernel/types";
import { PromptVariableForm } from "./prompt-variable-form";
import { ExecutePromptResult, VariableValues, executePromptUseCase } from "../application/useCase/ExecutePromptUseCase";
import { LocalStoragePromptRepository } from "../infrastructure/repositories/local-storage-prompt-repository";
import { getPromptByIdUseCase } from "../application/useCase/GetPromptByIdUseCase";

type PromptDetailProps = {
  promptId: string;
};

/**
 * プロンプト詳細表示コンポーネント
 */
export function PromptDetail({ promptId }: PromptDetailProps) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [executedContent, setExecutedContent] = useState<string | null>(null);
  const { push } = useNavigation();

  // リポジトリとユースケースの初期化
  const repository = new LocalStoragePromptRepository();
  const getPromptDetails = getPromptByIdUseCase({ promptRepository: repository });
  const executePrompt = executePromptUseCase({ 
    promptRepository: repository, 
    clipboardService: { 
      copyToClipboard: async ({ text }) => ({ tag: "ok", val: true }) 
    } 
  });
  // 初期ロード
  useEffect(() => {
    fetchPromptDetails();
  }, [promptId]);

  // プロンプト詳細の取得
  async function fetchPromptDetails() {
    setIsLoading(true);

    try {
      const result = await getPromptDetails({ id: promptId });

      if (result.ok) {
        setPrompt(result.value);
      } else {
        showToast({
          style: Toast.Style.Failure,
          title: "読み込みエラー",
          message: result.error,
        });
      }
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "エラーが発生しました",
        message: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  // プロンプト実行処理
  async function handleExecute() {
    if (!prompt) return;

    // 変数がある場合は変数入力画面へ
    if (prompt.variables.length > 0) {
      push(<PromptVariableForm promptId={promptId} variables={prompt.variables} onSubmit={executeWithVariables} />);
      return;
    }

    // 変数がない場合は直接実行
    executeWithVariables(promptId, {});
  }

  // 変数入力後のプロンプト実行
  async function executeWithVariables(promptId: string, values: VariableValues) {
    try {
      const result = await executePrompt({ params: { id: promptId, variables: values } });

      if (result.ok) {
        setExecutedContent(result.value.content);
        showToast({
          style: Toast.Style.Success,
          title: "プロンプトを実行しました",
        });
      } else {
        showToast({
          style: Toast.Style.Failure,
          title: "実行エラー",
          message: result.error,
        });
      }
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "エラーが発生しました",
        message: String(error),
      });
    }
  }

  // Markdownコンテンツの生成
  function getMarkdownContent() {
    if (!prompt) return "Loading...";

    // タグをMarkdownで表示
    const tagsStr = prompt.tags.map((tag) => `\`${tag}\``).join(" ");

    // 変数をMarkdownで表示
    const variablesStr =
      prompt.variables.length > 0
        ? prompt.variables
            .map((v) => `- \`${v.name}\`: ${v.description}${v.defaultValue ? ` (デフォルト: ${v.defaultValue})` : ""}`)
            .join("\n")
        : "変数なし";

    // メタデータ
    const metadata = `
## メタデータ

- **カテゴリ**: ${prompt.category}
- **タグ**: ${tagsStr}
- **作成者**: ${prompt.createdBy}${prompt.department ? `\n- **部署**: ${prompt.department}` : ""}${prompt.position ? `\n- **役職**: ${prompt.position}` : ""}
- **作成日**: ${prompt.createdAt.toLocaleDateString("ja-JP")}
- **更新日**: ${prompt.updatedAt.toLocaleDateString("ja-JP")}
- **実行回数**: ${prompt.executionCount}回

## 変数

${variablesStr}
`;

    // プロンプト本文
    const content = `
## プロンプト本文

\`\`\`
${prompt.content}
\`\`\`
`;

    // 実行結果がある場合
    const executedResult = executedContent
      ? `
## 実行結果

\`\`\`
${executedContent}
\`\`\`
`
      : "";

    return `# ${prompt.title}\n${metadata}\n${content}\n${executedResult}`;
  }

  // アクションパネル
  const actions = prompt ? (
    <ActionPanel>
      <Action title="プロンプトを実行" icon={Icon.Play} onAction={handleExecute} />
      <Action.CopyToClipboard
        title="プロンプトをコピー"
        content={prompt.content}
        shortcut={{ modifiers: ["cmd"], key: "c" }}
      />
      <Action
        title="プロンプトを編集"
        icon={Icon.Pencil}
        shortcut={{ modifiers: ["cmd"], key: "e" }}
        onAction={() => {}}
      />
      {executedContent && (
        <Action.CopyToClipboard
          title="実行結果をコピー"
          content={executedContent}
          shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
        />
      )}
    </ActionPanel>
  ) : undefined;

  return <Detail markdown={getMarkdownContent()} isLoading={isLoading} actions={actions} />;
}
