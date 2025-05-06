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

export const PROMPT_CATEGORIES = {
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

// valueプロパティの値を型として使用
export type PromptCategory = (typeof PROMPT_CATEGORIES)[keyof typeof PROMPT_CATEGORIES]["value"];

export const makePromptCategory = (raw: string): Result<PromptCategory, ValidationErr> => {
  const trimmedRaw = raw.trim().toLowerCase();

  // 値を検証して型変換
  for (const key of Object.keys(PROMPT_CATEGORIES)) {
    if (PROMPT_CATEGORIES[key as keyof typeof PROMPT_CATEGORIES].value === trimmedRaw) {
      return ok(trimmedRaw as PromptCategory);
    }
  }

  return err({ kind: "InvalidCategoryName", raw });
};

// Unwrap
export const unwrapPromptCategory = (category: PromptCategory): string => {
  return category as string;
};
