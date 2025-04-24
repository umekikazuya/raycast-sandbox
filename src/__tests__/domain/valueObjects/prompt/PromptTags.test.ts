import { createPromptTags } from "../../../../domain/valueObjects/prompt/PromptTags";

describe("PromptTags", () => {
  it("正常系: 英数字・アンダースコア・ハイフンのみ最大10個まで許容", () => {
    const result = createPromptTags({ raw: ["tag1", "tag_2", "tag-3"] });
    expect(result.tag).toBe("ok");
    if (result.tag === "ok") {
      expect(result.val?.length).toBe(3);
      expect(result.val).toEqual(["tag1", "tag_2", "tag-3"]);
    }
  });
  it("異常系: 11個以上はエラー", () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    const result = createPromptTags({ raw: tags });
    expect(result.tag).toBe("err");
    if (result.tag === "err") {
      expect(result.err.kind).toBe("TooManyTags");
    }
  });
  it("異常系: 不正な文字を含むタグはエラー", () => {
    const result = createPromptTags({ raw: ["tag@1"] });
    expect(result.tag).toBe("err");
    if (result.tag === "err") {
      expect(result.err.kind).toBe("InvalidTagFormat");
    }
  });
  it("正常系: 大文字・重複は小文字化・ユニーク化される", () => {
    const result = createPromptTags({ raw: ["Tag", "tag", "TAG"] });
    expect(result.tag).toBe("ok");
    if (result.tag === "ok") {
      expect(result.val?.length).toBe(1);
    }
  });
});
