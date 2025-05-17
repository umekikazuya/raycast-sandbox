import { InMemoryEventStoreFns } from "../../../infrastructure/eventstore/InMemoryPromptEventStore";
import { DomainEvent } from "../../../domain/events/domainEvent";

describe("InMemoryEventStoreFns", () => {
  const promptId = "prompt-1";
  const event: DomainEvent = {
    type: "prompt.created",
    aggregateId: promptId,
    keyword: "test-keyword",
    body: "test-body",
    category: "test-category",
    occurredAt: "2025-05-18T00:00:00.000Z",
  };

  it("append: 新規IDならイベントを追加できる", () => {
    const state = new Map();
    const result = InMemoryEventStoreFns.append(state, [event]);
    expect(result.tag).toBe("ok");
    if (result.tag === "ok") {
      expect(result.val.get(promptId)?.length).toBe(1);
      expect(result.val.get(promptId)?.[0]).toEqual(event);
    }
  });

  it("append: 既存IDならイベントが追記される", () => {
    const state = new Map([[promptId, [event]]]);
    const newEvent = { ...event, occurredAt: "2025-05-18T01:00:00.000Z" };
    const result = InMemoryEventStoreFns.append(state, [newEvent]);
    expect(result.tag).toBe("ok");
    if (result.tag === "ok") {
      expect(result.val.get(promptId)?.length).toBe(2);
      expect(result.val.get(promptId)?.[1]).toEqual(newEvent);
    }
  });

  it("append: aggregateIdが空ならエラー", () => {
    const state = new Map();
    const badEvent = { ...event, aggregateId: "" };
    const result = InMemoryEventStoreFns.append(state, [badEvent]);
    expect(result.tag).toBe("err");
  });

  it("load: IDが存在すればイベント配列を返す", () => {
    const state = new Map([[promptId, [event]]]);
    const result = InMemoryEventStoreFns.load(state, promptId);
    expect(result.tag).toBe("ok");
    if (result.tag === "ok") {
      expect(result.val.length).toBe(1);
      expect(result.val[0]).toEqual(event);
    }
  });

  it("load: IDが存在しなければ空配列を返す", () => {
    const state = new Map();
    const result = InMemoryEventStoreFns.load(state, "not-exist");
    expect(result.tag).toBe("ok");
    if (result.tag === "ok") {
      expect(result.val).toEqual([]);
    }
  });
});
