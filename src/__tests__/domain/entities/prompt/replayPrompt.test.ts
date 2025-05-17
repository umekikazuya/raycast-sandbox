import { DomainEvent } from "../../../../domain/events/domainEvent";
import { makePromptCreated } from "../../../../domain/events/promptCreated";

function applyPromptCreated(ev) {
  return {
    id: ev.aggregateId,
    keyword: ev.keyword,
    body: ev.body,
    category: ev.category,
    createdAt: ev.occurredAt,
    updatedAt: ev.occurredAt,
  };
}

function replayPrompt(events: DomainEvent[]) {
  if (!events.length) throw new Error("no events");
  return events.reduce((agg, ev) => {
    if (ev.type === "prompt.created") return applyPromptCreated(ev);
    return agg;
  }, null);
}

describe("replayPrompt", () => {
  it("PromptCreatedイベントからAggregateを復元できる", () => {
    const ev = makePromptCreated({
      aggregateId: "id-1",
      keyword: "kw",
      body: "body",
      category: "cat",
      occurredAt: "2025-05-18T00:00:00.000Z",
    });
    const agg = replayPrompt([ev]);
    expect(agg.id).toBe("id-1");
    expect(agg.keyword).toBe("kw");
    expect(agg.body).toBe("body");
    expect(agg.category).toBe("cat");
    expect(agg.createdAt).toBe("2025-05-18T00:00:00.000Z");
    expect(agg.updatedAt).toBe("2025-05-18T00:00:00.000Z");
  });

  it("空配列ならエラー", () => {
    expect(() => replayPrompt([])).toThrow("no events");
  });
});
