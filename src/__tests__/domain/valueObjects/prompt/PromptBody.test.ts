import { createPromptBody } from "../../../../domain/valueObjects/prompt/PromptBody";

describe("PromptBody", () => {
  it("正常系: 1文字以上5000文字以内の文字列を許容する", () => {
    expect(createPromptBody({ raw: "a" }).tag).toBe("ok");
    expect(createPromptBody({ raw: "a".repeat(5000) }).tag).toBe("ok");
  });
  it("異常系: 空文字列はエラー", () => {
    const result = createPromptBody({ raw: "" });
    expect(result.tag).toBe("err");
    if (result.tag === "err") {
      expect(result.err.kind).toBe("InvalidPromptBody");
    }
  });
  it("異常系: 5001文字以上はエラー", () => {
    const result = createPromptBody({ raw: "a".repeat(5001) });
    expect(result.tag).toBe("err");
    if (result.tag === "err") {
      expect(result.err.kind).toBe("InvalidPromptBody");
    }
  });
});
