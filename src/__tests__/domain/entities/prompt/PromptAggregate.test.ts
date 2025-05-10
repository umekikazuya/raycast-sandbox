import { createPromptAggregate } from "../../../../domain/entities/prompt/PromptAggregate";
import { makePromptCreated } from "../../../../domain/entities/prompt/events/promptCreated";
import { jest } from "@jest/globals";

describe("makePromptCreated", () => {
  it("コンパイルエラー: payloadに余計なキーを含むとエラーになる", () => {
    // @ts-expect-error: payloadにextraKeyは存在しないためエラー
    makePromptCreated({
      aggregateId: "id",
      keyword: "kw",
      body: "body",
      category: "cat",
      occurredAt: "2025-05-07T00:00:00.000Z",
      extraKey: "unexpected",
    });
  });
  it('sets type to "prompt.created"', () => {
    const payload = {
      aggregateId: "id",
      keyword: "kw",
      body: "body",
      category: "cat",
      occurredAt: "2025-05-07T00:00:00.000Z",
    };
    const event = makePromptCreated(payload);
    expect(event.type).toBe("prompt.created");
    expect(event.aggregateId).toBe(payload.aggregateId);
    expect(event.keyword).toBe(payload.keyword);
    expect(event.body).toBe(payload.body);
    expect(event.category).toBe(payload.category);
    expect(event.occurredAt).toBe(payload.occurredAt);
  });
});

describe("createPromptAggregate", () => {
  const fixedDate = new Date("2025-05-07T00:00:00.000Z");
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fixedDate);
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  const baseInput = {
    id: "id1",
    keyword: "keyword",
    body: "body",
    category: "writing",
  };

  it("succeeds when all inputs are valid", () => {
    const result = createPromptAggregate(baseInput);
    expect(result.tag).toBe("ok");
    if (result.tag === "ok") {
      const { aggregate, event } = result.val;
      expect(aggregate.id).toBe(baseInput.id);
      expect(aggregate.keyword).toBe(baseInput.keyword);
      expect(aggregate.body).toBe(baseInput.body);
      expect(aggregate.category).toBe(baseInput.category);
      expect(aggregate.createdAt).toEqual(fixedDate);
      expect(aggregate.updatedAt).toEqual(fixedDate);
      expect(event.type).toBe("prompt.created");
      expect(event.occurredAt).toBe(fixedDate.toISOString());
    }
  });

  it("fails with InvalidId when id is invalid", () => {
    const result = createPromptAggregate({ ...baseInput, id: "" });
    expect(result.tag).toBe("err");
    if (result.tag === "err") expect(result.err.kind).toBe("InvalidPromptId");
  });

  it("fails with InvalidKeyword when keyword is invalid", () => {
    const result = createPromptAggregate({ ...baseInput, keyword: "" });
    expect(result.tag).toBe("err");
    if (result.tag === "err") expect(result.err.kind).toBe("InvalidPromptKeyword");
  });

  it("fails with InvalidBody when body is invalid", () => {
    const result = createPromptAggregate({ ...baseInput, body: "" });
    expect(result.tag).toBe("err");
    if (result.tag === "err") expect(result.err.kind).toBe("InvalidPromptBody");
  });

  it("fails with InvalidCategory when category is invalid", () => {
    const result = createPromptAggregate({ ...baseInput, category: "" });
    expect(result.tag).toBe("err");
    if (result.tag === "err") expect(result.err.kind).toBe("InvalidCategoryFormat");
  });

  it("returns first error when multiple inputs invalid: id and keyword", () => {
    const result = createPromptAggregate({ ...baseInput, id: "", keyword: "" });
    expect(result.tag).toBe("err");
    if (result.tag === "err") expect(result.err.kind).toBe("InvalidPromptId");
  });

  it("returns next error when first is valid and others invalid: keyword and body", () => {
    const result = createPromptAggregate({ ...baseInput, keyword: "", body: "" });
    expect(result.tag).toBe("err");
    if (result.tag === "err") expect(result.err.kind).toBe("InvalidPromptKeyword");
  });

  it("returns next error when id and keyword valid but body and category invalid", () => {
    const result = createPromptAggregate({ ...baseInput, body: "", category: "" });
    expect(result.tag).toBe("err");
    if (result.tag === "err") expect(result.err.kind).toBe("InvalidPromptBody");
  });
});
