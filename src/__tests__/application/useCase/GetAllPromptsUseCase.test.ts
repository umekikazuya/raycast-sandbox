import { getAllPromptsUseCase } from "../../../application/useCase/GetAllPromptsUseCase";

describe("getAllPromptsUseCase", () => {
import { PromptRepository } from "../../../domain/repositories/promptRepository";
import { Result } from "../../../shared/kernel/result";

const mockRepo: PromptRepository = {
  findAll: jest.fn(async () => ({ tag: "ok", val: [{ id: "id1" }] })),
  findById: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

  it("正常系: 全件取得成功", async () => {
    const useCase = getAllPromptsUseCase({ promptRepository: mockRepo });
    const result = await useCase();
    expect(result.tag).toBe("ok");
    expect(result.val.length).toBe(1);
  });
  it("異常系: findAllがerrの場合はRepositoryError", async () => {
    const repo = { ...mockRepo, findAll: jest.fn(async () => ({ tag: "err", err: { kind: "x" } })) };
    const useCase = getAllPromptsUseCase({ promptRepository: repo });
    const result = await useCase();
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("RepositoryError");
  });
});
