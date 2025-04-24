import { createPromptKeyword } from "../../../../domain/valueObjects/prompt/PromptKeyword";

describe("PromptKeyword", () => {
  it("正常系: 1文字以上100文字以内のキーワードを許容", () => {
    expect(createPromptKeyword({ raw: "keyword" }).tag).toBe("ok");
    expect(createPromptKeyword({ raw: "a".repeat(100) }).tag).toBe("ok");
  });
  it("異常系: 空文字列はエラー", () => {
    const result = createPromptKeyword({ raw: "" });
    expect(result.tag).toBe("err");
    if (result.tag === "err") {
      expect(result.err.kind).toBe("InvalidPromptKeyword");
    }
  });
  it("異常系: 101文字以上はエラー", () => {
    const result = createPromptKeyword({ raw: "a".repeat(101) });
    expect(result.tag).toBe("err");
    if (result.tag === "err") {
      expect(result.err.kind).toBe("InvalidPromptKeyword");
    }
  });
});
