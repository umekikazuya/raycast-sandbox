import { Brand } from "../../../shared/kernel/brand";
import { Result, ok, err } from "../../../shared/kernel/result";
import { ValidationErr } from "../../../shared/kernel/types";

export type PromptCategory = Brand<string, "PromptCategory">;

interface CreatePromptCategoryArgs {
  raw: string;
}

const CATEGORY_REGEX = /^[a-z0-9_-]+$/;

export const createPromptCategory = ({ raw }: CreatePromptCategoryArgs): Result<PromptCategory, ValidationErr> => {
  const trimmed = raw.trim().toLowerCase();

  if (!CATEGORY_REGEX.test(trimmed)) {
    return err({ kind: "InvalidCategoryFormat", raw: trimmed });
  }

  return ok(trimmed as PromptCategory);
};
