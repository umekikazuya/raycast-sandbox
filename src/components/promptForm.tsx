import { useState } from "react";
import { Form, ActionPanel, Action, showToast, Toast, useNavigation } from "@raycast/api";
import { LocalStoragePromptRepository } from "../infrastructure/repositories/localStoragePromptRepository";
import { createPromptUseCase, CreatePromptParams } from "../application/useCase/CreatePromptUseCase";
import { UpdatePromptParams, updatePromptUseCase } from "../application/useCase/UpdatePromptUseCase";
import { Prompt } from "../domain/entities/prompt";
import { createPromptCategory, PROMPT_CATEGORIES } from "../domain/valueObjects/prompt/PromptCategory";

type PromptFormProps = {
  initialValues: Prompt | null;
  mode: "create" | "edit";
};

/**
 * プロンプト作成・編集フォーム
 */
export function PromptForm({ initialValues, mode }: PromptFormProps) {
  const [keyword, setKeyword] = useState(initialValues ? initialValues.keyword : "");
  const [body, setBody] = useState(initialValues ? initialValues.body : "");
  const [category, setCategory] = useState(initialValues ? initialValues.category : "");

  const { pop } = useNavigation();

  // リポジトリとユースケースの初期化
  const repository = new LocalStoragePromptRepository();
  const createPrompt = createPromptUseCase({ promptRepository: repository });
  const updatePrompt = updatePromptUseCase({ promptRepository: repository });

  // フォーム送信
  async function handleSubmit() {
    if (!body.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "プロンプトを入力してください",
      });
      return;
    }

    if (!keyword.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "キーワードを入力してください",
      });
      return;
    }

    const categoryResult = createPromptCategory({ raw: category });
    if (categoryResult.tag !== "ok") {
      showToast({
        style: Toast.Style.Failure,
        title: "カテゴリを入力してください",
      });
      return;
    }

    if (mode === "create") {
      // 新規作成
      const params: CreatePromptParams = {
        keyword,
        body,
        category: categoryResult.val,
        type: "local",
      };

      const result = await createPrompt({ params });

      if (result.tag === "ok") {
        showToast({
          style: Toast.Style.Success,
          title: "プロンプトを作成しました",
        });
        pop();
      } else {
        showToast({
          style: Toast.Style.Failure,
          title: "作成に失敗しました",
          message: result.err.kind || String(result.err),
        });
      }
    } else if (mode === "edit" && initialValues?.id) {
      // 編集
      const params: UpdatePromptParams = {
        id: initialValues.id,
        keyword,
        body,
        category: categoryResult.val,
        type: "local",
      };
      const result = await updatePrompt({ params: params });

      if (result.tag === "ok") {
        showToast({
          style: Toast.Style.Success,
          title: "プロンプトを更新しました",
        });
        pop();
      } else {
        showToast({
          style: Toast.Style.Failure,
          title: "更新に失敗しました",
          message: result.err.kind || String(result.err),
        });
      }
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={mode === "create" ? "プロンプトを作成" : "プロンプトを更新"}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea id="body" title="プロンプト" placeholder="プロンプトを入力" value={body} onChange={setBody} />

      <Form.TextField
        id="keyword"
        title="キーワード"
        placeholder="プロンプトのキーワードを入力"
        value={keyword}
        onChange={setKeyword}
      />

      <Form.Separator />

      <Form.Dropdown
        id="category"
        title="カテゴリ"
        defaultValue="development"
        placeholder="カテゴリを選択"
        onChange={setCategory}
      >
        {Object.entries(PROMPT_CATEGORIES).map(([k, c]) => (
          <Form.Dropdown.Item key={k} title={c.label} value={c.value} icon={c.icon} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
