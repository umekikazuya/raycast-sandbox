import { Action, ActionPanel, Icon, List, useNavigation } from "@raycast/api";
import { Prompt } from "../../domain/entities/prompt";
import { PromptFilter } from "../../domain/repositories/promptRepository";
import { PromptForm } from "../../components/promptForm";
import { PromptListItem } from "../../components/promptListItem";
import { useDeletePrompt } from "../../lib/hook/useDeletePrompt";
import { PROMPT_CATEGORIES } from "../../domain/valueObjects/prompt/PromptCategory";

interface LocalPromptListProps {
  isLoading: boolean;
  prompts: Prompt[];
  filter: PromptFilter;
  handleSearchTextChange: (text: string | undefined) => void;
  handleSearchCategoryChange: (text: string | undefined) => void;
  fetchPrompts: () => void;
}

export const LocalPromptList: React.FunctionComponent<LocalPromptListProps> = ({
  isLoading,
  prompts,
  filter,
  handleSearchTextChange,
  handleSearchCategoryChange,
  fetchPrompts,
}) => {
  const { push } = useNavigation();
  const { deletePrompt } = useDeletePrompt(fetchPrompts);

  // Push new prompt creation screen
  function handleCreatePrompt() {
    push(<PromptForm initialValues={null} mode="create" />);
  }

  // Push edit prompt screen
  function handleExecuteEditPrompt(prompt: Prompt) {
    push(<PromptForm initialValues={prompt} mode="edit" />);
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
              {Object.entries(PROMPT_CATEGORIES).map(([k, c]) => (
                <List.Dropdown.Item key={k} title={c.label} value={c.value} icon={c.icon} />
              ))}
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
            onExecuteDelete={() => deletePrompt(prompt.id)}
          />
        ))}
      </List.Section>
    </List>
  );
};
