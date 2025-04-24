import { Brand } from "../../../shared/kernel/brand";
import { Result, ok, err } from "../../../shared/kernel/result";
import { ValidationErr } from "../../../shared/kernel/types";

export type PromptTags = Brand<string[], "PromptTags">;

interface CreatePromptTagsArgs {
  raw: string[];
}

const MAX_TAGS = 10;
const TAG_REGEX = /^[a-z0-9_-]+$/;

export const createPromptTags = ({ raw }: CreatePromptTagsArgs): Result<PromptTags, ValidationErr> => {
  const unique = Array.from(new Set(raw.map((tag) => tag.trim().toLowerCase())));
  if (unique.length > MAX_TAGS) {
    return err({ kind: "TooManyTags", count: unique.length });
  }

  for (const tag of unique) {
    if (!TAG_REGEX.test(tag)) {
      return err({ kind: "InvalidTagFormat", raw: tag });
    }
  }

  return ok(unique as PromptTags);
};
