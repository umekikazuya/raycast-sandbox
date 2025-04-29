import { Result, ok, err } from "../../../shared/kernel/result";
import { ValidationErr } from "../../../shared/kernel/types";

/**
 * Prompt category definition (for value, label, icon, etc.)
 */
export interface PromptCategoryDef {
  value: string;
  label: string;
  icon: string;
  description?: string;
}

export const PROMPT_CATEGORIES: Record<string, PromptCategoryDef> = {
  writing: {
    value: "writing",
    label: "Writing",
    icon: "✍️",
    description: "For writing and composition tasks",
  },
  development: {
    value: "development",
    label: "Development",
    icon: "💻",
    description: "For programming and development work",
  },
  learning: {
    value: "learning",
    label: "Learning",
    icon: "📚",
    description: "For study, research, and investigation",
  },
  daily: {
    value: "daily",
    label: "Daily",
    icon: "🗓️",
    description: "For daily routines and regular tasks",
  },
} as const;

export type PromptCategory = keyof typeof PROMPT_CATEGORIES;

export const createPromptCategory = ({ raw }: { raw: string }): Result<PromptCategory, ValidationErr> => {
  const trimmedRaw = raw.trim().toLowerCase();
  if (trimmedRaw in PROMPT_CATEGORIES) {
    return ok(trimmedRaw as PromptCategory);
  }
  return err({ kind: "InvalidCategoryName", raw });
};
