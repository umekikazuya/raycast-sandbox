import { List, ActionPanel, Action, Icon, showToast, Toast, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { Prompt } from "./domain/entities/prompt";
import { LocalStoragePromptRepository } from "./infrastructure/repositories/localStoragePromptRepository";
import { PromptListItem } from "./components/promptListItem";
import { PromptFilter } from "./domain/repositories/promptRepository";
import { PromptForm } from "./components/promptForm";
import { filterPromptsUseCase } from "./application/useCase/FilterPromptsUseCase";
import { deletePromptUseCase } from "./application/useCase/DeletePromptUseCase";

/**
 * プロンプト検索コマンド
 * アプリケーションサービスを利用して、UIと業務ロジックを分離f
 */
export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState<PromptFilter>({});
  const { push } = useNavigation();

  // リポジトリとアプリケーションサービスの初期化
  const repository = new LocalStoragePromptRepository();

  // 初期ロード
  useEffect(() => {
    fetchPrompts();
  }, []);

  // フィルタの変更時
  useEffect(() => {
    fetchPrompts();
  }, [filter]);

  // 検索処理
  async function fetchPrompts() {
    setIsLoading(true);

    const filterUseCase = filterPromptsUseCase({ promptRepository: repository });

    try {
      // 検索テキストをキーワードに設定
      const currentFilter: PromptFilter = {
        ...filter,
        keywords: searchText || undefined,
      };

      const result = await filterUseCase({ filter: currentFilter });

      if (result.tag === "ok") {
        if (result.val) {
          setPrompts(result.val);
        }
      } else {
        showToast({
          style: Toast.Style.Failure,
          title: "検索エラー",
          message: result.err.kind,
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

  // 検索テキスト変更時
  function handleSearchTextChange(text: string) {
    setSearchText(text);
    fetchPrompts();
  }

  // 新規プロンプト作成画面へ遷移
  function handleCreatePrompt() {
    push(<PromptForm initialValues={null} mode="create" />);
  }

  // プロンプト編集画面へ遷移
  function handleExecuteEditPrompt(prompt: Prompt) {
    push(<PromptForm initialValues={prompt} mode="edit" />);
  }

  // プロンプト削除
  async function handleDeletePrompt(prompt: Prompt) {
    const deleteUseCase = deletePromptUseCase({ promptRepository: repository });

    const result = await deleteUseCase({ id: prompt.id });

    if (result.tag === "ok") {
      showToast({
        style: Toast.Style.Success,
        title: "プロンプトが削除されました",
      });
      fetchPrompts();
    } else {
      showToast({
        style: Toast.Style.Failure,
        title: "削除エラー",
        message: result.err.kind,
      });
    }
  }

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={handleSearchTextChange}
      searchBarPlaceholder="プロンプトを検索..."
      filtering={false}
      throttle={true}
      actions={
        <ActionPanel>
          <Action
            title="Create New Prompt"
            icon={Icon.Plus}
            shortcut={{ modifiers: ["cmd"], key: "n" }}
            onAction={handleCreatePrompt}
          />
        </ActionPanel>
      }
    >
      <List.Section title="プロンプト一覧" subtitle={`${prompts.length}件`}>
        {prompts.map((prompt) => (
          <PromptListItem key={prompt.id} prompt={prompt} onExecuteEdit={() => handleExecuteEditPrompt(prompt)} onExecuteDelete={() => handleDeletePrompt(prompt)} />
        ))}
      </List.Section>

      {prompts.length === 0 && !isLoading && (
        <List.EmptyView
          title="No Prompts Found"
          description="No prompts match your search."
          icon={Icon.Text}
          actions={
            <ActionPanel>
              <Action title="Create New Prompt" icon={Icon.Plus} onAction={handleCreatePrompt} />
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}
