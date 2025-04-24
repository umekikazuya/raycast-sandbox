import { Brand } from "../../../shared/kernel/brand";
import { Result, ok, err } from "../../../shared/kernel/result";
import { ValidationErr } from "../../../shared/kernel/types";

export type PromptVariableKey = Brand<string, "PromptVariableKey">;

interface CreatePromptVariableKeyArgs {
  raw: string;
}

const VARIABLE_KEY_REGEX = /^[a-zA-Z0-9_]+$/;

export const createPromptVariableKey = ({
  raw,
}: CreatePromptVariableKeyArgs): Result<PromptVariableKey, ValidationErr> => {
  const trimmed = raw.trim();
  if (!VARIABLE_KEY_REGEX.test(trimmed)) {
    return err({ kind: "InvalidVariableKeyFormat", raw: trimmed });
  }
  return ok(trimmed as PromptVariableKey);
};

export interface PromptVariable {
  key: PromptVariableKey;
  label: string;
  required: boolean;
  placeholder?: string;
}

interface CreatePromptVariableArgs {
  variables: unknown[] | null;
}

export const createPromptVariable = ({
  variables,
}: CreatePromptVariableArgs): Result<PromptVariable[] | null, ValidationErr> => {
  if (!variables || variables.length === 0) {
    return ok(null);
  }
  const promptVariables = variables.map((variable) => {
    return createPromptVariableObject(variable);
  });
  const errors = promptVariables.filter((result) => result.tag === "err");
  if (errors.length > 0) {
    return err({ kind: "InvalidVariableLabel", raw: errors[0].tag });
  }
  return ok(
    promptVariables
      .map((result) => (result.tag === "ok" ? result.val : null))
      .filter((val) => val !== null) as PromptVariable[],
  );
};

const createPromptVariableObject = (variable: unknown): Result<PromptVariable, ValidationErr> => {
  if (typeof variable === "object" && variable !== null) {
    const { key, label, required, placeholder } = variable as {
      key: string;
      label: string;
      required: boolean;
      placeholder?: string;
    };
    const keyResult = createPromptVariableKey({ raw: key });
    if (keyResult.tag === "err") {
      return err({ kind: "InvalidVariableKeyFormat", raw: key });
    }
    return ok({
      key: keyResult.val,
      label: label || "",
      required: required || false,
      placeholder: placeholder || "",
    });
  }
  return err({ kind: "InvalidVariableLabel", raw: "Variables Error" });
};
