import { Brand } from "../../../shared/kernel/brand";
import { Result, ok, err } from "../../../shared/kernel/result";
import { ValidationErr } from "../../../shared/kernel/types";

export type AuthorId = Brand<string, "AuthorId">;

export interface Author {
  id: AuthorId;
  displayName: string;
}

interface CreateAuthorArgs {
  id: string;
  displayName: string;
}

export const createAuthor = ({ 
  id, 
  displayName
}: CreateAuthorArgs): Result<Author, ValidationErr> => {
  if (!id || id.trim().length === 0) {
    return err({ kind: "InvalidAuthorId", raw: id });
  }

  if (!displayName || displayName.trim().length === 0) {
    return err({ kind: "InvalidDisplayName", raw: displayName });
  }

  return ok({
    id: id as AuthorId,
    displayName: displayName.trim()
  });
};
