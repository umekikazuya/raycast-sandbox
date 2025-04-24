import { Brand } from "../../../shared/kernel/brand";
import { Result, ok, err } from "../../../shared/kernel/result";
import { ValidationErr } from "../../../shared/kernel/types";

export type PromptKeyword = Brand<string, "PromptKeyword">;

interface CreatePromptKeywordArgs {
  raw: string;
}

export const createPromptKeyword = ({ raw }: CreatePromptKeywordArgs): Result<PromptKeyword, ValidationErr> => {
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > 100) {
    return err({ kind: "InvalidPromptKeyword", raw });
  }
  return ok(trimmed as PromptKeyword);
};
