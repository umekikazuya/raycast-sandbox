export type ValidationErr =
  | { kind: "InvalidPromptBody"; raw: string }
  | { kind: "InvalidTagFormat"; raw: string }
  | { kind: "TooManyTags"; count: number }
  | { kind: "InvalidCategoryFormat"; raw: string }
  | { kind: "InvalidCategoryId"; raw: string }
  | { kind: "InvalidCategoryName"; raw: string }
  | { kind: "InvalidPromptId"; raw: string }
  | { kind: "InvalidPromptTitle"; raw: string }
  | { kind: "MissingAuthor"; promptType: string }
  | { kind: "InvalidUserName"; raw: string }
  | { kind: "InvalidUserId"; raw: string }
  | { kind: "InvalidOrgId"; raw: string }
  | { kind: "InvalidOrgName"; raw: string }
  | { kind: "InvalidVariableKeyFormat"; raw: string }
  | { kind: "InvalidVariableLabel"; raw: string };

export type ConflictErr = { kind: "DuplicateTitle"; title: string };

export type DomainErr = ValidationErr | ConflictErr;
