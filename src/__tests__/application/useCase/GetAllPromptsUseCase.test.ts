import { getAllPromptsUseCase } from "../../../application/useCase/GetAllPromptsUseCase";
import { PromptRepository, PromptRepositoryErr } from "../../../domain/repositories/promptRepository";

describe("getAllPromptsUseCase", () => {
  const mockRepo: PromptRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    findByFilter: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  it("正常系: 全件取得成功", async () => {
    const useCase = getAllPromptsUseCase({ promptRepository: mockRepo });
    const result = await useCase();
    expect(result.tag).toBe("ok");
    if (result.tag === "ok") {
      expect(result.val).toEqual([{ id: "id1" }]);
    }
  });
  it("異常系: findAllがerrの場合はRepositoryError", async () => {
    const useCase = getAllPromptsUseCase({ promptRepository: mockRepo });
    const result = await useCase();
    expect(result.tag).toBe("err");
    if (result.tag === "err") {
      expect(result.err.kind).toBe("RepositoryError");
    }
  });
});
