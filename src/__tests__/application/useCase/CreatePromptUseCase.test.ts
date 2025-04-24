import { createPromptUseCase } from "../../../application/useCase/CreatePromptUseCase";

describe("createPromptUseCase", () => {
  const mockRepo = {
    save: jest.fn(async ({ prompt }) => ({ tag: "ok", val: prompt })),
  } as any;

  it("正常系: 正しい値でプロンプト作成", async () => {
    const useCase = createPromptUseCase({ promptRepository: mockRepo });
    const params = {
      keyword: "test-keyword",
      body: "test body",
      categoryId: "cat1" as any,
      variables: null,
      type: "local",
      author: "user1",
    };
    const result = await useCase({ params });
    expect(result.tag).toBe("ok");
    expect(result.val.keyword).toBeDefined();
  });

  it("異常系: バリデーションエラー時はerrを返す", async () => {
    const useCase = createPromptUseCase({ promptRepository: mockRepo });
    const params = {
      keyword: "",
      body: "",
      categoryId: "",
      variables: null,
      type: "local",
      author: "user1",
    };
    const result = await useCase({ params });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("ValidationError");
  });

  it("異常系: リポジトリエラー時はerrを返す", async () => {
    const errorMockRepo = {
      save: jest.fn(async () => ({ tag: "err", err: { kind: "DatabaseError" } })),
    } as PromptRepository;

    const useCase = createPromptUseCase({ promptRepository: errorMockRepo });
    const params = {
      keyword: "test-keyword",
      body: "test body",
      categoryId: "cat1",
      variables: null,
      type: "local",
      author: "user1",
    };

    const result = await useCase({ params });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("RepositoryError");
  });
});
