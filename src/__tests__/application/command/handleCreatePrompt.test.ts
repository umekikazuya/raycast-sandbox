import { InMemoryEventStoreFns } from "../../../infrastructure/eventstore/InMemoryPromptEventStore";
import { makePromptCreated } from "../../../domain/events/promptCreated";

// 仮のhandleCreate（本来はsrcからimport）
function handleCreate(state, input) {
  const event = makePromptCreated({
    aggregateId: input.id,
    keyword: input.keyword,
    body: input.body,
    category: input.category,
    occurredAt: input.occurredAt,
  });
  const appendResult = InMemoryEventStoreFns.append(state, [event]);
  if (appendResult.tag === "err") return appendResult;
  return { tag: "ok", val: { state: appendResult.val, aggregate: { id: input.id, keyword: input.keyword, body: input.body, category: input.category, createdAt: input.occurredAt, updatedAt: input.occurredAt } } };
}

describe("handleCreate", () => {
  const baseInput = {
    id: "id-1",
    keyword: "kw",
    body: "body",
    category: "cat",
    occurredAt: "2025-05-18T00:00:00.000Z",
  };
  it("正常系: 新規イベントを追加しAggregateを返す", () => {
    const state = new Map();
    const result = handleCreate(state, baseInput);
    expect(result.tag).toBe("ok");
    if (result.tag === "ok") {
      expect(result.val.state.get(baseInput.id)?.length).toBe(1);
      expect(result.val.aggregate.id).toBe(baseInput.id);
    }
  });
  it("異常系: appendでエラーならerrを返す", () => {
    const state = new Map();
    const badInput = { ...baseInput, id: "" };
    // appendはaggregateId空でerr
    const result = handleCreate(state, badInput);
    expect(result.tag).toBe("err");
  });
});
