import { updatePromptUseCase } from "../../../application/useCase/UpdatePromptUseCase";

describe("updatePromptUseCase", () => {
  const mockRepo = {
    findById: jest.fn(async ({ id }) => ({ tag: "ok", val: { id } })),
    update: jest.fn(async ({ id, params }) => ({ tag: "ok", val: { id, ...params } })),
  } as any;

  it("正常系: 既存プロンプトが存在し更新成功", async () => {
    const useCase = updatePromptUseCase({ promptRepository: mockRepo });
    const result = await useCase({ id: "id1" as any, params: { keyword: "new" } });
    expect(result.tag).toBe("ok");
    expect(result.val.keyword).toBe("new");
  });
  it("異常系: findByIdがerrの場合はRepositoryError", async () => {
    const repo = { ...mockRepo, findById: jest.fn(async () => ({ tag: "err", err: { kind: "x" } })) };
    const useCase = updatePromptUseCase({ promptRepository: repo });
    const result = await useCase({ id: "id1" as any, params: {} });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("RepositoryError");
  });
  it("異常系: プロンプトが存在しない場合はNotFoundError", async () => {
    const repo = { ...mockRepo, findById: jest.fn(async () => ({ tag: "ok", val: null })) };
    const useCase = updatePromptUseCase({ promptRepository: repo });
    const result = await useCase({ id: "id1" as any, params: {} });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("NotFoundError");
  });
  it("異常系: updateがerrの場合はRepositoryError", async () => {
    const repo = { ...mockRepo, update: jest.fn(async () => ({ tag: "err", err: { kind: "x" } })) };
    const useCase = updatePromptUseCase({ promptRepository: repo });
    const result = await useCase({ id: "id1" as any, params: {} });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("RepositoryError");
  });
});
