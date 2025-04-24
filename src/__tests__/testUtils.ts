import { createPromptBody } from "../domain/valueObjects/prompt/PromptBody";
import { createPromptId } from "../domain/valueObjects/prompt/PromptId";
import { createPromptKeyword } from "../domain/valueObjects/prompt/PromptKeyword";
import { Brand } from "../shared/kernel/brand";

// IDの作成ヘルパー
export function createTestPromptId(id: string) {
  const result = createPromptId({ raw: id });
  if (result.tag === "err") throw new Error(`Invalid test ID: ${id}`);
  return result.val;
}

// 他のドメインオブジェクト作成ヘルパーも追加できます
export function createTestPromptKeyword(keyword: string) {
  const result = createPromptKeyword({ raw: keyword });
  if (result.tag === "err") throw new Error(`Invalid test keyword: ${keyword}`);
  return result.val;
}

export function createTestPromptBody(body: string) {
  const result = createPromptBody({ raw: body });
  if (result.tag === "err") throw new Error(`Invalid test body: ${body}`);
  return result.val;
}

export function createTestCategoryId(id: string) {
  return id as Brand<string, "CategoryId">;
}

// モックレポジトリを作成するヘルパー関数も追加可能
export function createMockPromptRepository() {
  return {
    findById: jest.fn(async ({ id }) => ({ tag: "ok", val: { id } })),
    findAll: jest.fn(async () => ({ tag: "ok", val: [] })),
    findByFilter: jest.fn(async () => ({ tag: "ok", val: [] })),
    save: jest.fn(async ({ prompt }) => ({ tag: "ok", val: prompt })),
    update: jest.fn(async ({ id, params }) => ({ tag: "ok", val: { id, ...params } })),
    delete: jest.fn(async ({ id }) => ({ tag: "ok", val: undefined })),
  };
}
