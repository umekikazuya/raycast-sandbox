import { createPrompt } from "../../../domain/entities/prompt";

describe("Prompt", () => {
  it("正常系: 全ての値が正しい場合に生成できる", () => {
    const result = createPrompt({
      id: "id1",
      keyword: "keyword",
      body: "本文",
      categoryId: "cat1",
      type: "local",
      variables: [
        { key: "var1", label: "変数1", required: true }
      ]
    });
    expect(result.tag).toBe("ok");
    if (result.tag === 'ok') {
      expect(result.val.id).toBe("id1");
      expect(result.val.keyword).toBe("keyword");
      expect(result.val.body).toBe("本文");
      expect(result.val.categoryId).toBe("cat1");
      expect(result.val.type).toBe("local");
      expect(result.val.variables).toEqual([
        { key: "var1", label: "変数1", required: true }
      ]);
    }
  });
  it("異常系: 空idはエラー", () => {
    const result = createPrompt({
      id: "",
      keyword: "keyword",
      body: "本文",
      categoryId: "cat1",
      type: "local",
      variables: null
    });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("InvalidPromptId");
  });
  it("異常系: 空keywordはエラー", () => {
    const result = createPrompt({
      id: "id1",
      keyword: "",
      body: "本文",
      categoryId: "cat1",
      type: "local",
      variables: null
    });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("InvalidPromptKeyword");
  });
  it("異常系: 空bodyはエラー", () => {
    const result = createPrompt({
      id: "id1",
      keyword: "keyword",
      body: "",
      categoryId: "cat1",
      type: "local",
      variables: null
    });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("InvalidPromptBody");
  });
  it("異常系: 空categoryIdはエラー", () => {
    const result = createPrompt({
      id: "id1",
      keyword: "keyword",
      body: "本文",
      categoryId: "",
      type: "local",
      variables: null
    });
    expect(result.tag).toBe("err");
    expect(result.err.kind).toBe("InvalidCategoryId");
  });
});
