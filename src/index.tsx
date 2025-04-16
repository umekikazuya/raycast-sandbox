import { List, ActionPanel, Action, Icon, showToast, Toast, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { Prompt } from "./domain/models/prompt";
import { LocalStoragePromptRepository } from "./infrastructure/repositories/local-storage-prompt-repository";
import { PromptListItem } from "./components/prompt-list-item";
import { PromptFilter } from "./domain/repositories/prompt-repository";
import { PromptDetail } from "./components/prompt-detail";
import { PromptForm } from "./components/prompt-form";
import { VariableValues } from "./usecases/execute-prompt";
import { PromptApplicationServiceImpl } from "./application/services/prompt-application-service-impl";

/**
 * プロンプト検索コマンド
 * アプリケーションサービスを利用して、UIと業務ロジックを分離
 */
export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState<PromptFilter>({});
  const { push } = useNavigation();

  // リポジトリとアプリケーションサービスの初期化
  const repository = new LocalStoragePromptRepository();
  const promptService = new PromptApplicationServiceImpl(repository);

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
    
    try {
      // サンプルデータの初期化（初回のみ）
      await promptService.initializeSampleData();
      
      // 検索テキストをキーワードに設定
      const currentFilter: PromptFilter = {
        ...filter,
        keywords: searchText || undefined
      };

      const result = await promptService.searchPrompts(currentFilter);
      
      if (result.ok) {
        setPrompts(result.value);
      } else {
        showToast({
          style: Toast.Style.Failure,
          title: "検索エラー",
          message: result.error
        });
      }
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "エラーが発生しました",
        message: String(error)
      });
    } finally {
      setIsLoading(false);
    }
  }

  // 検索テキスト変更時
  function handleSearchTextChange(text: string) {
    setSearchText(text);
    // 遅延実行（パフォーマンス向上のため）
    const timeoutId = setTimeout(() => {
      fetchPrompts();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }

  // プロンプト詳細画面へ遷移
  function handleShowDetail(promptId: string) {
    push(<PromptDetail promptId={promptId} />);
  }

  // プロンプト実行
  async function handleExecutePrompt(promptId: string, variables: VariableValues = {}) {
    try {
      const result = await promptService.executePrompt(promptId as any, variables);
      
      if (result.ok) {
        showToast({
          style: Toast.Style.Success,
          title: "プロンプトを実行しました",
        });
        
        // クリップボードにコピーするなどの追加機能も実装可能
      } else {
        showToast({
          style: Toast.Style.Failure,
          title: "実行エラー",
          message: result.error
        });
      }
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "エラーが発生しました",
        message: String(error)
      });
    }
  }

  // 新規プロンプト作成画面へ遷移
  function handleCreatePrompt() {
    push(
      <PromptForm
        mode="create"
      />
    );
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
            title="新規プロンプト作成"
            icon={Icon.Plus}
            shortcut={{ modifiers: ["cmd"], key: "n" }}
            onAction={handleCreatePrompt}
          />
        </ActionPanel>
      }
    >
      <List.Section title="プロンプト一覧" subtitle={`${prompts.length}件`}>
        {prompts.map((prompt) => (
          <PromptListItem 
            key={prompt.id} 
            prompt={prompt} 
            onExecute={handleExecutePrompt} 
          />
        ))}
      </List.Section>
      
      {prompts.length === 0 && !isLoading && (
        <List.EmptyView
          title="プロンプトが見つかりません"
          description="新しいプロンプトを作成するか、検索条件を変更してください。"
          icon={Icon.Text}
          actions={
            <ActionPanel>
              <Action
                title="新規プロンプト作成"
                icon={Icon.Plus}
                onAction={handleCreatePrompt}
              />
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}
