import { Brand } from "../../shared/kernel/brand";
import { Result, ok, err } from "../../shared/kernel/result";
import { ValidationErr } from "../../shared/kernel/types";

export type CategoryId = Brand<string, "CategoryId">;

const CATEGORY_NAME_REGEX = /^[a-z0-9_-]+$/;

export interface Category {
  id: CategoryId;
  name: string;
}

interface CreateCategoryArgs {
  id: string;
  name: string;
}

export const createCategory = ({ id, name }: CreateCategoryArgs): Result<Category, ValidationErr> => {
  if (!id || id.trim().length === 0) {
    return err({ kind: "InvalidCategoryId", raw: id });
  }

  const trimmedName = name.trim().toLowerCase();

  if (!CATEGORY_NAME_REGEX.test(trimmedName)) {
    return err({ kind: "InvalidCategoryName", raw: name });
  }

  return ok({
    id: id as CategoryId,
    name: trimmedName,
  });
};
