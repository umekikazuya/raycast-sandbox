import { useState } from "react";
import { Form, ActionPanel, Action, showToast, Toast, useNavigation } from "@raycast/api";
import { Prompt } from "../domain/entities/prompt";
import { PromptVariable, createPromptVariable } from "../domain/valueObjects/prompt/PromptVariable";
import { LocalStoragePromptRepository } from "../infrastructure/repositories/local-storage-prompt-repository";
import { createPromptUseCase, CreatePromptParams } from "../application/useCase/CreatePromptUseCase";
import { updatePromptUseCase } from "../application/useCase/UpdatePromptUseCase";
import { UpdatePromptParams } from "../domain/repositories/promptRepository";

type PromptFormProps = {
  initialValues?: {
    id?: string;
    title: string;
    content: string;
    category: string;
    tags: string;
    variables: PromptVariable[];
    department?: string;
    position?: string;
  };
  mode: "create" | "edit";
};

/**
 * プロンプト作成・編集フォーム
 */
export function PromptForm({ initialValues, mode }: PromptFormProps) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [content, setContent] = useState(initialValues?.content || "");
  const [category, setCategory] = useState(initialValues?.category || "");
  const [tags, setTags] = useState(initialValues?.tags || "");
  const [variables, setVariables] = useState<PromptVariable[]>(initialValues?.variables || []);
  const [variableName, setVariableName] = useState("");
  const [variableDescription, setVariableDescription] = useState("");
  const [variableDefaultValue, setVariableDefaultValue] = useState("");
  const [department, setDepartment] = useState(initialValues?.department || "");
  const [position, setPosition] = useState(initialValues?.position || "");

  const { pop } = useNavigation();

  // リポジトリとユースケースの初期化
  const repository = new LocalStoragePromptRepository();
  const createPrompt = createPromptUseCase({ promptRepository: repository });
  const updatePrompt = updatePromptUseCase({ promptRepository: repository });

  // 変数の追加
  function handleAddVariable() {
    if (!variableName.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "変数名を入力してください",
      });
      return;
    }

    const variableResult = createPromptVariable(variableName, variableDescription, variableDefaultValue || undefined);

    if (!variableResult.ok) {
      showToast({
        style: Toast.Style.Failure,
        title: "変数の作成に失敗しました",
        message: variableResult.error,
      });
      return;
    }

    setVariables([...variables, variableResult.value]);
    setVariableName("");
    setVariableDescription("");
    setVariableDefaultValue("");
  }

  // 変数の削除
  function handleRemoveVariable(index: number) {
    const newVariables = [...variables];
    newVariables.splice(index, 1);
    setVariables(newVariables);
  }

  // フォーム送信
  async function handleSubmit() {
    if (!title.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "タイトルを入力してください",
      });
      return;
    }

    if (!content.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "プロンプト本文を入力してください",
      });
      return;
    }

    if (!category.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "カテゴリを入力してください",
      });
      return;
    }

    // タグをスペースまたはカンマで分割
    const tagArray = tags.split(/[\s,]+/).filter((tag) => tag.trim() !== "");

    try {
      if (mode === "create") {
        // 新規作成
        const params: CreatePromptParams = {
          title,
          content,
          category,
          tags: tagArray,
          variables,
          createdBy: "current-user", // 現在のユーザーIDを設定（実際には認証機能などと連携）
          department,
          position,
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
            message: result.err.message || String(result.err),
          });
        }
      } else if (mode === "edit" && initialValues?.id) {
        // 編集
        const params: UpdatePromptParams = {
          title,
          content,
          category,
          tags: tagArray,
          variables,
          department,
          position,
        };

        const result = await updatePrompt({ id: initialValues.id, params });

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
            message: result.err.message || String(result.err),
          });
        }
      }
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "エラーが発生しました",
        message: String(error),
      });
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
      <Form.TextField
        id="title"
        title="タイトル"
        placeholder="プロンプトのタイトルを入力"
        value={title}
        onChange={setTitle}
        required
      />

      <Form.TextArea
        id="content"
        title="プロンプト本文"
        placeholder="プロンプトの内容を入力（変数は {{変数名}} の形式で埋め込めます）"
        value={content}
        onChange={setContent}
        required
      />

      <Form.TextField
        id="category"
        title="カテゴリ"
        placeholder="プロンプトのカテゴリを入力"
        value={category}
        onChange={setCategory}
        required
      />

      <Form.TextField
        id="tags"
        title="タグ"
        placeholder="スペースまたはカンマ区切りでタグを入力"
        value={tags}
        onChange={setTags}
      />

      <Form.Separator />

      <Form.TextField
        id="department"
        title="部署"
        placeholder="所属部署（任意）"
        value={department}
        onChange={setDepartment}
      />

      <Form.TextField id="position" title="役職" placeholder="役職（任意）" value={position} onChange={setPosition} />

      <Form.Separator />

      <Form.Description title="変数" text="プロンプト内で使用する変数を定義します" />

      {variables.map((variable, index) => (
        <Form.Description
          key={index}
          title={`${variable.name}`}
          text={`${variable.description}${variable.defaultValue ? ` (デフォルト: ${variable.defaultValue})` : ""}`}
          info={
            <ActionPanel>
              <Action title="削除" onAction={() => handleRemoveVariable(index)} />
            </ActionPanel>
          }
        />
      ))}

      <Form.TextField
        id="variableName"
        title="変数名"
        placeholder="新しい変数の名前"
        value={variableName}
        onChange={setVariableName}
      />

      <Form.TextField
        id="variableDescription"
        title="変数の説明"
        placeholder="変数の説明"
        value={variableDescription}
        onChange={setVariableDescription}
      />

      <Form.TextField
        id="variableDefaultValue"
        title="デフォルト値"
        placeholder="デフォルト値（任意）"
        value={variableDefaultValue}
        onChange={setVariableDefaultValue}
      />

      <Form.Buttons>
        <Form.Buttons.Item title="変数を追加" onPress={handleAddVariable} disabled={!variableName.trim()} />
      </Form.Buttons>
    </Form>
  );
}
