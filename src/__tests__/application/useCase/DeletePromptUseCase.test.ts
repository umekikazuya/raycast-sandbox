import { deletePromptUseCase } from "../../../application/useCase/DeletePromptUseCase";
import { PromptRepository } from "../../../domain/repositories/promptRepository";
import { createTestPromptId } from "../../testUtils"; // テストヘルパー関数をインポート

describe("deletePromptUseCase", () => {
  let mockRepo: PromptRepository;
  let useCase: ReturnType<typeof deletePromptUseCase>;
  let testId: ReturnType<typeof createTestPromptId>;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(async ({ id }) => ({ tag: "ok", val: { id } })),
      delete: jest.fn(async ({ id }) => ({ tag: "ok", val: undefined })),
      findAll: jest.fn(),
      findByFilter: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    useCase = deletePromptUseCase({ promptRepository: mockRepo });
    testId = createTestPromptId("id1");
  });

  it("正常系: 既存プロンプトが存在し削除に成功する", async () => {
    const result = await useCase({ id: testId });
    expect(result.tag).toBe("ok");
  });

  it("異常系: findByIdがエラーを返す場合はRepositoryErrorを返す", async () => {
    mockRepo.findById = jest.fn(async () => ({ tag: "err", err: { kind: "x" } }));
    const result = await useCase({ id: testId });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("RepositoryError");
  });

  it("異常系: プロンプトが存在しない場合はNotFoundErrorを返す", async () => {
    mockRepo.findById = jest.fn(async () => ({ tag: "ok", val: null }));
    const result = await useCase({ id: testId });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("NotFoundError");
  });

  it("異常系: deleteがエラーを返す場合はRepositoryErrorを返す", async () => {
    mockRepo.delete = jest.fn(async () => ({ tag: "err", err: { kind: "x" } }));
    const result = await useCase({ id: testId });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("RepositoryError");
  });
});
