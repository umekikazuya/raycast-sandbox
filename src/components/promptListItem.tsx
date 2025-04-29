import { Action, ActionPanel, confirmAlert, Icon, List } from "@raycast/api";
import { Prompt } from "../domain/entities/prompt";
import { PROMPT_CATEGORIES } from "../domain/valueObjects/prompt/PromptCategory";

type PromptListItemProps = {
  prompt: Prompt;
  onExecuteEdit: (prompt: Prompt) => void;
  onExecuteDelete: (prompt: Prompt) => void;
};

/**
 * ListItem Component
 */
export function PromptListItem({ prompt, onExecuteEdit, onExecuteDelete }: PromptListItemProps) {
  return (
    <List.Item
      id={prompt.id}
      title={prompt.body}
      subtitle={prompt.category}
      icon={PROMPT_CATEGORIES[prompt.category]?.icon ?? Icon.Document}
      accessories={[{ text: prompt.keyword }]}
      keywords={[prompt.keyword]}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Copy Prompt"
            content={prompt.body}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
          <Action
            title="Edit Prompt"
            icon={Icon.Pencil}
            shortcut={{ modifiers: ["cmd"], key: "e" }}
            onAction={() => onExecuteEdit(prompt)}
          />
          <Action
            title="Delete Prompt"
            icon={Icon.Trash}
            shortcut={{ modifiers: ["cmd"], key: "d" }}
            onAction={async () => {
              const confirmed = await confirmAlert({ title: "Delete Prompt" });
              if (confirmed) {
                onExecuteDelete(prompt);
              }
            }}
          />
        </ActionPanel>
      }
    />
  );
}
