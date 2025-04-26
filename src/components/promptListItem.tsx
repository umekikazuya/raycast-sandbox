import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { Prompt } from "../domain/entities/prompt";

type PromptListItemProps = {
  prompt: Prompt;
  onExecuteEdit: (promptId: string) => void;
};

/**
 * ListItem Component
 */
export function PromptListItem({ prompt, onExecuteEdit }: PromptListItemProps) {

  return (
    <List.Item
      id={prompt.id}
      title={prompt.body}
      subtitle={prompt.category}
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
            onAction={() => onExecuteEdit(prompt.id)}
          />
        </ActionPanel>
      }
    />
  );
}
