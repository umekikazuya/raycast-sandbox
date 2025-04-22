import { deletePromptUseCase } from "../../../application/useCase/DeletePromptUseCase";

import { deletePromptUseCase } from "../../../application/useCase/DeletePromptUseCase";
import { PromptRepository } from "../../../domain/repositories/promptRepository";
import { Result } from "../../../shared/kernel/result";

describe("deletePromptUseCase", () => {
  // …rest of your tests…
const mockRepo: PromptRepository = {
  findById: jest.fn(async ({ id }) => ({ tag: "ok", val: { id } })),
  delete:   jest.fn(async ({ id }) => ({ tag: "ok", val: undefined })),
  findAll:  jest.fn(),
  save:     jest.fn(),
};

  it("正常系: 既存プロンプトが存在し削除成功", async () => {
    const useCase = deletePromptUseCase({ promptRepository: mockRepo });
    const result = await useCase({ id: "id1" as any });
    expect(result.tag).toBe("ok");
  });
  it("異常系: findByIdがerrの場合はRepositoryError", async () => {
    const repo = { ...mockRepo, findById: jest.fn(async () => ({ tag: "err", err: { kind: "x" } })) };
    const useCase = deletePromptUseCase({ promptRepository: repo });
    const result = await useCase({ id: "id1" as any });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("RepositoryError");
  });
  it("異常系: プロンプトが存在しない場合はNotFoundError", async () => {
    const repo = { ...mockRepo, findById: jest.fn(async () => ({ tag: "ok", val: null })) };
    const useCase = deletePromptUseCase({ promptRepository: repo });
    const result = await useCase({ id: "id1" as any });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("NotFoundError");
  });
  it("異常系: deleteがerrの場合はRepositoryError", async () => {
    const repo = { ...mockRepo, delete: jest.fn(async () => ({ tag: "err", err: { kind: "x" } })) };
    const useCase = deletePromptUseCase({ promptRepository: repo });
    const result = await useCase({ id: "id1" as any });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("RepositoryError");
  });
});
