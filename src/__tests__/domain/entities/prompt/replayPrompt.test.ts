import { replayPrompt } from "../../../../domain/entities/prompt/PromptAggregate";
import { makePromptCreated } from "../../../../domain/events/promptCreated";

describe("replayPrompt", () => {
  it("PromptCreatedイベントからAggregateを復元できる", () => {
    const ev = makePromptCreated({
      aggregateId: "id-1",
      keyword: "kw",
      body: "body",
      category: "writing",
      occurredAt: "2025-05-18T00:00:00.000Z",
    });
    const agg = replayPrompt([ev]);
    expect(agg).not.toBeNull();
    expect(agg!.id).toBe("id-1");
    expect(agg!.keyword).toBe("kw");
    expect(agg!.body).toBe("body");
    expect(agg!.category).toBe("writing");
    expect(agg!.createdAt.toISOString()).toBe("2025-05-18T00:00:00.000Z");
    expect(agg!.updatedAt.toISOString()).toBe("2025-05-18T00:00:00.000Z");
  });

  it("空配列ならnullを返す", () => {
    expect(replayPrompt([])).toBeNull();
  });

  it("複数のイベントから正しくリプレイできる", () => {
    const createEvent = makePromptCreated({
      aggregateId: "id-1",
      keyword: "kw",
      body: "body",
      category: "writing",
      occurredAt: "2025-05-18T00:00:00.000Z",
    });

    const deleteEvent = {
      type: "prompt.deleted",
      aggregateId: "id-1",
      occurredAt: "2025-05-19T00:00:00.000Z",
    };

    // 作成イベントだけでリプレイ
    const agg1 = replayPrompt([createEvent]);
    expect(agg1).not.toBeNull();

    // 作成→削除でリプレイ
    const agg2 = replayPrompt([createEvent, deleteEvent]);
    expect(agg2).toBeNull();
  });

  it("サポートされていないイベントタイプは無視される", () => {
    const createEvent = makePromptCreated({
      aggregateId: "id-1",
      keyword: "kw",
      body: "body",
      category: "writing",
      occurredAt: "2025-05-18T00:00:00.000Z",
    });

    const unknownEvent = {
      type: "prompt.unknown",
      aggregateId: "id-1",
      occurredAt: "2025-05-19T00:00:00.000Z",
    };

    const agg = replayPrompt([createEvent, unknownEvent]);
    expect(agg).not.toBeNull();
    expect(agg!.id).toBe("id-1");
  });
});
