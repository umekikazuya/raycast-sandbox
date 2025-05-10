import { Brand } from "../../../shared/kernel/brand";
import { Result, ok, err } from "../../../shared/kernel/result";
import { ValidationErr } from "../../../shared/kernel/types";

export type PromptKeyword = Brand<string, "PromptKeyword">;

type CreatePromptKeywordArgs = string;

export const makePromptKeyword = (raw: CreatePromptKeywordArgs): Result<PromptKeyword, ValidationErr> => {
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > 50) {
    return err({ kind: "InvalidPromptKeyword", raw });
  }
  return ok(trimmed as PromptKeyword);
};

// Unwrap
export const unwrapPromptKeyword = (keyword: PromptKeyword): string => {
  return keyword as string;
};
