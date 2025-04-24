import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { Prompt } from "../domain/models/prompt";

type PromptListItemProps = {
  prompt: Prompt;
  onExecute: (promptId: string) => void;
};

/**
 * プロンプトリストアイテムコンポーネント
 */
export function PromptListItem({ prompt, onExecute }: PromptListItemProps) {
  const formattedDate = prompt.updatedAt.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <List.Item
      id={prompt.id}
      title={prompt.title}
      subtitle={`カテゴリ: ${prompt.category}`}
      accessories={[
        {
          tag: { value: `実行: ${prompt.executionCount}回`, color: prompt.executionCount > 0 ? "green" : "secondary" },
        },
        { text: `${formattedDate}` },
      ]}
      keywords={[...prompt.tags, prompt.category]}
      actions={
        <ActionPanel>
          <Action title="プロンプトを実行" icon={Icon.Play} onAction={() => onExecute(prompt.id)} />
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
        </ActionPanel>
      }
    />
  );
}
