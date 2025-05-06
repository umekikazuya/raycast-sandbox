import { Brand } from "../../../shared/kernel/brand";
import { Result, ok, err } from "../../../shared/kernel/result";
import { ValidationErr } from "../../../shared/kernel/types";

export type PromptBody = Brand<string, "PromptBody">;

type CreatePromptBodyArgs = string;

export const makePromptBody = (raw: CreatePromptBodyArgs): Result<PromptBody, ValidationErr> => {
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > 5000) {
    return err({ kind: "InvalidPromptBody", raw });
  }
  return ok(trimmed as PromptBody);
};

// Unwrap
export const unwrapPromptBody = (body: PromptBody): string => {
  return body as string;
};
