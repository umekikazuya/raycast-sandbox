import { Result, PromptId, Category, Tag, UserId, PromptError } from "./types";
import { PromptVariable } from "./prompt-variable";
import { v4 as uuidv4 } from "uuid";

/**
 * プロンプトエンティティ
 */
export type Prompt = {
  readonly id: PromptId;
  readonly title: string;
  readonly content: string;
  readonly category: Category;
  readonly tags: ReadonlyArray<Tag>;
  readonly variables: ReadonlyArray<PromptVariable>;
  readonly createdBy: UserId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly executionCount: number;
  readonly department?: string;
  readonly position?: string;
};

/**
 * プロンプト作成のパラメータ
 */
export type CreatePromptParams = {
  title: string;
  content: string;
  category: string;
  tags: string[];
  variables: PromptVariable[];
  createdBy: string;
  department?: string;
  position?: string;
};

/**
 * プロンプト更新のパラメータ
 */
export type UpdatePromptParams = Partial<Omit<CreatePromptParams, "createdBy">>;

/**
 * プロンプトIDの生成
 */
export function generatePromptId(): PromptId {
  return uuidv4() as PromptId;
}

/**
 * カテゴリの生成
 */
export function createCategory(value: string): Result<Category, PromptError> {
  if (!value.trim()) {
    return { ok: false, error: PromptError.INVALID_CONTENT };
  }
  return { ok: true, value: value as Category };
}

/**
 * タグの生成
 */
export function createTag(value: string): Result<Tag, PromptError> {
  if (!value.trim()) {
    return { ok: false, error: PromptError.INVALID_CONTENT };
  }
  return { ok: true, value: value as Tag };
}

/**
 * ユーザーIDの生成
 */
export function createUserId(value: string): UserId {
  return value as UserId;
}

/**
 * プロンプトの作成
 */
export function createPrompt(params: CreatePromptParams): Result<Prompt, PromptError> {
  // タイトルの検証
  if (!params.title.trim()) {
    return { ok: false, error: PromptError.INVALID_TITLE };
  }

  // コンテンツの検証
  if (!params.content.trim()) {
    return { ok: false, error: PromptError.INVALID_CONTENT };
  }

  // カテゴリの検証
  const categoryResult = createCategory(params.category);
  if (!categoryResult.ok) {
    return categoryResult;
  }

  // タグの検証
  const tags: Tag[] = [];
  for (const tagValue of params.tags) {
    const tagResult = createTag(tagValue);
    if (!tagResult.ok) {
      return tagResult;
    }
    tags.push(tagResult.value);
  }

  const now = new Date();

  return {
    ok: true,
    value: {
      id: generatePromptId(),
      title: params.title,
      content: params.content,
      category: categoryResult.value,
      tags: tags,
      variables: params.variables,
      createdBy: createUserId(params.createdBy),
      createdAt: now,
      updatedAt: now,
      executionCount: 0,
      department: params.department,
      position: params.position,
    },
  };
}

/**
 * プロンプトの更新
 */
export function updatePrompt(prompt: Prompt, params: UpdatePromptParams): Result<Prompt, PromptError> {
  let updatedCategory = prompt.category;
  let updatedTags = prompt.tags;

  // カテゴリの更新があれば検証
  if (params.category !== undefined) {
    const categoryResult = createCategory(params.category);
    if (!categoryResult.ok) {
      return categoryResult;
    }
    updatedCategory = categoryResult.value;
  }

  // タグの更新があれば検証
  if (params.tags !== undefined) {
    const newTags: Tag[] = [];
    for (const tagValue of params.tags) {
      const tagResult = createTag(tagValue);
      if (!tagResult.ok) {
        return tagResult;
      }
      newTags.push(tagResult.value);
    }
    updatedTags = newTags;
  }

  return {
    ok: true,
    value: {
      ...prompt,
      title: params.title !== undefined ? params.title : prompt.title,
      content: params.content !== undefined ? params.content : prompt.content,
      category: updatedCategory,
      tags: updatedTags,
      variables: params.variables !== undefined ? params.variables : prompt.variables,
      updatedAt: new Date(),
      department: params.department !== undefined ? params.department : prompt.department,
      position: params.position !== undefined ? params.position : prompt.position,
    },
  };
}

/**
 * プロンプト実行回数のインクリメント
 */
export function incrementExecutionCount(prompt: Prompt): Prompt {
  return {
    ...prompt,
    executionCount: prompt.executionCount + 1,
    updatedAt: new Date(),
  };
}
