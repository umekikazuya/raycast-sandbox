import { filterPromptsUseCase } from "../../../application/useCase/FilterPromptsUseCase";

describe("filterPromptsUseCase", () => {
  const mockRepo = {
    findByFilter: jest.fn(async ({ filter }) => ({ tag: "ok", val: [{ id: "id1" }] })),
  } as any;

  it("正常系: フィルタ取得成功", async () => {
    const useCase = filterPromptsUseCase({ promptRepository: mockRepo });
    const result = await useCase({ filter: { keywords: "test" } });
    expect(result.tag).toBe("ok");
    expect(result.val.length).toBe(1);
  });
  it("異常系: findByFilterがerrの場合はRepositoryError", async () => {
    const repo = { ...mockRepo, findByFilter: jest.fn(async () => ({ tag: "err", err: { kind: "x" } })) };
    const useCase = filterPromptsUseCase({ promptRepository: repo });
    const result = await useCase({ filter: {} });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("RepositoryError");
  });
});
