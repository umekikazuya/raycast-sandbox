import { Brand } from "../../../shared/kernel/brand";
import { Result, ok, err } from "../../../shared/kernel/result";
import { ValidationErr } from "../../../shared/kernel/types";

export type PromptId = Brand<string, "PromptId">;

export type CreatePromptIdArgs = string;

export function makePromptId(raw: CreatePromptIdArgs): Result<PromptId, ValidationErr> {
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return err({ kind: "InvalidPromptId", reason: "empty", raw });
  }

  return ok(trimmed as PromptId);
}

// Unwrap
export function unwrapPromptId(id: PromptId): string {
  return id as string;
}
