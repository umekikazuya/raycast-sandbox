import { makePromptKeyword } from "../../../../domain/valueObjects/prompt/PromptKeyword";

describe("PromptKeyword", () => {
  it("異常系: 空文字列および空白のみはエラー", () => {
    expect(makePromptKeyword("").tag).toBe("err");
    expect(makePromptKeyword("   ").tag).toBe("err");
  });
  it("長さの境界: 最大50文字まで許容し、51文字以上でエラー", () => {
    expect(makePromptKeyword("a".repeat(50)).tag).toBe("ok");
    expect(makePromptKeyword("a".repeat(51)).tag).toBe("err");
  });
});
