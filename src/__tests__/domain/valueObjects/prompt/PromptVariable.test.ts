import { createPromptVariable, createPromptVariableKey } from "../../../../domain/valueObjects/prompt/PromptVariable";

describe("PromptVariableKey", () => {
  it("正常系: 英数字・アンダースコアのみ許容", () => {
    expect(createPromptVariableKey({ raw: "var1" }).tag).toBe("ok");
    expect(createPromptVariableKey({ raw: "VAR_2" }).tag).toBe("ok");
  });
  it("異常系: 不正な文字はエラー", () => {
    const result = createPromptVariableKey({ raw: "var-1" });
    expect(result.tag).toBe("err");
    if (result.tag === "err") {
      expect(result.err.kind).toBe("InvalidVariableKeyFormat");
    }
  });
});

describe("PromptVariable", () => {
  it("正常系: 複数変数を配列で生成できる", () => {
    const result = createPromptVariable({
      variables: [
        { key: "var1", label: "変数1", required: true },
        { key: "var2", label: "変数2", required: false },
      ],
    });
    expect(result.tag).toBe("ok");
    if (result.tag === "err") {
      throw new Error("Unexpected error");
    }
  });
  it("正常系: null/空配列はnullを返す", () => {
    const result = createPromptVariable({ variables: null });
    expect(result.tag).toBe("ok");
    if (result.tag === "err") {
      throw new Error("Unexpected error");
    }
    expect(result.val).toBeNull();
  });
  it("異常系: 不正なkeyは例外", () => {
    expect(() => createPromptVariable({ variables: [{ key: "bad-key", label: "NG", required: true }] })).toThrow();
  });
});
