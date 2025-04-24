import { Form, ActionPanel, Action, useNavigation } from "@raycast/api";
import { useState } from "react";
import { PromptVariable } from "../domain/models/prompt-variable";
import { VariableValues } from "../usecases/execute-prompt";

type PromptVariableFormProps = {
  promptId: string;
  variables: PromptVariable[];
  onSubmit: (promptId: string, values: VariableValues) => void;
};

/**
 * プロンプト変数入力フォームコンポーネント
 */
export function PromptVariableForm({ promptId, variables, onSubmit }: PromptVariableFormProps) {
  const { pop } = useNavigation();
  const [values, setValues] = useState<VariableValues>({});

  // フォーム送信時
  function handleSubmit() {
    onSubmit(promptId, values);
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="実行" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      {variables.map((variable) => (
        <Form.TextField
          key={variable.name}
          id={variable.name}
          title={variable.name}
          placeholder={variable.description}
          defaultValue={variable.defaultValue}
          info={variable.description}
          onChange={(value) => setValues({ ...values, [variable.name]: value })}
        />
      ))}
    </Form>
  );
}
