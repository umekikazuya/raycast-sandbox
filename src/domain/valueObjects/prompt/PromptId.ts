import { Brand } from "../../../shared/kernel/brand";
import { Result, ok, err } from "../../../shared/kernel/result";
import { ValidationErr } from "../../../shared/kernel/types";

export type PromptId = Brand<string, "PromptId">;

interface CreatePromptIdArgs {
  raw: string;
}

export const createPromptId = ({ raw }: CreatePromptIdArgs): Result<PromptId, ValidationErr> => {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length === 0) {
    return err({ kind: "InvalidPromptId", raw });
  }
  return ok(trimmed as PromptId);
};
