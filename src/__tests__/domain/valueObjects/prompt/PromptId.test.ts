import { createPromptId } from "../../../../domain/valueObjects/prompt/PromptId";

describe("PromptId", () => {
  it("正常系: 空白以外の文字列を許容", () => {
    expect(createPromptId({ raw: "abc" }).tag).toBe("ok");
  });
  it("異常系: 空文字列はエラー", () => {
    const result = createPromptId({ raw: "" });
    expect(result.tag).toBe("err");
    if (result.tag === "err") {
      expect(result.err.kind).toBe("InvalidPromptId");
    }
  });
  it("異常系: 空白のみはエラー", () => {
    const result = createPromptId({ raw: "   " });
    expect(result.tag).toBe("err");
    if (result.tag === "err") {
      expect(result.err.kind).toBe("InvalidPromptId");
    }
  });
});
