import { List, ActionPanel, Action, Icon, showToast, Toast, useNavigation } from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import { Prompt } from "./domain/entities/prompt";
import { LocalStoragePromptRepository } from "./infrastructure/repositories/localStoragePromptRepository";
import { PromptListItem } from "./components/promptListItem";
import { PromptFilter } from "./domain/repositories/promptRepository";
import { PromptForm } from "./components/promptForm";
import { filterPromptsUseCase } from "./application/useCase/FilterPromptsUseCase";
import { deletePromptUseCase } from "./application/useCase/DeletePromptUseCase";
import { PromptCategory } from "./domain/valueObjects/prompt/PromptCategory";

/**
 * プロンプト検索コマンド
 * アプリケーションサービスを利用して、UIと業務ロジックを分離
 */
export default function Command() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filter, setFilter] = useState<PromptFilter>({ category: undefined, keyword: undefined });
  const { push } = useNavigation();

  const repository = useMemo(() => new LocalStoragePromptRepository(), []);
  const filterUseCase = useMemo(() => filterPromptsUseCase({ promptRepository: repository }), [repository]);
  const deleteUseCase = useMemo(() => deletePromptUseCase({ promptRepository: repository }), [repository]);

  // 起動時にロード.
  useEffect(() => {
    fetchPrompts();
  }, [filter]);

  // Get prompts.
  async function fetchPrompts() {
    setIsLoading(true);

    const result = await filterUseCase({ filter });

    if (result.tag === "ok") {
      setPrompts(result.val);
    }
    setIsLoading(false);
  }

  // Change search text.
  async function handleSearchTextChange(text: string | undefined) {
    setFilter({ ...filter, keyword: text ?? undefined });
  }

  // Change search category.
  async function handleSearchCategoryChange(category: string | undefined) {
    setFilter({ ...filter, category: (category as PromptCategory) ?? undefined });
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
    const result = await deleteUseCase({ id: prompt.id });

    if (result.tag !== "ok") {
      showToast({
        style: Toast.Style.Failure,
        title: "削除エラー",
        message: result.err.kind,
      });
      return;
    }

    showToast({
      style: Toast.Style.Success,
      title: "プロンプトが削除されました",
    });
    await fetchPrompts();
  }

  return (
    <List
      isLoading={isLoading}
      searchText={filter.keyword || ""}
      onSearchTextChange={handleSearchTextChange}
      throttle={true}
      searchBarPlaceholder="Search for prompts"
      searchBarAccessory={
        <>
          <List.Dropdown
            tooltip="Filter by category"
            onChange={(value: string) => {
              handleSearchCategoryChange(value);
            }}
            defaultValue={filter.category || ""}
          >
            <List.Dropdown.Section title="Categories">
              <List.Dropdown.Item title="All" value="" />
              <List.Dropdown.Item title="Writing" value="writing" />
              <List.Dropdown.Item title="Development" value="development" />
              <List.Dropdown.Item title="Learning" value="learning" />
              <List.Dropdown.Item title="Daily" value="daily" />
            </List.Dropdown.Section>
          </List.Dropdown>
        </>
      }
    >
      <List.Section title="Actions">
        <List.Item
          title="Create New Prompt"
          icon={Icon.Plus}
          actions={
            <ActionPanel>
              <Action title="Create New Prompt" icon={Icon.Plus} onAction={handleCreatePrompt} />
            </ActionPanel>
          }
        />
      </List.Section>
      <List.Section title="Prompts" subtitle={`${prompts.length} prompts found`}>
        {prompts.map((prompt) => (
          <PromptListItem
            key={prompt.id}
            prompt={prompt}
            onExecuteEdit={() => handleExecuteEditPrompt(prompt)}
            onExecuteDelete={() => handleDeletePrompt(prompt)}
          />
        ))}
      </List.Section>
    </List>
  );
}
