import { getPromptByIdUseCase } from "../../../application/useCase/GetPromptByIdUseCase";

describe("getPromptByIdUseCase", () => {
  const mockRepo = {
    findById: jest.fn(async ({ id }) => ({ tag: "ok", val: { id } })),
  } as any;

  it("正常系: 取得成功", async () => {
    const useCase = getPromptByIdUseCase({ promptRepository: mockRepo });
    const result = await useCase({ id: "id1" as any });
    expect(result.tag).toBe("ok");
    expect(result.val.id).toBe("id1");
  });
  it("異常系: findByIdがerrの場合はRepositoryError", async () => {
    const repo = { ...mockRepo, findById: jest.fn(async () => ({ tag: "err", err: { kind: "x" } })) };
    const useCase = getPromptByIdUseCase({ promptRepository: repo });
    const result = await useCase({ id: "id1" as any });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("RepositoryError");
  });
});
