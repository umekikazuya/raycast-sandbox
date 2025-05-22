import { makePromptCreated, EVENT_TYPE } from "../../../domain/events/promptCreated";

describe("makePromptCreated", () => {
  it("正しい型・値でイベントが生成される", () => {
    const payload = {
      aggregateId: "id-1",
      keyword: "kw",
      body: "body",
      category: "cat",
      occurredAt: "2025-05-18T00:00:00.000Z",
    };
    const event = makePromptCreated(payload);
    expect(event.type).toBe(EVENT_TYPE);
    expect(event.aggregateId).toBe(payload.aggregateId);
    expect(event.keyword).toBe(payload.keyword);
    expect(event.body).toBe(payload.body);
    expect(event.category).toBe(payload.category);
    expect(event.occurredAt).toBe(payload.occurredAt);
  });

  it("余計なキーを渡すと型エラー（TypeScriptで検知）", () => {
    // @ts-expect-error: extraKeyは型エラー
    makePromptCreated({
      aggregateId: "id-1",
      keyword: "kw",
      body: "body",
      category: "cat",
      occurredAt: "2025-05-18T00:00:00.000Z",
      extraKey: "unexpected",
    });
  });
});
