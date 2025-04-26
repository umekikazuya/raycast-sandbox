import { Brand } from "../../../shared/kernel/brand";
import { Result, ok, err } from "../../../shared/kernel/result";
import { ValidationErr } from "../../../shared/kernel/types";

export type PromptCategory = Brand<"writing" | "development" | "learning" | "daily", 'PromptCategory'>;

export const createPromptCategory = ({
  raw,
}: {
  raw: string;
}): Result<PromptCategory, ValidationErr> => {
  const trimmedRaw = raw.trim().toLowerCase();

  if (trimmedRaw === "writing" || trimmedRaw === "development" || trimmedRaw === "learning" || trimmedRaw === "daily") {
    return ok(trimmedRaw as PromptCategory);
  }

  return err({ kind: "InvalidCategoryName", raw });
}
