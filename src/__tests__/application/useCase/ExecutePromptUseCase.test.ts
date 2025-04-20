import { executePromptUseCase } from "../../../application/useCase/ExecutePromptUseCase";

describe("executePromptUseCase", () => {
  const mockPrompt = {
    id: "id1",
    body: { toString: () => "Hello, {{name}}!" },
    variables: [{ key: { toString: () => "name" }, label: "名前", required: true }],
  };
  const mockRepo = {
    findById: jest.fn(async ({ id }) => ({ tag: "ok", val: mockPrompt })),
  } as any;
  const mockClipboard = {
    copyToClipboard: jest.fn(async ({ text }) => ({ tag: "ok", val: undefined })),
  } as any;

  it("正常系: 変数置換・クリップボード成功", async () => {
    const useCase = executePromptUseCase({ promptRepository: mockRepo, clipboardService: mockClipboard });
    const result = await useCase({ params: { id: "id1" as any, variables: { name: "Taro" } } });
    expect(result.tag).toBe("ok");
    expect(result.val.content).toBe("Hello, Taro!");
  });
  it("異常系: findByIdがerrの場合はRepositoryError", async () => {
    const repo = { ...mockRepo, findById: jest.fn(async () => ({ tag: "err", err: { kind: "x" } })) };
    const useCase = executePromptUseCase({ promptRepository: repo, clipboardService: mockClipboard });
    const result = await useCase({ params: { id: "id1" as any, variables: { name: "Taro" } } });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("RepositoryError");
  });
  it("異常系: プロンプトが存在しない場合はNotFoundError", async () => {
    const repo = { ...mockRepo, findById: jest.fn(async () => ({ tag: "ok", val: null })) };
    const useCase = executePromptUseCase({ promptRepository: repo, clipboardService: mockClipboard });
    const result = await useCase({ params: { id: "id1" as any, variables: { name: "Taro" } } });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("NotFoundError");
  });
  it("異常系: 変数未入力時はValidationError", async () => {
    const useCase = executePromptUseCase({ promptRepository: mockRepo, clipboardService: mockClipboard });
    const result = await useCase({ params: { id: "id1" as any, variables: { val: [] } as any } });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("ValidationError");
  });
  it("異常系: クリップボード失敗時はExecutionError", async () => {
    const clipboard = { copyToClipboard: jest.fn(async () => ({ tag: "err", err: { kind: "ClipboardWriteFailed", message: "fail" } })) };
    const useCase = executePromptUseCase({ promptRepository: mockRepo, clipboardService: clipboard });
    const result = await useCase({ params: { id: "id1" as any, variables: { name: "Taro" } } });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("ExecutionError");
  });
});
