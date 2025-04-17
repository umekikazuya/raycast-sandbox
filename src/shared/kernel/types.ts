export type ValidationErr =
  | { kind: "InvalidPromptBody"; raw: string }
  | { kind: "InvalidTagFormat"; raw: string }
  | { kind: "TooManyTags"; count: number }
  | { kind: "InvalidCategoryFormat"; raw: string }
  | { kind: "InvalidCategoryId"; raw: string }
  | { kind: "InvalidCategoryName"; raw: string }
  | { kind: "InvalidPromptId"; raw: string }
  | { kind: "InvalidPromptKeyword"; raw: string }
  | { kind: "MissingAuthor" }
  | { kind: "InvalidAuthorId"; raw: string }
  | { kind: "InvalidDisplayName"; raw: string }
  | { kind: "InvalidVariableKeyFormat"; raw: string }
  | { kind: "InvalidVariableLabel"; raw: string };

export type ConflictErr = { kind: "DuplicateTitle"; title: string };

export type ApplicationErr =
  | { kind: "ValidationError"; message: string; cause?: unknown }
  | { kind: "NotFoundError"; message: string }
  | { kind: "RepositoryError"; message: string; cause?: unknown }
  | { kind: "ExecutionError"; message: string; cause?: unknown }
  | { kind: "AdaptationError"; message: string; cause?: unknown };

export type InfrastructureErr = 
  | { kind: "StorageError"; message: string }
  | { kind: "NetworkError"; message: string }
  | { kind: "SerializationError"; message: string }
  | { kind: "UnknownError"; message: string };

export type DomainErr = ValidationErr | ConflictErr;
